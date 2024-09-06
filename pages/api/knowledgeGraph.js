const OpenAI = require('openai');

const openai = new OpenAI({
  organization: 'org-gLWuvsHwqOs4i3QAdK8nQ5zk',
  project: 'proj_TRi4aW8PdBr9LBaE9W34pDPi',
});

function createPyramidLayout(nodes) {
  const levels = Math.ceil(Math.sqrt(nodes.length));
  const width = 800;
  const height = 600; 
  const nodeWidth = 150;
  const nodeHeight = 50;

  return nodes.map((node, index) => {
    const level = Math.floor(Math.sqrt(index));
    const nodesInLevel = (level * 2) + 1;
    const nodeIndex = index - (level * level);
    
    const x = (width / (nodesInLevel + 1) * (nodeIndex + 1)) - (nodeWidth / 2);
    const y = (height / (levels + 1) * (level + 1)) - (nodeHeight / 2);

    return {
      ...node,
      position: { x, y },
      style: { width: nodeWidth, height: nodeHeight }
    };
  });
}

function createMindMapLayout(nodes) {
  const centerX = 400;
  const centerY = 300;
  const radius = 250;

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
        {role: "system", content: "You are an expert capable of breaking down complex concepts into structured knowledge graphs. Please provide a response in JSON format, including 'nodes' and 'edges' arrays, and a 'type' field indicating whether the graph should be a 'pyramid' or 'mindmap'. Each node should have 'id' and 'label' properties. Each edge should have 'source', 'target', and 'label' properties."},
        {role: "user", content: `Please create a knowledge graph for the following question: ${query}`}
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
        type: 'smoothstep',
        animated: true,
      }))
    };

    console.log('Processed graph data:', graphData);
    res.status(200).json(graphData);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Error generating knowledge graph', error: error.message });
  }
}