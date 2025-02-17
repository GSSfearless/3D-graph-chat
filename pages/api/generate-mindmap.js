import { callWithFallback } from '../../utils/api-client';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { content } = req.body;

    const prompt = `请将以下内容转换为 Mermaid 思维导图格式。请严格遵循以下规则：

1. 使用以下格式：
   graph TD
   A[主题] --> B[子主题1]
   A --> C[子主题2]
   B --> D[内容1]
   C --> E[内容2]

2. 节点命名规则：
   - 使用字母和数字的组合作为节点ID，如 A1, B1, C1 等
   - 节点ID不能包含特殊字符
   - 每个节点ID必须唯一

3. 节点内容规则：
   - 所有节点文本都必须用方括号包裹，如 [文本内容]
   - 文本中如果包含特殊字符，需要进行转义
   - 每个节点的文本应该简短精炼

4. 连接规则：
   - 使用 --> 表示节点之间的关系
   - 每个连接必须在单独的行上
   - 确保连接的两端都是有效的节点ID

5. 格式要求：
   - 第一行必须是 graph TD
   - 每个节点定义和连接都独占一行
   - 缩进使用四个空格
   - 不要使用其他特殊的 Mermaid 语法

请分析以下内容并生成符合上述规则的 Mermaid 代码：

${content}`;

    const messages = [
      {
        role: 'system',
        content: '你是一个专业的思维导图生成助手，擅长将文本转换为结构化的 Mermaid 图表。'
      },
      {
        role: 'user',
        content: prompt
      }
    ];

    // 使用故障转移机制调用 API
    const { provider, response } = await callWithFallback(messages, false);
    console.log(`Using ${provider} API for mind map generation`);

    // 提取 Mermaid 代码
    let mermaidCode = '';
    
    switch (provider) {
      case 'openai':
        mermaidCode = response.data.choices[0].message.content.trim();
        break;
      case 'deepseek':
        mermaidCode = response.data.choices[0].message.content.trim();
        break;
      case 'claude':
        mermaidCode = response.data.content.trim();
        break;
      case 'gemini':
        mermaidCode = response.data.candidates[0].content.parts[0].text.trim();
        break;
    }
    
    // 如果返回的内容包含了额外的解释文本，尝试提取出 Mermaid 代码部分
    if (mermaidCode.includes('graph TD')) {
      const startIndex = mermaidCode.indexOf('graph TD');
      const possibleEndIndex = mermaidCode.indexOf('```', startIndex);
      mermaidCode = mermaidCode.substring(
        startIndex,
        possibleEndIndex > startIndex ? possibleEndIndex : undefined
      ).trim();
    }
    
    res.status(200).json({ mermaidCode, provider });
  } catch (error) {
    console.error('Error calling API:', error);
    res.status(500).json({ 
      message: 'Error generating mind map',
      error: error.message 
    });
  }
} 