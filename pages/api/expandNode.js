import OpenAI from 'openai';

const openai = new OpenAI({
  organization: 'org-gLWuvsHwqOs4i3QAdK8nQ5zk',
  project: 'proj_TRi4aW8PdBr9LBaE9W34pDPi',
});

function isOverlapping(node1, node2) {
  const margin = 20; // 节点间的最小间距
  return Math.abs(node1.position.x - node2.position.x) < node1.style.width + margin &&
         Math.abs(node1.position.y - node2.position.y) < node1.style.height + margin;
}

function createLayout(nodes, parentNode, existingNodes) {
  const radius = 200;
  const angleStep = (2 * Math.PI) / nodes.length;

  return nodes.map((node, index) => {
    let angle = index * angleStep;
    let x, y;
    let attempts = 0;
    const maxAttempts = 20;

    do {
      x = parentNode.position.x + radius * Math.cos(angle);
      y = parentNode.position.y + radius * Math.sin(angle);
      attempts++;
      angle += 0.1;

      const newNode = {
        ...node,
        position: { x, y },
        style: { width: 150, height: 50 }
      };

      if (!existingNodes.some(existingNode => isOverlapping(newNode, existingNode))) {
        return newNode;
      }
    } while (attempts < maxAttempts);

    // 如果无法找到不重叠的位置，返回最后一次尝试的位置
    return {
      ...node,
      position: { x, y },
      style: { width: 150, height: 50 }
    };
  });
}

function sanitizeJSON(str) {
  // 移除可能导致 JSON 解析错误的字符
  return str.replace(/[\n\r\t]/g, '')
            .replace(/,\s*]/g, ']')
            .replace(/,\s*}/g, '}');
}

function parseJSONSafely(str) {
  try {
    return JSON.parse(sanitizeJSON(str));
  } catch (error) {
    console.error('JSON parsing error:', error);
    return null;
  }
}

function cleanOpenAIResponse(response) {
  // 移除可能的 Markdown 标记
  let cleaned = response.replace(/```json\n?/, '').replace(/```\n?/, '');
  // 使用 sanitizeJSON 函数
  return sanitizeJSON(cleaned);
}

export default async function handler(req, res) {
  console.log('expandNode API called with body:', req.body);

  if (req.method !== 'POST') {
    return res.status(405).json({ message: '只允许 POST 请求' });
  }

  const { nodeId, label, parentPosition, query } = req.body;

  if (!nodeId || !label) {
    return res.status(400).json({ message: '缺少必要的参数' });
  }

  try {
    console.log('Calling OpenAI API');
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {role: "system", content: "你是一个专家，能够深入解析复杂概念。请提供一个 JSON 格式的响应，包含 'nodes' 数组。每个节点应该有 'id' 和 'label' 属性。请只生成两个新节点，这两个节点应该是对给定概念的更详细解释或延伸。"},
        {role: "user", content: `请为以下概念提供两个更详细的解释或相关概念，考虑到以下问题：${label}。问题：${query}`}
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
    const layoutedNodes = createLayout(processedNodes, parentNode, existingNodes);

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
    // 添加更详细的错误信息
    res.status(500).json({ 
      message: '展开节点时出错', 
      error: error.message,
      stack: error.stack,
      details: error.toString()
    });
  }
}