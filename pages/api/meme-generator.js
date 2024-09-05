const OpenAI = require('openai');
const { createCanvas, loadImage, registerFont } = require('canvas');
const path = require('path');
const fs = require('fs');

const openai = new OpenAI({
  organization: 'org-gLWuvsHwqOs4i3QAdK8nQ5zk',
  project: 'proj_TRi4aW8PdBr9LBaE9W34pDPi',
});

// 注册字体，确保使用的字体存在
registerFont(path.resolve('./public/fonts/NotoSansSC-Regular.ttf'), { family: 'Noto Sans SC' });

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`方法 ${req.method} 不被允许`);
  }

  const { topic } = req.body;

  if (!topic) {
    return res.status(400).json({ error: '主题是必需的' });
  }

  try {
    // 步骤 1: 生成一个meme文本
    const prompt = `生成一个有趣且适合家庭的meme关于${topic}。格式应为两行文本。`;
    const gptResponse = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
    });

    let meme = gptResponse.choices[0].message.content.trim();
    let [topText, bottomText] = meme.split('\n');

    // 确保有两行文本
    if (!bottomText) {
      bottomText = topText;
      topText = '';
    }

    // 步骤 2: 创建meme图片
    const canvas = createCanvas(800, 800);
    const context = canvas.getContext('2d');

    // 绘制白色背景
    context.fillStyle = '#FFFFFF';
    context.fillRect(0, 0, canvas.width, canvas.height);

    // 绘制边框
    context.strokeStyle = '#000000';
    context.lineWidth = 10;
    context.strokeRect(5, 5, canvas.width - 10, canvas.height - 10);

    // 加载随机logo图片
    const logoDir = path.resolve('./public/doge_raw');
    const logos = fs.readdirSync(logoDir);
    const randomLogo = logos[Math.floor(Math.random() * logos.length)];
    const logoImagePath = path.join(logoDir, randomLogo);
    const logoImage = await loadImage(logoImagePath);

    // 在中心绘制logo，保持原始比例
    const logoSizeWidth = 300;
    const logoSizeHeight = 328;
    const logoX = (canvas.width - logoSizeWidth) / 2;
    const logoY = (canvas.height - logoSizeHeight) / 2;
    context.drawImage(logoImage, logoX, logoY, logoSizeWidth, logoSizeHeight);

    // 绘制meme文本
    const memeFont = 'bold 36px "Noto Sans SC"';
    const memeColor = 'black';

    context.font = memeFont;
    context.fillStyle = memeColor;
    context.textAlign = 'center';

    // 绘制上下文本
    const topY = 80;
    const bottomY = canvas.height - 80;
    drawWrappedText(context, topText, canvas.width / 2, topY, canvas.width - 40, 'top');
    drawWrappedText(context, bottomText, canvas.width / 2, bottomY, canvas.width - 40, 'bottom');

    const buffer = canvas.toBuffer('image/png');

    res.setHeader('Content-Type', 'image/png');
    res.status(200).end(buffer, 'binary');
  } catch (error) {
    console.error('生成meme时出错:', error);

    if (error.response) {
      res.status(500).json({ error: '生成meme失败', details: error.response.data });
    } else {
      res.status(500).json({ error: '生成meme失败', details: error.message });
    }
  }
}

function drawWrappedText(context, text, x, y, maxWidth, position) {
  context.textAlign = 'center';
  const words = text.split(' ');
  let lines = [];
  let currentLine = words[0];

  for (let i = 1; i < words.length; i++) {
    let testLine = currentLine + ' ' + words[i];
    let metrics = context.measureText(testLine);
    let testWidth = metrics.width;

    if (testWidth > maxWidth) {
      lines.push(currentLine);
      currentLine = words[i];
    } else {
      currentLine = testLine;
    }
  }
  lines.push(currentLine);

  let lineHeight = 40;
  let totalHeight = lines.length * lineHeight;
  let startY = position === 'top' ? y : y - totalHeight;

  for (let i = 0; i < lines.length; i++) {
    context.fillText(lines[i], x, startY + (i * lineHeight));
  }
}