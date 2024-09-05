const OpenAI = require('openai');

const openai = new OpenAI({
  organization: 'org-gLWuvsHwqOs4i3QAdK8nQ5zk',
  project: 'proj_TRi4aW8PdBr9LBaE9W34pDPi',
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST requests are allowed' });
  }

  const { query } = req.body;

  if (!query) {
    return res.status(400).json({ message: 'Missing query parameter' });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {role: "system", content: "You are an expert capable of breaking down complex concepts into structured knowledge graphs. Please provide a response in JSON format, including information about nodes and edges."},
        {role: "user", content: `Please create a knowledge graph for the following question: ${query}`}
      ],
    });

    const graphData = JSON.parse(completion.choices[0].message.content);
    res.status(200).json(graphData);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Error generating knowledge graph', error: error.message });
  }
}