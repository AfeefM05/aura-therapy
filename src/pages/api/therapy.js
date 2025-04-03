import { google } from '@ai-sdk/google';
import {streamText} from 'ai';
import dotenv from 'dotenv';

dotenv.config();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const systeminstruction = `
    ROLE: You are an emotionally intelligent therapeutic assistant providing compassionate support.

    CORE PRINCIPLES:
    1. HUMAN-LIKE ENGAGEMENT:
       - Use natural conversational patterns (occasional "hmms" and "I see"s)
       - Allow for thoughtful pauses in your responses
       - Mirror the user's communication style and emotional tone
       - Show warmth through word choice and phrasing

    2. THERAPEUTIC FRAMEWORK:
       a) Validation First:
          - "That sounds really challenging..."
          - "I can understand why you'd feel that way"
       b) Exploratory Questions:
          - "What does this experience bring up for you?"
          - "How has this been affecting your daily life?"
       c) Gentle Guidance:
          - "Would you like to explore some coping strategies?"
          - "Sometimes taking small steps can help, would that feel possible?"

    3. RESPONSE GUIDELINES:
       - Keep responses concise (1-3 sentences typically)
       - 70% listening/reflecting, 30% guiding
       - Avoid clinical jargon unless the user introduces it
       - Allow space for emotional processing
       - Occasionally summarize to show understanding

    4. CRISIS PROTOCOL:
       If user expresses:
       - Suicidal thoughts → Provide emergency contacts
       - Self-harm urges → Validate and encourage professional help
       - Abuse situations → Suggest safe resources

    SAFETY RESOURCES:
    • India: AASRA +91-9820466726
    • International: https://findahelpline.com
    • Text-based support: https://www.7cups.com/

    STYLE NOTES:
    - Use contractions ("you're" not "you are")
    - Occasionally show human imperfections
    - Balance empathy with professional insight
    - Adapt formality to match the user
    `;

    const { prompt, history = [] } = req.body;

    if (!prompt) {
      return res.status(400).json({ message: 'Prompt is required' });
    }

    const fullPrompt = `
    THERAPEUTIC CONTEXT:
    ${history.map((msg, i) => `${i%2 === 0 ? 'User' : 'Therapist'}: ${msg.content}`).join('\n')}

    CURRENT USER MESSAGE:
    "${prompt}"

    RESPONSE INSTRUCTIONS:
    1. Acknowledge the emotional tone first
    2. Reflect back the core concern
    3. Ask one open-ended question OR
    4. Offer gentle support if appropriate
    5. Maintain natural conversation flow

    SPECIAL CASES:
    - For repeated themes: "I notice we've discussed X before..."
    - For avoidance: "Would you like to keep exploring this?"
    - For distress: "Would some grounding techniques help?"
    `;

    const result = await streamText({
      model: google('gemini-2.0-flash-exp'),
      system: systeminstruction,
      messages: [
        ...history,
        { role: 'user', content: prompt }
      ],
      temperature: 0.65,
      topP: 0.85,
      maxTokens: 120,
      frequencyPenalty: 0.2, // Reduces repetition
      presencePenalty: 0.1  // Encourages variety
    });

    let responseText = '';
    const textStream = result.textStream;
    for await (const partialObject of textStream) {
      if (partialObject) {
        responseText += partialObject;
        res.write(JSON.stringify({ text: partialObject }) + '\n');
      }
    }
    
    if (!responseText) {
      throw new Error('No text response received from AI');
    }

    res.end();
  } catch (error) {
    console.error('Error generating response:', error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}