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

    // 执行搜索
    const results = await searchService.search(query);
    
    // 直接返回所有结果
    return res.status(200).json({
      results: results.map(result => ({
        title: result.title,
        snippet: result.snippet,
        url: result.url,
        source: result.source
      }))
    });
  } catch (error) {
    console.error('Search error:', error);
    return res.status(500).json({ error: 'Failed to fetch search results' });
  }
}