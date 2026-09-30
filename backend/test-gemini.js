require('dotenv').config();
const { callGemini } = require('./src/services/ai/geminiProvider');
const { generatePlaceKnowledge } = require('./src/services/ai/index');

async function testGeminiBasic() {
  console.log("Testing basic Gemini generation...");
  try {
    const text = await callGemini({
      systemPrompt: "You are a helpful assistant.",
      userContent: "Tell me about Munnar, Kerala, India in 1 sentence."
    });
    console.log("[Basic Result]:", text);
  } catch (error) {
    console.error("[Basic Error]:", error.message);
  }
}

async function testGeminiStructured() {
  console.log("\nTesting structured Gemini generation...");
  try {
    const { result, provider } = await generatePlaceKnowledge("Munnar", "Kerala", "India", "10.0882", "77.0624");
    console.log(`[Structured Result via ${provider}]:`, JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("[Structured Error]:", error.message);
  }
}

async function run() {
  await testGeminiBasic();
  await testGeminiStructured();
}

run();
