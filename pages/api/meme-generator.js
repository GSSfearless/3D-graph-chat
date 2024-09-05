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
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { topic } = req.body;

  if (!topic) {
    return res.status(400).json({ error: 'Topic is required' });
  }

  try {
    // Step 1: 生成一句包含上下句的meme
    const prompt = `生成一句有趣且适合家庭的meme，包含上下句，关于${topic}。`;
    const gptResponse = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
    });

    const meme = gptResponse.choices[0].message.content.trim();

    // Step 2: 创建meme图片
    const canvas = createCanvas(800, 800);
    const context = canvas.getContext('2d');

    // 绘制白色背景
    context.fillStyle = '#FFFFFF';
    context.fillRect(0, 0, canvas.width, canvas.height);

    // 添加边框
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
    const logoSizeWidth = 150;
    const logoSizeHeight = 164;
    const logoX = (canvas.width - logoSizeWidth) / 2;
    const logoY = (canvas.height - logoSizeHeight) / 2;
    context.drawImage(logoImage, logoX, logoY, logoSizeWidth, logoSizeHeight);

    // 绘制meme文本
    const memeFont = '24px "Noto Sans SC"'; // 使用更大的字体
    const memeColor = 'black';

    context.font = memeFont;
    context.fillStyle = memeColor;
    context.textAlign = 'center';

    // 分割上下句
    const [topText, bottomText] = meme.split('\n');

    // 绘制上句
    drawWrappedText(context, topText, canvas.width / 2, 50, canvas.width - 40);

    // 绘制下句
    drawWrappedText(context, bottomText, canvas.width / 2, canvas.height - 50, canvas.width - 40);

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

function drawWrappedText(context, text, x, y, maxWidth) {
  context.textAlign = 'center';

  const words = text.split(' ');
  let line = '';
  let testY = y;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = context.measureText(testLine);
    const testWidth = metrics.width;
  
    if (testWidth > maxWidth && n > 0) {
      context.fillText(line, x, testY);
      line = words[n] + ' ';
      testY += 30; // 增加行距
    } else {
      line = testLine;
    }
  }
  context.fillText(line, x, testY);
}