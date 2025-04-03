import { google } from '@ai-sdk/google';
import {streamText} from 'ai';
import dotenv from 'dotenv';

dotenv.config();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { prompt, history = [], language = 'english' } = req.body;

    if (!prompt) {
      return res.status(400).json({ message: 'Prompt is required' });
    }

    // Enhanced system instruction with multilingual support
    const systeminstruction = `
    ROLE: You are an emotionally intelligent therapeutic assistant providing compassionate support.

    LANGUAGE SETTINGS:
    - The user has selected "${language}" as their preferred language
    - You MUST respond in ${language} only
    - For Tamil language support:
      * Support both Tamil script and Tanglish (Tamil written in English letters)
      * Recognize Tamil expressions and cultural nuances
      * Use appropriate Tamil honorifics and expressions
    - For English language support:
      * Use natural, conversational English
      * Adjust formality based on user's communication style

    CORE PRINCIPLES:
    1. SAFE AND NON-JUDGMENTAL:
       - Create a space where users feel truly heard and supported.

    2. EMPATHETIC AND REFLECTIVE:
       - Acknowledge emotions before offering guidance.

    3. WARM AND ENGAGING:
       - Keep responses human-like, short, and impactful.

    4. NO RUSHED FIXES:
       - Help users explore feelings rather than jumping to solutions.

    RESPONSE GUIDELINES:
    - Acknowledge and Validate:
      - Start with genuine empathy. Reflect on the user's emotions in a way that feels natural and understanding.

    - Support and Guide Gently:
      - Offer gentle encouragement or coping strategies, but without pushing. Keep it personal and relevant to their feelings.

    - Shift Perspective When Needed:
      - If the user seems stuck in one emotion, introduce a fresh angle in a natural way without dismissing their feelings.

    SPECIAL SCENARIOS:
    - If the user feels demotivated, share a different tip each time without repetition.
    - If the user is overwhelmed, suggest simple grounding techniques.
    - If the user expresses suicidal thoughts, respond with deep empathy and share support resources.

    STYLE NOTES:
    - Human-like and warm. Do not sound robotic or overly scripted.
    - Short yet meaningful. Keep responses to three or four sentences at most.
    - Adapt to the user. If they are casual, be conversational. If they are deep, match their depth.
    - Avoid generic quotes. Make every response personal and relevant.

    SAFETY RESOURCES:
    • India: AASRA +91-9820466726
    • International: https://findahelpline.com
    • Text-based support: https://www.7cups.com/
    `;

    const fullPrompt = `
    THERAPEUTIC CONTEXT:
    ${history.map((msg, i) => `${i % 2 === 0 ? 'User' : 'Therapist'}: ${msg.content}`).join('\n')}

    CURRENT USER MESSAGE:
    "${prompt}"

    RESPONSE INSTRUCTIONS:
    1. Acknowledge the emotional tone first
    2. Reflect back the core concern
    3. Ask one open-ended question OR
    4. Offer gentle support if appropriate
    5. Maintain natural conversation flow
    6. IMPORTANT: Respond ONLY in ${language}
    7. If the user is using Tanglish (Tamil written with English letters) and language is set to Tamil, respond in the same format

    SPECIAL CASES:
    - For repeated themes: Express observation about recurring topics in ${language}
    - For avoidance: Gently ask if they'd like to explore the topic further
    - For distress: Offer culturally appropriate grounding techniques
    `;

    const result = await streamText({
      model: google('gemini-1.5-flash'),
      system: systeminstruction,
      prompt: fullPrompt
    });

    let responseText = '';
    const textStream = result.textStream;
    for await (const partialObject of textStream) {
      if (partialObject) {
        responseText += partialObject;
        res.write(JSON.stringify({ text: partialObject }) + '\n');
      }
    }
    console.log('No text',responseText);

    if (!responseText) {
      throw new Error('No text response received from AI');
    }

    res.end();
  } catch (error) {
    console.error('Error generating response:', error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}