import OpenAI from 'openai';

const openai = new OpenAI({
  organization: 'org-gLWuvsHwqOs4i3QAdK8nQ5zk',
  project: 'proj_TRi4aW8PdBr9LBaE9W34pDPi',
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST requests are allowed' });
  }

  const { topic } = req.body;

  if (!topic) {
    return res.status(400).json({ message: 'Missing topic parameter' });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {role: "system", content: "You are an expert at generating relevant follow-up questions. Please provide 3-5 related questions for the given topic."},
        {role: "user", content: `Generate 3-5 related questions for the topic: ${topic}`}
      ],
    });

    const questions = completion.choices[0].message.content
      .split('\n')
      .filter(question => question.trim() !== '')
      .map(question => question.replace(/^\d+\.\s*/, ''));

    res.status(200).json(questions);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Error generating related questions', error: error.message });
  }
}
