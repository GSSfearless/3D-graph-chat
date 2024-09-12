import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { nodeId, label, nodes } = req.body;

  if (!nodeId || !label || !nodes) {
    return res.status(400).json({ message: 'Missing required parameters' });
  }

  try {
    const relatedNodes = nodes.filter(n => n.id !== nodeId);
    const relatedNodesText = relatedNodes.map(n => n.data.label).join(', ');

    const prompt = `
    Provide a detailed explanation of the concept "${label}" in the context of a knowledge graph.
    Also, describe its relationship with the following related concepts: ${relatedNodesText}.
    
    Format your response using the following guidelines:
    1. Use double asterisks (**) to highlight important terms.
    2. Use hyphens (-) for bullet points.
    3. Use three hash symbols (###) for subheadings.
    
    Limit your response to 200 words.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a knowledgeable AI assistant specializing in explaining concepts and their relationships." },
        { role: "user", content: prompt }
      ],
      max_tokens: 300,
    });

    const explanation = completion.choices[0].message.content.trim();
    res.status(200).json({ explanation });
  } catch (error) {
    console.error('Error generating node explanation:', error);
    res.status(500).json({ message: 'Error generating explanation', error: error.message });
  }
}
