import { OpenAIStream } from '../../utils/OpenAIStream';

export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  const { nodeId, label, graphData } = await req.json();

  if (!nodeId || !label || !graphData) {
    return new Response('Missing required parameters', { status: 400 });
  }

  const relatedNodes = graphData.edges
    .filter(edge => edge.source === nodeId || edge.target === nodeId)
    .map(edge => {
      const relatedNodeId = edge.source === nodeId ? edge.target : edge.source;
      return graphData.nodes.find(node => node.id === relatedNodeId);
    });

  const prompt = `
  You are a large language AI assistant. Please provide a concise and accurate explanation for the concept "${label}" in the context of a knowledge graph. Your explanation must be correct, accurate, and written in a professional and neutral tone. Please limit it to about 200 words. Do not provide information unrelated to the concept, and do not repeat yourself.

  Please strictly use the following format to organize your answer:
  1. Use double asterisks (**) to surround important concepts or keywords to indicate bold. For example: **important concept**.
  2. Use a bullet point (•) followed by a space to create bulleted lists. Each new point should start on a new line.
  3. Use three hash symbols (###) to create subheadings, ensuring the subheading is on its own line.
  4. Use a single line break to separate paragraphs.

  Example format:
  ### Key Points
  • **First important concept**
  • **Second important concept**
  • **Third important concept**

  ### Detailed Explanation
  • Explanation of the first concept
    • Additional details
    • More information
  • Explanation of the second concept
  • Explanation of the third concept

  Do not use more than three hash symbols (###) for headings. Focus on providing an informative and well-structured explanation.

  Related concepts: ${relatedNodes.map(node => node.data.label).join(', ')}.
  
  Please structure your response as follows:
  1. A brief definition or explanation of "${label}".
  2. How "${label}" relates to or interacts with the related concepts.
  3. Any important sub-concepts or aspects of "${label}" that are relevant to understanding it fully.
  `;

  const payload = {
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    max_tokens: 300,
    stream: true,
    n: 1,
  };

  const stream = await OpenAIStream(payload);
  return new Response(stream);
}