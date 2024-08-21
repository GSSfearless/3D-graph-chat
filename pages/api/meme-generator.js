import axios from 'axios';
import { createCanvas, loadImage, registerFont } from 'canvas';
import path from 'path';

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
    // 抓取meme模板图片从外部URL
    console.log(`Fetching image from url: ${selectedTemplate.url}`);
    const response = await axios.get(selectedTemplate.url, { responseType: 'arraybuffer' });
    const templateBuffer = Buffer.from(response.data);

    // 加载模板图片
    const img = await loadImage(templateBuffer);
    console.log('Image loaded successfully');

    // 创建canvas
    const width = img.width;
    const height = img.height;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // 画模板图片
    ctx.drawImage(img, 0, 0, width, height);

    // 注册字体
    const fontPath = path.join(process.cwd(), 'public/fonts/Impact.ttf');
    console.log(`Registering font from path: ${fontPath}`);
    registerFont(fontPath, { family: 'Impact' });

    // 设置文本样式
    ctx.font = '40px Impact';
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.textAlign = 'center';

    // 在顶部绘制查询文本
    ctx.fillText(query, width / 2, 50);
    ctx.strokeText(query, width / 2, 50);

    // 在底部绘制AI答案文本
    const lines = aiAnswer.split('. ').map((line, i) => {
      const y = height - (lines.length - i) * 40;
      ctx.fillText(line, width / 2, y);
      ctx.strokeText(line, width / 2, y);
    });

    // 输出最终图像
    const buffer = canvas.toBuffer('image/png');
    console.log('Image generated successfully');
    res.setHeader('Content-Type', 'image/png');
    res.send(buffer);

  } catch (error) {
    console.error('Error generating meme:', error);
    res.status(500).json({
      error: 'Failed to generate meme',
      details: error.message,
      stack: error.stack
    });
  }
}