import { useState } from 'react';
import axios from 'axios';

function ScoreCircle({ label, score }) {
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-20 h-20">
        <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r={radius} fill="none" stroke="#E5E7EB" strokeWidth="6" />
          <circle
            cx="40" cy="40" r={radius} fill="none"
            stroke="#6366F1" strokeWidth="6" strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="ring-progress"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-mono text-lg font-semibold text-gray-800">{score}</span>
        </div>
      </div>
      <p className="font-mono text-[10px] tracking-widest uppercase mt-2 text-center max-w-[90px] text-gray-500">
        {label}
      </p>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 h-full">
      <p className="font-mono text-xs tracking-widest uppercase mb-3 text-gray-500">
        {title}
      </p>
      {children}
    </div>
  );
}

function Tags({ items, tone }) {
  const palette = {
    good: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
    bad: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
    neutral: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  }[tone];

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item, i) => (
        <span
          key={i}
          className={`text-xs font-medium px-3 py-1.5 rounded-full border ${palette.bg} ${palette.text} ${palette.border}`}
        >
          {item}
        </span>
      ))}
    </div>
  );
}

function fitLabel(score) {
  if (score < 50) return { text: 'Bad Match', color: 'text-red-300' };
  if (score < 80) return { text: 'Fair Match', color: 'text-amber-300' };
  return { text: 'Perfect Match', color: 'text-green-300' };
}

function App() {
  const [roleName, setRoleName] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    if (!roleName || !jobDescription || !file) {
      setError('Please fill in role name, job description, and upload a resume.');
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('resume', file);
    formData.append('roleName', roleName);
    formData.append('jobDescription', jobDescription);

    try {
      const response = await axios.post(
  'https://backend-production-a7c9.up.railway.app/analyze',
  formData
);
      const data = response.data;
setResult({
  ats_score: data.ats_score ?? 0,
  jd_match_percentage: data.jd_match_percentage ?? 0,
  skills_matching_percentage: data.skills_matching_percentage ?? 0,
  skills_identified: data.skills_identified ?? [],
  missing_skills: data.missing_skills ?? [],
  review: data.review ?? 'No review available.',
  recommended_job_roles: data.recommended_job_roles ?? [],
  learning_roadmap: data.learning_roadmap ?? [],
  estimated_fit_score: data.estimated_fit_score ?? 0,
});
    } catch (err) {
  const detail = err.response?.data?.details || err.message || 'Unknown error';
  setError(`Failed to analyze resume: ${detail}`);
} finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-14 bg-gray-50">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        {/* Header */}
<div className="bg-white rounded-xl shadow-sm border border-gray-200 text-center mb-6 py-10 px-6">
  <p className="font-mono text-xs tracking-[0.25em] uppercase mb-3 text-indigo-600">
    Job Fit Review
  </p>
  <h1 className="text-4xl font-bold mb-3 text-gray-900">
    AI Resume Analyzer
  </h1>
  <p className="text-sm max-w-md mx-auto text-gray-500">
    Paste a role and job description, upload your resume, and get a section-by-section fit review.
  </p>
</div>

        {/* Inputs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6 relative overflow-hidden">
          {loading && <div className="scan-line absolute inset-0 pointer-events-none" />}

          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="font-mono text-[10px] tracking-widest uppercase mb-1 block text-gray-500">Role Name</label>
              <input
                type="text"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                placeholder="e.g. MERN Stack Developer"
                className="w-full text-sm rounded-lg px-3 py-2.5 outline-none border border-gray-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
            <div>
              <label className="font-mono text-[10px] tracking-widest uppercase mb-1 block text-gray-500">Resume</label>
              <label className="flex items-center text-sm rounded-lg px-3 py-2.5 cursor-pointer truncate border border-gray-300 text-gray-500 hover:border-indigo-400">
                <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files[0])} className="hidden" />
                {file ? file.name : 'Choose resume PDF…'}
              </label>
            </div>
          </div>

          <div className="mb-4">
            <label className="font-mono text-[10px] tracking-widest uppercase mb-1 block text-gray-500">Job Description</label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description here…"
              rows={4}
              className="w-full text-sm rounded-lg px-3 py-2.5 outline-none resize-none border border-gray-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-semibold text-sm px-6 py-3 rounded-lg transition w-full sm:w-auto"
          >
            {loading ? 'Reviewing…' : 'Analyze Resume'}
          </button>

          {error && (
            <p className="text-sm mt-4 px-3 py-2 rounded-lg bg-red-50 text-red-600 border border-red-200">
              {error}
            </p>
          )}
        </div>

        {/* Results */}
        {result && (
          <div className="flex flex-col gap-6">

            {/* Score circles */}
            <div className="flex justify-center gap-10 p-6 rounded-xl shadow-sm border border-gray-200 bg-white">
              <ScoreCircle label="ATS Score" score={result.ats_score} />
              <ScoreCircle label="JD Match" score={result.jd_match_percentage} />
              <ScoreCircle label="Skills Match" score={result.skills_matching_percentage} />
            </div>

            {/* Skills row */}
            <div className="grid sm:grid-cols-2 gap-6">
              <Card title="Skills Identified">
                <Tags items={result.skills_identified} tone="good" />
              </Card>
              <Card title="Missing Skills">
                <Tags items={result.missing_skills} tone="bad" />
              </Card>
            </div>

            {/* Review panel - full width */}
            <Card title="Review & Suggestions">
              <p className="text-sm leading-relaxed text-gray-700">
                {result.review}
              </p>
            </Card>

            {/* Roles + roadmap row */}
            <div className="grid sm:grid-cols-2 gap-6">
              <Card title="Recommended Roles">
                <Tags items={result.recommended_job_roles} tone="neutral" />
              </Card>
              <Card title="Learning Roadmap">
                <ol className="text-sm space-y-2 list-decimal list-inside text-gray-700">
                  {result.learning_roadmap.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              </Card>
            </div>

            {/* Fit score footer */}
            <div className="bg-gray-900 p-6 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className={`font-mono text-[10px] tracking-widest uppercase mb-1 ${fitLabel(result.estimated_fit_score).color}`}>
                  Estimated Fit Score · {fitLabel(result.estimated_fit_score).text}
                </p>
                <p className="text-xs text-gray-400">
                  Estimated likelihood of being shortlisted for this role — not a guarantee.
                </p>
              </div>
              <p className="font-mono text-3xl font-semibold text-white flex-shrink-0">
                {result.estimated_fit_score}%
              </p>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}

export default App;