import OpenAI from 'openai';

// 添加语言检测函数
function detectLanguage(text) {
  const hasChineseChars = /[\u4e00-\u9fa5]/.test(text);
  const hasJapaneseChars = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/.test(text);
  const hasKoreanChars = /[\uac00-\ud7af\u1100-\u11ff]/.test(text);

  if (hasChineseChars) return 'zh';
  if (hasJapaneseChars) return 'ja';
  if (hasKoreanChars) return 'ko';
  return 'en';
}

// 获取多语言提示模板
function getPromptTemplate(lang, label, relatedNodes) {
  const templates = {
    zh: `
    您是一个大型语言AI助手。请为知识图谱中的概念"${label}"提供简明准确的解释。您的解释必须正确、准确，并以专业和中立的语气撰写。请将内容限制在大约200字以内。请不要提供与概念无关的信息，也不要重复自己。

    请严格使用以下格式组织您的回答：
    1. 使用双星号（**）包围重要概念或关键词以表示加粗。例如：**重要概念**
    2. 使用项目符号（•）后跟空格创建项目符号列表。每个新点应该从新行开始。
    3. 使用三个井号（###）创建子标题，确保子标题独占一行。不要使用超过三个井号。
    4. 使用单个换行符分隔段落。

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

    相关概念：${relatedNodes.map(node => node.data.label).join('、')}。

    请按以下结构组织您的回答：
    1. "${label}"的简要定义或解释。
    2. "${label}"如何与相关概念关联或互动。
    3. 理解"${label}"所需的任何重要子概念或方面。
    `,
    en: `
    You are a large language AI assistant. Please provide a concise and accurate explanation for the concept "${label}" in the context of a knowledge graph. Your explanation must be correct, accurate, and written in a professional and neutral tone. Please limit it to about 200 words. Do not provide information unrelated to the concept, and do not repeat yourself.

    Please strictly use the following format to organize your answer:
    1. Use double asterisks (**) to surround important concepts or keywords to indicate bold. For example: **important concept**.
    2. Use a bullet point (•) followed by a space to create bulleted lists. Each new point should start on a new line.
    3. Use three hash symbols (###) to create subheadings, ensuring the subheading is on its own line. Do not use more than three hash symbols.
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

    Related concepts: ${relatedNodes.map(node => node.data.label).join(', ')}.

    Please structure your response as follows:
    1. A brief definition or explanation of "${label}".
    2. How "${label}" relates to or interacts with the related concepts.
    3. Any important sub-concepts or aspects of "${label}" that are relevant to understanding it fully.
    `
  };

  return templates[lang] || templates.en;
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { nodeId, label, graphData } = req.body;

  if (!nodeId || !label || !graphData) {
    return res.status(400).json({ message: 'Missing required parameters' });
  }

  try {
    const relatedNodes = graphData.edges
      .filter(edge => edge.source === nodeId || edge.target === nodeId)
      .map(edge => {
        const relatedNodeId = edge.source === nodeId ? edge.target : edge.source;
        return graphData.nodes.find(node => node.id === relatedNodeId);
      });

    // 检测标签的语言
    const detectedLang = detectLanguage(label);
    const prompt = getPromptTemplate(detectedLang, label, relatedNodes);

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 300,
    });

    const explanation = completion.choices[0].message.content;

    res.status(200).json({ explanation });
  } catch (error) {
    console.error('Error generating node explanation:', error);
    res.status(500).json({ message: 'Error generating explanation', error: error.message });
  }
}