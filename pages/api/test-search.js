import axios from 'axios';

async function testBingSearch() {
  try {
    const response = await axios.get('https://api.bing.microsoft.com/v7.0/search', {
      headers: {
        'Ocp-Apim-Subscription-Key': process.env.BING_API_KEY
      },
      params: {
        q: 'test query',
        count: 1
      }
    });
    
    return {
      success: true,
      data: response.data.webPages.value[0],
      message: 'Bing API 工作正常'
    };
  } catch (error) {
    console.error('Bing API error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data || error.message,
      message: 'Bing API 测试失败'
    };
  }
}

async function testGoogleSearch() {
  try {
    const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
      params: {
        key: process.env.GOOGLE_API_KEY,
        cx: process.env.GOOGLE_SEARCH_ENGINE_ID,
        q: 'test query'
      }
    });
    
    return {
      success: true,
      data: response.data.items[0],
      message: 'Google API 工作正常'
    };
  } catch (error) {
    console.error('Google API error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data || error.message,
      message: 'Google API 测试失败'
    };
  }
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: '只允许 GET 请求' });
  }

  try {
    // 测试所有搜索API
    const [bingResult, googleResult] = await Promise.all([
      testBingSearch(),
      testGoogleSearch()
    ]);

    // 返回测试结果
    res.status(200).json({
      timestamp: new Date().toISOString(),
      bing: bingResult,
      google: googleResult,
      environment: {
        bingApiKey: process.env.BING_API_KEY ? '已配置' : '未配置',
        googleApiKey: process.env.GOOGLE_API_KEY ? '已配置' : '未配置',
        googleSearchEngineId: process.env.GOOGLE_SEARCH_ENGINE_ID ? '已配置' : '未配置'
      }
    });
  } catch (error) {
    console.error('测试过程出错:', error);
    res.status(500).json({ 
      message: '测试过程出错', 
      error: error.message 
    });
  }
} 