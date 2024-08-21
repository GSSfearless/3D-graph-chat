import { createCanvas, loadImage } from 'canvas';
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  const { query, aiAnswer } = req.body;

  // Define canvas dimensions
  const width = 800;
  const height = 600;

  // Create canvas
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Load background image for meme (stored locally)
  const backgroundPath = path.join(process.cwd(), 'public', 'background.jpg'); 
  const backgroundImage = await loadImage(backgroundPath);
  ctx.drawImage(backgroundImage, 0, 0, width, height);

  // Define text properties
  ctx.font = '28px Impact';
  ctx.fillStyle = 'white';
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 2;
  ctx.textAlign = 'center';

  // Add text to canvas
  ctx.fillText(query, width / 2, 60);
  ctx.strokeText(query, width / 2, 60);

  // Split AI answer into lines if it's too long
  const maxLineLength = 60;
  const lines = [];
  aiAnswer.split('. ').forEach(sentence => {
    if (sentence.length > maxLineLength) {
      const words = sentence.split(' ');
      let line = '';
      words.forEach(word => {
        if ((line + word).length < maxLineLength) {
          line += (line === '' ? '' : ' ') + word;
        } else {
          lines.push(line);
          line = word;
        }
      });
      if (line !== '') lines.push(line);
    } else {
      lines.push(sentence);
    }
  });

  // Add multiline AI answer to canvas
  lines.forEach((line, index) => {
    const yPosition = 100 + index * 30;
    ctx.fillText(line, width / 2, yPosition);
    ctx.strokeText(line, width / 2, yPosition);
  });

  // Convert canvas to PNG and return as response
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync('/tmp/meme.png', buffer);

  res.setHeader('Content-Type', 'image/png');
  res.send(buffer);
}