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

  const { context, query, graphData } = req.body;

  if (!context || !query || !graphData) {
    return res.status(400).json({ error: 'Context, query, and graphData are required' });
  }

  const prompt = `
  You are an AI assistant with expertise in explaining complex concepts. Using the provided knowledge graph, create a concise and accurate explanation of the user's query. Your response should be in English and use Markdown formatting.

  Follow these guidelines:
  1. Use double asterisks (**) to highlight important concepts or keywords in bold.
  2. Use numbered lists to organize main points.
  3. Use three hash symbols (###) to create subheadings on separate lines.
  4. Use single line breaks to separate paragraphs.

  Knowledge Graph Structure:
  ${JSON.stringify(graphData, null, 2)}

  Context Information:
  ${context.map((item, index) => `${item.title}\n${item.snippet}`).join('\n\n')}

  User Query: "${query}"

  Provide a structured explanation based on the knowledge graph, incorporating relevant context information.
  `;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
    });

    const generatedAnswer = response.choices[0].message.content;
    res.status(200).json({ answer: generatedAnswer });
  } catch (error) {
    console.error('Error generating answer:', error);

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