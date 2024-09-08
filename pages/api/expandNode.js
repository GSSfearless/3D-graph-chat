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
    // 返回一个默认的节点结构
    return {
      nodes: [
        { id: 'default1', label: 'Default Node 1' },
        { id: 'default2', label: 'Default Node 2' }
      ]
    };
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

    const cleanedResponse = cleanOpenAIResponse(completion.choices[0].message.content);
    console.log('Cleaned response:', cleanedResponse);

    let expandedData = parseJSONSafely(cleanedResponse);
    console.log('Parsed expanded data:', expandedData);

    // 确保 expandedData 有正确的结构
    if (!expandedData.nodes || !Array.isArray(expandedData.nodes)) {
      throw new Error('OpenAI 响应格式不正确');
    }

    // 为新节点创建布局
    const parentNode = { id: nodeId, position: { x: 0, y: 0 } };
    const layoutedNodes = createLayout(expandedData.nodes, parentNode);

    // 修改这里，确保新节点包含正确的数据结构
    const processedNodes = layoutedNodes.map(node => ({
      id: node.id,
      data: { label: node.label },
      position: node.position,
      style: node.style
    }));

    // 创建从父节点到新节点的边
    const newEdges = processedNodes.map(node => ({
      id: `${nodeId}-${node.id}`,
      source: nodeId,
      target: node.id,
      label: '详细',
    }));

    const responseData = {
      nodes: processedNodes,
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