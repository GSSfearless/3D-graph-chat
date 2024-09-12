import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { nodeId, label, graphData } = req.body;

  if (!nodeId || !label || !graphData) {
    return res.status(400).json({ message: 'Missing required parameters' });
  }

  try {
    const relatedNodes = graphData.edges
      .filter(edge => edge.source === nodeId || edge.target === nodeId)
      .map(edge => {
        const relatedNodeId = edge.source === nodeId ? edge.target : edge.source;
        return graphData.nodes.find(node => node.id === relatedNodeId);
      });

    const prompt = `
      Provide a detailed explanation for the concept "${label}" in the context of a knowledge graph.
      Related concepts: ${relatedNodes.map(node => node.data.label).join(', ')}.
      
      Please structure your response as follows:
      1. A brief definition or explanation of "${label}".
      2. How "${label}" relates to or interacts with the following concepts: ${relatedNodes.map(node => node.data.label).join(', ')}.
      3. Any important sub-concepts or aspects of "${label}" that are relevant to understanding it fully.

      Format your response using markdown, with appropriate headers, bullet points, and emphasis where needed.
      Limit your response to about 200 words.
    `;

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