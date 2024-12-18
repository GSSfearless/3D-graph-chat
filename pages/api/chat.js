import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { context, query, language = 'en' } = req.body;

    // 根据语言选择系统提示
    const systemPrompts = {
      'zh': '你是一个知识渊博的AI助手。请用中文回答问题，保持专业性和易懂性。',
      'en': 'You are a knowledgeable AI assistant. Please answer in English, maintaining professionalism and clarity.',
      'ja': 'あなたは知識豊富なAIアシスタントです。日本語で分かりやすく、専門的な回答をしてください。',
      'ko': '당신은 지식이 풍부한 AI 어시스턴트입니다. 한국어로 전문적이고 이해하기 쉽게 답변해 주세요.'
    };

    const systemPrompt = systemPrompts[language] || systemPrompts['en'];

    const completion = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Context: ${context}\n\nQuestion: ${query}` }
      ],
      stream: true,
    });

    // 设置响应头以支持流式传输
    res.writeHead(200, {
      'Content-Type': 'text/plain',
      'Transfer-Encoding': 'chunked',
    });

    // 流式传输回答
    for await (const chunk of completion.data) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        res.write(content);
      }
    }

    res.end();
  } catch (error) {
    console.error('Chat API error:', error);
    res.status(500).json({ error: 'Failed to generate response' });
  }
}