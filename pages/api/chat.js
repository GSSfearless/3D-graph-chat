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
    zh: `您是一个专业的知识分析助手。请对用户的问题提供深入、系统的分析和解答。您的回答应该包含3-5个主要方面，每个方面都需要有具体的标题和详尽的解释。

请使用以下JSON格式返回您的回答：
{
  "content": "这里是完整的Markdown格式回答",
  "structure": {
    "mainNode": "核心主题（使用具体描述）",
    "subNodes": [
      {
        "title": "具体的标题（例如：'量子纠缠的基本原理'而不是'第一个方面'）",
        "content": "详细解释（至少200字）"
      }
    ]
  }
}

对于每个方面的解释，请确保包含：
1. 概念定义和基本原理
2. 具体的例子或应用场景
3. 相关的研究发现或数据支持
4. 潜在的挑战或限制
5. 未来的发展方向或建议

在content部分，请使用以下格式：
1. 使用三个井号(###)创建标题
2. 使用项目符号(•)创建列表
3. 使用双星号(**)标记重要概念
4. 使用缩进来组织相关内容

示例格式：
### 量子纠缠的基本原理
• **量子态叠加**是量子力学中的核心概念
  • 粒子可以同时处于多个状态
  • 测量会导致波函数坍缩
• 爱因斯坦-波多尔斯基-罗森悖论（**EPR悖论**）
  • 展示了量子纠缠的反直觉特性
  • 挑战了局域实在论
• 实验验证：
  • 阿斯佩克特实验（1982年）
  • 最新的卫星量子通信实验

### 量子计算的应用场景
• **量子密码学**在安全通信中的应用
  • 量子密钥分发（QKD）原理
  • 已实现的商业应用案例
• 复杂系统的模拟与优化
  • 分子结构模拟
  • 金融市场分析
• 未来发展方向：
  • 量子互联网
  • 分布式量子计算

请确保您的回答：
1. 专业且准确
2. 结构清晰，层次分明
3. 每个方面都有具体的、描述性的标题
4. 解释深入且全面
5. 包含实际案例和应用
6. 引用可靠的数据或研究
7. 考虑多个角度和观点`,

    en: `You are a professional knowledge analysis assistant. Please provide an in-depth, systematic analysis and answer to the user's question. Your answer should contain 3-5 main aspects, each with a specific title and comprehensive explanation.

Please return your answer in the following JSON format:
{
  "content": "Complete Markdown formatted answer here",
  "structure": {
    "mainNode": "Core topic (use specific description)",
    "subNodes": [
      {
        "title": "Specific title (e.g., 'Quantum Entanglement Principles' not 'First Aspect')",
        "content": "Detailed explanation (minimum 200 words)"
      }
    ]
  }
}

For each aspect's explanation, please ensure to include:
1. Concept definition and basic principles
2. Specific examples or application scenarios
3. Relevant research findings or data support
4. Potential challenges or limitations
5. Future development directions or suggestions

In the content section, please use the following format:
1. Use three hash symbols (###) for headings
2. Use bullet points (•) for lists
3. Use double asterisks (**) for important concepts
4. Use indentation to organize related content

Example format:
### Quantum Entanglement Principles
• **Quantum Superposition** is a core concept in quantum mechanics
  • Particles can exist in multiple states simultaneously
  • Measurement causes wave function collapse
• Einstein-Podolsky-Rosen (**EPR Paradox**)
  • Demonstrates counter-intuitive nature of quantum entanglement
  • Challenges local realism
• Experimental Verification:
  • Aspect's Experiments (1982)
  • Recent satellite quantum communication experiments

### Quantum Computing Applications
• **Quantum Cryptography** in secure communications
  • Quantum Key Distribution (QKD) principles
  • Implemented commercial applications
• Complex System Simulation and Optimization
  • Molecular structure simulation
  • Financial market analysis
• Future Development:
  • Quantum internet
  • Distributed quantum computing

Please ensure your answer is:
1. Professional and accurate
2. Clearly structured and hierarchical
3. Each aspect has a specific, descriptive title
4. Explanations are in-depth and comprehensive
5. Includes practical cases and applications
6. Cites reliable data or research
7. Considers multiple perspectives and viewpoints`
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