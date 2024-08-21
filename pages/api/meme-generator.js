import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

export default async function handler(req, res) {
  const { query, aiAnswer } = req.body;

  // Define image dimensions
  const width = 800;
  const height = 600;

  // Load background image for meme (stored locally)
  const backgroundPath = path.join(process.cwd(), 'public', 'background.jpg');
  const backgroundImage = fs.readFileSync(backgroundPath);

  // Create meme image with sharp
  try {
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

    const memeImage = await sharp(backgroundImage)
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