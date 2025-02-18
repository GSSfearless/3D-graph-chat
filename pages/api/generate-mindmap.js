import { callWithFallback } from '../../utils/api-client';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    console.error('❌ 无效的请求方法:', req.method);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  console.log('=== 开始生成图表 ===');
  
  try {
    const { content, type } = req.body;
    
    if (!content) {
      console.error('❌ 请求体缺少内容');
      return res.status(400).json({ message: 'Content is required' });
    }

    if (!type || !['flowchart', 'markdown'].includes(type)) {
      console.error('❌ 无效的图表类型:', type);
      return res.status(400).json({ message: 'Invalid type. Must be either "flowchart" or "markdown"' });
    }

    console.log(`📊 正在生成 ${type === 'flowchart' ? '流程图' : '思维导图'}`);
    console.log('内容长度:', content.length);

    let prompt;
    if (type === 'flowchart') {
      console.log('🔄 构建流程图提示词...');
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

${content}`;
    } else {
      console.log('🔄 构建思维导图提示词...');
      prompt = `请将以下内容转换为 Markdown 格式的思维导图。请严格遵循以下规则：

1. 使用 Markdown 标题层级表示思维导图的层级关系：
   # 主题（只有一个）
   ## 主要分支（2-5个）
   ### 次要分支（每个主要分支下2-4个）
   - 具体内容（使用无序列表）

2. 内容要求：
   - 主题：使用简短的词组概括整体内容
   - 主要分支：表示主要的概念或类别
   - 次要分支：展示重要的细节或示例
   - 具体内容：使用简短的句子说明要点

3. 格式要求：
   - 每个层级使用正确的 Markdown 语法
   - 保持层级缩进整齐
   - 使用短横线（-）作为列表标记
   - 确保内容简洁明了

4. 结构要求：
   - 层级最多不超过3层
   - 每个分支下的内容控制在3-5点
   - 保持逻辑结构清晰
   - 避免内容重复

请分析以下内容，提取主要概念和关键信息，生成符合上述规则的 Markdown 思维导图：

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

    console.log('🚀 调用 AI 接口生成图表...');
    const { provider, response } = await callWithFallback(messages, false);
    console.log(`✅ 使用 ${provider} 生成${type === 'flowchart' ? '流程图' : '思维导图'}`);

    if (type === 'flowchart') {
      let mermaidCode = '';
      
      try {
        console.log('处理 Mermaid 代码...');
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
        
        console.log('Raw Mermaid code:', mermaidCode);

        if (mermaidCode.includes('flowchart TD')) {
          const startIndex = mermaidCode.indexOf('flowchart TD');
          const possibleEndIndex = mermaidCode.indexOf('```', startIndex);
          mermaidCode = mermaidCode.substring(
            startIndex,
            possibleEndIndex > startIndex ? possibleEndIndex : undefined
          ).trim();
          
          console.log('Processed Mermaid code:', mermaidCode);
        } else {
          console.error('Invalid Mermaid code format - missing flowchart TD');
          return res.status(400).json({ message: 'Generated code is not a valid flowchart' });
        }
      } catch (error) {
        console.error('❌ Mermaid 代码处理错误:', error);
        return res.status(500).json({ message: 'Error processing Mermaid code', error: error.message });
      }
      
      console.log('✅ 流程图生成成功');
      res.status(200).json({ mermaidCode, provider });
    } else {
      let markdownContent = '';
      
      try {
        console.log('处理 Markdown 内容...');
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
        
        console.log('Raw Markdown content:', markdownContent);

        if (!markdownContent.includes('#')) {
          console.error('Invalid Markdown format - missing headers');
          return res.status(400).json({ message: 'Generated content is not a valid markdown mind map' });
        }
      } catch (error) {
        console.error('❌ Markdown 内容处理错误:', error);
        return res.status(500).json({ message: 'Error processing Markdown content', error: error.message });
      }
      
      console.log('✅ 思维导图生成成功');
      res.status(200).json({ markdownContent, provider });
    }
  } catch (error) {
    console.error('❌ 图表生成过程出错:', error);
    res.status(500).json({ 
      message: 'Error generating diagram',
      error: error.message,
      stack: error.stack
    });
  }
} 