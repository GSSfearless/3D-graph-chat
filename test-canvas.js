// test-canvas.js

const { createCanvas, registerFont } = require('canvas');
const fs = require('fs');
const path = require('path');

// 创建一个800x600的空白图像
const width = 800;
const height = 600;
const canvas = createCanvas(width, height);
const ctx = canvas.getContext('2d');

// 填充白色背景
ctx.fillStyle = 'white';
ctx.fillRect(0, 0, width, height);

// 注册和设置字体
const fontPath = path.join(process.cwd(), 'public/fonts/Impact.ttf');
registerFont(fontPath, { family: 'Impact' });

ctx.font = '30px Impact';
ctx.fillStyle = 'black';
ctx.textAlign = 'center';
ctx.fillText('测试文本', width / 2, height / 2);

// 保存图像
const buffer = canvas.toBuffer('image/png');
fs.writeFileSync('test-image.png', buffer);

console.log('Image generated and saved as test-image.png');