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
  // 设置更长的超时时间
  res.setTimeout(120000); // 增加到120秒
  
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
      prompt = `请将以下内容转换为简洁的 Mermaid 流程图格式。要求：
1. 使用 flowchart TD 格式
2. 节点ID使用字母数字组合，保持简短
3. 节点文本简洁，不超过10个字
4. 主要流程放在中间
5. 控制总节点数不超过15个
6. 确保格式正确，避免特殊字符

请分析内容并生成流程图：

${content}

只返回 Mermaid 代码，不要其他说明。`;
    } else {
      console.log('构建思维导图提示词...');
      prompt = `请将以下内容转换为简洁的 Mermaid 思维导图格式。要求：
1. 使用 mindmap 格式
2. 主题简洁，层级清晰
3. 每个节点文本不超过10个字
4. 控制总节点数不超过20个
5. 确保格式正确，避免特殊字符

请分析内容并生成思维导图：

${content}

只返回 Mermaid 代码，不要其他说明。`;
    }

    const messages = [
      {
        role: 'system',
        content: type === 'flowchart' 
          ? '你是专业的流程图生成助手，擅长生成简洁清晰的Mermaid流程图。'
          : '你是专业的思维导图生成助手，擅长生成结构化的Mermaid思维导图。'
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

      console.log('✅ 图表生成成功');
      return res.status(200).json({ 
        mermaidCode: result, 
        provider,
        type 
      });
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