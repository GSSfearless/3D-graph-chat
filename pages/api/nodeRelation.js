import { OpenAIStream } from '../../utils/OpenAIStream';

export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  try {
    const { nodeContent, nodeLabel, userQuestion } = await req.json();

    const prompt = `
作为一个知识图谱解释专家，请分析并解释以下节点内容与用户问题之间的关联性：

用户的问题：${userQuestion}
节点标题：${nodeLabel}
节点内容：${nodeContent}

请从以下几个方面进行分析：
1. 这个节点与用户问题的直接关联点
2. 这个节点如何帮助理解或回答用户问题
3. 这个节点在整体知识结构中的作用

请用中文回答，以markdown格式输出，确保内容简洁明了。
`;

    const payload = {
      model: "gpt-4-turbo-preview",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      max_tokens: 800,
      stream: true,
      n: 1,
    };

    const stream = await OpenAIStream(payload);
    return new Response(stream);

  } catch (error) {
    console.error('Error in nodeRelation API:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate relation explanation' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 