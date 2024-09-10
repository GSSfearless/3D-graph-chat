import { OpenAIStream, StreamingTextResponse } from 'ai';
import OpenAI from 'openai';

const openai = new OpenAI({
  organization: 'org-gLWuvsHwqOs4i3QAdK8nQ5zk',
  project: 'proj_TRi4aW8PdBr9LBaE9W34pDPi',
});

export const runtime = 'edge';

export default async function handler(req) {
  const { context, query } = await req.json();

  if (!context || !query) {
    return new Response('Context and query are required', { status: 400 });
  }

  const prompt = `
  您是一个大型语言AI助手。请为用户的问题提供简洁准确的答案。您将收到与问题相关的上下文信息。您的回答必须正确、准确，并以专业和中立的语气撰写。请将回答限制在1024个标记以内。不要提供与问题无关的信息，也不要重复自己。

  首先，请描述一个与问题相关的知识图谱。包括主要概念及其之间的关系。然后，基于这个知识图谱回答问题。

  请严格使用以下格式组织您的回答：
  1. 使用双星号（**）包围重要概念或关键词以表示加粗。例如：**重要概念**。
  2. 使用数字和点创建有序列表。每个新点应该另起一行。
  3. 使用三个井号（###）创建子标题，确保子标题单独占一行。
  4. 使用单个换行符分隔段落。

  示例格式：
  ### 知识图谱描述
  1. **概念A** 与 **概念B** 通过 *关系X* 相连。
  2. **概念C** 是 **概念A** 的一个子类。

  ### 详细解释
  这里是基于知识图谱的额外解释。

  不要引用任何上下文编号或来源。专注于提供信息丰富且结构良好的答案。

  以下是上下文信息集：

  ${context.map((item, index) => `标题：${item.title}\n摘要：${item.snippet}`).join('\n\n')}

  请记住，不要盲目重复上下文。以下是用户的问题：
  "${query}"
  `;

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
    stream: true,
  });

  const stream = OpenAIStream(response);
  return new StreamingTextResponse(stream);
}