const OpenAI = require('openai');

const openai = new OpenAI({
  organization: 'org-gLWuvsHwqOs4i3QAdK8nQ5zk',
  project: 'proj_TRi4aW8PdBr9LBaE9W34pDPi',
});

function createPyramidLayout(nodes) {
  const levels = Math.ceil(Math.sqrt(nodes.length));
  const width = 1000; // 增加宽度
  const height = 800; // 增加高度
  const nodeWidth = 150;
  const nodeHeight = 50;
  const horizontalSpacing = 200; // 增加水平间距
  const verticalSpacing = 150; // 增加垂直间距

  return nodes.map((node, index) => {
    const level = Math.floor(Math.sqrt(index));
    const nodesInLevel = (level * 2) + 1;
    const nodeIndex = index - (level * level);
    
    const x = (width / (nodesInLevel + 1) * (nodeIndex + 1)) - (nodeWidth / 2);
    const y = verticalSpacing * (level + 1) - (nodeHeight / 2);

    return {
      ...node,
      position: { x, y },
      style: { width: nodeWidth, height: nodeHeight }
    };
  });
}

function createMindMapLayout(nodes) {
  const centerX = 500; // 增加中心点坐标
  const centerY = 400;
  const radius = 350; // 增加半径

  return nodes.map((node, index) => {
    const angle = (index / nodes.length) * 2 * Math.PI;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);

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
    // 返回一个默认的图形结构
    return {
      type: 'mindmap',
      nodes: [{ id: 'default', label: 'Default Node' }],
      edges: []
    };
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST requests are allowed' });
  }

  const { query } = req.body;

  if (!query) {
    return res.status(400).json({ message: 'Missing query parameter' });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system", 
          content: "你是一位专家，能够将复杂的概念分解为结构化的知识图谱。请提供一个 JSON 格式的响应，包括 'nodes' 和 'edges' 数组，以及一个 'type' 字段，指示图谱应该是 'pyramid' 还是 'mindmap'。每个节点应该有 'id' 和 'label' 属性。每个边应该有 'source'、'target'、'label' 和 'type' 属性。'type' 属性应该是以下之一：'strong'（表示强关系）、'weak'（表示弱关系）或 'default'（表示一般关系）。"
        },
        {
          role: "user", 
          content: `请为以下问题创建一个知识图谱：${query}`
        }
      ],
    });

    const rawGraphData = parseJSONSafely(completion.choices[0].message.content);
    
    const layoutFunction = rawGraphData.type === 'pyramid' ? createPyramidLayout : createMindMapLayout;
    
    const graphData = {
      nodes: layoutFunction(rawGraphData.nodes.map(node => ({
        id: node.id,
        data: { label: node.label || node.id },
      }))),
      edges: rawGraphData.edges.map(edge => ({
        id: `${edge.source}-${edge.target}`,
        source: edge.source,
        target: edge.target,
        label: edge.label || '',
        type: 'custom', // 使用自定义边类型
        data: { 
          fullLabel: edge.label || '',
          type: edge.type || 'default' // 使用 AI 生成的边类型
        },
        animated: true,
        labelStyle: { fill: '#888', fontWeight: 700 },
        labelBgStyle: { fill: '#fff', fillOpacity: 0.7 },
        labelBgPadding: [8, 4],
        labelBgBorderRadius: 4,
        markerEnd: {
          type: 'arrowclosed',
          color: '#888',
        },
      }))
    };

    console.log('Processed graph data:', graphData);
    res.status(200).json(graphData);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Error generating knowledge graph', error: error.message });
  }
}