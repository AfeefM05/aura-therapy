import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { textAnalysis, audioAnalysis, videoAnalysis, answers, description } = req.body;

    // Combine all analyses into a comprehensive user profile
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

    // Generate taglines using Ollama
    const taglines = await Promise.all(
      Object.entries(prompts).map(async ([type, prompt]) => {
        try {
          const response = await axios.post('https://3f25-117-250-254-122.ngrok-free.app/api/generate', {
            model: 'llama3.2',
            prompt: prompt,
            stream: false
          });
          return { type, tagline: response.data.response.trim() };
        } catch (error) {
          console.error(`Error generating ${type} tagline:`, error);
          return { type, tagline: null };
        }
      })
    );
    console.log(taglines);
    res.status(200).json({
      success: true,
      taglines: Object.fromEntries(taglines.map(({ type, tagline }) => [type, tagline]))
    });

  } catch (error) {
    console.error('Error in generate-taglines:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 