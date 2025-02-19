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
      ? `你是一个专业的知识助手，现在处于深度思考模式。请对问题进行深入分析，考虑多个角度，并提供详尽的见解。要求：
1. 使用markdown格式，但不要添加"大标题"、"小标题"等无意义的标题文字
2. 回答要有清晰的层次结构，适当使用标题（##、###）来组织内容
3. 深入分析问题的各个方面
4. 考虑不同的观点和可能性
5. 提供具体的例子和解释
6. 在回答的最后，总结关键要点和见解
7. 在回答的最后生成两个Mermaid图表，格式如下：

\`\`\`mermaid
graph TD
    A[开始] --> B[概念1]
    B --> C[概念2]
    C --> D[结束]
\`\`\`

\`\`\`mermaid
mindmap
  root((核心主题))
    思考1
        要点1
        要点2
    思考2
        要点3
        要点4
\`\`\`
`
      : `你是一个专业的知识助手。请基于提供的上下文信息，以清晰、简洁的方式回答问题。要求：
1. 使用markdown格式，但不要添加"大标题"、"小标题"等无意义的标题文字
2. 回答要有清晰的层次结构，适当使用标题（##、###）来组织内容
3. 适当使用列表和要点
4. 在回答的最后，总结关键要点
5. 在回答的最后生成两个Mermaid图表，格式如下：

\`\`\`mermaid
graph TD
    A[开始] --> B[概念1]
    B --> C[概念2]
    C --> D[结束]
\`\`\`

\`\`\`mermaid
mindmap
  root((核心主题))
    思考1
        要点1
        要点2
    思考2
        要点3
        要点4
\`\`\`
`;

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
              console.log('收到 [DONE] 信号');
              // 在结束前确保发送完整的图表数据
              const diagrams = extractMermaidDiagrams(responseText);
              if (diagrams.flowchart) {
                console.log('发送最终流程图数据');
                res.write(`data: {"type":"flowchart","content":"${encodeURIComponent(diagrams.flowchart)}"}\n\n`);
              }
              if (diagrams.mindmap) {
                console.log('发送最终思维导图数据');
                res.write(`data: {"type":"mindmap","content":"${encodeURIComponent(diagrams.mindmap)}"}\n\n`);
              }
              res.write('data: [DONE]\n\n');
              continue;
            }

            try {
              const parsed = JSON.parse(data);
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
                
                // 检查累积的响应文本中是否包含完整的图表
                if (responseText.includes('```mermaid')) {
                  console.log('检测到Mermaid图表标记');
                  const diagrams = extractMermaidDiagrams(responseText);
                  
                  if (diagrams.flowchart) {
                    console.log('发送流程图数据，长度:', diagrams.flowchart.length);
                    res.write(`data: {"type":"flowchart","content":"${encodeURIComponent(diagrams.flowchart)}"}\n\n`);
                  }
                  if (diagrams.mindmap) {
                    console.log('发送思维导图数据，长度:', diagrams.mindmap.length);
                    res.write(`data: {"type":"mindmap","content":"${encodeURIComponent(diagrams.mindmap)}"}\n\n`);
                  }
                }
              }
            } catch (e) {
              console.error('Message parse error:', e, 'Raw data:', data);
              continue;
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

// 修改提取Mermaid图表的逻辑
const extractMermaidDiagrams = (text) => {
  const diagrams = {
    flowchart: '',
    mindmap: ''
  };
  
  // 使用更精确的正则表达式
  const mermaidRegex = /```mermaid\n([\s\S]*?)```/g;
  let match;
  
  while ((match = mermaidRegex.exec(text)) !== null) {
    const diagramContent = match[1].trim();
    console.log('找到Mermaid图表:', diagramContent);
    
    if (diagramContent.startsWith('graph TD')) {
      console.log('提取到流程图');
      diagrams.flowchart = diagramContent;
    } else if (diagramContent.startsWith('mindmap')) {
      console.log('提取到思维导图');
      diagrams.mindmap = diagramContent;
    }
  }
  
  // 打印提取结果
  console.log('提取的图表数据:', {
    hasFlowchart: !!diagrams.flowchart,
    hasMindmap: !!diagrams.mindmap,
    flowchartLength: diagrams.flowchart.length,
    mindmapLength: diagrams.mindmap.length
  });
  
  return diagrams;
};