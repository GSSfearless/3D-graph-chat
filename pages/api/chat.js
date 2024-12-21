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
    zh: `您是一个大型语言AI助手。请对用户的问题提供结构化的回答，包含主要观点和详细解释。您的回答必须包含3-5个主要方面，每个方面都应该有一个清晰的标题和详细解释。

请使用以下JSON格式返回您的回答：
{
  "content": "这里是完整的Markdown格式回答",
  "structure": {
    "mainNode": "核心主题",
    "subNodes": [
      {
        "title": "第一个方面",
        "content": "详细解释"
      },
      {
        "title": "第二个方面",
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
### 核心概述
• 这是问题的总体回答

### 第一个方面
• **关键点1**
• 详细解释

### 第二个方面
• **关键点2**
• 详细解释

请确保您的回答：
1. 准确、专业且中立
2. 结构清晰，便于理解
3. 每个方面都有明确的标题
4. 内容简洁但全面`,

    en: `You are a large language AI assistant. Please provide a structured answer to the user's question, including main points and detailed explanations. Your answer must contain 3-5 main aspects, each with a clear title and detailed explanation.

Please return your answer in the following JSON format:
{
  "content": "Complete Markdown formatted answer here",
  "structure": {
    "mainNode": "Core topic",
    "subNodes": [
      {
        "title": "First aspect",
        "content": "Detailed explanation"
      },
      {
        "title": "Second aspect",
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
### Core Overview
• This is the overall answer to the question

### First Aspect
• **Key point 1**
• Detailed explanation

### Second Aspect
• **Key point 2**
• Detailed explanation

Please ensure your answer is:
1. Accurate, professional, and neutral
2. Clearly structured and easy to understand
3. Each aspect has a clear title
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

请严格按照以下格式回复：
1. 首先输出完整的JSON结构
2. 然后输出 "---SPLIT---" 作为分隔符
3. 最后输出详细的Markdown内容

示例：
{
  "structure": {
    "mainNode": "主题",
    "subNodes": []
  }
}
---SPLIT---
### 标题
内容
`;

  try {
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
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    let buffer = '';
    let structure = null;
    let isStructurePart = true;
    let structureBuffer = '';

    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body.getReader();
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            
            if (isStructurePart) {
              // 检查是否有分隔符
              const splitIndex = buffer.indexOf('---SPLIT---');
              if (splitIndex !== -1) {
                // 找到分隔符，处理结构数据
                structureBuffer = buffer.substring(0, splitIndex).trim();
                try {
                  const match = structureBuffer.match(/\{[\s\S]*\}/);
                  if (match) {
                    structure = JSON.parse(match[0]);
                    controller.enqueue(encoder.encode(JSON.stringify({
                      type: 'structure',
                      data: structure
                    }) + '\n'));
                  }
                } catch (e) {
                  console.error('Error parsing structure:', e);
                }
                // 移除结构部分和分隔符，保留剩余内容
                buffer = buffer.substring(splitIndex + 11);
                isStructurePart = false;
              } else {
                // 继续累积结构数据
                continue;
              }
            }

            // 处理内容部分
            if (!isStructurePart) {
              const lines = buffer.split('\n');
              buffer = lines.pop() || '';

              for (const line of lines) {
                if (line.trim() === '') continue;
                controller.enqueue(encoder.encode(JSON.stringify({
                  type: 'content',
                  data: line + '\n'
                }) + '\n'));
              }
            }
          }

          // 处理最后的缓冲区内容
          if (buffer.trim()) {
            controller.enqueue(encoder.encode(JSON.stringify({
              type: 'content',
              data: buffer
            }) + '\n'));
          }
        } catch (error) {
          controller.error(error);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({
        type: 'error',
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