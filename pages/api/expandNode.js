import OpenAI from 'openai';

const openai = new OpenAI({
  organization: 'org-gLWuvsHwqOs4i3QAdK8nQ5zk',
  project: 'proj_TRi4aW8PdBr9LBaE9W34pDPi',
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST requests are allowed' });
  }

  const { nodeId, label } = req.body;

  if (!nodeId || !label) {
    return res.status(400).json({ message: 'Missing required parameters' });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {role: "system", content: "You are an expert capable of breaking down complex concepts. Please provide a response in JSON format, including 'nodes' and 'edges' arrays. Each node should have 'id' and 'label' properties."},
        {role: "user", content: `Please provide two more detailed explanations or related concepts for the following concept: ${label}`}
      ],
    });

    const expandedData = JSON.parse(completion.choices[0].message.content);

    // Process new nodes and edges IDs to ensure they are unique
    const newNodes = expandedData.nodes.map((node, index) => ({
      id: `${nodeId}-child-${index + 1}`,
      data: { label: node.label },
    }));

    const newEdges = newNodes.map(node => ({
      id: `${nodeId}-${node.id}`,
      source: nodeId,
      target: node.id,
    }));

    res.status(200).json({ nodes: newNodes, edges: newEdges });
  } catch (error) {
    console.error('Error expanding node:', error);
    res.status(500).json({ message: 'Error expanding node', error: error.message });
  }
}