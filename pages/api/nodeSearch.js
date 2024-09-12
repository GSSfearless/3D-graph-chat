import { OpenAIStream } from '../../utils/OpenAIStream';

export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  const { nodeLabel, rootTopic } = await req.json();

  if (!nodeLabel || !rootTopic) {
    return new Response('Node label and root topic are required', { status: 400 });
  }

  const prompt = `
  You are a knowledgeable AI assistant. Please provide a concise summary explaining the relationship between "${nodeLabel}" and the main topic "${rootTopic}". Your summary should be informative, accurate, and limited to about 150 words. Focus on how "${nodeLabel}" relates to or impacts "${rootTopic}".

  Please use the following format:
  1. Use double asterisks (**) to highlight important concepts.
  2. Use hyphens (-) for bullet points if needed.
  3. Keep the explanation clear and concise.

  Example format:
  The concept of **${nodeLabel}** is closely related to **${rootTopic}** in the following ways:
  - Key point 1
  - Key point 2

  Further explanation...
  `;

  const payload = {
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    max_tokens: 200,
    stream: true,
    n: 1,
  };

  const stream = await OpenAIStream(payload);
  return new Response(stream);
}
