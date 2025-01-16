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

  const { nodeId, label, parentPosition, nodeType } = req.body;

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
          content: `你是一个思维导图专家，请为给定的主题生成相关的分支概念。
          规则：
          1. 生成的内容要简洁，每个分支不超过4个字
          2. 内容要有逻辑性和关联性
          3. 生成的分支数量：
             - 如果是主分支，生成3个分支
             - 如果是子分支，生成2个更细节的分支
          4. 返回格式为JSON，包含nodes数组，每个节点有id和label属性`
        },
        {
          role: "user", 
          content: `请为主题"${label}"生成${nodeType === 'branch' ? '2' : '3'}个分支概念`
        }
      ],
    });

    console.log('OpenAI API response:', completion.choices[0].message.content);

    const cleanedResponse = cleanOpenAIResponse(completion.choices[0].message.content);
    console.log('Cleaned response:', cleanedResponse);

    let expandedData = parseJSONSafely(cleanedResponse);
    console.log('Parsed expanded data:', expandedData);

    if (!expandedData || !expandedData.nodes || !Array.isArray(expandedData.nodes)) {
      console.error('Invalid expandedData structure:', expandedData);
      // 生成默认分支
      expandedData = {
        nodes: nodeType === 'branch' ? [
          { id: `${nodeId}-sub-1`, label: '要点一' },
          { id: `${nodeId}-sub-2`, label: '要点二' }
        ] : [
          { id: `${nodeId}-branch-1`, label: '分支一' },
          { id: `${nodeId}-branch-2`, label: '分支二' },
          { id: `${nodeId}-branch-3`, label: '分支三' }
        ]
      };
    }

    const processedNodes = expandedData.nodes.map((node, index) => ({
      id: node.id || `${nodeId}-${nodeType === 'branch' ? 'sub' : 'branch'}-${index + 1}`,
      data: { 
        label: node.label || `${nodeType === 'branch' ? '要点' : '分支'}${index + 1}`,
        type: nodeType === 'branch' ? 'subbranch' : 'branch'
      },
    }));

    const parentNode = { id: nodeId, position: parentPosition || { x: 0, y: 0 } };
    const existingNodes = req.body.existingNodes || [];
    const layoutedNodes = createExpandLayout(processedNodes, parentNode, existingNodes);

    const newEdges = layoutedNodes.map(node => ({
      id: `${nodeId}-${node.id}`,
      source: nodeId,
      target: node.id,
      type: 'mindmap',
      animated: true,
      style: { 
        stroke: '#888', 
        strokeWidth: nodeType === 'branch' ? 1 : 2 
      },
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