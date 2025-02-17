import { callWithFallback } from '../../utils/api-client';

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

    const messages = [
      {
        role: 'system',
        content: systemPrompt
      },
      {
        role: 'user',
        content: `上下文信息：\n${contextText}\n\n问题：${query}`
      }
    ];

    // 使用故障转移机制调用 API
    const { provider, response } = await callWithFallback(messages, true);
    console.log(`Using ${provider} API for response`);

    let isFirstChunk = true;
    let buffer = '';
    let responseText = '';

    // 处理流式响应
    response.data.on('data', (chunk) => {
      try {
        if (isFirstChunk) {
          res.write('data: {"type":"start","provider":"' + provider + '"}\n\n');
          isFirstChunk = false;
        }

        buffer += chunk.toString();
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              res.write('data: [DONE]\n\n');
              continue;
            }

            try {
              const parsed = JSON.parse(data);
              let content = '';

              // 处理不同 API 的响应格式
              if (parsed.choices && parsed.choices[0]) {
                const choice = parsed.choices[0];
                
                // OpenAI/DeepSeek 流式响应格式
                if (choice.delta) {
                  if (choice.delta.content) {
                    content = choice.delta.content;
                    responseText += content;
                    res.write(`data: {"type":"delta","content":"${encodeURIComponent(content)}"}\n\n`);
                  }
                  if (choice.delta.role === 'assistant') {
                    res.write(`data: {"type":"role","content":"assistant"}\n\n`);
                  }
                }
                // Claude/其他 API 完整响应格式
                else if (choice.message) {
                  if (choice.message.reasoning_content) {
                    content = choice.message.reasoning_content;
                    responseText += content + '\n\n';
                    res.write(`data: {"type":"reasoning","content":"${encodeURIComponent(content)}"}\n\n`);
                    
                    content = choice.message.content;
                    responseText += content;
                    res.write(`data: {"type":"answer","content":"${encodeURIComponent(content)}"}\n\n`);
                  } else if (choice.message.content) {
                    content = choice.message.content;
                    responseText += content;
                    res.write(`data: {"type":"content","content":"${encodeURIComponent(content)}"}\n\n`);
                  }
                }
              }
            } catch (e) {
              console.error('Error parsing chunk:', e, 'Raw data:', data);
            }
          }
        }
      } catch (error) {
        console.error('Error processing chunk:', error);
      }
    });

    response.data.on('end', () => {
      // 处理缓冲区中剩余的数据
      if (buffer) {
        try {
          if (buffer.startsWith('data: ')) {
            const data = buffer.slice(6);
            if (data && data !== '[DONE]') {
              const parsed = JSON.parse(data);
              if (parsed.choices && parsed.choices[0].delta && parsed.choices[0].delta.content) {
                const content = parsed.choices[0].delta.content;
                responseText += content;
                res.write(`data: {"type":"delta","content":"${encodeURIComponent(content)}"}\n\n`);
              }
            }
          }
        } catch (e) {
          console.error('Error processing final buffer:', e);
        }
      }

      // 发送完整的响应文本用于验证
      if (responseText) {
        res.write(`data: {"type":"complete","content":"${encodeURIComponent(responseText)}"}\n\n`);
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