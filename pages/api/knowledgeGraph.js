const OpenAI = require('openai');
const { relayoutGraph } = require('../../utils/graphLayouts');

// 添加语言检测函数
function detectLanguage(text) {
  const hasChineseChars = /[\u4e00-\u9fa5]/.test(text);
  const hasJapaneseChars = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/.test(text);
  const hasKoreanChars = /[\uac00-\ud7af\u1100-\u11ff]/.test(text);

  if (hasChineseChars) return 'zh';
  if (hasJapaneseChars) return 'ja';
  if (hasKoreanChars) return 'ko';
  return 'en';
}

function createGraphFromStructure(structure) {
  const nodes = [
    {
      id: 'root',
      data: { label: structure.mainNode }
    }
  ];

  const edges = [];

  structure.subNodes.forEach((subNode, index) => {
    const nodeId = `node-${index}`;
    nodes.push({
      id: nodeId,
      data: { 
        label: subNode.title,
        content: subNode.content 
      }
    });

    edges.push({
      id: `edge-${index}`,
      source: 'root',
      target: nodeId,
      label: '包含',
      type: 'smoothstep',
      animated: true,
      labelStyle: { fill: '#888', fontWeight: 700 },
      labelBgStyle: { fill: '#fff', fillOpacity: 0.7 },
      labelBgPadding: [8, 4],
      labelBgBorderRadius: 4,
      style: { stroke: '#888' },
      markerEnd: {
        type: 'arrowclosed',
        color: '#888',
      }
    });
  });

  return { nodes, edges };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST requests are allowed' });
  }

  const { structure } = req.body;

  if (!structure) {
    return res.status(400).json({ message: 'Missing structure parameter' });
  }

  try {
    // 直接使用传入的结构生成图谱
    const graphData = createGraphFromStructure(structure);
    
    // 应用布局
    const { nodes: layoutedNodes, edges: layoutedEdges } = relayoutGraph(graphData.nodes, graphData.edges, 'pyramid');
    
    const finalGraphData = {
      nodes: layoutedNodes,
      edges: layoutedEdges
    };

    console.log('Processed graph data:', finalGraphData);
    res.status(200).json(finalGraphData);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Error generating knowledge graph', error: error.message });
  }
}