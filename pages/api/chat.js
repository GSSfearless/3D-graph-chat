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
    zh: `您是一名思维导图专家。您的主要目标是将复杂问题转化为清晰的思维导图结构。

请使用以下JSON格式返回您的回答：
{
  "content": "这里是完整的Markdown格式回答",
  "structure": {
    "mainNode": "核心主题（4字以内）",
    "subNodes": [
      {
        "title": "主要分支（4字以内）",
        "content": "关键词1\n关键词2\n关键词3"
      },
      {
        "title": "主要分支（4字以内）",
        "content": "关键词1\n关键词2\n关键词3"
      }
    ]
  }
}

在content部分，请使用以下格式：
1. 使用三个井号(###)标记主要分支
2. 使用项目符号(•)列出关键词
3. 每个关键词不超过4个字

示例格式：
### 发展历程
• 起源探索
• 技术突破
• 未来展望

### 核心价值
• 创新思维
• 效率提升
• 深度认知

`,

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

`
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
          // 清理可能的控制字符和非法字符
          const cleanedJson = jsonMatch[0]
            .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
            .replace(/\\[^"\/bfnrtu]/g, '\\\\')
            .replace(/[\t\n\r\f\b]/g, ' ')
            .replace(/\s+/g, ' ');

          let responseData;
          try {
            responseData = JSON.parse(cleanedJson);
          } catch (jsonError) {
            console.error('JSON parse error:', jsonError);
            // 如果JSON解析失败，创建一个基本的响应结构
            responseData = {
              content: fullResponse,
              structure: {
                mainNode: query.slice(0, 10) + '...',
                subNodes: [
                  {
                    title: '主要内容',
                    content: fullResponse
                  }
                ]
              }
            };
          }
          
          // 验证和清理响应数据
          const cleanedData = {
            content: typeof responseData.content === 'string' 
              ? responseData.content.trim() 
              : fullResponse,
            structure: {
              mainNode: typeof responseData.structure?.mainNode === 'string'
                ? responseData.structure.mainNode.trim()
                : query.slice(0, 10) + '...',
              subNodes: Array.isArray(responseData.structure?.subNodes)
                ? responseData.structure.subNodes.map(node => ({
                    title: typeof node.title === 'string' ? node.title.trim() : '分支',
                    content: typeof node.content === 'string' ? node.content.trim() : ''
                  }))
                : [
                    {
                      title: '主要内容',
                      content: fullResponse
                    }
                  ]
            }
          };

          return new Response(JSON.stringify(cleanedData), {
            headers: { 'Content-Type': 'application/json' }
          });
        } catch (error) {
          console.error('Error in response processing:', error);
          // 返回一个基本的响应结构
          return new Response(JSON.stringify({
            content: fullResponse,
            structure: {
              mainNode: query.slice(0, 10) + '...',
              subNodes: [
                {
                  title: '完整回答',
                  content: fullResponse
                }
              ]
            }
          }), {
            headers: { 'Content-Type': 'application/json' }
          });
        }
      }

      // 如果没有找到JSON结构，返回基本响应
      return new Response(JSON.stringify({
        content: fullResponse,
        structure: {
          mainNode: query.slice(0, 10) + '...',
          subNodes: [
            {
              title: '完整回答',
              content: fullResponse
            }
          ]
        }
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (parseError) {
      console.error('Error in response parsing:', parseError);
      return new Response(JSON.stringify({
        content: fullResponse,
        structure: {
          mainNode: query.slice(0, 10) + '...',
          subNodes: [
            {
              title: '完整回答',
              content: fullResponse
            }
          ]
        }
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(JSON.stringify({
      content: "抱歉，处理您的请求时出现错误，请稍后重试。",
      structure: {
        mainNode: "处理中",
        subNodes: [
          {
            title: "系统提示",
            content: "正在尝试重新处理您的请求"
          }
        ]
      }
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
}