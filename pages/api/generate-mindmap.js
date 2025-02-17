import axios from 'axios';

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = 'https://api.siliconflow.com/v1/chat/completions';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { content } = req.body;

    const prompt = `请将以下内容转换为 Mermaid 思维导图格式。请遵循以下规则：

1. 基本结构
   - 使用 graph TD 指令创建自上而下的布局
   - 主题放在最上方，用圆角矩形样式：[主题文本]
   - 子主题使用六边形样式：{{子主题文本}}
   - 具体内容使用圆角矩形：([内容文本])

2. 节点命名规则
   - 主节点使用 main1, main2 等命名
   - 子节点使用 sub1, sub2 等命名
   - 内容节点使用 content1, content2 等命名

3. 样式要求
   - 所有节点文本都要用双引号包裹，避免特殊字符问题
   - 使用 --> 表示节点之间的关系
   - 确保层次分明，避免过度复杂的连接

4. 内容处理
   - 从文本中提取关键概念和重要信息
   - 将长文本适当简化，保持节点文本简洁
   - 保持逻辑关系清晰

请分析以下内容并生成符合上述规则的 Mermaid 代码：

${content}

只返回 Mermaid 代码，不需要其他解释。确保代码可以直接在 Mermaid 中渲染。`;

    const response = await axios.post(
      DEEPSEEK_API_URL,
      {
        model: 'deepseek-chat',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      },
      {
        headers: {
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // 提取 Mermaid 代码
    const mermaidCode = response.data.choices[0].message.content.trim();
    
    res.status(200).json({ mermaidCode });
  } catch (error) {
    console.error('Error calling DeepSeek API:', error);
    res.status(500).json({ 
      message: 'Error generating mind map',
      error: error.message 
    });
  }
} 