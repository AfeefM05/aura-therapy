import { NextApiRequest, NextApiResponse } from 'next';
import { createReadStream, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import formidable from 'formidable';
import axios from 'axios';

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

    // Send file paths to local models
    const responses = await Promise.all([
      axios.post('http://localhost:4000', { path: mediaEntries.text }).catch(() => null),
      axios.post('http://localhost:4001', { path: mediaEntries.audio }).catch(() => null),
      axios.post('http://localhost:4002', { path: mediaEntries.video }).catch(() => null),
    ]);

    res.status(200).json({
      success: true,
      mediaEntries,
      modelResponses: {
        text: responses[0]?.data || null,
        audio: responses[1]?.data || null,
        video: responses[2]?.data || null,
      },
    });
  } catch (err) {
    console.error('Error processing upload:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
