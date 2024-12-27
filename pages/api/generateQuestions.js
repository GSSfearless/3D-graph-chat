import OpenAI from 'openai';

// 添加语言检测函数
function detectLanguage(text) {
  const hasChineseChars = /[\u4e00-\u9fa5]/.test(text);
  const hasJapaneseChars = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/.test(text);
  const hasKoreanChars = /[\uac00-\ud7af\u1100-\u11ff]/.test(text);

  if (hasChineseChars) return 'zh';
  if (hasJapaneseChars) return 'ja';
  if (hasKoreanChars) return 'ko';
  return 'en';
}

// 获取多语言提示模板
function getPromptTemplate(lang, concept) {
  const templates = {
    zh: `作为一个思维导图助手，请为主题"${concept}"生成3个发散性思考的问题。这些问题应该：
1. 有助于深化理解
2. 激发创新思维
3. 探索实际应用
4. 考虑不同角度
5. 引导批判性思考

请确保问题：
- 具体且有针对性
- 开放性但不模糊
- 有启发性
- 与主题紧密相关
- 适合进一步探讨

请直接返回JSON格式的问题数组，不要包含其他内容：
["问题1", "问题2", "问题3"]`,

    en: `As a mind mapping assistant, please generate 3 divergent thinking questions for the topic "${concept}". These questions should:
1. Help deepen understanding
2. Stimulate innovative thinking
3. Explore practical applications
4. Consider different perspectives
5. Encourage critical thinking

Ensure the questions are:
- Specific and targeted
- Open-ended but not vague
- Thought-provoking
- Closely related to the topic
- Suitable for further exploration

Please return only a JSON array of questions, without any other content:
["Question 1", "Question 2", "Question 3"]`
  };

  return templates[lang] || templates.en;
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { nodeContent } = req.body;

  if (!nodeContent) {
    return res.status(400).json({ message: 'Node content is required' });
  }

  try {
    // 检测语言
    const detectedLang = detectLanguage(nodeContent);
    const prompt = getPromptTemplate(detectedLang, nodeContent);

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
      max_tokens: 200,
    });

    let questions;
    try {
      // 尝试解析JSON响应
      questions = JSON.parse(completion.choices[0].message.content);
    } catch (error) {
      console.error('Error parsing OpenAI response:', error);
      // 如果解析失败，使用默认问题
      questions = [
        `如何深入理解"${nodeContent}"？`,
        `"${nodeContent}"的实际应用有哪些？`,
        `"${nodeContent}"存在什么挑战？`
      ];
    }

    // 确保返回的是数组且包含3个问题
    if (!Array.isArray(questions) || questions.length !== 3) {
      questions = [
        `如何深入理解"${nodeContent}"？`,
        `"${nodeContent}"的实际应用有哪些？`,
        `"${nodeContent}"存在什么挑战？`
      ];
    }

    res.status(200).json({ questions });
  } catch (error) {
    console.error('Error generating questions:', error);
    res.status(500).json({ 
      message: 'Error generating questions', 
      error: error.message,
      questions: [
        `如何深入理解"${nodeContent}"？`,
        `"${nodeContent}"的实际应用有哪些？`,
        `"${nodeContent}"存在什么挑战？`
      ]
    });
  }
} 