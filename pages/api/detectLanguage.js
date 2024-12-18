export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text } = req.body;
    
    // 简单的语言检测逻辑
    const hasChineseChars = /[\u4e00-\u9fa5]/.test(text);
    const hasJapaneseChars = /[\u3040-\u30ff]/.test(text);
    const hasKoreanChars = /[\uac00-\ud7af]/.test(text);
    
    let language = 'en'; // 默认英语
    
    if (hasChineseChars) {
      language = 'zh';
    } else if (hasJapaneseChars) {
      language = 'ja';
    } else if (hasKoreanChars) {
      language = 'ko';
    }

    res.status(200).json({ language });
  } catch (error) {
    console.error('Language detection error:', error);
    res.status(500).json({ error: 'Failed to detect language' });
  }
} 