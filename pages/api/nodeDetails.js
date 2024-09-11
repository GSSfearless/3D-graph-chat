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
        {role: "system", content: "You are an expert capable of providing in-depth explanations of complex concepts. Please provide a concise but detailed explanation."},
        {role: "user", content: `Please explain the following concept in detail: ${label}`}
      ],
    });

    const details = completion.choices[0].message.content;

    res.status(200).json({ details });
  } catch (error) {
    console.error('Error getting node details:', error);
    res.status(500).json({ message: 'Error getting node details', error: error.message });
  }
}
