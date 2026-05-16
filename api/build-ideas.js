module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { resultTitles, starredSteps } = req.body;
  if (!resultTitles && !starredSteps) return res.status(400).json({ error: 'No context provided' });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Missing API key' });

  const resultsLine = resultTitles
    ? `Based on what I have been creating with Claude: ${resultTitles}.`
    : '';
  const starsLine = starredSteps
    ? `I have also starred and saved these Claude skills as particularly useful to me: ${starredSteps}.`
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
          content: `${resultsLine} ${starsLine}

Based ONLY on what I have been working on and what interests me, give me exactly 3 specific, actionable project ideas I can build TODAY using Claude AI. Make each idea directly relevant to my actual work and interests — not generic AI use cases. Format as a raw JSON array with no markdown or backticks. Each object: "title" (max 6 words, specific to my context), "description" (2 sentences, very specific and actionable), "skills_used" (2-3 specific Claude capabilities needed).`
        }]
      })
    });

    const data = await response.json();
    const raw = data.content?.[0]?.text || '[]';
    const clean = raw.replace(/```json|```/g, '').trim();
    const ideas = JSON.parse(clean);
    return res.status(200).json({ ideas });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
