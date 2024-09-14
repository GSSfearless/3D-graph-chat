export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { nodeId, note } = req.body;

  if (!nodeId || note === undefined) {
    return res.status(400).json({ message: 'Missing required parameters' });
  }

  try {
    // 这里应该实现保存笔记到数据库的逻辑
    // 现在我们只是模拟成功保存
    console.log(`Saving note for node ${nodeId}: ${note}`);

    res.status(200).json({ message: 'Note saved successfully' });
  } catch (error) {
    console.error('Error saving note:', error);
    res.status(500).json({ message: 'Error saving note', error: error.message });
  }
}
