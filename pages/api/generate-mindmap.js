import { callWithFallback } from '../../utils/api-client';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { content, type } = req.body;

    let prompt;
    if (type === 'flowchart') {
      prompt = `请将以下内容转换为 Mermaid 流程图格式。请严格遵循以下规则：

1. 使用以下格式：
   flowchart TD
   A[开始] --> B[步骤1]
   B --> C[步骤2]
   C --> D[结果1]
   C --> E[结果2]

2. 节点命名规则：
   - 使用字母和数字的组合作为节点ID
   - 节点ID不能包含特殊字符
   - 每个节点ID必须唯一

3. 节点内容规则：
   - 所有节点文本都必须用方括号包裹
   - 文本中如果包含特殊字符，需要进行转义
   - 每个节点的文本应该简短精炼

4. 连接规则：
   - 使用 --> 表示节点之间的关系
   - 每个连接必须在单独的行上
   - 确保连接的两端都是有效的节点ID

请分析以下内容并生成符合上述规则的 Mermaid 流程图代码：

${content}`;
    } else {
      prompt = `请将以下内容转换为 Markdown 格式的思维导图。请严格遵循以下规则：

1. 使用 Markdown 标题层级表示思维导图的层级关系
2. 主题使用一级标题 (#)
3. 主要分支使用二级标题 (##)
4. 次要分支使用三级标题 (###)
5. 具体内容使用列表项 (-)
6. 确保层级关系清晰
7. 使用简洁的语言
8. 保持逻辑结构清晰

请分析以下内容并生成思维导图：

${content}`;
    }

    const messages = [
      {
        role: 'system',
        content: type === 'flowchart' 
          ? '你是一个专业的流程图生成助手，擅长将文本转换为结构化的 Mermaid 流程图。'
          : '你是一个专业的思维导图生成助手，擅长将文本转换为结构化的 Markdown 思维导图。'
      },
      {
        role: 'user',
        content: prompt
      }
    ];

    // 使用故障转移机制调用 API
    const { provider, response } = await callWithFallback(messages, false);
    console.log(`Using ${provider} API for ${type} generation`);

    if (type === 'flowchart') {
      // 提取 Mermaid 代码
      let mermaidCode = '';
      
      switch (provider) {
        case 'openai':
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
      if (mermaidCode.includes('flowchart TD')) {
        const startIndex = mermaidCode.indexOf('flowchart TD');
        const possibleEndIndex = mermaidCode.indexOf('```', startIndex);
        mermaidCode = mermaidCode.substring(
          startIndex,
          possibleEndIndex > startIndex ? possibleEndIndex : undefined
        ).trim();
      }
      
      res.status(200).json({ mermaidCode, provider });
    } else {
      // 提取 Markdown 内容
      let markdownContent = '';
      
      switch (provider) {
        case 'openai':
        case 'deepseek':
          markdownContent = response.data.choices[0].message.content.trim();
          break;
        case 'claude':
          markdownContent = response.data.content.trim();
          break;
        case 'gemini':
          markdownContent = response.data.candidates[0].content.parts[0].text.trim();
          break;
      }
      
      res.status(200).json({ markdownContent, provider });
    }
  } catch (error) {
    console.error('Error calling API:', error);
    res.status(500).json({ 
      message: 'Error generating diagram',
      error: error.message 
    });
  }
} 