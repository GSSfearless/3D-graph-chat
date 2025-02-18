import { callWithFallback } from '../../utils/api-client';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { query, context, useDeepThinking } = req.body;

  try {
    // 构建上下文提示词
    const contextText = context
      .map(item => `${item.title}\n${item.content}`)
      .join('\n\n');

    const systemPrompt = useDeepThinking 
      ? `你是一个专业的知识助手，现在处于深度思考模式。请对问题进行深入分析，考虑多个角度，并提供详尽的见解。回答应该：
1. 使用markdown格式，确保层次分明
2. 包含清晰的标题和小标题
3. 深入分析问题的各个方面
4. 考虑不同的观点和可能性
5. 提供具体的例子和解释
6. 在回答的最后，总结关键要点和见解`
      : `你是一个专业的知识助手。请基于提供的上下文信息，以清晰、简洁的方式回答问题。回答应该：
1. 使用markdown格式，确保层次分明
2. 包含清晰的标题和小标题
3. 适当使用列表和要点
4. 在回答的最后，总结关键要点`;

    // 设置响应头
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const messages = [
      {
        role: 'system',
        content: systemPrompt
      },
      {
        role: 'user',
        content: `上下文信息：\n${contextText}\n\n问题：${query}`
      }
    ];

    // 使用故障转移机制调用 API
    const { provider, response } = await callWithFallback(messages, true, useDeepThinking);
    console.log(`Using ${provider} API for response${useDeepThinking ? ' (Deep Thinking Mode)' : ''}`);

    let isFirstChunk = true;
    let buffer = '';
    let responseText = '';
    let chunkCount = 0;

    const startTime = Date.now();
    // 处理流式响应
    response.data.on('data', (chunk) => {
      try {
        chunkCount++;
        console.log(`Processing chunk #${chunkCount}`);
        
        if (isFirstChunk) {
          console.log('First chunk received');
          res.write('data: {"type":"start","provider":"' + provider + '"}\n\n');
          isFirstChunk = false;
        }

        const chunkText = chunk.toString();
        console.log('Raw chunk:', chunkText);
        buffer += chunkText;

        // 处理完整的数据行
        while (buffer.includes('\n')) {
          const newlineIndex = buffer.indexOf('\n');
          const line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              console.log('Received [DONE] signal');
              if (provider === 'volcengine') {
                console.log('🎯 DeepSeek R1 会话完成');
                console.log(`总计处理 ${chunkCount} 个数据块`);
              }
              res.write('data: [DONE]\n\n');
              continue;
            }

            try {
              const parsed = JSON.parse(data);
              console.log('Parsed data:', parsed);
              if (!parsed) continue;

              let content = '';
              
              // 处理不同API的响应格式
              switch (provider) {
                case 'openai':
                case 'deepseek':
                  if (parsed.choices && parsed.choices[0]) {
                    const choice = parsed.choices[0];
                    if (choice.delta && choice.delta.content) {
                      content = choice.delta.content;
                    }
                  }
                  break;
                case 'volcengine':
                  console.log('处理 DeepSeek R1 响应:', parsed);
                  if (parsed.output && parsed.output.text) {
                    content = parsed.output.text;
                    console.log('📝 DeepSeek R1 输出:', content);
                  } else if (parsed.choices && parsed.choices[0]) {
                    const choice = parsed.choices[0];
                    if (choice.delta && choice.delta.content) {
                      content = choice.delta.content;
                      console.log('📝 DeepSeek R1 流式输出:', content);
                    }
                    // 处理思考过程
                    if (choice.reasoning_step) {
                      console.log('💭 DeepSeek R1 思考步骤:', choice.reasoning_step);
                      res.write(`data: {"type":"reasoning","content":"${encodeURIComponent(choice.reasoning_step)}"}\n\n`);
                    }
                    if (choice.reasoning_output) {
                      console.log('💭 DeepSeek R1 思考输出:', choice.reasoning_output);
                      res.write(`data: {"type":"reasoning","content":"${encodeURIComponent(choice.reasoning_output)}"}\n\n`);
                    }
                  }
                  break;
                case 'claude':
                  if (parsed.type === 'content_block_delta') {
                    content = parsed.delta.text;
                  } else if (parsed.type === 'content_block_start' || parsed.type === 'content_block_stop') {
                    console.log(`Claude content block ${parsed.type}`);
                  }
                  break;
                case 'gemini':
                  if (parsed.candidates && parsed.candidates[0]) {
                    const candidate = parsed.candidates[0];
                    if (candidate.content && candidate.content.parts) {
                      content = candidate.content.parts[0].text;
                    }
                  }
                  break;
              }

              if (content) {
                console.log('Extracted content:', content);
                responseText += content;
                res.write(`data: {"type":"delta","content":"${encodeURIComponent(content)}"}\n\n`);
                
                // 当收到完整回答时，生成流程图和思维导图
                if (parsed.type === 'complete' && parsed.content) {
                  // 生成流程图
                  const generateCharts = async () => {
                    try {
                      const flowchartPrompt = `请将以下内容转换为简洁的 Mermaid 流程图格式。要求：
1. 使用 flowchart TD 格式
2. 节点ID使用字母数字组合，保持简短
3. 节点文本简洁，不超过10个字
4. 主要流程放在中间
5. 控制总节点数不超过15个
6. 确保格式正确，避免特殊字符

${decodeURIComponent(parsed.content)}`;

                      const mindmapPrompt = `请将以下内容转换为简洁的 Mermaid 思维导图格式。要求：
1. 使用 mindmap 格式
2. 主题简洁，层级清晰
3. 每个节点文本不超过10个字
4. 控制总节点数不超过20个
5. 确保格式正确，避免特殊字符

${decodeURIComponent(parsed.content)}`;

                      const flowchartMessages = [
                        { role: 'system', content: '你是专业的流程图生成助手，擅长生成简洁清晰的Mermaid流程图。' },
                        { role: 'user', content: flowchartPrompt }
                      ];

                      const mindmapMessages = [
                        { role: 'system', content: '你是专业的思维导图生成助手，擅长生成结构化的Mermaid思维导图。' },
                        { role: 'user', content: mindmapPrompt }
                      ];

                      // 并行生成图表
                      const [flowchartResponse, mindmapResponse] = await Promise.all([
                        callWithFallback(flowchartMessages, false, false),
                        callWithFallback(mindmapMessages, false, false)
                      ]);

                      // 发送流程图
                      const flowchartContent = flowchartResponse.response.data.choices[0].message.content.trim();
                      res.write(`data: {"type":"flowchart","content":"${encodeURIComponent(flowchartContent)}"}\n\n`);

                      // 发送思维导图
                      const mindmapContent = mindmapResponse.response.data.choices[0].message.content.trim();
                      res.write(`data: {"type":"mindmap","content":"${encodeURIComponent(mindmapContent)}"}\n\n`);
                    } catch (error) {
                      console.error('生成图表时出错:', error);
                    }
                  };

                  // 执行图表生成
                  generateCharts().catch(error => {
                    console.error('图表生成过程出错:', error);
                  });
                }
              }
            } catch (e) {
              console.error('Error parsing chunk:', e, 'Raw data:', data);
              console.error('Provider:', provider);
            }
          }
        }
      } catch (error) {
        console.error('Error processing chunk:', error);
      }
    });

    response.data.on('end', () => {
      console.log('Stream ended');
      console.log('Final buffer:', buffer);
      console.log('Total chunks processed:', chunkCount);
      console.log('Final response length:', responseText.length);

      // 处理缓冲区中剩余的数据
      if (buffer.length > 0) {
        console.log('Processing remaining buffer');
        const lines = buffer.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              let content = '';
              
              // 处理不同API的响应格式
              switch (provider) {
                case 'openai':
                case 'deepseek':
                  if (parsed.choices && parsed.choices[0]) {
                    const choice = parsed.choices[0];
                    if (choice.delta && choice.delta.content) {
                      content = choice.delta.content;
                    }
                  }
                  break;
                case 'volcengine':
                  if (parsed.output && parsed.output.text) {
                    content = parsed.output.text;
                  } else if (parsed.choices && parsed.choices[0]) {
                    const choice = parsed.choices[0];
                    if (choice.delta && choice.delta.content) {
                      content = choice.delta.content;
                    }
                  }
                  break;
                case 'claude':
                  if (parsed.type === 'content_block_delta') {
                    content = parsed.delta.text;
                  }
                  break;
                case 'gemini':
                  if (parsed.candidates && parsed.candidates[0]) {
                    const candidate = parsed.candidates[0];
                    if (candidate.content && candidate.content.parts) {
                      content = candidate.content.parts[0].text;
                    }
                  }
                  break;
              }

              if (content) {
                console.log('Extracted content from buffer:', content);
                responseText += content;
                res.write(`data: {"type":"delta","content":"${encodeURIComponent(content)}"}\n\n`);
                
                // 当收到完整回答时，生成流程图和思维导图
                if (parsed.type === 'complete' && parsed.content) {
                  // 生成流程图
                  const generateCharts = async () => {
                    try {
                      const flowchartPrompt = `请将以下内容转换为简洁的 Mermaid 流程图格式。要求：
1. 使用 flowchart TD 格式
2. 节点ID使用字母数字组合，保持简短
3. 节点文本简洁，不超过10个字
4. 主要流程放在中间
5. 控制总节点数不超过15个
6. 确保格式正确，避免特殊字符

${decodeURIComponent(parsed.content)}`;

                      const mindmapPrompt = `请将以下内容转换为简洁的 Mermaid 思维导图格式。要求：
1. 使用 mindmap 格式
2. 主题简洁，层级清晰
3. 每个节点文本不超过10个字
4. 控制总节点数不超过20个
5. 确保格式正确，避免特殊字符

${decodeURIComponent(parsed.content)}`;

                      const flowchartMessages = [
                        { role: 'system', content: '你是专业的流程图生成助手，擅长生成简洁清晰的Mermaid流程图。' },
                        { role: 'user', content: flowchartPrompt }
                      ];

                      const mindmapMessages = [
                        { role: 'system', content: '你是专业的思维导图生成助手，擅长生成结构化的Mermaid思维导图。' },
                        { role: 'user', content: mindmapPrompt }
                      ];

                      // 并行生成图表
                      const [flowchartResponse, mindmapResponse] = await Promise.all([
                        callWithFallback(flowchartMessages, false, false),
                        callWithFallback(mindmapMessages, false, false)
                      ]);

                      // 发送流程图
                      const flowchartContent = flowchartResponse.response.data.choices[0].message.content.trim();
                      res.write(`data: {"type":"flowchart","content":"${encodeURIComponent(flowchartContent)}"}\n\n`);

                      // 发送思维导图
                      const mindmapContent = mindmapResponse.response.data.choices[0].message.content.trim();
                      res.write(`data: {"type":"mindmap","content":"${encodeURIComponent(mindmapContent)}"}\n\n`);
                    } catch (error) {
                      console.error('生成图表时出错:', error);
                    }
                  };

                  // 执行图表生成
                  generateCharts().catch(error => {
                    console.error('图表生成过程出错:', error);
                  });
                }
              }
            } catch (e) {
              console.error('Error processing final buffer:', e);
              console.error('Provider:', provider);
            }
          }
        }
      }

      // 发送完整的响应文本
      if (responseText) {
        console.log('准备发送完整回答信号...');
        console.log('完整回答长度:', responseText.length);
        try {
          const completeSignal = `data: {"type":"complete","content":"${encodeURIComponent(responseText)}"}\n\n`;
          res.write(completeSignal);
          console.log('✅ 完整回答信号已发送');
        } catch (error) {
          console.error('❌ 发送完整回答信号失败:', error);
        }
      }
      
      console.log('准备结束响应流...');
      res.write('data: {"type":"end"}\n\n');
      res.end();

      const endTime = Date.now();
      console.log(`${provider} API 响应总时间:`, endTime - startTime, 'ms');
    });

    response.data.on('error', (error) => {
      console.error('Stream error:', error);
      res.write(`data: {"type":"error","message":"${error.message}"}\n\n`);
      res.end();
    });

  } catch (error) {
    console.error('Error calling API:', error);
    res.status(500).json({ 
      message: 'Error processing chat request',
      error: error.message 
    });
  }
}