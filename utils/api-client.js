import axios from 'axios';

// API 配置
const API_CONFIG = {
  deepseek: {
    url: 'https://api.siliconflow.cn/v1/chat/completions',
    key: process.env.SILICONFLOW_API_KEY,
    models: {
      fast: 'deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B',  // 快速响应模型
      deep: 'deepseek-ai/DeepSeek-R1',  // 深度思考模型
      chat: 'deepseek-ai/deepseek-chat-7b',  // 通用对话模型
      coder: 'deepseek-ai/deepseek-coder-7b',  // 代码生成模型
      math: 'deepseek-ai/deepseek-math-7b',  // 数学推理模型
      moe: 'deepseek-ai/deepseek-moe-16b'  // 大规模混合专家模型
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
const callDeepSeekAPI = async (messages, stream = false, useDeepThinking = false) => {
  const config = API_CONFIG.deepseek;
  if (!config.key) {
    logApiDetails('DeepSeek', 'error', 'API key not configured');
    throw new Error('DeepSeek API key not configured');
  }

  // 根据任务类型选择合适的模型
  let model;
  if (useDeepThinking) {
    model = config.models.deep;
  } else if (messages.some(m => m.content.includes('代码') || m.content.includes('编程'))) {
    model = config.models.coder;
  } else if (messages.some(m => m.content.includes('数学') || m.content.includes('计算'))) {
    model = config.models.math;
  } else if (messages.length > 5) {  // 复杂对话使用 MOE 模型
    model = config.models.moe;
  } else {
    model = config.models.fast;  // 默认使用快速模型
  }

  logApiDetails('DeepSeek', 'info', `Using model: ${model}`);

  try {
    const response = await api({
      method: 'post',
      url: config.url,
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
        'Authorization': `Bearer ${config.key}`,
        'Content-Type': 'application/json',
        'Accept': stream ? 'text/event-stream' : 'application/json'
      },
      responseType: stream ? 'stream' : 'json',
      retry: 3,
      retryDelay: 1000
    });
    logApiDetails('DeepSeek', 'success', `API call successful using ${model}`);
    return response;
  } catch (error) {
    logApiDetails('DeepSeek', 'error', `API call failed with ${model}: ${error.message}`);
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
const callWithFallback = async (messages, stream = false, useDeepThinking = false) => {
  // 定义多个 DeepSeek 模型尝试顺序
  const deepseekModels = [
    { name: 'deepseek-primary', fn: (msgs, strm) => callDeepSeekAPI(msgs, strm, useDeepThinking) },
    { name: 'deepseek-backup', fn: (msgs, strm) => callDeepSeekAPI(msgs, strm, false) }  // 使用快速模型作为备选
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