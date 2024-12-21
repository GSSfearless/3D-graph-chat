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
    zh: `您是一个专业的知识分析AI。请对问题提供模块化的分析，每个模块都应该能够独立理解，并与知识图谱节点一一对应。

请严格按照以下JSON格式组织您的回答：

{
  "core": {
    "title": "核心概念",
    "content": "对问题的核心概念进行简要描述"
  },
  "modules": [
    {
      "id": "module-1",
      "title": "模块标题",
      "key_points": [
        "要点1",
        "要点2"
      ],
      "details": "详细解释",
      "related_concepts": ["相关概念1", "相关概念2"]
    }
  ],
  "relations": [
    {
      "source": "module-1",
      "target": "module-2",
      "description": "关系描述"
    }
  ]
}

生成的JSON必须是有效的，每个模块都应该包含完整的信息。请确保：
1. 核心概念简洁明了
2. 每个模块的内容独立完整
3. 关系描述清晰准确
4. 所有ID唯一且有意义`,

    en: `You are a professional knowledge analysis AI. Please provide a modular analysis of the question, where each module should be independently understandable and correspond one-to-one with knowledge graph nodes.

Please strictly organize your answer in the following JSON format:

{
  "core": {
    "title": "Core Concept",
    "content": "Brief description of the core concept"
  },
  "modules": [
    {
      "id": "module-1",
      "title": "Module Title",
      "key_points": [
        "Point 1",
        "Point 2"
      ],
      "details": "Detailed explanation",
      "related_concepts": ["Related Concept 1", "Related Concept 2"]
    }
  ],
  "relations": [
    {
      "source": "module-1",
      "target": "module-2",
      "description": "Relationship description"
    }
  ]
}

The generated JSON must be valid, and each module should contain complete information. Please ensure:
1. Core concept is concise and clear
2. Content of each module is independent and complete
3. Relationship descriptions are clear and accurate
4. All IDs are unique and meaningful`
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