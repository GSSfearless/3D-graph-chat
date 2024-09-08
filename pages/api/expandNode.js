import OpenAI from 'openai';

const openai = new OpenAI({
  organization: 'org-gLWuvsHwqOs4i3QAdK8nQ5zk',
  project: 'proj_TRi4aW8PdBr9LBaE9W34pDPi',
});

function createLayout(nodes, parentNode) {
  const radius = 200;
  const angleStep = (2 * Math.PI) / nodes.length;

  return nodes.map((node, index) => {
    const angle = index * angleStep;
    const x = parentNode.position.x + radius * Math.cos(angle);
    const y = parentNode.position.y + radius * Math.sin(angle);

    return {
      ...node,
      position: { x, y },
      style: { width: 150, height: 50 }
    };
  });
}

export default async function handler(req, res) {
  console.log('expandNode API called with body:', req.body);

  if (req.method !== 'POST') {
    return res.status(405).json({ message: '只允许 POST 请求' });
  }

  const { nodeId, label } = req.body;

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

    const expandedData = JSON.parse(completion.choices[0].message.content);
    console.log('Parsed expanded data:', expandedData);

    // 为新节点创建布局
    const parentNode = { id: nodeId, position: { x: 0, y: 0 } };
    const layoutedNodes = createLayout(expandedData.nodes, parentNode);

    // 创建从父节点到新节点的边
    const newEdges = layoutedNodes.map(node => ({
      id: `${nodeId}-${node.id}`,
      source: nodeId,
      target: node.id,
      label: '详细',
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