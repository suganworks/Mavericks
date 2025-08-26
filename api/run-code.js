// Vercel serverless function: /api/run-code.js
// Uses Judge0 API to safely run Python code (and can be extended for other languages)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  try {
    const { code, language, input } = req.body;
    // Only allow Python for now
    const language_id = 71; // Judge0 language_id for Python 3

    // You need a RapidAPI key for Judge0 (free at rapidapi.com)
    const RAPIDAPI_KEY = process.env.JUDGE0_RAPIDAPI_KEY;
    if (!RAPIDAPI_KEY) {
      res.status(500).json({ error: 'Missing Judge0 RapidAPI key' });
      return;
    }

    // Send code to Judge0 API
    const response = await fetch('https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
      },
      body: JSON.stringify({
        source_code: code,
        language_id,
        stdin: input || ''
      })
    });
    const result = await response.json();
    if (result.stderr) {
      res.status(200).json({ error: result.stderr });
    } else {
      res.status(200).json({ output: result.stdout || '' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message || 'Execution failed' });
  }
}
