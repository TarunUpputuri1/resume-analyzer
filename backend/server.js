const axios = require('axios');
const pdfParse = require('pdf-parse');
const express = require('express');
const cors = require('cors');
require('dotenv').config();
console.log('Key length:', process.env.GROQ_API_KEY?.length);
console.log('Key starts with:', process.env.GROQ_API_KEY?.substring(0, 10));

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

  const { roleName, jobDescription } = req.body;

  if (!roleName || !jobDescription) {
    return res.status(400).json({ error: 'Role name and job description are required' });
  }

  try {
    const pdfData = await pdfParse(req.file.buffer);
    const resumeText = pdfData.text;

    const prompt = `You are an expert technical recruiter and resume analyst. Analyze the resume below against the target role and job description provided. Return ONLY a valid JSON object (no markdown, no code fences, no extra text) with this EXACT structure:

{
  "ats_score": <number 0-100, overall resume quality independent of any specific job>,
  "jd_match_percentage": <number 0-100, how well resume content aligns with this specific job description>,
  "skills_matching_percentage": <number 0-100, percentage of skills required by the JD that are present in the resume>,
  "skills_identified": [<array of strings, skills found in the resume>],
  "missing_skills": [<array of strings, skills required by the JD but missing from the resume>],
  "review": "<a concise paragraph reviewing the resume's project section quality and giving specific, actionable improvement suggestions for this resume>",
  "recommended_job_roles": [<array of strings, alternative or related roles this resume is well suited for>],
  "learning_roadmap": [<array of strings, ordered list of skills/topics to learn to close the missing skills gap, each as a short actionable step>],
  "estimated_fit_score": <number 0-100, an ESTIMATED likelihood of being shortlisted for this specific role based on resume-to-JD alignment>
}

Target Role: ${roleName}

Job Description:
${jobDescription}

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