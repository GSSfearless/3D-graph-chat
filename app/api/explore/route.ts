import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nodes } = body;

    if (!nodes || !Array.isArray(nodes) || nodes.length === 0) {
      return NextResponse.json(
        { error: '无效的节点数据' },
        { status: 400 }
      );
    }

    // 这里调用你的知识图谱服务
    // 示例响应数据
    const response = {
      nodes: [
        {
          data: {
            id: 'new-node-1',
            label: '新发现的节点1',
            description: '这是一个新发现的相关节点'
          }
        },
        {
          data: {
            id: 'new-node-2',
            label: '新发现的节点2',
            description: '这是另一个新发现的相关节点'
          }
        }
      ],
      edges: [
        {
          data: {
            source: nodes[0].id,
            target: 'new-node-1'
          }
        },
        {
          data: {
            source: 'new-node-1',
            target: 'new-node-2'
          }
        }
      ]
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('处理探索请求时出错:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
} 