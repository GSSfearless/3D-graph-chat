import axios from 'axios';

// API 配置
const API_CONFIG = {
  deepseek: {
    // 非联网版本
    standard: {
      url: 'https://ark.cn-beijing.volces.com/api/v3',
      key: process.env.VOLCANO_API_KEY,
      models: {
        fast: 'deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B',
        deep: 'deepseek-ai/DeepSeek-R1'
      }
    },
    // 联网版本
    web: {
      url: 'https://ark.cn-beijing.volces.com/api/v3/bots',
      key: process.env.VOLCANO_API_KEY,
      models: {
        fast: process.env.VOLCANO_BOT_ID_FAST,  // 快速联网 bot ID
        deep: process.env.VOLCANO_BOT_ID_DEEP   // 深度思考联网 bot ID
      }
    }
  },
  openai: {
    url: 'https://api.openai.com/v1/chat/completions',
    key: process.env.OPENAI_API_KEY,
    model: 'gpt-4-turbo-preview'
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

// API 状态监控
const logApiDetails = (api, status, details = '') => {
  const timestamp = new Date().toLocaleTimeString();
  const style = status === 'success' 
    ? 'color: #22c55e; font-weight: bold;'
    : status === 'error'
    ? 'color: #ef4444; font-weight: bold;'
    : status === 'warning'
    ? 'color: #f59e0b; font-weight: bold;'
    : 'color: #3b82f6; font-weight: bold;';
  
  console.log(
    `%c[${timestamp}] [${api}] ${status.toUpperCase()}${details ? ': ' + details : ''}`,
    style
  );
};

// OpenAI API 调用
const callOpenAIAPI = async (messages, stream = false) => {
  const config = API_CONFIG.openai;
  if (!config.key) {
    logApiDetails('OpenAI', 'error', 'API key not configured');
    throw new Error('OpenAI API key not configured');
  }

  logApiDetails('OpenAI', 'info', `Calling API with ${messages.length} messages, stream: ${stream}`);
  try {
    const response = await api({
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
    logApiDetails('OpenAI', 'success', 'API call successful');
    return response;
  } catch (error) {
    logApiDetails('OpenAI', 'error', `API call failed: ${error.message}`);
    throw error;
  }
};

// DeepSeek API 调用
const callDeepSeekAPI = async (messages, stream = false, useDeepThinking = false, useWebSearch = false) => {
  const config = API_CONFIG.deepseek;
  const mode = useWebSearch ? config.web : config.standard;
  
  if (!mode.key) {
    logApiDetails('DeepSeek', 'error', 'API key not configured');
    throw new Error('DeepSeek API key not configured');
  }

  // 根据模式和思考深度选择模型
  const model = useDeepThinking ? mode.models.deep : mode.models.fast;
  
  if (!model) {
    logApiDetails('DeepSeek', 'error', `Model ID not configured for ${useWebSearch ? 'web' : 'standard'} mode`);
    throw new Error('DeepSeek model ID not configured');
  }

  logApiDetails('DeepSeek', 'info', `Using ${useWebSearch ? 'web' : 'standard'} mode with model: ${model}`);

  try {
    const response = await api({
      method: 'post',
      url: mode.url,
      data: {
        model: model,
        messages,
        temperature: 0.7,
        max_tokens: useDeepThinking ? 4000 : 2000,
        stream,
        top_p: 0.8,
        frequency_penalty: 0.5
      },
      headers: {
        'Authorization': `Bearer ${mode.key}`,
        'Content-Type': 'application/json',
        'Accept': stream ? 'text/event-stream' : 'application/json'
      },
      responseType: stream ? 'stream' : 'json',
      retry: 3,
      retryDelay: 1000
    });
    logApiDetails('DeepSeek', 'success', `API call successful using ${useWebSearch ? 'web' : 'standard'} mode`);
    return response;
  } catch (error) {
    logApiDetails('DeepSeek', 'error', `API call failed: ${error.message}`);
    throw error;
  }
};

// Gemini API 调用
const callGeminiAPI = async (messages, stream = false) => {
  const config = API_CONFIG.gemini;
  if (!config.key) {
    logApiDetails('Gemini', 'error', 'API key not configured');
    throw new Error('Gemini API key not configured');
  }

  const systemMessage = messages.find(m => m.role === 'system')?.content || '';
  const userMessage = messages.find(m => m.role === 'user')?.content || '';

  logApiDetails('Gemini', 'info', `Calling API with system and user messages, stream: ${stream}`);
  try {
    const response = await api({
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
        },
        stream
      },
      headers: {
        'Content-Type': 'application/json',
        'Accept': stream ? 'text/event-stream' : 'application/json'
      },
      responseType: stream ? 'stream' : 'json',
      retry: 3,
      retryDelay: 1000
    });
    logApiDetails('Gemini', 'success', 'API call successful');
    return response;
  } catch (error) {
    logApiDetails('Gemini', 'error', `API call failed: ${error.message}`);
    throw error;
  }
};

// 故障转移调用
const callWithFallback = async (messages, stream = false, useDeepThinking = false, useWebSearch = false) => {
  // 定义多个 DeepSeek 模型尝试顺序
  const deepseekModels = [
    { 
      name: 'deepseek-primary', 
      fn: (msgs, strm) => callDeepSeekAPI(msgs, strm, useDeepThinking, useWebSearch)
    },
    { 
      name: 'deepseek-backup', 
      fn: (msgs, strm) => callDeepSeekAPI(msgs, strm, false, useWebSearch)
    }
  ];

  // 其他 API 作为最后的备选
  const backupApis = [
    { name: 'openai', fn: callOpenAIAPI },
    { name: 'gemini', fn: callGeminiAPI }
  ];

  // 合并所有 API，确保 DeepSeek 模型优先
  const apis = [...deepseekModels, ...backupApis];

  logApiDetails('Fallback', 'info', 'Starting API fallback sequence');
  
  for (const api of apis) {
    try {
      logApiDetails('Fallback', 'info', `Attempting ${api.name} API`);
      const response = await api.fn(messages, stream);
      logApiDetails('Fallback', 'success', `Successfully used ${api.name} API`);
      return { provider: api.name.split('-')[0], response };
    } catch (error) {
      logApiDetails('Fallback', 'warning', `${api.name} API failed: ${error.message}`);
      continue;
    }
  }

  logApiDetails('Fallback', 'error', 'All API calls failed');
  throw new Error('All API calls failed');
};

export {
  callWithFallback,
  callOpenAIAPI,
  callDeepSeekAPI,
  callGeminiAPI
}; 