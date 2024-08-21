import axios from 'axios';
import { createCanvas, loadImage, registerFont } from 'canvas';

// 确保 Impact.ttf 字体文件在项目根目录下
registerFont('Impact.ttf', { family: 'Impact' });

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

    // 加载模板图片
    const img = await loadImage(templateBuffer);

    // 创建 canvas 画布
    const width = img.width;
    const height = img.height;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // 绘制模板图片
    ctx.drawImage(img, 0, 0, width, height);

    // 设置文字样式
    ctx.font = '40px Impact';
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.textAlign = 'center';

    // 在图片顶部绘制查询文字
    ctx.fillText(query, width / 2, 50);
    ctx.strokeText(query, width / 2, 50);

    // 在图片底部绘制 AI 回答文本
    const lines = aiAnswer.split('. ').map((line, i) => {
      const y = height - (lines.length - i) * 40;
      ctx.fillText(line, width / 2, y);
      ctx.strokeText(line, width / 2, y);
    });

    // 输出最终图片
    const buffer = canvas.toBuffer('image/png');
    res.setHeader('Content-Type', 'image/png');
    res.send(buffer);

  } catch (error) {
    console.error('Error generating meme:', error);
    res.status(500).json({ error: 'Failed to generate meme', details: error.message });
  }
}