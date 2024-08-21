const sharp = require('sharp');
const { OpenAI } = require('openai');
const path = require('path');
const fs = require('fs');

// 配置 OpenAI API
const openai = new OpenAI({
  organization: 'org-gLWuvsHwqOs4i3QAdK8nQ5zk',
  project: 'proj_TRi4aW8PdBr9LBaE9W34pDPi',
  apiKey: process.env.OPENAI_API_KEY,
});

const NUM_PHRASES = 5;

const handler = async (req, res) => {
  console.log('Request method:', req.method);  // 日志 1
  console.log('Request headers:', req.headers);  // 日志 2
  console.log('Request body:', req.body);  // 日志 3
  
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    console.log('Method not allowed');  // 日志 4
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { topic } = req.body;
  console.log('Request body topic:', topic);  // 日志 5
  if (!topic) {
    console.log('Topic is not provided in the request body');  // 日志 6
    return res.status(400).json({ error: 'Topic is required' });
  }

  try {
    // 生成空白背景图像
    const width = 800;
    const height = 600;
    console.log('Generating blank image...');  // 日志 7
    
    const blankImageBuffer = await sharp({
      create: {
        width: width,
        height: height,
        channels: 3,
        background: { r: 255, g: 255, b: 255 }
      }
    }).png().toBuffer();

    console.log('Blank image generated');  // 日志 8

    // 使用 AI 生成短语
    console.log('Generating meme phrases using OpenAI...');  // 日志 9
    
    const response = await openai.completions.create({
      model: 'text-davinci-003',
      prompt: `Generate ${NUM_PHRASES} funny meme phrases about ${topic}.`,
      max_tokens: 150,
    });

    const phrases = response.choices[0].text.trim().split('\n').filter(Boolean);
    console.log('Fetched phrases:', phrases);  // 日志 10

    // 使用 sharp 在图像上绘制文字
    let image = sharp(blankImageBuffer);

    // 加载字体文件
    const fontPath = path.join(process.cwd(), 'public/fonts/Impact.ttf');
    if (!fs.existsSync(fontPath)) {
      console.error(`Font file not found at path: ${fontPath}`);
      return res.status(500).json({ error: 'Font file not found' });
    }
    console.log('Font file found at:', fontPath);  // 日志 11

    // 绘制每一个短语
    const textOverlay = phrases.map((phrase, index) => ({
      input: Buffer.from(
        `<svg width="${width}" height="40">
          <text x="50%" y="50%" font-family="Impact" font-size="30" fill="black" text-anchor="middle" dominant-baseline="middle">${phrase}</text>
        </svg>`
      ),
      top: 50 + index * ((height - 100) / NUM_PHRASES),
      left: 0
    }));
    
    // 合成文本和背景
    console.log('Creating composite image...');  // 日志 12
    
    image = await image.composite(textOverlay).png().toBuffer();
    console.log('Composite image created');  // 日志 13

    // 输出图像
    res.setHeader('Content-Type', 'image/png');
    res.send(image);
    console.log('Image sent');  // 日志 14

  } catch (error) {
    console.error('Error generating meme:', error);  // 调试错误日志
    res.status(500).json({
      error: 'Failed to generate meme',
      details: error.message,
      stack: error.stack,
    });
  }
};

module.exports = handler;