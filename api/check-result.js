module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { resultText, stepLabel } = req.body;
  if (!resultText || !stepLabel) return res.status(400).json({ error: 'Missing fields' });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Missing API key' });

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
        max_tokens: 200,
        messages: [{
          role: 'user',
          content: `A user saved this result from a Claude AI learning step called "${stepLabel}":

"${resultText}"

Is this result specific, meaningful, and clearly the output of real work with Claude? Or is it vague, confusing, a copy-paste of a generic example, or doesn't make sense as a real outcome?

Respond ONLY with valid JSON: {"quality": "good"} if it's fine, or {"quality": "poor", "suggestion": "one specific sentence telling them how to get a better result from this step"} if it needs improvement. No markdown, no explanation.`
        }]
      })
    });

    const data = await response.json();
    const raw = data.content?.[0]?.text || '{"quality":"good"}';
    const clean = raw.replace(/```json|```/g, '').trim();
    return res.status(200).json(JSON.parse(clean));
  } catch (err) {
    return res.status(200).json({ quality: 'good' }); // fail silently
  }
};
