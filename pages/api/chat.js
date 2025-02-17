import axios from 'axios';

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = 'https://api.siliconflow.com/v1/chat/completions';

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
1. 使用markdown格式
2. 包含清晰的标题和小标题
3. 适当使用列表和要点
4. 确保信息准确且来源于上下文
5. 如果上下文信息不足，请明确指出`;

    const response = await axios.post(
      DEEPSEEK_API_URL,
      {
        model: 'deepseek-chat',
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
        stream: true
      },
      {
        headers: {
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json'
        },
        responseType: 'stream'
      }
    );

    // 设置响应头
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // 转发流式响应
    response.data.pipe(res);

    // 错误处理
    response.data.on('error', (error) => {
      console.error('Stream error:', error);
      res.end();
    });

  } catch (error) {
    console.error('Error calling DeepSeek API:', error);
    res.status(500).json({ 
      message: 'Error processing chat request',
      error: error.message 
    });
  }
}