import { useState } from 'react';
import axios from 'axios';

function App() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setResult(null);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!file) {
      setError('Please select a PDF file first');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('resume', file);

    try {
      //const response = await axios.post('http://localhost:5000/analyze', formData, {
      //const response = await axios.post('http://localhost:5000/analyze', formData, {
      const response = await axios.post('https://backend-production-a7c9.up.railway.app/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResult(response.data);
    } catch (err) {
      setError('Failed to analyze resume. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-800 mb-2 text-center">
          AI Resume Analyzer
        </h1>
        <p className="text-slate-500 text-center mb-8">
          Upload your resume to get an ATS score, skill analysis, and job role recommendations
        </p>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="flex-1 text-sm text-slate-600 border border-slate-300 rounded-lg px-3 py-2 w-full"
            />
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-medium px-5 py-2 rounded-lg transition w-full sm:w-auto"
            >
              {loading ? 'Analyzing...' : 'Analyze Resume'}
            </button>
          </div>

          {error && (
            <p className="text-red-500 text-sm mt-3">{error}</p>
          )}
        </div>

        {result && (
          <div className="mt-6 bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
            <div className="text-center">
              <p className="text-sm text-slate-500 mb-1">ATS Score</p>
              <p className="text-4xl font-bold text-indigo-600">{result.ats_score}/100</p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-2">Skills Identified</h3>
              <div className="flex flex-wrap gap-2">
                {result.skills_identified.map((skill, i) => (
                  <span key={i} className="bg-green-50 text-green-700 text-xs font-medium px-3 py-1 rounded-full border border-green-200">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-2">Missing Skills</h3>
              <div className="flex flex-wrap gap-2">
                {result.missing_skills.map((skill, i) => (
                  <span key={i} className="bg-red-50 text-red-700 text-xs font-medium px-3 py-1 rounded-full border border-red-200">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-2">Recommended Job Roles</h3>
              <div className="flex flex-wrap gap-2">
                {result.recommended_job_roles.map((role, i) => (
                  <span key={i} className="bg-indigo-50 text-indigo-700 text-xs font-medium px-3 py-1 rounded-full border border-indigo-200">
                    {role}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;