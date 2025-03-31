import { createReadStream, mkdirSync, writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import formidable from 'formidable';
import axios from 'axios';
import FormData from 'form-data';
import { createClient } from "@deepgram/sdk";

export const config = {
  api: {
    bodyParser: false,
  },
};

const transcribeFile = async (audioFilePath) => {
  const deepgram = createClient(process.env.DEEPGRAM_API_KEY);

  const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
    createReadStream(audioFilePath),
    {
      model: "nova-3",
      smart_format: true,
    }
  );


  if (error) throw error;
  console.log(result.results.channels[0].alternatives[0].transcript);
  return result.results.channels[0].alternatives[0].transcript;
};


export default async function handler(req, res) {
  const uploadDir = join(process.cwd(), 'public', 'uploads');
  
  // Create uploads directory if it doesn't exist
  mkdirSync(uploadDir, { recursive: true });

  const form = formidable({
    uploadDir,
    keepExtensions: true,
    filename: (name, ext) => `${Date.now()}-${name}${ext}`,
  });

  try {
    const [fields, files] = await form.parse(req);

    // Process text data
    const answers = JSON.parse(fields.answers?.[0] || '{}');
    const description = fields.description?.[0] || '';
    
    // If description is empty, transcribe audio file
    let finalDescription = description;

    if (!description && files.audio) {
      try {
        finalDescription = await transcribeFile(files.audio[0].filepath);
      } catch(error) {
        console.log("Error transcribing audio file",error);
        finalDescription="Normal And Energetic"
      }
    }

    // Save text data
    const dataPath = join(uploadDir, `data-${Date.now()}.json`);
    writeFileSync(dataPath, JSON.stringify({ answers, description: finalDescription }));

    // Process media files
    const mediaEntries = {
      video: files.video ? files.video[0].filepath : null,
      audio: files.audio ? files.audio[0].filepath : null,
      text: dataPath,
    };
    console.log(mediaEntries);

    // Handle text data upload to Hugging Face Space
    let textAnalysis = null;
    if (mediaEntries.text) {
      const formData = new FormData();
      formData.append('file', createReadStream(mediaEntries.text));

      try {
        const response = await axios.post(
          'https://rivalcoder-text-process.hf.space/api/predict',
          formData,
          {
            headers: {
              ...formData.getHeaders(),
            },
          }
        );
        textAnalysis = response.data;
        console.log('✅ Text analysis success:', textAnalysis);
      } catch (error) {
        console.error('❌ Text analysis error:', error.response?.data || error.message);
      }
    }

    // Handle audio file upload to Hugging Face Space
    let audioAnalysis = null;
    if (mediaEntries.audio) {
      const formData = new FormData();
      formData.append('file', createReadStream(mediaEntries.audio));

      try {
        const response = await axios.post(
          'https://rivalcoder-gradio-audi-test.hf.space/api/predict', 
          formData, 
          {
            headers: {
              ...formData.getHeaders(),
            },
          }
        );
        audioAnalysis = response.data;
        console.log('✅ Audio analysis success:', audioAnalysis);
      } catch (error) {
        console.error('❌ Audio analysis error:', error.response?.data || error.message);
      }
    }

    // Send video to Hugging Face Space
    let videoAnalysis = null;
    if (mediaEntries.video) {
      const videoPath = mediaEntries.video; // Path to the video file
      const apiUrl = "https://rivalcoder-video-processing.hf.space/api/analyze-video";

      const formData = new FormData();
      formData.append('file', createReadStream(videoPath));

      try {
        const response = await axios.post(apiUrl, formData, {
          headers: {
            ...formData.getHeaders(),
          },
        });
        videoAnalysis = response.data.results;
        console.log('✅ Video analysis success:', videoAnalysis);
      } catch (error) {
        console.error('❌ Video analysis error:', error.response?.data || error.message);
      }
    }

    if (mediaEntries.audio) {
      unlinkSync(mediaEntries.audio);
    }
    if (mediaEntries.video) {
      unlinkSync(mediaEntries.video);
    }
    if (mediaEntries.text) {
      unlinkSync(mediaEntries.text);
    }

    res.status(200).json({
      success: true,
      mediaEntries, // Return media entries for further processing
      textAnalysis,
      audioAnalysis,
      videoAnalysis,
    });

      
    // Send data to Hugging Face Space
  } catch (err) {

    if (mediaEntries.audio) {
      unlinkSync(mediaEntries.audio);
    }
    if (mediaEntries.video) {
      unlinkSync(mediaEntries.video);
    }
    if (mediaEntries.text) {
      unlinkSync(mediaEntries.text);
    }

    console.error('Error processing upload:', err);
    res.status(500).json({ error: 'Internal server error' });

  }
}