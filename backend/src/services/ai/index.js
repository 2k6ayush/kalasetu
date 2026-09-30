/**
 * AI Service — provider-agnostic layer with automatic failover
 *
 * Tries Gemini first; if that fails for ANY reason, retries via Grok.
 * Returns { result, provider } so callers never know which provider served.
 * Logs which provider served each call.
 */
const { callGemini } = require('./geminiProvider');
const { callGrok }   = require('./grokProvider');

// ────────────────────────────────────────────────────────────────
// Core dispatcher
// ────────────────────────────────────────────────────────────────

/**
 * @param {object} opts
 * @param {string} opts.task          — label for logging (e.g. "moderation")
 * @param {string} opts.systemPrompt
 * @param {string} opts.userContent
 * @param {string} [opts.imageBase64]
 * @returns {Promise<{result: any, provider: string}>}
 */
async function callAI({ task, systemPrompt, userContent, imageBase64 }) {
  const payload = { systemPrompt, userContent, imageBase64 };

  // ── Try Gemini first ──
  try {
    const raw = await callGemini(payload);
    const result = parseJSON(raw);
    console.log(`[AI] ✓ ${task} served by gemini`);
    return { result, provider: 'gemini' };
  } catch (geminiErr) {
    console.warn(`[AI] ⚠ Gemini failed for ${task}: ${geminiErr.message} — falling back to Groq`);
  }

  // ── Fallback to Grok ──
  try {
    const raw = await callGrok(payload);
    const result = parseJSON(raw);
    console.log(`[AI] ✓ ${task} served by groq`);
    return { result, provider: 'groq' };
  } catch (grokErr) {
    console.error(`[AI] ✗ Groq also failed for ${task}: ${grokErr.message}`);
    throw new Error(`Both AI providers failed for task "${task}". Please try again later.`);
  }
}

/**
 * Extract JSON from a response that may be wrapped in markdown code fences.
 */
function parseJSON(raw) {
  let cleaned = raw.trim();
  // Strip ```json ... ``` wrappers
  const fenced = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) cleaned = fenced[1].trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    // If JSON parse fails, return the raw text as-is (for spotlight/craft free-text)
    return cleaned;
  }
}

// ────────────────────────────────────────────────────────────────
// High-level task functions
// ────────────────────────────────────────────────────────────────

/**
 * 1. Content moderation — flags ONLY: 18+, violence, hate symbols, spam/ads.
 */
async function moderateContent(imageBase64, note = '') {
  const systemPrompt = `You are a content moderator for an independent art platform. Look at this image and caption. Return JSON: {"safe": boolean, "reason": string}. Flag ONLY: explicit/18+ content, graphic violence, hate symbols, or blatant non-art advertisement. Do not flag based on subject matter, style, skill level, or medium. When in doubt, approve.`;
  const userContent = note ? `Caption: "${note}"` : 'No caption provided.';
  return callAI({ task: 'moderation', systemPrompt, userContent, imageBase64 });
}

/**
 * 2. Tag an artwork image with medium, technique, cultural influence, mood.
 */
async function tagArtwork(imageBase64) {
  const systemPrompt = `Analyze this artwork image. Return JSON: {"medium": string, "technique": string, "cultural_influence": string, "mood": [string]}. Base every tag only on visible evidence in the image — don't guess beyond what's shown.`;
  const userContent = 'Please analyze this artwork and generate tags.';
  return callAI({ task: 'tagging', systemPrompt, userContent, imageBase64 });
}

/**
 * 3. Write an editorial spotlight feature about an artist.
 */
async function writeSpotlight(artistProfile) {
  const systemPrompt = `Write a 150–200 word editorial feature introducing this independent artist to a new audience. Profile: ${JSON.stringify(artistProfile)}. Tone: warm, specific, magazine-quality — avoid generic praise or filler adjectives. Return JSON: {"title": string, "body": string}.`;
  const userContent = `Artist profile: ${JSON.stringify(artistProfile)}`;
  return callAI({ task: 'spotlight', systemPrompt, userContent });
}

/**
 * 4. Generate a step-by-step breakdown of a traditional craft technique.
 */
async function generateCraftBreakdown(description, images = []) {
  const systemPrompt = `A practitioner described this traditional technique: "${description}". Generate a clear 4–8 step breakdown that could teach someone unfamiliar with the tradition. Preserve the practitioner's own terminology where given. Return JSON: {"steps": [string]}.`;
  const userContent = `Technique description: ${description}`;
  const imageBase64 = images.length > 0 ? images[0] : undefined;
  return callAI({ task: 'craft', systemPrompt, userContent, imageBase64 });
}

module.exports = {
  callAI,
  moderateContent,
  tagArtwork,
  writeSpotlight,
  generateCraftBreakdown,
};
