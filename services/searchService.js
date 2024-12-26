import axios from 'axios';

class SearchResult {
  constructor(title, snippet, url, source, date = new Date()) {
    this.title = title;
    this.snippet = snippet;
    this.url = url;
    this.source = source;
    this.date = date;
  }
}

export class MultiSourceSearchService {
  constructor() {
    this.serperApiKey = process.env.SERPER_API_KEY;
    this.bingApiKey = process.env.BING_API_KEY;
    this.googleApiKey = process.env.GOOGLE_API_KEY;
  }

  async search(query) {
    try {
      // 并行执行多个搜索
      const [serperResults, bingResults, googleResults] = await Promise.allSettled([
        this.searchSerper(query),
        this.searchBing(query),
        this.searchGoogle(query)
      ]);

      // 合并和处理结果
      const results = this.mergeResults([
        serperResults.status === 'fulfilled' ? serperResults.value : [],
        bingResults.status === 'fulfilled' ? bingResults.value : [],
        googleResults.status === 'fulfilled' ? googleResults.value : []
      ]);

      return results;
    } catch (error) {
      console.error('Search error:', error);
      throw error;
    }
  }

  async searchSerper(query) {
    try {
      const response = await axios.get(`https://serpapi.com/search.json`, {
        params: {
          q: query,
          api_key: this.serperApiKey
        }
      });

      return response.data.organic_results.map(result => new SearchResult(
        result.title,
        result.snippet,
        result.link,
        'serper'
      ));
    } catch (error) {
      console.error('Serper API error:', error);
      return [];
    }
  }

  async searchBing(query) {
    try {
      const response = await axios.get('https://api.bing.microsoft.com/v7.0/search', {
        headers: {
          'Ocp-Apim-Subscription-Key': this.bingApiKey
        },
        params: {
          q: query,
          count: 10
        }
      });

      return response.data.webPages.value.map(result => new SearchResult(
        result.name,
        result.snippet,
        result.url,
        'bing'
      ));
    } catch (error) {
      console.error('Bing API error:', error);
      return [];
    }
  }

  async searchGoogle(query) {
    try {
      const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
        params: {
          key: this.googleApiKey,
          cx: process.env.GOOGLE_SEARCH_ENGINE_ID,
          q: query
        }
      });

      return response.data.items.map(result => new SearchResult(
        result.title,
        result.snippet,
        result.link,
        'google'
      ));
    } catch (error) {
      console.error('Google API error:', error);
      return [];
    }
  }

  mergeResults(resultArrays) {
    // 扁平化并去重
    const allResults = resultArrays.flat();
    
    // 按相关性评分排序
    const scoredResults = allResults.map(result => ({
      ...result,
      score: this.calculateRelevanceScore(result)
    }));

    // 排序并返回前10个结果
    return scoredResults
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map(({ score, ...result }) => result);
  }

  calculateRelevanceScore(result) {
    let score = 0;

    // 1. 来源权重
    const sourceWeights = {
      'google': 0.4,
      'bing': 0.3,
      'serper': 0.3
    };
    score += sourceWeights[result.source] || 0;

    // 2. 内容长度权重
    if (result.snippet) {
      score += Math.min(result.snippet.length / 200, 0.3);
    }

    // 3. URL质量权重
    const urlScore = this.calculateUrlScore(result.url);
    score += urlScore * 0.3;

    return score;
  }

  calculateUrlScore(url) {
    try {
      const domain = new URL(url).hostname;
      
      // 可信域名列表
      const trustDomains = {
        'github.com': 0.9,
        'stackoverflow.com': 0.8,
        'medium.com': 0.7,
        'wikipedia.org': 0.8,
        'docs.microsoft.com': 0.8,
        'developer.mozilla.org': 0.8
      };

      // 检查是否是可信域名
      for (const [trustDomain, score] of Object.entries(trustDomains)) {
        if (domain.includes(trustDomain)) {
          return score;
        }
      }

      // 默认分数
      return 0.5;
    } catch (error) {
      return 0.1;
    }
  }
} 