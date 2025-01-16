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
  // 创建中心主题节点
  const nodes = [
    {
      id: 'root',
      data: { 
        label: structure.mainNode,
        type: 'center'  // 标记为中心节点
      }
    }
  ];

  const edges = [];
  
  // 处理主要分支
  structure.subNodes.forEach((subNode, index) => {
    const branchId = `branch-${index}`;
    
    // 添加主分支节点
    nodes.push({
      id: branchId,
      data: { 
        label: subNode.title,
        content: subNode.content,
        type: 'branch'  // 标记为主分支
      }
    });

    // 连接中心节点和主分支
    edges.push({
      id: `edge-to-branch-${index}`,
      source: 'root',
      target: branchId,
      type: 'mindmap',  // 使用思维导图类型的连接线
      animated: true,
      style: { stroke: '#888', strokeWidth: 2 },
      labelStyle: { fill: '#888', fontWeight: 700 },
      labelBgStyle: { fill: '#fff', fillOpacity: 0.7 },
      labelBgPadding: [8, 4],
      labelBgBorderRadius: 4,
      markerEnd: {
        type: 'arrowclosed',
        color: '#888',
      }
    });

    // 如果有子内容，创建子分支
    if (subNode.content) {
      // 分割内容并清理
      const contentPoints = subNode.content
        .split(/[\n•]/) // 同时处理换行符和项目符号
        .map(point => point.trim())
        .filter(point => point.length > 0)
        .reduce((acc, point) => {
          // 如果一个点包含多个关键词（用逗号或分号分隔），则拆分它们
          const keywords = point
            .split(/[,，;；、]/)
            .map(k => k.trim())
            .filter(k => k.length > 0);
          return [...acc, ...keywords];
        }, []);
      
      contentPoints.forEach((point, pointIndex) => {
        const subBranchId = `${branchId}-sub-${pointIndex}`;
        
        // 添加子分支节点
        nodes.push({
          id: subBranchId,
          data: { 
            label: point,
            type: 'subbranch'  // 标记为子分支
          }
        });

        // 连接主分支和子分支
        edges.push({
          id: `edge-to-subbranch-${index}-${pointIndex}`,
          source: branchId,
          target: subBranchId,
          type: 'mindmap',  // 使用思维导图类型的连接线
          animated: true,
          style: { stroke: '#888', strokeWidth: 1 },  // 子分支线条稍细
          markerEnd: {
            type: 'arrowclosed',
            color: '#888',
          }
        });
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