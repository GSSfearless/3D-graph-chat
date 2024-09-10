import { OpenAIStream, StreamingTextResponse } from 'ai';
import OpenAI from 'openai';

const openai = new OpenAI({
  organization: 'org-gLWuvsHwqOs4i3QAdK8nQ5zk',
  project: 'proj_TRi4aW8PdBr9LBaE9W34pDPi',
});

export const runtime = 'edge';

export default async function handler(req) {
  const { query } = await req.json();

  if (!query) {
    return new Response('Query is required', { status: 400 });
  }

  const prompt = `
  请为以下问题创建一个知识图谱：${query}

  返回一个JSON格式的响应，包含'nodes'和'edges'数组。每个节点应该有'id'和'label'属性。每个边应该有'source'、'target'和'label'属性。

  请逐个生成节点和边，每次生成一个节点或边后，用---分隔。这将允许我们逐步构建图谱。

  示例：
  {"node": {"id": "1", "label": "概念A"}}
  ---
  {"node": {"id": "2", "label": "概念B"}}
  ---
  {"edge": {"source": "1", "target": "2", "label": "关系X"}}
  ---
  `;

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
    stream: true,
  });

  const stream = OpenAIStream(response);
  return new StreamingTextResponse(stream);
}