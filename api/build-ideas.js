module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { stepNames, resultContext } = req.body;
  if (!stepNames) return res.status(400).json({ error: 'No step names provided' });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Missing API key' });

  const contextLine = resultContext
    ? ` Based on what I have been creating: ${resultContext}.`
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
          content: `I have mastered these Claude AI skills: ${stepNames}.${contextLine} Give me exactly 3 specific, practical project ideas I can build TODAY using ONLY these skills. Make the ideas relevant to what I have been working on if context is provided. Return ONLY a raw JSON array with no markdown, no backticks, no code fences. Each object must have: "title" (max 6 words), "description" (2 sentences), "skills_used" (2-3 items from my skill list).`
        }]
      })
    });

    const data = await response.json();
    const raw = data.content?.[0]?.text || '[]';
    // Strip any markdown code fences
    const clean = raw.replace(/```json|```/g, '').trim();
    const ideas = JSON.parse(clean);
    return res.status(200).json({ ideas });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
