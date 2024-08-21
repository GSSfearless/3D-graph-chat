

// /pages/api/meme-generator.js
const OpenAI = require('openai');

// Replace with your actual OpenAI credentials
const openai = new OpenAI({
  organization: 'org-your-organization-id',
  project: 'proj_TRi4aW8PdBr9LBaE9W34pDPi',
});

const Jimp = require('jimp');

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
    // Generate meme text using OpenAI API
    const prompt = `Generate a funny meme caption about the topic: ${topic}`;
    const response = await openai.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
    });
    const memeText = response.choices[0].text.trim();

    // Load a meme template image
    const image = await Jimp.read('https://i.imgflip.com/30b1gx.jpg'); // Sample template image URL

    // Add text to the image
    const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);
    image.print(font, 10, 10, memeText, image.bitmap.width - 20);

    // Convert the image to a buffer
    const imageBuffer = await image.getBufferAsync(Jimp.MIME_JPEG);

    // Return the image as response
    res.setHeader('Content-Type', 'image/jpeg');
    res.send(imageBuffer);
  } catch (error) {
    console.error('Error creating meme:', error);
    res.status(500).json({ error: 'Failed to create meme' });
  }
}