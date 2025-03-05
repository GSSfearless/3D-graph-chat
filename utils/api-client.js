import axios from 'axios';

// API 配置
const API_CONFIG = {
  deepseek: {
    url: 'https://api.siliconflow.com/v1/chat/completions',
    key: process.env.SILICONFLOW_API_KEY,
    models: {
      fast: 'Qwen/Qwen1.5-0.5B-Chat',  // 更换为更轻量级的模型，响应更快
      deep: 'deepseek-ai/DeepSeek-R1',  // 深度思考模型
      chat: 'deepseek-ai/deepseek-chat-7b',  // 通用对话模型
      coder: 'deepseek-ai/deepseek-coder-7b',  // 代码生成模型
      math: 'deepseek-ai/deepseek-math-7b',  // 数学推理模型
      moe: 'deepseek-ai/deepseek-moe-16b'  // 大规模混合专家模型
    }
  },
  volcengine: {
    url: process.env.VOLCENGINE_API_URL,
    key: process.env.VOLCENGINE_API_KEY,
    model_id: process.env.VOLCENGINE_MODEL_ID,
    region: 'cn-beijing'
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
const createAxiosInstance = (timeout = 30000) => {
  return axios.create({
    timeout,
    maxContentLength: Infinity,
    maxBodyLength: Infinity
  });
};

// 添加重试逻辑和错误处理
const addRetryInterceptor = (api) => {
  // 添加请求拦截器
  api.interceptors.request.use(config => {
    // 记录请求开始时间
    config.metadata = { startTime: new Date() };
    return config;
  });

  // 添加响应拦截器
  api.interceptors.response.use(
    response => {
      // 计算请求耗时
      const requestTime = new Date() - response.config.metadata.startTime;
      console.log(`请求耗时: ${requestTime}ms`);
      return response;
    },
    async (err) => {
      const { config } = err;
      if (!config || !config.retry) {
        return Promise.reject(err);
      }
      
      // 记录详细错误信息
      const errorStatus = err.response ? err.response.status : 'network error';
      console.error(`API错误(${config.url}): ${errorStatus} - ${err.message}`);
      
      config.currentRetryAttempt = config.currentRetryAttempt || 0;
      
      // 对于504错误，立即切换到备用端点
      if (err.response && err.response.status === 504 && config.url.includes('siliconflow') && config.currentRetryAttempt === 0) {
        console.log('检测到504超时，正在切换到备用API端点...');
        
        // 尝试切换API端点
        if (config.url.includes('api.siliconflow.com')) {
          config.url = config.url.replace('api.siliconflow.com', 'api.siliconflow.cn');
        } else if (config.url.includes('api.siliconflow.cn')) {
          config.url = config.url.replace('api.siliconflow.cn', 'api.siliconflow.com');
        }
        
        console.log(`已切换到新端点: ${config.url}`);
        return api(config);
      }
      
      if (config.currentRetryAttempt >= config.retry) {
        return Promise.reject(err);
      }
      
      config.currentRetryAttempt += 1;
      const delayMs = config.retryDelay || 1000;
      console.log(`重试中(${config.currentRetryAttempt}/${config.retry})，等待${delayMs}ms...`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
      return api(config);
    }
  );
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
const callDeepSeekAPI = async (messages, stream = true, useDeepThinking = false) => {
  // 如果启用深度思考，使用火山引擎
  if (useDeepThinking) {
    return callVolcengineAPI(messages, stream);
  }

  const config = API_CONFIG.deepseek;
  if (!config.key) {
    logApiDetails('DeepSeek', 'error', 'API key not configured');
    throw new Error('DeepSeek API key not configured');
  }

  // 根据任务类型选择合适的模型
  let model;
  if (messages.some(m => m.content && (m.content.includes('代码') || m.content.includes('编程') || m.content.includes('code')))) {
    model = config.models.coder;
  } else if (messages.some(m => m.content && (m.content.includes('数学') || m.content.includes('计算') || m.content.includes('math')))) {
    model = config.models.math;
  } else if (messages.length > 8) {  // 复杂对话使用 MOE 模型
    model = config.models.moe;
  } else {
    model = config.models.fast;  // 默认使用快速模型 (Qwen1.5-0.5B-Chat)
  }

  logApiDetails('DeepSeek', 'info', `Using model: ${model}`);

  // 为Qwen模型优化的参数
  const isQwenModel = model.includes('Qwen');
  const temperature = isQwenModel ? 0.7 : 0.7;
  const max_tokens = isQwenModel ? 2000 : 2000; // 减少token数量以加快响应
  const top_p = isQwenModel ? 0.9 : 0.8;

  // 增强的日志记录
  if (isQwenModel) {
    console.log('=== 快速响应Qwen模型调用详情 ===');
    console.log('🚀 模型:', model);
    console.log('📝 消息数量:', messages.length);
    console.log('⚙️ 参数配置:');
    console.log('   - 温度:', temperature);
    console.log('   - 最大token:', max_tokens);
    console.log('   - Top P:', top_p);
    console.log('   - 流式响应:', stream ? '是' : '否');
    console.log('================================');
    
    logApiDetails('DeepSeek', 'info', `使用轻量级Qwen模型: ${model}`);
  }

  try {
    const response = await api({
      method: 'post',
      url: config.url,
      data: {
        model: model,
        messages,
        temperature,
        max_tokens,
        stream,
        top_p,
        frequency_penalty: 0.3, // 降低重复惩罚以加快生成速度
        presence_penalty: 0.1   // 低值以提高响应速度
      },
      headers: {
        'Authorization': `Bearer ${config.key}`,
        'Content-Type': 'application/json',
        'Accept': stream ? 'text/event-stream' : 'application/json'
      },
      responseType: stream ? 'stream' : 'json',
      retry: 2,        // 减少重试次数，以便更快切换到备用模型
      retryDelay: 500  // 减少重试延迟
    });
    logApiDetails('DeepSeek', 'success', `API call successful using ${model}`);
    return response;
  } catch (error) {
    logApiDetails('DeepSeek', 'error', `API call failed with ${model}: ${error.message}`);
    throw error;
  }
};

// 火山引擎 API 调用
const callVolcengineAPI = async (messages, stream = false) => {
  const config = API_CONFIG.volcengine;
  
  console.log('=== DeepSeek R1 调用详情 ===');
  console.log('模型ID:', config.model_id);
  console.log('区域:', config.region);
  console.log('流式响应:', stream ? '是' : '否');
  console.log('消息数量:', messages.length);
  console.log('========================');

  try {
    const requestData = {
      model: config.model_id,
      messages,
      temperature: 0.7,
      max_tokens: 4000,
      stream,
      top_p: 0.8,
      frequency_penalty: 0.5,
      presence_penalty: 0.5,
      stop: null,
      reasoning_steps: true,
      reasoning_output: true
    };

    console.log('🚀 正在发送请求到火山引擎...');
    console.log('请求配置:', {
      url: config.url,
      model: config.model_id,
      stream: stream,
      headers: {
        'Content-Type': 'application/json',
        'Accept': stream ? 'text/event-stream' : 'application/json',
        'X-Region': config.region,
        'X-Reasoning': 'true'
      }
    });

    const response = await api({
      method: 'post',
      url: config.url,
      data: requestData,
      headers: {
        'Authorization': `Bearer ${config.key}`,
        'Content-Type': 'application/json',
        'Accept': stream ? 'text/event-stream' : 'application/json',
        'X-Region': config.region,
        'X-Reasoning': 'true'
      },
      responseType: stream ? 'stream' : 'json',
      retry: 3,
      retryDelay: 1000
    });

    if (response.status === 200) {
      logApiDetails('Volcengine', 'success', `
=== DeepSeek R1 响应成功 ===
- 状态码: ${response.status}
- 响应类型: ${response.headers['content-type']}
=========================`);
    }
    return response;
  } catch (error) {
    logApiDetails('Volcengine', 'error', `
=== DeepSeek R1 调用失败 ===
- 错误信息: ${error.message}
- 状态码: ${error.response?.status || 'N/A'}
=========================`);
    
    if (error.response?.data) {
      console.error('错误响应数据:', error.response.data);
    }
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
const callWithFallback = async (messages, stream = true, useDeepThinking = false) => {
  // 确保消息不为空且格式正确
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    logApiDetails('Fallback', 'error', '消息格式错误或为空');
    throw new Error('Invalid messages format');
  }

  // 缩短长消息以减少处理时间
  const optimizedMessages = messages.map(msg => {
    if (msg.content && typeof msg.content === 'string' && msg.content.length > 4000) {
      return {
        ...msg,
        content: msg.content.substring(0, 4000) + '...(content truncated for performance)'
      };
    }
    return msg;
  });

  // 如果启用深度思考，优先使用火山引擎
  if (useDeepThinking) {
    try {
      logApiDetails('Fallback', 'info', '🔍 检测到深度思考模式已开启');
      logApiDetails('Fallback', 'info', '🚀 正在尝试调用火山引擎 DeepSeek R1...');
      
      // 验证火山引擎配置
      const config = API_CONFIG.volcengine;
      if (!config.key || !config.model_id || !config.url) {
        logApiDetails('Fallback', 'error', '❌ 火山引擎配置不完整');
        console.error('缺失的配置:', {
          key: !config.key ? '未配置' : '已配置',
          model_id: !config.model_id ? '未配置' : '已配置',
          url: !config.url ? '未配置' : '已配置'
        });
        throw new Error('Volcengine configuration incomplete');
      }

      logApiDetails('Fallback', 'info', `📌 火山引擎配置验证成功:
        - API URL: ${config.url}
        - Model ID: ${config.model_id}
        - Region: ${config.region}`);

      const response = await callVolcengineAPI(optimizedMessages, stream);
      logApiDetails('Fallback', 'success', '✅ 火山引擎 DeepSeek R1 调用成功');
      return { provider: 'volcengine', response };
    } catch (error) {
      logApiDetails('Fallback', 'error', `❌ 火山引擎调用失败: ${error.message}`);
      console.error('详细错误信息:', error);
      logApiDetails('Fallback', 'warning', '⚠️ 正在切换到备用API...');
    }
  }

  // 定义API调用列表和优先级
  const apiConfigs = [
    // 优先使用超轻量模型，保证快速响应
    { 
      name: 'qwen-fast', 
      description: '超轻量级Qwen模型(0.5B)',
      fn: async (msgs, strm) => {
        // 确保使用轻量级模型
        const modelName = 'Qwen/Qwen1.5-0.5B-Chat';
        const config = API_CONFIG.deepseek;
        
        const response = await api({
          method: 'post',
          url: config.url,
          data: {
            model: modelName,
            messages: msgs,
            temperature: 0.7,
            max_tokens: 1500,
            stream: strm,
            top_p: 0.9,
            frequency_penalty: 0.3
          },
          headers: {
            'Authorization': `Bearer ${config.key}`,
            'Content-Type': 'application/json',
            'Accept': strm ? 'text/event-stream' : 'application/json'
          },
          responseType: strm ? 'stream' : 'json',
          retry: 1,
          retryDelay: 300
        });
        
        return response;
      }
    },
    // 其次使用标准DeepSeek调用
    { 
      name: 'deepseek-primary', 
      description: '标准DeepSeek模型',
      fn: (msgs, strm) => callDeepSeekAPI(msgs, strm, false) 
    },
    // 最后使用其他备用API
    { 
      name: 'openai', 
      description: 'OpenAI (备用)',
      fn: callOpenAIAPI 
    },
    { 
      name: 'gemini', 
      description: 'Google Gemini (备用)',
      fn: callGeminiAPI 
    }
  ];

  // 记录故障转移开始
  console.log('==== API故障转移序列开始 ====');
  console.log(`请求消息数: ${messages.length}`);
  console.log(`流式响应: ${stream ? '启用' : '禁用'}`);
  console.log('备选API顺序:');
  apiConfigs.forEach((api, idx) => {
    console.log(`${idx+1}. ${api.name} - ${api.description}`);
  });
  console.log('============================');
  
  // 依次尝试每个API
  for (const api of apiConfigs) {
    try {
      logApiDetails('Fallback', 'info', `尝试调用 ${api.name} API`);
      const startTime = Date.now();
      const response = await api.fn(optimizedMessages, stream);
      const duration = Date.now() - startTime;
      logApiDetails('Fallback', 'success', `成功使用 ${api.name} API (耗时: ${duration}ms)`);
      return { provider: api.name.split('-')[0], response };
    } catch (error) {
      logApiDetails('Fallback', 'warning', `${api.name} API调用失败: ${error.message}`);
      continue;
    }
  }

  // 所有API都失败，抛出最终错误
  logApiDetails('Fallback', 'error', '所有API调用均失败，请检查网络连接或API配置');
  throw new Error('所有API调用都失败');
};

export {
  callWithFallback,
  callOpenAIAPI,
  callDeepSeekAPI,
  callGeminiAPI
}; 