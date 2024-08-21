// pages/api/meme-generator.js
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

  const { topic } = req.body;

  if (!topic) {
    return res.status(400).json({ error: 'Topic is required' });
  }

  try {
    const response = await openai.images.generate({
      prompt: `Create a funny meme about ${topic}`,
      n: 1,
      size: "512x512",
    });

    const memeUrl = response.data[0].url; 
    res.status(200).json({ memeUrl });
  } catch (error) {
    console.error('Error generating meme:', error);

    if (error.response) {
      res.status(500).json({ error: 'Failed to generate meme', details: error.response.data });
    } else {
      res.status(500).json({ error: 'Failed to generate meme', details: error.message });
    }
  }
}