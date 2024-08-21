// pages/api/meme-generator.js
const OpenAI = require('openai');
const { createCanvas, loadImage, registerFont } = require('canvas');
const path = require('path');

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
    // Step 1: Generate meme texts
    const prompt = `Generate 4 funny and family-friendly memes about ${topic}.`;
    const gptResponse = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
    });

    const memes = gptResponse.choices[0].message.content.split('\n').filter(meme => meme.trim().length > 0);

    // Step 2: Create meme image
    const canvas = createCanvas(800, 800);
    const context = canvas.getContext('2d');

    // Draw white background
    context.fillStyle = '#FFFFFF';
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Load logo image
    const logoImagePath = path.resolve('./public/logo-image.png');       // 你需要将logo图像保存在 public 文件夹中
    const logoImage = await loadImage(logoImagePath);

    // Draw logo in the center
    const logoSize = 200;
    context.drawImage(logoImage, (canvas.width - logoSize) / 2, (canvas.height - logoSize) / 2, logoSize, logoSize);

    // Draw memes around the logo
    const memeFont = '20px Arial';
    const memeColor = 'black';
    const memePadding = 30;

    context.font = memeFont;
    context.fillStyle = memeColor;
    context.textAlign = 'center';

    const positions = [
      { x: canvas.width / 2, y: memePadding },
      { x: canvas.width - memePadding, y: canvas.height / 2 },
      { x: canvas.width / 2, y: canvas.height - memePadding },
      { x: memePadding, y: canvas.height / 2 }
    ];

    memes.forEach((meme, index) => {
      const { x, y } = positions[index];
      const lines = meme.split(' ');
      let line = '';

      lines.forEach(word => {
        const tempLine = line + word + ' ';
        const lineWidth = context.measureText(tempLine).width;
        if (lineWidth < 150) {
          line = tempLine;
        } else {
          context.fillText(line, x, y - (lines.length - 1) * 20 / 2 + index * 20);
          line = word + ' ';
        }
      });

      context.fillText(line, x, y - (lines.length - 1) * 20 / 2 + index * 20);
    });

    const buffer = canvas.toBuffer('image/png');

    res.setHeader('Content-Type', 'image/png');
    res.status(200).end(buffer, 'binary');
  } catch (error) {
    console.error('Error generating meme:', error);

    if (error.response) {
      res.status(500).json({ error: 'Failed to generate meme', details: error.response.data });
    } else {
      res.status(500).json({ error: 'Failed to generate meme', details: error.message });
    }
  }
}