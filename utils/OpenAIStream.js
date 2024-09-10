export async function OpenAIStream(payload) {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  let counter = 0;

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY ?? ''}`,
    },
    method: 'POST',
    body: JSON.stringify(payload),
  });

  const stream = new ReadableStream({
    async start(controller) {
      const reader = res.body.getReader();
      let buffer = '';
      
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          
          for (let i = 0; i < lines.length - 1; i++) {
            const line = lines[i].trim();
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') {
                controller.close();
                return;
              }
              try {
                const json = JSON.parse(data);
                const text = json.choices[0].delta?.content || '';
                if (counter < 2 && (text.match(/\n/) || []).length) {
                  continue;
                }
                const queue = encoder.encode(text);
                controller.enqueue(queue);
                counter++;
              } catch (e) {
                controller.error(e);
              }
            }
          }
          buffer = lines[lines.length - 1];
        }
      } catch (e) {
        controller.error(e);
      }
    },
  });

  return stream;
}