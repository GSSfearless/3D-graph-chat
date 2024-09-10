const OpenAI = require('openai');

const openai = new OpenAI({
  organization: 'org-gLWuvsHwqOs4i3QAdK8nQ5zk',
  project: 'proj_TRi4aW8PdBr9LBaE9W34pDPi',
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { context, query } = req.body;

  if (!context || !query) {
    return res.status(400).json({ error: 'Context and query are required' });
  }

  const prompt = `
  You are a large language AI assistant. Please provide a concise and accurate answer to the user's question. You will receive a set of context information related to the question. Your answer must be correct, accurate, and written in a professional and neutral tone. Please limit it to 1024 tokens. Do not provide information unrelated to the question, and do not repeat yourself.

  Please strictly use the following format to organize your answer:
  1. Use double asterisks (**) to surround important concepts or keywords to indicate bold. For example: **important concept**.
  2. Use numbers and dots to create numbered lists. Each new point should start on a new line.
  3. Use three hash symbols (###) to create subheadings, ensuring the subheading is on its own line.
  4. Use a single line break to separate paragraphs.

  Example format:
  ### Main Concepts
  1. **First point**
  2. **Second point**

  ### Detailed Explanation
  Here is some additional explanation.

  Do not reference any context numbers or sources. Focus on providing an informative and well-structured answer.

  Here is the set of context information:

  ${context.map((item, index) => `Title: ${item.title}\nSummary: ${item.snippet}`).join('\n\n')}

  Remember, don't blindly repeat the context. Here is the user's question:
  "${query}"
  `;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
    });

    const generatedAnswer = response.choices[0].message.content;
    res.status(200).json({ answer: generatedAnswer });
  } catch (error) {
    console.error('Error generating answer:', error);

    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
      console.error('Data:', error.response.data);
      res.status(500).json({ error: 'Failed to generate answer', details: error.response.data });
    } else {
      console.error('Error message:', error.message);
      res.status(500).json({ error: 'Failed to generate answer', details: error.message });
    }
  }
}