const OpenAI = require('openai');

const openai = new OpenAI({
  organization: 'org-gLWuvsHwqOs4i3QAdK8nQ5zk',
  project: 'proj_TRi4aW8PdBr9LBaE9W34pDPi',
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { context, query } = req.body;

  if (!context || !query) {
    return res.status(400).json({ error: 'Context and query are required' });
  }

  const prompt = `
  你是一个大型语言AI助手。请针对用户的问题提供一个简洁、准确的回答。你将获得一组与问题相关的上下文信息。你的回答必须正确、准确，并以专业和中立的语气撰写。请限制在1024个标记以内。不要提供与问题无关的信息，也不要重复。如果给定的上下文不提供足够的信息，请说"关于[相关主题]的信息不足"。

  请使用以下格式来组织你的回答：
  1. 使用粗体（用**包围）来强调重要概念或关键词。
  2. 使用编号列表来组织多个要点。
  3. 如果适用，使用小标题来分隔不同的部分。

  不要引用任何上下文编号或来源。专注于提供信息丰富、结构清晰的回答。

  以下是上下文信息集：

  ${context.map((item, index) => `标题: ${item.title}\n摘要: ${item.snippet}`).join('\n\n')}

  记住，不要盲目重复上下文。这里是用户的问题：
  "${query}"
  `;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
    });

    const generatedAnswer = response.choices[0].message.content;
    res.status(200).json({ answer: generatedAnswer });
  } catch (error) {
    console.error('生成答案时出错:', error);

    if (error.response) {
      console.error('状态:', error.response.status);
      console.error('头部:', error.response.headers);
      console.error('数据:', error.response.data);
      res.status(500).json({ error: '生成答案失败', details: error.response.data });
    } else {
      console.error('错误信息:', error.message);
      res.status(500).json({ error: '生成答案失败', details: error.message });
    }
  }
}