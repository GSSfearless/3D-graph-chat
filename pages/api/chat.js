import { callWithFallback } from '../../utils/api-client';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  console.log('=== API请求开始 ===');
  console.log('请求方法:', req.method);
  console.log('请求体:', req.body);

  const { query, useDeepThinking } = req.body;

  if (!query) {
    console.error('缺少查询参数');
    return res.status(400).json({ message: '请提供查询内容' });
  }

  try {
    // 设置响应头
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const messages = [
      {
        role: 'system',
        content: useDeepThinking 
          ? '你现在处于深度思考模式。请仔细分析问题，并提供详细的推理过程。'
          : '你是一个知识助手。请简洁明了地回答问题。'
      },
      {
        role: 'user',
        content: query
      }
    ];

    console.log('准备调用API...');
    console.log('消息内容:', messages);
    console.log('深度思考模式:', useDeepThinking ? '开启' : '关闭');

    // 使用故障转移机制调用 API
    const { provider, response } = await callWithFallback(messages, true, useDeepThinking);
    console.log(`使用 ${provider} API 响应${useDeepThinking ? ' (深度思考模式)' : ''}`);

    let isFirstChunk = true;
    let buffer = '';
    let responseText = '';
    let chunkCount = 0;

    const startTime = Date.now();

    // 处理流式响应
    response.data.on('data', (chunk) => {
      try {
        chunkCount++;
        console.log(`处理数据块 #${chunkCount}`);
        
        if (isFirstChunk) {
          console.log('收到第一个数据块');
          res.write('data: {"type":"start","provider":"' + provider + '"}\n\n');
          isFirstChunk = false;
        }

        const chunkText = chunk.toString();
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
              res.write('data: [DONE]\n\n');
              continue;
            }

            try {
              const parsed = JSON.parse(data);
              if (!parsed) continue;

              let content = '';
              
              // 处理不同API的响应格式
              switch (provider) {
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
                    // 处理思考过程
                    if (choice.reasoning_step) {
                      res.write(`data: {"type":"reasoning","content":"${encodeURIComponent(choice.reasoning_step)}"}\n\n`);
                    }
                    if (choice.reasoning_output) {
                      res.write(`data: {"type":"reasoning","content":"${encodeURIComponent(choice.reasoning_output)}"}\n\n`);
                    }
                  }
                  break;
              }

              if (content) {
                console.log('提取的内容:', content);
                responseText += content;
                res.write(`data: {"type":"delta","content":"${encodeURIComponent(content)}"}\n\n`);
              }
            } catch (e) {
              console.error('解析消息错误:', e, '原始数据:', data);
              continue;
            }
          }
        }
      } catch (error) {
        console.error('处理数据块错误:', error);
      }
    });

    response.data.on('end', () => {
      console.log('流结束');
      console.log('最终缓冲区:', buffer);
      console.log('处理的数据块总数:', chunkCount);
      console.log('最终响应长度:', responseText.length);

      // 发送完整的响应文本
      if (responseText) {
        console.log('准备发送完整回答信号...');
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
      console.error('流错误:', error);
      res.write(`data: {"type":"error","message":"${error.message}"}\n\n`);
      res.end();
    });

  } catch (error) {
    console.error('调用API错误:', error);
    console.error('错误详情:', {
      message: error.message,
      stack: error.stack,
      response: error.response?.data
    });
    
    return res.status(500).json({ 
      message: '处理聊天请求时出错',
      error: error.message,
      details: error.response?.data
    });
  }
}

// 修改提取Mermaid图表的逻辑
const extractMermaidDiagrams = (text) => {
  const diagrams = {
    flowchart: '',
    mindmap: '',
    fishbone: '',
    orgchart: '',
    timeline: '',
    treechart: '',
    bracket: ''
  };
  
  // 使用更精确的正则表达式
  const mermaidRegex = /```mermaid\n([\s\S]*?)```/g;
  let match;
  
  while ((match = mermaidRegex.exec(text)) !== null) {
    const diagramContent = match[1].trim();
    console.log('找到Mermaid图表:', diagramContent);
    
    if (diagramContent.startsWith('graph LR') || diagramContent.startsWith('graph TD')) {
      console.log('提取到流程图');
      diagrams.flowchart = diagramContent;
    } else if (diagramContent.startsWith('mindmap')) {
      console.log('提取到思维导图');
      diagrams.mindmap = diagramContent;
    } else if (diagramContent.startsWith('fishbone')) {
      console.log('提取到鱼骨图');
      diagrams.fishbone = diagramContent;
    } else if (diagramContent.startsWith('orgchart')) {
      console.log('提取到组织结构图');
      diagrams.orgchart = diagramContent;
    } else if (diagramContent.startsWith('timeline')) {
      console.log('提取到时间轴');
      diagrams.timeline = diagramContent;
    } else if (diagramContent.startsWith('tree')) {
      console.log('提取到树形图');
      diagrams.treechart = diagramContent;
    } else if (diagramContent.startsWith('bracket')) {
      console.log('提取到括号图');
      diagrams.bracket = diagramContent;
    }
  }
  
  // 打印提取结果
  console.log('提取的图表数据:', {
    hasFlowchart: !!diagrams.flowchart,
    hasMindmap: !!diagrams.mindmap,
    hasFishbone: !!diagrams.fishbone,
    hasOrgchart: !!diagrams.orgchart,
    hasTimeline: !!diagrams.timeline,
    hasTreechart: !!diagrams.treechart,
    hasBracket: !!diagrams.bracket,
    flowchartLength: diagrams.flowchart.length,
    mindmapLength: diagrams.mindmap.length,
    fishboneLength: diagrams.fishbone.length,
    orgchartLength: diagrams.orgchart.length,
    timelineLength: diagrams.timeline.length,
    treechartLength: diagrams.treechart.length,
    bracketLength: diagrams.bracket.length
  });
  
  return diagrams;
};