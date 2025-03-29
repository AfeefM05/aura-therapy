import { createReadStream, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import formidable from 'formidable';
import axios from 'axios';
import FormData from 'form-data';

export const config = {
  api: {
    bodyParser: false,
  },
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
    
    // Save text data
    const dataPath = join(uploadDir, `data-${Date.now()}.json`);
    writeFileSync(dataPath, JSON.stringify({ answers, description }));

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

    // Send video to local model (or update this to use HF Space if needed)
    let videoAnalysis = null;
    if (mediaEntries.video) {
      try {
        const response = await axios.post(
          'http://localhost:4000', 
          { path: mediaEntries.video }
        ).catch(() => null);
        videoAnalysis = response?.data || null;
      } catch (error) {
        console.error('❌ Video analysis error:', error.response?.data || error.message);
      }
    }

    // Modify the response to only include necessary data for further processing
    res.status(200).json({
      success: true,
      mediaEntries, // Return media entries for further processing
      textAnalysis,
      audioAnalysis,
      videoAnalysis,
    });
  } catch (err) {
    console.error('Error processing upload:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}