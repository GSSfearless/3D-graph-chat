import { OpenAIStream } from '../../utils/OpenAIStream';

// 添加语言检测函数
function detectLanguage(text) {
  // 简单的语言检测逻辑
  const hasChineseChars = /[\u4e00-\u9fa5]/.test(text);
  const hasJapaneseChars = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/.test(text);
  const hasKoreanChars = /[\uac00-\ud7af\u1100-\u11ff]/.test(text);

  if (hasChineseChars) return 'zh';
  if (hasJapaneseChars) return 'ja';
  if (hasKoreanChars) return 'ko';
  return 'en';
}

// 获取多语言提示模板
function getPromptTemplate(lang) {
  const templates = {
    zh: `
您是一个大型语言AI助手。请对用户的问题提供简洁准确的回答。您将收到与问题相关的上下文信息。您的回答必须正确、准确，并以专业和中立的语气撰写。请限制在1024个令牌内。请不要提供与问题无关的信息，也不要重复自己。

请严格使用以下格式组织您的回答：
1. 使用双星号（**）包围重要概念或关键词以表示加粗。例如：**重要概念**
2. 使用项目符号（•）后跟空格创建项目符号列表。每个新点应该从新行开始。
3. 使用三个井号（###）创建子标题，确保子标题独占一行。不要使用超过三个井号。

示例格式：
### 主要观点
• **第一个重要概念**
• **第二个重要概念**
• **第三个重要概念**

### 详细说明
• 第一个概念的解释
  • 补充细节
  • 更多信息
• 第二个概念的解释
• 第三个概念的解释
`,
    en: `
You are a large language AI assistant. Please provide a concise and accurate answer to the user's question. You will receive a set of context information related to the question. Your answer must be correct, accurate, and written in a professional and neutral tone. Please limit it to 1024 tokens. Do not provide information unrelated to the question, and do not repeat yourself.

Please strictly use the following format to organize your answer:
1. Use double asterisks (**) to surround important concepts or keywords to indicate bold. For example: **important concept**
2. Use a bullet point (•) followed by a space to create bulleted lists. Each new point should start on a new line.
3. Use three hash symbols (###) to create subheadings, ensuring the subheading is on its own line. Do not use more than three hash symbols.

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
`,
    // 可以添加更多语言的模板
  };

  return templates[lang] || templates.en;
}

export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  const { context, query } = await req.json();

  if (!context || !query) {
    return new Response('Context and query are required', { status: 400 });
  }

  // 检测用户输入的语言
  const detectedLang = detectLanguage(query);
  const promptTemplate = getPromptTemplate(detectedLang);

  const prompt = `${promptTemplate}

这是上下文信息集：

${context.map((item, index) => `标题: ${item.title}\n摘要: ${item.snippet}`).join('\n\n')}

记住，不要盲目重复上下文。这是用户的问题：
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