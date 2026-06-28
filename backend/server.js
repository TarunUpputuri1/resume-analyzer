const axios = require('axios');
const pdfParse = require('pdf-parse');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Resume Analyzer Backend is running!');
});

const multer = require('multer');

// Store uploaded file in memory (not saved to disk)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// app.post('/analyze', upload.single('resume'), async (req, res) => {
//   if (!req.file) {
//     return res.status(400).json({ error: 'No file uploaded' });
//   }

//   try {
//     const pdfData = await pdfParse(req.file.buffer);
//     const extractedText = pdfData.text;

//     console.log('Extracted text length:', extractedText.length);
//     console.log('First 200 chars:', extractedText.substring(0, 200));

//     res.json({
//       message: 'PDF text extracted successfully',
//       textLength: extractedText.length,
//       preview: extractedText.substring(0, 200)
//     });
//   } catch (error) {
//     console.error('Error extracting PDF text:', error);
//     res.status(500).json({ error: 'Failed to extract text from PDF' });
//   }
// });
app.post('/analyze', upload.single('resume'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    const pdfData = await pdfParse(req.file.buffer);
    const resumeText = pdfData.text;

    const prompt = `You are a resume analysis expert. Analyze the following resume and return ONLY a valid JSON object (no markdown, no code fences, no extra text) with this exact structure:
{
  "ats_score": <number between 0-100>,
  "skills_identified": [<array of strings>],
  "missing_skills": [<array of strings>],
  "recommended_job_roles": [<array of strings>]
}

Resume text:
${resumeText}`;

    const groqResponse = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    let aiText = groqResponse.data.choices[0].message.content;

    // Clean up in case AI wraps response in markdown code fences
    aiText = aiText.replace(/```json|```/g, '').trim();

    const analysis = JSON.parse(aiText);

    res.json(analysis);

  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Failed to analyze resume', details: error.message });
}
});
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});