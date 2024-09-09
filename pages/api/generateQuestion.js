import OpenAI from 'openai';

const openai = new OpenAI({
  organization: 'org-gLWuvsHwqOs4i3QAdK8nQ5zk',
  project: 'proj_TRi4aW8PdBr9LBaE9W34pDPi',
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: '只允许 POST 请求' });
  }

  const { nodeLabel } = req.body;

  if (!nodeLabel) {
    return res.status(400).json({ message: '缺少必要的参数' });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {role: "system", content: "你是一个专家，能够根据给定的主题生成深入的问题。"},
        {role: "user", content: `请根据以下主题生成一个深入的问题：${nodeLabel}`}
      ],
    });

    const generatedQuestion = completion.choices[0].message.content.trim();
    res.status(200).json({ question: generatedQuestion });
  } catch (error) {
    console.error('生成问题时出错:', error);
    res.status(500).json({ message: '生成问题失败', error: error.message });
  }
}
