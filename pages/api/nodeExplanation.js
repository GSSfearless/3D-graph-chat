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
    You are a large language AI assistant. Please provide a concise and accurate explanation for the concept "${label}" in the context of a knowledge graph. Your explanation must be correct, accurate, and written in a professional and neutral tone. Please limit it to about 200 words. Do not provide information unrelated to the concept, and do not repeat yourself.

    Please strictly use the following format to organize your answer:
    1. Use double asterisks (**) to surround important concepts or keywords to indicate bold. For example: **important concept**.
    2. Use a bullet point (•) followed by a space to create bulleted lists. Each new point should start on a new line.
    3. Use three hash symbols (###) to create subheadings, ensuring the subheading is on its own line.
    4. Use a single line break to separate paragraphs.

    Example format:
    ### Key Points
    • **First important concept**
    • **Second important concept**
    • **Third important concept**

    ### Detailed Explanation
    • Explanation of the first concept
      • Additional details
      • More information
    • Explanation of the second concept
    • Explanation of the third concept

    Do not use more than three hash symbols (###) for headings. Focus on providing an informative and well-structured explanation.

    Related concepts: ${relatedNodes.map(node => node.data.label).join(', ')}.
    
    Please structure your response as follows:
    1. A brief definition or explanation of "${label}".
    2. How "${label}" relates to or interacts with the related concepts.
    3. Any important sub-concepts or aspects of "${label}" that are relevant to understanding it fully.
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