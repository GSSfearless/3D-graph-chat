import { callWithFallback } from '../../utils/api-client';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb'
    },
    responseLimit: false,
    externalResolver: true
  }
};

export default async function handler(req, res) {
  // 设置较长的超时时间
  res.setTimeout(60000); // 增加到60秒
  
  console.log('=== 图表生成服务启动 ===');
  
  if (req.method !== 'POST') {
    console.error('❌ 无效的请求方法:', req.method);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { content, type } = req.body;
    console.log('收到生成请求:', { type, contentLength: content?.length });
    
    if (!content) {
      console.error('❌ 请求体缺少内容');
      return res.status(400).json({ message: 'Content is required' });
    }

    if (!type || !['flowchart', 'markdown'].includes(type)) {
      console.error('❌ 无效的图表类型:', type);
      return res.status(400).json({ message: 'Invalid type. Must be either "flowchart" or "markdown"' });
    }

    let prompt;
    if (type === 'flowchart') {
      console.log('构建流程图提示词...');
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
   - 节点ID应该按顺序命名，如 A, B, C 或 A1, A2, B1, B2

3. 节点内容规则：
   - 所有节点文本都必须用方括号包裹
   - 文本中如果包含特殊字符，需要进行转义
   - 每个节点的文本应该简短精炼，不超过10个字
   - 使用中文描述节点内容

4. 连接规则：
   - 使用 --> 表示节点之间的关系
   - 每个连接必须在单独的行上
   - 确保连接的两端都是有效的节点ID
   - 避免交叉连接，保持图表整洁

5. 布局规则：
   - 从上到下布局（TD）
   - 主要流程应该在中间
   - 分支流程在两侧
   - 控制节点数量在20个以内

请分析以下内容，提取主要流程和关键步骤，生成符合上述规则的 Mermaid 流程图代码：

${content}

注意：请只返回 Mermaid 代码，不要包含任何其他解释或说明。`;
    } else {
      console.log('构建思维导图提示词...');
      prompt = `请将以下内容转换为 Mermaid 思维导图格式。请使用以下格式：

mindmap
  root((核心主题))
    主要分支1
      子分支1
        内容1
        内容2
      子分支2
        内容3
        内容4
    主要分支2
      子分支3
        内容5
        内容6

规则：
1. 使用中文
2. 保持层级清晰
3. 每个节点文本简洁
4. 确保格式正确
5. 内容逻辑合理

请分析以下内容，生成思维导图：

${content}

注意：请只返回 Mermaid 格式的思维导图代码，不要包含任何其他解释或说明。`;
    }

    const messages = [
      {
        role: 'system',
        content: type === 'flowchart' 
          ? '你是一个专业的流程图生成助手，擅长将文本转换为结构化的 Mermaid 流程图。'
          : '你是一个专业的思维导图生成助手，擅长将文本转换为结构化的 Mermaid 思维导图。'
      },
      {
        role: 'user',
        content: prompt
      }
    ];

    console.log('调用 AI 接口生成图表...');
    const { provider, response } = await callWithFallback(messages, false, false);
    console.log(`使用 ${provider} API 生成${type === 'flowchart' ? '流程图' : '思维导图'}`);

    let result;
    try {
      switch (provider) {
        case 'openai':
        case 'deepseek':
        case 'volcengine':
          result = response.data.choices[0].message.content.trim();
          break;
        case 'claude':
          result = response.data.content.trim();
          break;
        case 'gemini':
          result = response.data.candidates[0].content.parts[0].text.trim();
          break;
      }

      // 提取 Mermaid 代码
      if (type === 'flowchart') {
        if (result.includes('flowchart TD')) {
          const startIndex = result.indexOf('flowchart TD');
          const endIndex = result.indexOf('```', startIndex);
          result = result.substring(
            startIndex,
            endIndex > startIndex ? endIndex : undefined
          ).trim();
        }
      } else {
        if (result.includes('mindmap')) {
          const startIndex = result.indexOf('mindmap');
          const endIndex = result.indexOf('```', startIndex);
          result = result.substring(
            startIndex,
            endIndex > startIndex ? endIndex : undefined
          ).trim();
        }
      }

      if (type === 'flowchart') {
        return res.status(200).json({ mermaidCode: result, provider });
      } else {
        return res.status(200).json({ mermaidCode: result, provider });
      }
    } catch (error) {
      console.error('❌ 结果处理错误:', error);
      return res.status(500).json({ 
        message: 'Error processing result',
        error: error.message
      });
    }
  } catch (error) {
    console.error('❌ 图表生成过程出错:', error);
    return res.status(500).json({ 
      message: 'Error generating diagram',
      error: error.message
    });
  }
} 