require('dotenv').config();
const { callGrok } = require('./src/services/ai/grokProvider');

async function test() {
  try {
    const res = await callGrok({
      systemPrompt: 'Say hello.',
      userContent: 'Technique description: Testing 123'
    });
    console.log('Success:', res);
  } catch (err) {
    console.error('Error:', err);
  }
}

test();
