module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { resultText, stepLabel } = req.body;
  if (!resultText || !stepLabel) return res.status(400).json({ error: 'Missing fields' });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ quality: 'good' });

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
        max_tokens: 100,
        messages: [{
          role: 'user',
          content: `Rate this saved result from a Claude AI learning step called "${stepLabel}":

"${resultText}"

Only flag it as poor if it is truly meaningless, completely random, or obvious gibberish. Real work output — even if imperfect — should always be rated good. Respond ONLY with JSON, no other text: {"quality":"good"} OR {"quality":"poor","suggestion":"one short sentence max 15 words"}`
        }]
      })
    });

    const data = await response.json();
    const raw = (data.content?.[0]?.text || '{"quality":"good"}').trim();
    // Only parse if it looks like JSON
    if (!raw.startsWith('{')) return res.status(200).json({ quality: 'good' });
    return res.status(200).json(JSON.parse(raw));
  } catch {
    return res.status(200).json({ quality: 'good' });
  }
};
