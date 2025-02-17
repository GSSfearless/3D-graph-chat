import axios from 'axios';

// API 配置
const API_CONFIG = {
  openai: {
    url: 'https://api.openai.com/v1/chat/completions',
    key: process.env.OPENAI_API_KEY,
    model: 'gpt-4-turbo-preview'
  },
  deepseek: {
    url: 'https://api.siliconflow.cn/v1/chat/completions',
    key: process.env.SILICONFLOW_API_KEY,
    model: 'deepseek-ai/DeepSeek-R1'
  },
  claude: {
    url: 'https://api.anthropic.com/v1/messages',
    key: process.env.CLAUDE_API_KEY,
    model: 'claude-3-sonnet-20240229'
  },
  gemini: {
    url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
    key: process.env.GEMINI_API_KEY,
    model: 'gemini-pro'
  }
};

// 创建 axios 实例
const createAxiosInstance = (timeout = 120000) => {
  return axios.create({
    timeout,
    maxContentLength: Infinity,
    maxBodyLength: Infinity
  });
};

// 添加重试逻辑
const addRetryInterceptor = (api) => {
  api.interceptors.response.use(undefined, async (err) => {
    const { config } = err;
    if (!config || !config.retry) {
      return Promise.reject(err);
    }
    config.currentRetryAttempt = config.currentRetryAttempt || 0;
    if (config.currentRetryAttempt >= config.retry) {
      return Promise.reject(err);
    }
    config.currentRetryAttempt += 1;
    const delayMs = config.retryDelay || 1000;
    await new Promise(resolve => setTimeout(resolve, delayMs));
    return api(config);
  });
  return api;
};

// 创建带有重试的 axios 实例
const api = addRetryInterceptor(createAxiosInstance());

// OpenAI API 调用
const callOpenAIAPI = async (messages, stream = false) => {
  const config = API_CONFIG.openai;
  if (!config.key) throw new Error('OpenAI API key not configured');

  return api({
    method: 'post',
    url: config.url,
    data: {
      model: config.model,
      messages,
      temperature: 0.7,
      max_tokens: 2000,
      stream,
      top_p: 0.8,
      frequency_penalty: 0.5
    },
    headers: {
      'Authorization': `Bearer ${config.key}`,
      'Content-Type': 'application/json',
      'Accept': stream ? 'text/event-stream' : 'application/json'
    },
    responseType: stream ? 'stream' : 'json',
    retry: 3,
    retryDelay: 1000
  });
};

// DeepSeek API 调用
const callDeepSeekAPI = async (messages, stream = false) => {
  const config = API_CONFIG.deepseek;
  if (!config.key) throw new Error('DeepSeek API key not configured');

  return api({
    method: 'post',
    url: config.url,
    data: {
      model: config.model,
      messages,
      temperature: 0.7,
      max_tokens: 2000,
      stream,
      top_p: 0.8,
      frequency_penalty: 0.5
    },
    headers: {
      'Authorization': `Bearer ${config.key}`,
      'Content-Type': 'application/json',
      'Accept': stream ? 'text/event-stream' : 'application/json'
    },
    responseType: stream ? 'stream' : 'json',
    retry: 3,
    retryDelay: 1000
  });
};

// Claude API 调用
const callClaudeAPI = async (messages, stream = false) => {
  const config = API_CONFIG.claude;
  if (!config.key) throw new Error('Claude API key not configured');

  const systemMessage = messages.find(m => m.role === 'system')?.content || '';
  const userMessage = messages.find(m => m.role === 'user')?.content || '';

  return api({
    method: 'post',
    url: config.url,
    data: {
      model: config.model,
      messages: [
        {
          role: 'user',
          content: `${systemMessage}\n\n${userMessage}`
        }
      ],
      max_tokens: 2000,
      stream
    },
    headers: {
      'x-api-key': config.key,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json'
    },
    responseType: stream ? 'stream' : 'json',
    retry: 3,
    retryDelay: 1000
  });
};

// Gemini API 调用
const callGeminiAPI = async (messages) => {
  const config = API_CONFIG.gemini;
  if (!config.key) throw new Error('Gemini API key not configured');

  const systemMessage = messages.find(m => m.role === 'system')?.content || '';
  const userMessage = messages.find(m => m.role === 'user')?.content || '';

  return api({
    method: 'post',
    url: `${config.url}?key=${config.key}`,
    data: {
      contents: [
        {
          role: 'user',
          parts: [{ text: `${systemMessage}\n\n${userMessage}` }]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        maxOutputTokens: 2000
      }
    },
    headers: {
      'Content-Type': 'application/json'
    },
    retry: 3,
    retryDelay: 1000
  });
};

// 故障转移调用
const callWithFallback = async (messages, stream = false) => {
  const apis = [
    { name: 'openai', fn: callOpenAIAPI },
    { name: 'deepseek', fn: callDeepSeekAPI },
    { name: 'claude', fn: callClaudeAPI },
    { name: 'gemini', fn: callGeminiAPI }
  ];

  for (const api of apis) {
    try {
      console.log(`Trying ${api.name} API...`);
      const response = await api.fn(messages, stream);
      console.log(`Successfully used ${api.name} API`);
      return { provider: api.name, response };
    } catch (error) {
      console.error(`Error with ${api.name} API:`, error);
      continue;
    }
  }

  throw new Error('All API calls failed');
};

export {
  callWithFallback,
  callOpenAIAPI,
  callDeepSeekAPI,
  callClaudeAPI,
  callGeminiAPI
}; 