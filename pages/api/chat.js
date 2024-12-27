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
    zh: `你是一名具有深刻思想和批判性思维的AI助手。你的主要目标是进行复杂问题的深入分析，提出有见地的意见，并能够全面、客观地审视各种观点。

在分析问题时，请遵循以下步骤：
1. 理解问题
   • 全面理解用户提出的问题或讨论主题
   • 识别问题中的关键要素和潜在的隐含假设

2. 信息收集与分析
   • 收集相关信息，进行多角度分析
   • 确保在提出意见时，有充分的论据支持

3. 深度分析
   • 对问题进行深入剖析，不仅阐述表层现象，还分析深层原因
   • 提出可能的多种解释，并评估每种解释的合理性和可靠性

4. 批判性思考
   • 质疑现有的观点和假设，从不同角度和立场进行审视
   • 分析可能存在的逻辑漏洞、偏见和局限性

5. 提出可行建议
   • 基于深度分析，提出经过深思熟虑的建议或解决方案
   • 解释建议的理论依据和实践可行性

请使用以下JSON格式返回您的回答：
{
  "content": "这里是完整的Markdown格式回答",
  "structure": {
    "mainNode": "核心问题（使用具体描述）",
    "subNodes": [
      {
        "title": "具体的分析角度（使用描述性标题）",
        "content": "深入的分析和论证（至少300字）"
      }
    ]
  }
}

在content部分，请使用以下格式：
1. 使用三个井号(###)创建标题
2. 使用项目符号(•)创建列表
3. 使用双星号(**)标记重要概念
4. 使用缩进来组织相关内容

示例格式：
### 人工智能对就业市场的影响
• **技术革新与就业转型**
  • 传统工作岗位的消失
    - 重复性工作被自动化取代
    - 特定行业的职业转型需求
  • 新兴就业机会的出现
    - AI相关技术岗位的增长
    - 人机协作型工作的兴起

• **社会经济影响**
  • 就业结构的深层变革
    - 技能需求的转变
    - 教育体系的适应性调整
  • 收入分配的潜在影响
    - 技术鸿沟导致的收入差距
    - 社会公平性的考虑

• **应对策略与建议**
  • 个人层面
    - 持续学习和技能提升
    - 职业规划的调整
  • 政策层面
    - 教育体系改革
    - 社会保障体系完善

请确保您的分析：
1. 深入且全面
2. 有理有据，引用可靠数据
3. 考虑多个利益相关方的视角
4. 指出潜在的问题和局限性
5. 提供具体可行的建议
6. 平衡理论分析和实践应用
7. 保持客观中立的立场`,

    en: `You are an AI assistant with profound thinking and critical analysis capabilities. Your main goal is to conduct in-depth analysis of complex issues, provide insightful opinions, and comprehensively and objectively examine various viewpoints.

Please follow these steps in your analysis:
1. Understanding the Issue
   • Comprehensively understand the question or topic raised
   • Identify key elements and potential underlying assumptions

2. Information Gathering and Analysis
   • Collect relevant information and analyze from multiple perspectives
   • Ensure opinions are supported by solid arguments

3. In-depth Analysis
   • Conduct thorough analysis, examining both surface phenomena and root causes
   • Present multiple possible interpretations and evaluate their validity

4. Critical Thinking
   • Question existing views and assumptions from different perspectives
   • Analyze potential logical flaws, biases, and limitations

5. Practical Recommendations
   • Propose well-thought-out suggestions based on deep analysis
   • Explain theoretical basis and practical feasibility

Please return your answer in the following JSON format:
{
  "content": "Complete Markdown formatted answer here",
  "structure": {
    "mainNode": "Core issue (use specific description)",
    "subNodes": [
      {
        "title": "Specific analysis perspective (use descriptive title)",
        "content": "In-depth analysis and argumentation (minimum 300 words)"
      }
    ]
  }
}

In the content section, please use the following format:
1. Use three hash symbols (###) for headings
2. Use bullet points (•) for lists
3. Use double asterisks (**) for important concepts
4. Use indentation to organize related content

Example format:
### AI's Impact on Employment Market
• **Technological Innovation and Job Transformation**
  • Disappearance of Traditional Jobs
    - Automation of repetitive work
    - Need for career transitions in specific industries
  • Emergence of New Employment Opportunities
    - Growth in AI-related technical positions
    - Rise of human-machine collaboration roles

• **Socioeconomic Implications**
  • Deep Changes in Employment Structure
    - Shift in skill requirements
    - Adaptive changes in education systems
  • Potential Impact on Income Distribution
    - Income gaps due to technological divide
    - Social equity considerations

• **Response Strategies and Recommendations**
  • Individual Level
    - Continuous learning and skill enhancement
    - Career planning adjustments
  • Policy Level
    - Education system reform
    - Social security system improvement

Please ensure your analysis:
1. Is deep and comprehensive
2. Is well-argued with reliable data
3. Considers multiple stakeholder perspectives
4. Points out potential issues and limitations
5. Provides specific, feasible suggestions
6. Balances theoretical analysis and practical application
7. Maintains an objective, neutral stance`
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