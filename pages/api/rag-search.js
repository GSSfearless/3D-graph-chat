import axios from 'axios';

export default async function handler(req, res) {
    const { query } = req.body;
    const apiKey = process.env.SERPER_API_KEY;

    try {
        const response = await axios.get(`https://serpapi.com/search.json?q=${encodeURIComponent(query)}&api_key=${apiKey}`);
        const results = response.data.organic_results.map(result => ({
            title: result.title,
            snippet: result.snippet
        }));
        res.status(200).json(results);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch search results' });
    }
}