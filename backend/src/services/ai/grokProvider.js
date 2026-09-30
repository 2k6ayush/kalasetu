/**
 * Groq Provider — fast LLM inference via Groq's OpenAI-compatible API
 * Endpoint: https://api.groq.com/openai/v1
 *
 * Note: "GROK_API_KEY" and "GROK_MODEL" env vars are reused for Groq
 * to keep the existing failover logic and .env structure unchanged.
 */
const OpenAI = require('openai');

const GROK_API_KEY = process.env.GROK_API_KEY;
const GROK_MODEL   = process.env.GROK_MODEL || 'llama-3.3-70b-versatile';

/**
 * Call Groq with text + optional image.
 * @param {object} opts
 * @param {string} opts.systemPrompt
 * @param {string} opts.userContent
 * @param {string} [opts.imageBase64] — base64-encoded image (no data-URI prefix)
 * @returns {Promise<string>} — raw text response
 */
async function callGrok({ systemPrompt, userContent, imageBase64 }) {
  if (!GROK_API_KEY) throw new Error('GROK_API_KEY not set');

  const client = new OpenAI.default({
    apiKey: GROK_API_KEY,
    baseURL: 'https://api.groq.com/openai/v1',
  });

  let finalUserContent;
  if (imageBase64) {
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    finalUserContent = [
      { type: 'text', text: userContent },
      {
        type: 'image_url',
        image_url: { url: `data:image/jpeg;base64,${cleanBase64}` },
      }
    ];
  } else {
    finalUserContent = userContent;
  }

  const completion = await client.chat.completions.create({
    model: GROK_MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: finalUserContent },
    ],
    temperature: 0.4,
  });

  const text = completion.choices?.[0]?.message?.content;
  if (!text) throw new Error('Empty response from Groq');
  return text;
}

module.exports = { callGrok };
