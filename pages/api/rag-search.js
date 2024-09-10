import axios from 'axios';

export default async function handler(req, res) {
  const { query } = req.body;
  const apiKey = process.env.SERPER_API_KEY;

  const url = `https://serpapi.com/search.json?q=${encodeURIComponent(query)}&api_key=${apiKey}`;
  
  console.log(`Fetching search results for query: ${query}`);
  console.log(`Using Serper API Key: ${apiKey}`);
  console.log(`Request URL: ${url}`);

  try {
    const response = await axios.get(url);
    console.log('Search response:', response.data);
    
    const results = response.data.organic_results.map((result, index) => {
      // 模拟逐步获取结果
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({
            title: result.title,
            snippet: result.snippet
          });
        }, index * 500); // 每500毫秒返回一个结果
      });
    });
    
    // 使用 Server-Sent Events 发送实时更新
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });

    let collectedResults = 0;
    for (const resultPromise of results) {
      const result = await resultPromise;
      collectedResults++;
      res.write(`data: ${JSON.stringify({ progress: collectedResults, total: results.length, result })}\n\n`);
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (error) {
    console.error('Error fetching search results:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Failed to fetch search results' });
  }
}