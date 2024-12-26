import { MultiSourceSearchService } from '../../services/searchService';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { query } = req.body;
  if (!query) {
    return res.status(400).json({ error: 'Query is required' });
  }

  console.log(`Processing search query: ${query}`);

  try {
    // 初始化搜索服务
    const searchService = new MultiSourceSearchService();

    // 设置SSE头
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });

    // 执行搜索
    const results = await searchService.search(query);
    
    // 模拟渐进式返回结果
    let collectedResults = 0;
    const totalResults = results.length;

    for (const result of results) {
      // 添加延迟以模拟渐进式加载
      await new Promise(resolve => setTimeout(resolve, 300));
      
      collectedResults++;
      res.write(`data: ${JSON.stringify({
        progress: collectedResults,
        total: totalResults,
        result: {
          title: result.title,
          snippet: result.snippet,
          url: result.url,
          source: result.source
        }
      })}\n\n`);
    }

    // 发送完成信号
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (error) {
    console.error('Search error:', error);
    // 如果流已经开始，发送错误事件
    if (res.writable) {
      res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
      res.end();
    } else {
      res.status(500).json({ error: 'Failed to fetch search results' });
    }
  }
}