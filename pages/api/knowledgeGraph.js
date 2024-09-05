import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: '只允许POST请求' });
  }

  const { query } = req.body;

  try {
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {role: "system", content: "你是一个专家，能够将复杂的概念分解成结构化的知识图表。请提供一个JSON格式的回答，包含节点和边的信息。"},
        {role: "user", content: `请为以下问题创建一个知识图表：${query}`}
      ],
    });

    const graphData = JSON.parse(completion.data.choices[0].message.content);
    res.status(200).json(graphData);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: '生成知识图表时出错' });
  }
}