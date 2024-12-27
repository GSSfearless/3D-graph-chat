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
    zh: `您是一个大型语言AI助手。请对用户的问题提供结构化的回答，包含主要观点和详细解释。您的回答必须包含3-5个主要方面，每个方面都应该有一个具体的、描述性的标题（不要使用"第一个方面"这样的通用标题）和详细解释。

请使用以下JSON格式返回您的回答：
{
  "content": "这里是完整的Markdown格式回答",
  "structure": {
    "mainNode": "核心主题（使用具体描述）",
    "subNodes": [
      {
        "title": "具体的标题（例如：'量子纠缠的基本原理'而不是'第一个方面'）",
        "content": "详细解释"
      },
      {
        "title": "另一个具体的标题（例如：'量子计算的应用场景'）",
        "content": "详细解释"
      }
      // ... 其他方面
    ]
  }
}

在content部分，请使用以下格式：
1. 使用三个井号(###)创建标题
2. 使用项目符号(•)创建列表
3. 使用双星号(**)标记重要概念

示例格式：
### 量子纠缠的基本原理
• **量子态叠加**的核心概念
• 粒子间的相互作用机制

### 量子计算的应用场景
• **量子密码学**在安全通信中的应用
• 复杂系统的模拟与优化

请确保您的回答：
1. 准确、专业且中立
2. 结构清晰，便于理解
3. 每个方面都有具体的、描述性的标题
4. 内容简洁但全面`,

    en: `You are a large language AI assistant. Please provide a structured answer to the user's question, including main points and detailed explanations. Your answer must contain 3-5 main aspects, each with a specific, descriptive title (avoid generic titles like "First Aspect") and detailed explanation.

Please return your answer in the following JSON format:
{
  "content": "Complete Markdown formatted answer here",
  "structure": {
    "mainNode": "Core topic (use specific description)",
    "subNodes": [
      {
        "title": "Specific title (e.g., 'Quantum Entanglement Principles' not 'First Aspect')",
        "content": "Detailed explanation"
      },
      {
        "title": "Another specific title (e.g., 'Quantum Computing Applications')",
        "content": "Detailed explanation"
      }
      // ... other aspects
    ]
  }
}

In the content section, please use the following format:
1. Use three hash symbols (###) for headings
2. Use bullet points (•) for lists
3. Use double asterisks (**) for important concepts

Example format:
### Quantum Entanglement Principles
• Core concept of **quantum superposition**
• Particle interaction mechanisms

### Quantum Computing Applications
• **Quantum cryptography** in secure communications
• Complex system simulation and optimization

Please ensure your answer is:
1. Accurate, professional, and neutral
2. Clearly structured and easy to understand
3. Each aspect has a specific, descriptive title
4. Content is concise but comprehensive`
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

  const detectedLang = detectLanguage(query);
  const promptTemplate = getPromptTemplate(detectedLang);

  const prompt = `${promptTemplate}

这是上下文信息集：

${context.map((item, index) => `标题: ${item.title}\n摘要: ${item.snippet}`).join('\n\n')}

记住，不要盲目重复上下文。这是用户的问题：
"${query}"
`;

  try {
    // 使用非流式响应
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY ?? ''}`,
      },
      method: 'POST',
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 1024,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const fullResponse = data.choices[0].message.content;

    try {
      // 尝试解析JSON响应
      const jsonMatch = fullResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const responseData = JSON.parse(jsonMatch[0]);
          // 验证响应数据的格式
          if (!responseData.content || typeof responseData.content !== 'string') {
            throw new Error('Invalid response format: missing or invalid content');
          }
          if (!responseData.structure || typeof responseData.structure !== 'object') {
            throw new Error('Invalid response format: missing or invalid structure');
          }
          return new Response(JSON.stringify(responseData), {
            headers: { 'Content-Type': 'application/json' }
          });
        } catch (parseError) {
          console.error('Error parsing or validating JSON response:', parseError);
          // 创建格式化的错误响应
          const errorResponse = {
            content: "抱歉，处理响应时出现格式错误。",
            structure: {
              mainNode: "错误",
              subNodes: [{
                title: "错误信息",
                content: parseError.message
              }]
            }
          };
          return new Response(JSON.stringify(errorResponse), {
            headers: { 'Content-Type': 'application/json' }
          });
        }
      }
    } catch (parseError) {
      console.error('Error parsing JSON response:', parseError);
    }

    // 如果无法解析JSON，返回一个格式化的默认结构
    const defaultResponse = {
      content: fullResponse,
      structure: {
        mainNode: query,
        subNodes: [
          {
            title: "主要内容",
            content: fullResponse
          }
        ]
      }
    };

    return new Response(JSON.stringify(defaultResponse), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        content: "抱歉，处理您的请求时出现错误。",
        structure: {
          mainNode: "错误",
          subNodes: [{
            title: "错误信息",
            content: error.message
          }]
        }
      }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}