import axios from 'axios';

const API_KEY = 'sk-fgrhdqqyqtwcxdjnqqvcenmzykhrbttrklkizypndnpfxdbf';
const API_URL = 'https://api.siliconflow.cn/v1/chat/completions';

// 创建一个带有超时设置的 axios 实例
const api = axios.create({
  timeout: 60000, // 60秒超时
  maxContentLength: Infinity,
  maxBodyLength: Infinity
});

// 添加重试逻辑
api.interceptors.response.use(undefined, async (err) => {
  const { config } = err;
  if (!config || !config.retry) {
    return Promise.reject(err);
  }
  config.currentRetryAttempt = config.currentRetryAttempt || 0;
  if (config.currentRetryAttempt >= config.retry) {
    return Promise.reject(err);
  }
  config.currentRetryAttempt += 1;
  const delayMs = config.retryDelay || 1000;
  await new Promise(resolve => setTimeout(resolve, delayMs));
  return api(config);
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { query, context } = req.body;

  try {
    // 构建上下文提示词
    const contextText = context
      .map(item => `${item.title}\n${item.content}`)
      .join('\n\n');

    const systemPrompt = `你是一个专业的知识助手。请基于提供的上下文信息，以清晰、结构化的方式回答问题。回答应该：
1. 使用markdown格式，确保层次分明
2. 包含清晰的标题和小标题
3. 适当使用列表和要点
4. 确保信息准确且来源于上下文
5. 如果上下文信息不足，请明确指出
6. 在回答的最后，总结关键要点`;

    // 设置响应头
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const response = await api({
      method: 'post',
      url: API_URL,
      data: {
        model: 'deepseek-ai/DeepSeek-R1',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: `上下文信息：\n${contextText}\n\n问题：${query}`
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
        stream: true,
        top_p: 0.8,
        frequency_penalty: 0.5
      },
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream'
      },
      responseType: 'stream',
      // 添加重试配置
      retry: 3,
      retryDelay: 1000,
      timeout: 60000
    });

    let isFirstChunk = true;
    let buffer = '';

    // 处理流式响应
    response.data.on('data', (chunk) => {
      try {
        // 如果是第一个数据块，发送一个开始标记
        if (isFirstChunk) {
          res.write('data: {"type":"start"}\n\n');
          isFirstChunk = false;
        }

        buffer += chunk.toString();
        const lines = buffer.split('\n');
        buffer = lines.pop(); // 保留最后一个不完整的行

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              res.write('data: [DONE]\n\n');
            } else {
              try {
                const parsed = JSON.parse(data);
                if (parsed.choices && parsed.choices[0].message) {
                  const message = parsed.choices[0].message;
                  if (message.reasoning_content) {
                    res.write(`data: {"type":"reasoning","content":"${encodeURIComponent(message.reasoning_content)}"}\n\n`);
                    res.write(`data: {"type":"answer","content":"${encodeURIComponent(message.content)}"}\n\n`);
                  } else if (message.content) {
                    res.write(`data: {"type":"content","content":"${encodeURIComponent(message.content)}"}\n\n`);
                  }
                } else if (parsed.choices && parsed.choices[0].delta.content) {
                  res.write(`data: {"type":"delta","content":"${encodeURIComponent(parsed.choices[0].delta.content)}"}\n\n`);
                }
              } catch (e) {
                console.error('Error parsing chunk:', e);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error processing chunk:', error);
      }
    });

    response.data.on('end', () => {
      if (buffer) {
        // 处理缓冲区中剩余的数据
        try {
          const data = buffer.slice(6);
          if (data && data !== '[DONE]') {
            const parsed = JSON.parse(data);
            if (parsed.choices && parsed.choices[0].delta.content) {
              res.write(`data: {"type":"delta","content":"${encodeURIComponent(parsed.choices[0].delta.content)}"}\n\n`);
            }
          }
        } catch (e) {
          console.error('Error processing final buffer:', e);
        }
      }
      res.write('data: {"type":"end"}\n\n');
      res.end();
    });

    response.data.on('error', (error) => {
      console.error('Stream error:', error);
      res.write(`data: {"type":"error","message":"${error.message}"}\n\n`);
      res.end();
    });

  } catch (error) {
    console.error('Error calling API:', error);
    res.status(500).json({ 
      message: 'Error processing chat request',
      error: error.message 
    });
  }
}