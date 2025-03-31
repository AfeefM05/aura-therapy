import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config({ path: '.env.local' });

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { textAnalysis, audioAnalysis, videoAnalysis, answers, description } = req.body;

    const userProfile = {
    
        text: textAnalysis?.emotions || [],
        audio: audioAnalysis?.emotions || [],
        video: videoAnalysis?.emotions || [],
        personalityTraits: answers,
        concerns: description
    };

    // Create prompts for different recommendation types
    const prompts = ` 
        Generate a taglines for the user based on the following information Analysis:
            1).${userProfile.text} -This Describe the user's emotional state with text analysis analysed Text -(${userProfile.concerns} -This Describe the user's concerns with description text)    
            2).${userProfile.audio} -This Describe the user's emotional state with audio analysis using Librosa
            3).${userProfile.video} -This Describe the user's emotional state with video analysis using OpenCV and trained model
            4).${userProfile.personalityTraits} -This Describe the user's personality traits with Predefined questions and answers
          
            - Some Details will be there and some will be missing, so you need to generate the tagline based on the available information.

            1).Music Tagline:
                - Generate a tagline for the user based on the Mind State analysis and the user's personality traits and It want To improves user's mood and emotional state.
                - Generate A Unique Tagline for the user based on the user's personality traits and It want To improves user's mood and emotional state.
                - This Tagline will be used for the Music Recommendation System by Searching the Music from the Youtube so Give according to the Mood.
                - Give Tagline to Fetch Latest Tamil Songs like "latest sad Tamil Songs" "latest sad Tamil Songs" Dont Give Same Tagline Everytime and Given example  or provide singers sad songs it can give easily.
                - It should be 10-15 words long.
                - Add In End "give Full Songs".
              
            2).Video Tagline:
                - Generate a tagline for the user based on the Mind State analysis and the user's personality traits and It want To improves user's mood and emotional state.
                - Generate A Unique Tagline for the user based on the user's personality traits and It want To improves user's mood and emotional state.
                - This Tagline will be used for the Video Recommendation System by Searching the Video from the Youtube so Give according to the Mood.
                - It should be 10-15 words long.
                - I want videos that have more content and more views so user can get more information and come to good mood so like this searching GiveTagline Accordingly

            3).Books Tagline (Exactly 4):
                  - Generate a exact 4 Books Name according to the User Mood and Personality Traits and User Inputs Data if No Data then Generate Random Books Good Books for the User 
                  - And Also Generate a small Book Description for the Books described above in 10-15 words. 
                  - If there Are More Books in Generation Give Names and Details of top 4 Books.     
                  - Give Book Description as short and concise as possible        

            4).Self Care Activities (Exactly 3):
                  - Generate a exact 3 Self Care Activities to Do based on the User Mood and Personality Traits and User Inputs Data if No Data then Generate Random Self Care Activities for the User 
                  - And Also Generate a small Self Care Activity Description for the Activities described above in 10-15 words.              
                  - If there Are More Activities in Generation Give Names and Details of top 3 Activities.
                  - Give selfcare Activities  Description as short and concise as possible           


            5).Meditation Practices (Exactly 3):
                  - Generate a exact 3 Meditation Practices to Do based on the User Mood and Personality Traits and User Inputs Data if No Data then Generate Random Meditation Practices for the User 
                  - And Also Generate a small Meditation Practice Description for the Practices described above in 10-15 words. 
                  - If there Are More Practices in Generation Give Names and Details of top 3 Practices.             
                  - Give Meditation Practices Description as short and concise as possible    
                         
            6).Mindful Activities (Exactly 4):
                  - Generate a exact 4 Mindful Activities to Do based on the User Mood and Personality Traits and User Inputs Data if No Data then Generate Random Mindful Activities for the User 
                  - And Also Generate a small Mindful Activity Description for the Activities described above in 10-15 words.              
                  - If there Are More Activities in Generation Give Names and Details of top 4 Activities.                      
                  - Give Mindful Activities Description as short and concise as possible           

            7).Daily Affirmation:
                  - Generate a Daily Affirmation for the User based on the User Mood and Personality Traits
                  - It should be 10-15 words long.
                  - Give Daily Affirmation as short and concise as possible 

        -Like  This Generate All Based  on the User Based Information and User Inputs Data if No Data Then Default Peace and Happy Things Give to the User
        -Soon Response Should be in Given

        ## Mindful Activities, Meditation Practices,Self Care Activities,Daily Affirmation,Books,Music,Video Should Not be same Everytime thing and Give unique responses
        ## Think new and unique for every field especially for Mindful Activities, Meditation Practices,Self Care Activities,Daily Affirmation,Books Give new and unique names and details
        ##Because User will be see this activites same every time so give new and unique names and details

        #### Give response as Soon as Possible to the User
    `


    const {object}= await generateObject({
      model: google('gemini-2.5-pro-exp-03-25'),
      prompt: prompts,
      apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
      schema: z.object({
        music: z.string().describe('The generated tagline for the user profile'),
        video: z.string().describe('The generated tagline for the user profile'),
        books: z.object({
          booksnames:z.array(z.string()),
          bookdetails:z.array(z.string())
        }),
        selfcare:z.object({
          selfcarenames:z.array(z.string()),
          selfcaredetails:z.array(z.string())
        }),
        meditationpractices:z.object({
          meditationnames:z.array(z.string()),
          meditationdetails:z.array(z.string())
        }),
        mindfulactivities:z.object({
          mindfulactivitiesnames:z.array(z.string()),
          mindfulactivitiesdetails:z.array(z.string())
        }),
        dailyAffirmation:z.string().describe('Generate a Daily Affirmation for the User based on the User Mood and Personality Traits')
      })
    });

    console.log("Checking taglines :", object);
    res.status(200).json({
      success: true,
      taglines: object
    });

  } catch (error) {
    console.error('Error in generate-taglines:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
