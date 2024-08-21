const { createCanvas, registerFont } = require('canvas');
const path = require('path');
const { OpenAI } = require('openai');

// 配置 OpenAI API
const openai = new OpenAI({
  organization: 'org-gLWuvsHwqOs4i3QAdK8nQ5zk',
  project: 'proj_TRi4aW8PdBr9LBaE9W34pDPi',
});

const NUM_PHRASES = 5;

module.exports = async function handler(req, res) {
  const { topic } = req.body;

  try {
    // 1. 生成空白背景图像
    const width = 800;
    const height = 600;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // 填充白色背景
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, width, height);

    // 注册字体
    const fontPath = path.join(process.cwd(), '../../public/fonts/Impact.ttf');
    registerFont(fontPath, { family: 'Impact' });

    // 设置文本样式
    ctx.font = '30px Impact';
    ctx.fillStyle = 'black';
    ctx.textAlign = 'center';

    // 2. 使用 AI 生成短语
    const response = await openai.completions.create({
      model: 'gpt-3.5-turbo',
      prompt: `Generate ${NUM_PHRASES} funny meme phrases about ${topic}.`,
      max_tokens: 150,
    });

    const phrases = response.choices[0].text.trim().split('\n').filter(Boolean);

    // 3. 将短语均匀分布在背景上
    const interval = height / (phrases.length + 1);
    phrases.forEach((phrase, index) => {
      const y = interval * (index + 1);
      ctx.fillText(phrase, width / 2, y);
    });

    // 输出图像
    const buffer = canvas.toBuffer('image/png');
    res.setHeader('Content-Type', 'image/png');
    res.send(buffer);

  } catch (error) {
    console.error('Error generating meme:', error);
    res.status(500).json({
      error: 'Failed to generate meme',
      details: error.message,
      stack: error.stack,
    });
  }
};