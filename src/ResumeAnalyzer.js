import React, { useState } from 'react';
import axios from 'axios';

function ResumeAnalyzer() {
  const [resume, setResume] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    try {
      const response = await axios.post('http://localhost:5000/analyze', {
        resume,
        job_desc: jobDesc,
      });
      setResult(response.data);
      setError('');
    } catch (err) {
      console.error('Axios Error:', err);
      setError('❌ Network error: Make sure your Flask server is running on port 5000.');
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto bg-white shadow-xl rounded-lg mt-10">
      <h2 className="text-xl font-bold mb-4 text-center">Resume Keyword Analyzer</h2>

      <textarea
        placeholder="Paste your resume text here"
        className="w-full h-32 border p-2 mb-3"
        value={resume}
        onChange={(e) => setResume(e.target.value)}
      />
      <textarea
        placeholder="Paste the job description here"
        className="w-full h-32 border p-2 mb-3"
        value={jobDesc}
        onChange={(e) => setJobDesc(e.target.value)}
      />
      <button
        onClick={handleSubmit}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
      >
        Analyze
      </button>

      {error && (
        <p className="text-red-600 mt-4 text-center">{error}</p>
      )}

      {result && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold">Match: {result.match_percentage}%</h3>
          <h4 className="mt-3 font-medium">Missing Keywords:</h4>
          {result.missing_keywords.length > 0 ? (
            <ul className="list-disc pl-5">
              {result.missing_keywords.map((word, idx) => (
                <li key={idx}>{word}</li>
              ))}
            </ul>
          ) : (
            <p className="text-green-600">Great! Your resume covers all important keywords.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default ResumeAnalyzer;
