const OpenAI = require('openai');
const { createCanvas, loadImage, registerFont } = require('canvas');
const path = require('path');

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
    const logoImagePath = path.resolve('./public/logo-image.png');
    const logoImage = await loadImage(logoImagePath);

    // Draw logo in the center maintaining original proportions
    const logoSizeWidth = 150;
    const logoSizeHeight = 164;
    const logoX = (canvas.width - logoSizeWidth) / 2;
    const logoY = (canvas.height - logoSizeHeight) / 2;
    context.drawImage(logoImage, logoX, logoY, logoSizeWidth, logoSizeHeight);

    // Draw memes around the logo
    const memeFont = '16px "Noto Sans SC"'; // 使用 Noto Sans SC 字体
    const memeColor = 'black';

    context.font = memeFont;
    context.fillStyle = memeColor;
    context.textAlign = 'center';

    // 调整文本框位置，使其更靠近 Logo
    const textPadding = 20;
    const halfLogoHeight = logoSizeHeight / 2;
    const canvasHalfHeight = canvas.height / 2;
    const positions = [
      { x: canvas.width / 2, y: logoY - halfLogoHeight - textPadding - 30 }, // 上方
      { x: logoX + logoSizeWidth + textPadding + 70, y: canvasHalfHeight }, // 右侧，增加距离
      { x: canvas.width / 2, y: logoY + logoSizeHeight + textPadding + 30 }, // 下方
      { x: logoX - textPadding - 70, y: canvasHalfHeight } // 左侧，增加距离
    ];

    // 调整文本框宽度
    const textMaxWidth = 200;

    memes.forEach((meme, index) => {
      const { x, y } = positions[index];
      drawWrappedText(context, meme, x, y, textMaxWidth, context.textAlign === 'left');
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

function drawWrappedText(context, text, x, y, maxWidth, isVertical) {
  // 使文本内容居中对齐
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
      testY += 20; // 行距
    } else {
      line = testLine;
    }
  }
  context.fillText(line, x, testY);
}