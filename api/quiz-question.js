module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { stepLabel, stepWhat, stepTip } = req.body;
  if (!stepLabel) return res.status(400).json({ error: 'Missing step info' });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(200).json({ skip: true });

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
        max_tokens: 400,
        messages: [
          {
            role: 'user',
            content: `Create a single scenario-based multiple choice question to test understanding of this Claude AI skill:

Skill: "${stepLabel}"
What it is: "${stepWhat}"
Key insight: "${stepTip}"

The question should describe a real situation and ask what the best approach is. All 4 options should be plausible — no obviously wrong answers. Only one is correct.

Return ONLY a raw JSON object starting with { — no markdown, no explanation:
{"question":"...","options":["A) ...","B) ...","C) ...","D) ..."],"correct":0}

correct is the 0-based index of the right answer.`
          },
          {
            role: 'assistant',
            content: '{'
          }
        ]
      })
    });

    const data = await response.json();
    const raw = '{' + (data.content?.[0]?.text || '').trim();
    const clean = raw.replace(/```json|```/g, '').trim();
    const question = JSON.parse(clean);
    return res.status(200).json(question);
  } catch {
    return res.status(200).json({ skip: true });
  }
};
