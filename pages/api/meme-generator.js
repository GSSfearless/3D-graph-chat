import axios from 'axios';
import { createCanvas, registerFont } from 'canvas';
import path from 'path';
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
  // More templates can be added here
];

export default async function handler(req, res) {
  const { query, aiAnswer } = req.body;

  // Randomly select a meme template
  const selectedTemplate = memeTemplates[Math.floor(Math.random() * memeTemplates.length)];

  try {
    // Fetch the meme template image from external URL
    console.log(`Fetching image from url: ${selectedTemplate.url}`);
    const response = await axios.get(selectedTemplate.url, { responseType: 'arraybuffer' });
    const templateBuffer = Buffer.from(response.data);

    // Load template image using sharp
    const templateImage = sharp(templateBuffer);
    const { width, height } = await templateImage.metadata();

    // Register font and create text canvas
    const fontPath = path.join(process.cwd(), 'public/fonts/Impact.ttf');
    console.log(`Registering font from path: ${fontPath}`);
    registerFont(fontPath, { family: 'Impact' });

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(await loadImage(templateBuffer), 0, 0, width, height);

    // Set text style
    ctx.font = '40px Impact';
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.textAlign = 'center';

    // Draw query text at the top
    ctx.fillText(query, width / 2, 50);
    ctx.strokeText(query, width / 2, 50);

    // Draw AI answer text at the bottom
    const lines = aiAnswer.split('. ').map((line, i) => {
      const y = height - (lines.length - i) * 40;
      ctx.fillText(line, width / 2, y);
      ctx.strokeText(line, width / 2, y);
    });

    // Combine the template image with text canvas
    const textBuffer = canvas.toBuffer('image/png');
    const finalImage = await sharp(templateBuffer)
      .composite([{ input: textBuffer, blend: 'over' }])
      .toBuffer();

    // Output final image
    console.log('Image generated successfully');
    res.setHeader('Content-Type', 'image/png');
    res.send(finalImage);

  } catch (error) {
    console.error('Error generating meme:', error);
    res.status(500).json({
      error: 'Failed to generate meme',
      details: error.message,
      stack: error.stack
    });
  }
}