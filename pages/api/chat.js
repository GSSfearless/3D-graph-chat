const { Configuration, OpenAIApi } = require('openai');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { context, query } = req.body;

  if (!context || !query) {
    return res.status(400).json({ error: 'Context and query are required' });
  }

  // 配置 OpenAI API 客户端
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const openai = new OpenAIApi(configuration);

  // 创建提示词，将检索结果拼接成一个上下文
  const prompt = `
  You are a large language AI assistant built by ThinkAny AI. You are given a user question, and please write a clean, concise and accurate answer to the question. You will be given a set of related contexts to the question, each starting with a reference number like [[citation:x]], where x is a number. Please use the context and cite the context at the end of each sentence if applicable. Your answer must be correct, accurate, and written by an expert using an unbiased and professional tone. Please limit to 1024 tokens. Do not give any information that is not related to the question, and do not repeat. Say "information is missing on" followed by the related topic, if the given context does not provide sufficient information. Please cite the contexts with the reference numbers, in the format [citation:x]. If a sentence comes from multiple contexts, please list all applicable citations, like [citation:3][citation:5]. Other than code and specific names and citations, your answer must be written in the same language as the question. Here are the set of contexts:

  ${context.map((item, index) => `[[citation:${index + 1}]] Title: ${item.title}\nSnippet: ${item.snippet}`).join('\n\n')}

  Remember, don't blindly repeat the contexts verbatim. And here is the user question:
  "${query}"
  `;

  try {
    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
    });

    const generatedAnswer = response.data.choices[0].message.content;
    res.status(200).json({ answer: generatedAnswer });
  } catch (error) {
    console.error('Error generating answer:', error);
    res.status(500).json({ error: 'Failed to generate answer' });
  }
}