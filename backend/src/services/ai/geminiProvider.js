/**
 * Gemini Provider — raw Google Gemini API calls (via @google/genai SDK)
 */
const { GoogleGenAI } = require('@google/genai');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL   = process.env.GEMINI_MODEL || 'gemini-3.8-flash';

/**
 * Call Gemini with text + optional image.
 * @param {object} opts
 * @param {string} opts.systemPrompt
 * @param {string} opts.userContent
 * @param {string} [opts.imageBase64] — base64-encoded image (no data-URI prefix)
 * @param {object} [opts.responseSchema]
 * @returns {Promise<string>} — raw text response
 */
async function callGemini({ systemPrompt, userContent, imageBase64, responseSchema }) {
  if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY not set');

  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

  const parts = [];

  // Add text
  parts.push({ text: `${systemPrompt}\n\n${userContent}` });

  // Add image if provided
  if (imageBase64) {
    // Strip data URI prefix if present
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    parts.push({
      inlineData: {
        mimeType: 'image/jpeg',
        data: cleanBase64,
      },
    });
  }

  const config = {};
  if (responseSchema) {
    config.responseMimeType = 'application/json';
    config.responseSchema = responseSchema;
  }

  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: [{ role: 'user', parts }],
    config
  });

  const text = response.text;
  if (!text) throw new Error('Empty response from Gemini');
  return text;
}

module.exports = { callGemini };
