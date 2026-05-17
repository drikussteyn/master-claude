module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { resultTitles, starredSteps } = req.body;
  if (!resultTitles && !starredSteps) return res.status(400).json({ error: 'No context provided' });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Missing API key' });

  const resultsLine = resultTitles ? `Based on what I have been creating: ${resultTitles}.` : '';
  const starsLine = starredSteps ? `Skills I found most useful: ${starredSteps}.` : '';

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
        messages: [
          {
            role: 'user',
            content: `${resultsLine} ${starsLine} Give me 3 specific project ideas I can build with Claude AI based on my actual work. Return ONLY a JSON array, starting with [ and ending with ]. No prose, no markdown, no explanation before or after. Each object needs: "title" (max 6 words), "description" (2 sentences), "skills_used" (2-3 items).`
          },
          {
            role: 'assistant',
            content: '['
          }
        ]
      })
    });

    const data = await response.json();
    const raw = (data.content?.[0]?.text || '').trim();
    // Prepend the [ we used as prefill
    const full = '[' + raw;
    const clean = full.replace(/```json|```/g, '').trim();
    const ideas = JSON.parse(clean);
    return res.status(200).json({ ideas });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
