import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { textAnalysis, audioAnalysis, videoAnalysis, answers, description } = req.body;

    const userProfile = {
      emotionalState: {
        text: textAnalysis?.emotions || [],
        audio: audioAnalysis?.emotions || [],
        video: videoAnalysis?.emotions || []
      },
      personalityTraits: answers,
      concerns: description
    };

    // Create prompts for different recommendation types
    const prompts = {
      music: `Based on the following user profile, generate a single, meaningful tagline that captures their personality and emotional state for music recommendations. The tagline should be concise (max 10 words) and reflect their core characteristics and current emotional needs:

      User Profile:
      ${JSON.stringify(userProfile, null, 2)}

      Generate a tagline that:
      1. Reflects their personality traits from the questionnaire
      2. Acknowledges their current emotional state
      3. Is uplifting and supportive
      4. Can be used for personalized music recommendations

      Format: Return only the tagline text, nothing else.`,

      video: `Based on the following user profile, generate a single, meaningful tagline that captures their personality and emotional state for video recommendations. The tagline should be concise (max 10 words) and reflect their core characteristics and current emotional needs:

      User Profile:
      ${JSON.stringify(userProfile, null, 2)}

      Generate a tagline that:
      1. Reflects their personality traits from the questionnaire
      2. Acknowledges their current emotional state
      3. Is uplifting and supportive
      4. Can be used for personalized video recommendations

      Format: Return only the tagline text, nothing else.`,

      books: `Based on the following user profile, generate a single, meaningful tagline that captures their personality and emotional state for book recommendations. The tagline should be concise (max 10 words) and reflect their core characteristics and current emotional needs:

      User Profile:
      ${JSON.stringify(userProfile, null, 2)}

      Generate a tagline that:
      1. Reflects their personality traits from the questionnaire
      2. Acknowledges their current emotional state
      3. Is uplifting and supportive
      4. Can be used for personalized book recommendations

      Format: Return only the tagline text, nothing else.`,

      activities: `Based on the following user profile, generate a single, meaningful tagline that captures their personality and emotional state for activity recommendations. The tagline should be concise (max 10 words) and reflect their core characteristics and current emotional needs:

      User Profile:
      ${JSON.stringify(userProfile, null, 2)}

      Generate a tagline that:
      1. Reflects their personality traits from the questionnaire
      2. Acknowledges their current emotional state
      3. Is uplifting and supportive
      4. Can be used for personalized activity recommendations

      Format: Return only the tagline text, nothing else.`
    };

    const taglines = await Promise.all(
      Object.entries(prompts).map(async ([type, prompt]) => {
        try {
          const { text } = await generateText({
            model: google('gemini-2.0-flash-exp'),
            prompt: prompt,
            apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY
          });
          return { type, tagline: text.trim() };
        } catch (error) {
          console.error(`Error generating ${type} tagline:`, error);
          return { type, tagline: null };
        }
      })
    );

    console.log("Checking taglines :", taglines);
    res.status(200).json({
      success: true,
      taglines: Object.fromEntries(taglines.map(({ type, tagline }) => [type, tagline]))
    });

  } catch (error) {
    console.error('Error in generate-taglines:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
