const Groq = require('groq-sdk');

const GROK_API_KEY = process.env.GROK_API_KEY;

// User specified qwen/qwen3.8-27b as the model
const GROQ_MODEL = 'qwen/qwen3.8-27b';

/**
 * Single Gatekeeper for Kalasetu using Groq API directly.
 * Validates text and/or images for:
 * - AI-generated images or non-art uploads (screenshots, memes)
 * - Explicit, toxic, or 18+ text
 * - Keyboard-smash gibberish
 */
async function verifyGatekeeper({ imageBase64, textContent }) {
  if (!GROK_API_KEY) {
    throw new Error('GROK_API_KEY is missing');
  }

  const groq = new Groq({
    apiKey: GROK_API_KEY,
  });

  const systemPrompt = `You are a strict single gatekeeper for Kalasetu, an art platform.
Your job is to verify user uploads (text and/or image).
REJECT if you detect ANY of the following:
1. AI-generated images or non-art uploads (screenshots, memes).
2. Explicit, toxic, or 18+ text in user profiles or notes.
3. Keyboard-smash gibberish in text fields (e.g., "kdjnf'lwjfwnLJFb").

ACCEPT if it is original human art and/or clean profile data.

You must respond ONLY with a valid JSON object in the following format, with no markdown formatting or other text:
{
  "approved": boolean,
  "reason": "String explaining the decision concisely."
}`;

  const userParts = [];
  
  if (textContent) {
    userParts.push({ type: 'text', text: `Text Content:\n${textContent}` });
  } else {
    userParts.push({ type: 'text', text: `Text Content: None provided.` });
  }

  if (imageBase64) {
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    userParts.push({
      type: 'image_url',
      image_url: { url: `data:image/jpeg;base64,${cleanBase64}` },
    });
  }

  try {
    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userParts }
      ],
      temperature: 0.1,
      response_format: { type: 'json_object' }
    });

    const textResponse = completion.choices[0]?.message?.content;
    if (!textResponse) {
      throw new Error('Empty response from Groq moderation service');
    }

    const parsed = JSON.parse(textResponse);
    return {
      approved: !!parsed.approved,
      reason: parsed.reason || (parsed.approved ? 'Approved' : 'Rejected by moderation policy')
    };

  } catch (error) {
    console.error('[Gatekeeper] Error calling Groq API:', error);
    // Throw error so caller can return HTTP 503 (fail-closed)
    throw new Error('AI Verification Service Unavailable');
  }
}

module.exports = { verifyGatekeeper };
