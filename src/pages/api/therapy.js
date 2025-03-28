import { google } from '@ai-sdk/google';
import { streamObject } from 'ai';
import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const systeminstruction = `
      You are a supportive AI therapist who can also engage in normal conversation. Your responses should be:
      - Natural and conversational for casual topics
      - Therapeutic and supportive for emotional topics
      - Adapt tone based on the conversation context
      
      For casual conversation (greetings, small talk):
      - Keep it friendly and natural
      - Respond like a caring friend
      - Use casual, warm language
      - Keep responses short and engaging
      
      For emotional topics:
      - Short and concise (2-3 sentences max)
      - Direct and actionable
      - Include one specific coping strategy
      - End with a brief encouraging note
      
      For crisis situations (suicide, self-harm):
      - Keep response very short (1-2 sentences)
      - Focus on immediate action
      - Provide crisis helpline number (988)
      - Be direct and clear
      - No long explanations
      - No tips or exercises
      
      After therapeutic responses, add a "Quick Tip:" followed by a simple exercise or technique.
      
      Guidelines:
      - No long paragraphs
      - No medical advice
      - No diagnosis
      - Keep it simple and practical
      - Tips only for therapeutic responses
      - Consider the conversation history for context

      ## Every Answers should be in 3 sentences maximum so user can read it easily and comfortably
    `;

    const { prompt, history = [] } = req.body;

    if (!prompt) {
      return res.status(400).json({ message: 'Prompt is required' });
    }

    // Format conversation history
    const formattedHistory = history
      .map(msg => `${msg.type === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
      .join('\n');

    const fullPrompt = `
      Previous conversation:
      ${formattedHistory}

      Current message:
      ${prompt}

      If this is a casual conversation (greetings, small talk, normal chat):
      - Respond naturally and warmly
      - Keep it friendly and engaging
      - Use casual, conversational language
      - Keep responses short and simple
      
      If this is an emotional or therapeutic topic:
      Provide a brief, supportive response that includes:
      1. One line of empathy/validation
      2. One specific coping strategy
      3. One line of encouragement
      4. One line of advice
      5. If user have any suicidal thoughts then calm them down and tell them to not do anything stupid and give more advice
          and tell them to talk to someone or go to a therapist and give them a website to go to or emergency numbers
      
      if user tells he is very lazy not do anythings add a tip to recover from it Then add a "Quick Tip:" followed by a simple exercise or technique.

      Keep the main response under 3 sentences.
      Focus on immediate, practical help.
      Keep the response short and simple for casual conversation.
      Keep the response short and simple for therapeutic response.
      Keep the response short and simple for suicidal thoughts.
      Keep the response short and simple for lazy person.
      Consider the conversation history for context and continuity dont give same like history it only for data so give different response for the same question also.
    `;

    const { partialObjectStream: object } = await streamObject({
      model: google('gemini-2.0-flash-exp'),
      systeminstruction: systeminstruction,
      apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
      prompt: fullPrompt,
      schema: z.object({
        therapy: z.string()
      })
    });

    let responseText = '';
    
    for await (const partialObject of object) {
      if (partialObject.therapy) {
        responseText += partialObject.therapy;
        // Send partial response to client
        res.write(JSON.stringify({ text: partialObject.therapy }) + '\n');
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
