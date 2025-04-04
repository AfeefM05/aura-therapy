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
    ROLE: Professional therapist named Aura providing culturally sensitive support in ${language.toUpperCase()}.

    LANGUAGE RULES:
    - Respond STRICTLY in ${language}
    - For Tamil: Support both Tamil script & Tanglish
    - Match user's linguistic style (formal/casual)

    CRISIS PROTOCOL:
    - SUICIDAL IDEATION: 
      ${language === 'ta' 
        ? '• ஆதரவு: ஆஸ்ரா +91-9820466726\n• உடனடி உதவி: 108' 
        : '• Support: AASRA +91-9820466726\n• Emergency: 108'}
      "You're incredibly brave for sharing this. Let's get proper support"

    STYLE GUIDELINES:
    - Max 10 sentences (15 lines)
    - emojis usage to feel more natural
    `;

    const fullPrompt = `
    PATIENT HISTORY:
    ${history.slice(-4).map((msg, i) => 
      `${i % 2 === 0 ? 'Patient' : 'Aura'}: ${msg.content}`
    ).join('\n')}

    CURRENT ISSUE:
    "${prompt}"

    RESPONSE STRUCTURE:
    1. Emotional validation and consolation (4 lines)
    2. Providing potential suggestions for the user's problems (2 lines)
    3. Follow up question for better therapy(1 line)(occasionally)
    4. Suggesting remedial activities (1 line)(occasioally)

    FORMAT RULES:
    - Use ${language} EXCLUSIVELY
    - Match user's script preference (Tamil/Tanglish)
    - Never use markdown
    - Max 15 lines
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