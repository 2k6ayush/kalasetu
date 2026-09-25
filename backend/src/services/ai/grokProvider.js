/**
 * Grok Provider — raw xAI Grok API calls (OpenAI-compatible endpoint)
 */
const OpenAI = require('openai');

const GROK_API_KEY = process.env.GROK_API_KEY;
const GROK_MODEL   = process.env.GROK_MODEL || 'grok-4.7';

/**
 * Call Grok with text + optional image.
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
    baseURL: 'https://api.x.ai/v1',
  });

  const userParts = [];

  // Add text
  userParts.push({ type: 'text', text: userContent });

  // Add image if provided
  if (imageBase64) {
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    userParts.push({
      type: 'image_url',
      image_url: { url: `data:image/jpeg;base64,${cleanBase64}` },
    });
  }

  const completion = await client.chat.completions.create({
    model: GROK_MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userParts },
    ],
    temperature: 0.4,
  });

  const text = completion.choices?.[0]?.message?.content;
  if (!text) throw new Error('Empty response from Grok');
  return text;
}

module.exports = { callGrok };
