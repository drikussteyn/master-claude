module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { stepNames, resultContext } = req.body;
  if (!stepNames) return res.status(400).json({ error: 'No step names provided' });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Missing API key' });

  const contextLine = resultContext
    ? ` Based on what I've been creating: ${resultContext}.`
    : '';

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: `I have mastered these Claude AI skills: ${stepNames}.${contextLine} Give me exactly 3 specific, practical project ideas I can build TODAY using ONLY these skills. Make the ideas relevant to what I've been working on if context is provided. Format as JSON array with objects: "title" (short punchy name, max 6 words), "description" (2 sentences, very specific and actionable), "skills_used" (2-3 skill names from my list). Return ONLY valid JSON array, no markdown.`
        }]
      })
    });

    const data = await response.json();
    const text = data.content?.[0]?.text || '[]';
    const ideas = JSON.parse(text.trim());
    return res.status(200).json({ ideas });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
