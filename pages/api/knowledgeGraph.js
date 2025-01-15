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
      data: { 
        label: structure.mainNode,
        level: 'root'
      }
    }
  ];

  const edges = [];
  let nodeCounter = 0;

  // 处理主要分支
  structure.subNodes.forEach((subNode, index) => {
    const nodeId = `node-${nodeCounter++}`;
    nodes.push({
      id: nodeId,
      data: { 
        label: subNode.title,
        content: subNode.content,
        level: 'mainBranch'
      }
    });

    edges.push({
      id: `edge-${nodeCounter}`,
      source: 'root',
      target: nodeId,
      type: 'smoothstep',
      animated: false,
    });

    // 处理子分支（如果存在）
    if (subNode.children && Array.isArray(subNode.children)) {
      subNode.children.forEach((childNode) => {
        const childId = `node-${nodeCounter++}`;
        nodes.push({
          id: childId,
          data: {
            label: childNode.title,
            content: childNode.content,
            level: 'subBranch'
          }
        });

        edges.push({
          id: `edge-${nodeCounter}`,
          source: nodeId,
          target: childId,
          type: 'smoothstep',
          animated: false,
        });

        // 处理第三层节点（如果存在）
        if (childNode.children && Array.isArray(childNode.children)) {
          childNode.children.forEach((grandChild) => {
            const grandChildId = `node-${nodeCounter++}`;
            nodes.push({
              id: grandChildId,
              data: {
                label: grandChild.title,
                content: grandChild.content,
                level: 'subBranch'
              }
            });

            edges.push({
              id: `edge-${nodeCounter}`,
              source: childId,
              target: grandChildId,
              type: 'smoothstep',
              animated: false,
            });
          });
        }
      });
    }
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
    
    // 应用向下布局
    const { nodes: layoutedNodes, edges: layoutedEdges } = relayoutGraph(graphData.nodes, graphData.edges, 'downward');
    
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