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
        {role: "system", content: "你是一个专家，能够深入解析复杂概念。请提供一个 JSON 格式的响应，包含 'nodes' 数组。每个节点应该有 'id' 和 'label' 属性。请只生成两个新节点，这两个节点应该是对给定概念的更详细解释或延伸。"},
        {role: "user", content: `请为以下概念提供两个更详细的解释或相关概念：${label}`}
      ],
    });

    console.log('OpenAI API response:', completion.choices[0].message.content);

    const cleanedResponse = cleanOpenAIResponse(completion.choices[0].message.content);
    console.log('Cleaned response:', cleanedResponse);

    let expandedData = parseJSONSafely(cleanedResponse);
    console.log('Parsed expanded data:', expandedData);

    if (!expandedData || !expandedData.nodes || !Array.isArray(expandedData.nodes) || expandedData.nodes.length === 0) {
      console.error('Invalid expandedData structure:', expandedData);
      expandedData = {
        nodes: [
          { id: `${nodeId}-child-1`, label: `Aspect 1 of ${label}` },
          { id: `${nodeId}-child-2`, label: `Aspect 2 of ${label}` }
        ]
      };
    }

    const processedNodes = expandedData.nodes.map((node, index) => ({
      id: node.id || `${nodeId}-child-${index + 1}`,
      data: { label: node.label || `Aspect ${index + 1} of ${label}` },
    }));

    const parentNode = { id: nodeId, position: parentPosition || { x: 0, y: 0 } };
    const existingNodes = req.body.existingNodes || [];
    const layoutedNodes = createExpandLayout(processedNodes, parentNode, existingNodes);

    const newEdges = layoutedNodes.map(node => ({
      id: `${nodeId}-${node.id}`,
      source: nodeId,
      target: node.id,
      label: '详细',
      type: 'smoothstep',
      animated: true,
      labelStyle: { fill: '#888', fontWeight: 700 },
      labelBgStyle: { fill: '#fff', fillOpacity: 0.7 },
      labelBgPadding: [8, 4],
      labelBgBorderRadius: 4,
      style: { stroke: '#888', strokeWidth: 2 },
      markerEnd: {
        type: 'arrowclosed',
        color: '#888',
      },
    }));

    const responseData = {
      nodes: layoutedNodes,
      edges: newEdges,
    };
    console.log('Sending response:', responseData);
    res.status(200).json(responseData);
  } catch (error) {
    console.error('展开节点时出错:', error);
    res.status(500).json({ 
      message: '展开节点时出错', 
      error: error.message,
      stack: error.stack,
      details: error.toString()
    });
  }
}