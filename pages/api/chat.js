import { OpenAIStream } from '../../utils/OpenAIStream';

export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  const { context, query } = await req.json();

  if (!context || !query) {
    return new Response('Context and query are required', { status: 400 });
  }

  const prompt = `
  You are a large language AI assistant. Please provide a concise and accurate answer to the user's question. You will receive a set of context information related to the question. Your answer must be correct, accurate, and written in a professional and neutral tone. Please limit it to 1024 tokens. Do not provide information unrelated to the question, and do not repeat yourself.

  Please strictly use the following format to organize your answer:
  1. Use double asterisks (**) to surround important concepts or keywords to indicate bold. For example: **important concept**.
  2. Use a hyphen (-) followed by a space to create bulleted lists. Each new point should start on a new line.
  3. Use three hash symbols (###) to create subheadings, ensuring the subheading is on its own line.
  4. Use a single line break to separate paragraphs.

  Example format:
  ### Key Points
  - **First important concept**
  - **Second important concept**
  - **Third important concept**

  ### Detailed Explanation
  - Explanation of the first concept
    - Additional details
    - More information
  - Explanation of the second concept
  - Explanation of the third concept

  Do not reference any context numbers or sources. Focus on providing an informative and well-structured answer.

  Here is the set of context information:

  ${context.map((item, index) => `Title: ${item.title}\nSummary: ${item.snippet}`).join('\n\n')}

  Remember, don't blindly repeat the context. Here is the user's question:
  "${query}"
  `;

  const payload = {
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    max_tokens: 1024,
    stream: true,
    n: 1,
  };

  const stream = await OpenAIStream(payload);
  return new Response(stream);
}