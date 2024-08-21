import axios from 'axios';
import sharp from 'sharp';

const memeTemplates = [
  {
    id: '1',
    name: 'Distracted Boyfriend',
    url: 'https://i.imgflip.com/1ur9b0.jpg'
  },
  {
    id: '2',
    name: 'Two Buttons',
    url: 'https://i.imgflip.com/1g8my4.jpg'
  },
  {
    id: '3',
    name: 'Drake Hotline Bling',
    url: 'https://i.imgflip.com/30b1gx.jpg'
  },
  // 更多模板可以在这里添加
];

export default async function handler(req, res) {
  const { query, aiAnswer } = req.body;

  // 随机选择一个模板
  const selectedTemplate = memeTemplates[Math.floor(Math.random() * memeTemplates.length)];

  try {
    // Fetch the meme template image from external URL
    const response = await axios.get(selectedTemplate.url, { responseType: 'arraybuffer' });
    const templateBuffer = Buffer.from(response.data);

    // Define image dimensions (assuming same dimensions for simplicity)
    const width = 800;
    const height = 600;

    // Create meme image with sharp
    const svgText = `
      <svg width="${width}" height="${height}">
        <style>
          .title { fill: white; font-size: 28px; font-family: Impact; }
          .shadow { fill: black; font-size: 28px; font-family: Impact; }
          .text { fill: white; font-size: 20px; font-family: Impact; }
          .text-shadow { fill: black; font-size: 20px; font-family: Impact; }
        </style>
        <text x="50%" y="50" text-anchor="middle" class="shadow">${query}</text>
        <text x="50%" y="50" text-anchor="middle" class="title">${query}</text>
        ${aiAnswer.split('. ').map((line, i) => `
          <text x="50%" y="${100 + i * 30}" text-anchor="middle" class="text-shadow">${line}</text>
          <text x="50%" y="${100 + i * 30}" text-anchor="middle" class="text">${line}</text>
        `).join('')}
      </svg>
    `;

    const memeImage = await sharp(templateBuffer)
      .composite([
        { input: Buffer.from(svgText), blend: 'over' }
      ])
      .png()
      .toBuffer();

    res.setHeader('Content-Type', 'image/png');
    res.send(memeImage);

  } catch (error) {
    res.status(500).json({ error: 'Failed to generate meme', details: error.message });
  }
}