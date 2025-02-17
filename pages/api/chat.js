import axios from 'axios';

const API_KEY = 'sk-fgrhdqqyqtwcxdjnqqvcenmzykhrbttrklkizypndnpfxdbf';
const API_URL = 'https://api.siliconflow.cn/v1/chat/completions';

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

    const response = await axios({
      method: 'post',
      url: API_URL,
      data: {
        model: 'deepseek-ai/DeepSeek-R1',  // 使用 DeepSeek-R1 模型
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
      responseType: 'stream'
    });

    // 处理流式响应
    response.data.on('data', (chunk) => {
      const lines = chunk.toString().split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            res.write('data: [DONE]\n\n');
          } else {
            try {
              const parsed = JSON.parse(data);
              // 检查是否有推理内容
              if (parsed.choices && parsed.choices[0].message) {
                const message = parsed.choices[0].message;
                if (message.reasoning_content) {
                  // 如果有推理内容，将其添加到回答中
                  res.write(`data: ### 思维过程：\n${message.reasoning_content}\n\n### 最终回答：\n${message.content}\n\n`);
                } else if (message.content) {
                  res.write(`data: ${message.content}\n\n`);
                }
              } else if (parsed.choices && parsed.choices[0].delta.content) {
                res.write(`data: ${parsed.choices[0].delta.content}\n\n`);
              }
            } catch (e) {
              console.error('Error parsing chunk:', e);
            }
          }
        }
      }
    });

    response.data.on('end', () => {
      res.end();
    });

    response.data.on('error', (error) => {
      console.error('Stream error:', error);
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