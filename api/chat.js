export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { history, systemInstruction } = req.body;

    const keys = [];
    if (process.env.GEMINI_API_KEY_1) keys.push(process.env.GEMINI_API_KEY_1);
    if (process.env.GEMINI_API_KEY_2) keys.push(process.env.GEMINI_API_KEY_2);
    if (process.env.GEMINI_API_KEY_3) keys.push(process.env.GEMINI_API_KEY_3);

    if (keys.length === 0) {
      return res.status(500).json({ error: "Nenhuma chave de API do Gemini configurada no servidor." });
    }

    let lastError = null;

    for (let i = 0; i < keys.length; i++) {
      try {
        const apiKey = keys[i];
        
        const payload = {
          contents: history,
          systemInstruction: {
            parts: [{ text: systemInstruction }]
          },
          generationConfig: {
            temperature: 0.6,
            maxOutputTokens: 1024,
          }
        };

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
          // Fallback triggers on Quota exceeded or server overloaded
          if (response.status === 429 || response.status === 503) {
             throw new Error(`API Key ${i+1} failed with status ${response.status}`);
          } else {
             return res.status(response.status).json({ error: data.error });
          }
        }

        if (!data.candidates || data.candidates.length === 0) {
            throw new Error(`Empty response from API Key ${i+1}`);
        }

        return res.status(200).json({ 
          text: data.candidates[0].content.parts[0].text, 
          usedKeyIndex: i 
        });

      } catch (err) {
        lastError = err;
        console.warn(`[Fallback Triggered] Attempt with key ${i+1} failed:`, err.message);
      }
    }

    // Se todas as chaves falharam
    return res.status(500).json({ 
      error: "Todas as contas da IA esgotaram a cota ou estão indisponíveis.", 
      details: lastError.message 
    });

  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
}
