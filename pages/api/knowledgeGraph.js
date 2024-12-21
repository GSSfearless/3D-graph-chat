const OpenAI = require('openai');

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

// 获取多语言提示模板
function getPromptTemplate(lang) {
  const templates = {
    zh: `你是一个专门用于创建知识图谱的AI助手。请为以下问题创建一个知识图谱。
请以JSON格式提供响应，包含'nodes'和'edges'数组，以及一个'type'字段，指示图谱应该是'pyramid'还是'mindmap'类型。
每个节点应该有'id'和'label'属性，每个边应该有'source'、'target'和'label'属性。
所有文本必须使用中文。

请确保：
1. 节点标签简洁明了
2. 边的标签描述节点间的关系
3. 图谱结构清晰易懂
4. 所有文本使用中文`,
    en: `You are an AI assistant specialized in creating knowledge graphs. Please create a knowledge graph for the following question.
Please provide your response in JSON format, including 'nodes' and 'edges' arrays, and a 'type' field indicating whether the graph should be a 'pyramid' or 'mindmap'.
Each node should have 'id' and 'label' properties. Each edge should have 'source', 'target', and 'label' properties.

Please ensure:
1. Node labels are concise and clear
2. Edge labels describe relationships between nodes
3. Graph structure is clear and understandable
4. All text is in English`
  };

  return templates[lang] || templates.en;
}

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

  const { query, moduleData } = req.body;

  if (!query) {
    return res.status(400).json({ message: 'Missing query parameter' });
  }

  try {
    let graphData;
    
    if (moduleData) {
      // 如果提供了模块数据，直接使用它生成图谱
      graphData = convertModuleDataToGraph(moduleData);
    } else {
      // 否则使用原有的方式生成图谱
      const detectedLang = detectLanguage(query);
      const promptTemplate = getPromptTemplate(detectedLang);

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system", 
            content: promptTemplate
          },
          {
            role: "user", 
            content: `请为以下问题创建知识图谱：${query}`
          }
        ],
      });

      const rawGraphData = parseJSONSafely(completion.choices[0].message.content);
      graphData = processRawGraphData(rawGraphData);
    }

    res.status(200).json(graphData);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Error generating knowledge graph', error: error.message });
  }
}

function convertModuleDataToGraph(moduleData) {
  // 创建节点
  const nodes = [
    // 核心概念节点
    {
      id: 'core',
      data: { 
        label: moduleData.core.title,
        type: 'core',
        content: moduleData.core.content
      }
    },
    // 模块节点
    ...moduleData.modules.map(module => ({
      id: module.id,
      data: { 
        label: module.title,
        type: 'module',
        key_points: module.key_points,
        details: module.details,
        related_concepts: module.related_concepts
      }
    }))
  ];

  // 创建边
  const edges = [
    // 从核心节点到各模块的边
    ...moduleData.modules.map(module => ({
      id: `core-${module.id}`,
      source: 'core',
      target: module.id,
      type: 'smoothstep',
      animated: true,
      label: '包含',
      labelStyle: { fill: '#888', fontWeight: 700 },
      labelBgStyle: { fill: '#fff', fillOpacity: 0.7 },
      labelBgPadding: [8, 4],
      labelBgBorderRadius: 4,
      style: { stroke: '#888', strokeWidth: 2 },
      markerEnd: {
        type: 'arrowclosed',
        color: '#888',
      },
    })),
    // 模块之间的关系边
    ...moduleData.relations.map(relation => ({
      id: `${relation.source}-${relation.target}`,
      source: relation.source,
      target: relation.target,
      type: 'smoothstep',
      animated: true,
      label: relation.description,
      labelStyle: { fill: '#888', fontWeight: 700 },
      labelBgStyle: { fill: '#fff', fillOpacity: 0.7 },
      labelBgPadding: [8, 4],
      labelBgBorderRadius: 4,
      style: { stroke: '#888', strokeWidth: 2 },
      markerEnd: {
        type: 'arrowclosed',
        color: '#888',
      },
    }))
  ];

  return { nodes, edges };
}

function processRawGraphData(rawData) {
  const nodes = rawData.nodes.map(node => ({
    id: node.id,
    data: { label: node.label || node.id },
  }));

  const edges = rawData.edges.map(edge => ({
    id: `${edge.source}-${edge.target}`,
    source: edge.source,
    target: edge.target,
    label: edge.label || '',
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

  return { nodes, edges };
}