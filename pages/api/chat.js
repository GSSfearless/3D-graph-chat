import { Configuration, OpenAIApi } from 'openai';

export default async function handler(req, res) {
  const { context } = req.body;
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY, // 在 Vercel 环境变量中设置
  });
  const openai = new OpenAIApi(configuration);
  try {
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: context }],
    });
    const generatedAnswer = response.data.choices[0].message.content;
    res.status(200).json({ answer: generatedAnswer });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate answer' });
  }
}