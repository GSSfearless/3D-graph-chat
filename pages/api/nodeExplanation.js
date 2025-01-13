import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { nodeId, label, graphData, originalQuery } = req.body;

  if (!nodeId || !label || !graphData || !originalQuery) {
    return res.status(400).json({ message: 'Missing required parameters' });
  }

  try {
    const relatedNodes = graphData.edges
      .filter(edge => edge.source === nodeId || edge.target === nodeId)
      .map(edge => {
        const relatedNodeId = edge.source === nodeId ? edge.target : edge.source;
        return graphData.nodes.find(node => node.id === relatedNodeId);
      });

    const prompt = `你是一个专家，需要基于用户的原始问题"${originalQuery}"来深入解析概念"${label}"。
请提供两个与用户原始问题高度相关的延伸概念。这些概念应该：
1. 直接关联用户的核心关注点
2. 帮助用户更深入理解他们关心的问题
3. 保持在用户查询的语义范围内

请以 JSON 格式返回响应，包含 'nodes' 数组。每个节点需要有 'id' 和 'label' 属性。`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 300,
    });

    const explanation = completion.choices[0].message.content;

    res.status(200).json({ explanation });
  } catch (error) {
    console.error('Error generating node explanation:', error);
    res.status(500).json({ message: 'Error generating explanation', error: error.message });
  }
}