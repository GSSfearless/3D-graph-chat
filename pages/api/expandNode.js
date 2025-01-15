import OpenAI from 'openai';
import { createExpandLayout } from '../../utils/graphLayouts';

const openai = new OpenAI({
  organization: 'org-gLWuvsHwqOs4i3QAdK8nQ5zk',
  project: 'proj_TRi4aW8PdBr9LBaE9W34pDPi',
});

function cleanOpenAIResponse(response) {
  try {
    // 如果响应已经是JSON对象，直接返回
    if (typeof response === 'object') return JSON.stringify(response);
    
    // 移除可能的Markdown代码块标记
    let cleaned = response.replace(/```json\n?|\n?```/g, '');
    
    // 尝试解析和重新字符串化以确保有效的JSON
    const parsed = JSON.parse(cleaned);
    return JSON.stringify(parsed);
  } catch (error) {
    console.error('Error cleaning OpenAI response:', error);
    return response;
  }
}

function parseJSONSafely(str) {
  try {
    return JSON.parse(str);
  } catch (error) {
    console.error('Error parsing JSON:', error);
    return null;
  }
}

export default async function handler(req, res) {
  console.log('expandNode API called with body:', req.body);

  if (req.method !== 'POST') {
    return res.status(405).json({ message: '只允许 POST 请求' });
  }

  const { nodeId, label, parentPosition } = req.body;

  if (!nodeId || !label) {
    return res.status(400).json({ message: '缺少必要的参数' });
  }

  try {
    console.log('Calling OpenAI API');
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system", 
          content: "你是一个专家，能够深入解析复杂概念。请提供一个 JSON 格式的响应，包含 'nodes' 数组。每个节点应该有 'id' 和 'label' 属性。请生成3-5个新节点，这些节点应该从不同角度解释或延伸给定概念，使用简短的关键词或短语（不超过10个字），确保内容既相关又有深度。"
        },
        {
          role: "user", 
          content: `请为以下概念提供多个角度的解释或相关概念，使用简短的关键词或短语：${label}`
        }
      ],
      temperature: 0.8, // 增加创造性
      max_tokens: 500,
    });

    console.log('OpenAI API response:', completion.choices[0].message.content);

    const cleanedResponse = cleanOpenAIResponse(completion.choices[0].message.content);
    console.log('Cleaned response:', cleanedResponse);

    let expandedData = parseJSONSafely(cleanedResponse);
    console.log('Parsed expanded data:', expandedData);

    if (!expandedData || !expandedData.nodes || !Array.isArray(expandedData.nodes) || expandedData.nodes.length === 0) {
      console.error('Invalid expandedData structure:', expandedData);
      // 提供默认的扩展节点
      expandedData = {
        nodes: [
          { id: `${nodeId}-child-1`, label: `定义与概念` },
          { id: `${nodeId}-child-2`, label: `应用场景` },
          { id: `${nodeId}-child-3`, label: `关键特点` },
          { id: `${nodeId}-child-4`, label: `发展趋势` }
        ]
      };
    }

    // 确保至少有3个节点
    while (expandedData.nodes.length < 3) {
      const index = expandedData.nodes.length + 1;
      expandedData.nodes.push({
        id: `${nodeId}-child-${index}`,
        label: `扩展视角 ${index}`
      });
    }

    // 限制最多5个节点
    if (expandedData.nodes.length > 5) {
      expandedData.nodes = expandedData.nodes.slice(0, 5);
    }

    res.status(200).json(expandedData);
  } catch (error) {
    console.error('Error in expandNode:', error);
    res.status(500).json({ 
      message: 'Error expanding node',
      error: error.message,
      nodes: [
        { id: `${nodeId}-child-1`, label: `定义与概念` },
        { id: `${nodeId}-child-2`, label: `应用场景` },
        { id: `${nodeId}-child-3`, label: `关键特点` }
      ]
    });
  }
}