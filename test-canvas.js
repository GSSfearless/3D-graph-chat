const { createCanvas } = require('canvas');

const width = 200;
const height = 200;
const canvas = createCanvas(width, height);
const ctx = canvas.getContext('2d');

ctx.fillStyle = 'red';
ctx.fillRect(0, 0, width, height);

console.log('<img src="' + canvas.toDataURL() + '" />');