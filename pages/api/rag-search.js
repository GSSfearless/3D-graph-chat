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
    
    const results = response.data.organic_results.map(result => ({
      title: result.title,
      snippet: result.snippet
    }));
    
    res.status(200).json(results);
  } catch (error) {
    console.error('Error fetching search results:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Failed to fetch search results' });
  }
}