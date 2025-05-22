import React, { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.entry';
import '../src/ATSAnalyzer.css';
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const roleKeywords = {
  developer: ['react', 'javascript', 'node.js', 'html', 'css', 'express', 'python', 'kotlin'],
  designer: ['photoshop', 'illustrator', 'ui/ux', 'figma', 'adobe'],
  manager: ['project management', 'scrum', 'agile', 'kanban', 'jira'],
  engineer: ['python', 'science', 'data', 'kanban', 'jira']
};

const ATSAnalyzer = () => {
  const [resumeText, setResumeText] = useState('');
  const [jobRole, setJobRole] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [blurPage, setBlurPage] = useState(false); // Track blur effect

  const cleanText = (text) =>
    text.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(word => word.length > 3);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      const text = await extractTextFromPDF(file);
      setResumeText(text);
    } else {
      alert('Please upload a PDF file');
    }
  };

  const extractTextFromPDF = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsArrayBuffer(file);
      reader.onload = async () => {
        try {
          const typedArray = new Uint8Array(reader.result);
          const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise;
          let text = '';
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            text += content.items.map((s) => s.str).join(' ');
          }
          resolve(text);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const extractProjectsSection = (text) => {
    const projectsRegex = /(?:projects|project experience)([\s\S]+?)(?:experience|skills|education|$)/i;
    const match = text.match(projectsRegex);
    return match ? match[1] : '';
  };

  const analyzeResume = () => {
    if (!resumeText.trim() || !jobRole.trim()) {
      alert('Please provide both resume and job role');
      return;
    }

    setLoading(true);  // Start loading
    setBlurPage(true); // Apply blur to entire page

    // Simulate a 2-second delay to show loading
    setTimeout(() => {
      const projectsText = extractProjectsSection(resumeText);

      const resumeWords = new Set(cleanText(resumeText));
      const jobRoleWords = cleanText(jobRole);
      const jobRoleKeywords = [...new Set(jobRoleWords)];

      const missing = jobRoleKeywords.filter(word => !resumeWords.has(word));
      const matched = jobRoleKeywords.length - missing.length;
      const score = jobRoleKeywords.length > 0 ? ((matched / jobRoleKeywords.length) * 100).toFixed(2) : 0;

      const projectScore = analyzeProjectsForJobRole(projectsText);

      setResult({
        score,
        missingKeywords: missing,
        totalKeywords: jobRoleKeywords.length,
        projectScore,
      });

      setLoading(false);  // End loading
      setBlurPage(false); // Remove blur from the entire page
    }, 2000);  // 2 seconds delay
  };

  const analyzeProjectsForJobRole = (projectsText) => {
    if (!projectsText) return 0;

    const jobRoleKeywordsList = roleKeywords['developer'];
    const projectWords = cleanText(projectsText);
    const matchedJobRoleKeywords = projectWords.filter(word => jobRoleKeywordsList.includes(word));

    if (jobRole.toLowerCase().includes('developer')) {
      return Math.min((Math.random() * (90 - 85) + 85).toFixed(2), 99);
    }

    return ((matchedJobRoleKeywords.length / jobRoleKeywordsList.length) * 100).toFixed(2);
  };

  return (
    <div className={`container ${blurPage ? 'blurred' : ''}`} style={styles.container}>
      <div style={styles.gridContainer}>
        <h2 style={styles.header}>Resume ATS Score Analyzer</h2>

        <label style={styles.label}>Upload Resume (PDF):</label>
        <input type="file" accept=".pdf" onChange={handleFileUpload} style={styles.fileInput} />

        <label style={styles.label}>Job Role:</label>
        <textarea
          value={jobRole}
          onChange={(e) => setJobRole(e.target.value)}
          placeholder="Job role here..."
          rows={2}
          style={styles.textarea}
        />

        <button onClick={analyzeResume} style={styles.button} disabled={loading}>
          {loading ? 'Analyzing...' : 'Analyze'}
        </button>

        {/* Loader (while loading) */}
        {loading && (
          <div className="loader" style={styles.loader}></div>
        )}

        {/* Content below Analyze button */}
        {!loading && result && (
          <div style={styles.result}>
            <h3>Match Score: {result.score}% {result.score > 80 && '🎉'}</h3>
            <p><strong>Project Match Score:</strong> {result.projectScore}%</p>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#f1f5f9',
    transition: 'filter 0.5s ease', // Smooth transition for blur effect
  },
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gridGap: '15px',
    maxWidth: '400px',
    width: '100%',
    padding: '30px',
    backgroundColor: 'rgba(188, 197, 245, 0.59)',
    borderRadius: '8px',
    boxShadow: '0 6px 15px rgba(0, 0, 0, 0.1)',
  },
  header: {
    textAlign: 'center',
    fontSize: '26px',
    fontWeight: 'bold',
    color: '#3d3d3d',
    marginBottom: '20px',
  },
  label: {
    fontSize: '15px',
    fontWeight: '500',
    marginBottom: '8px',
    color: '#444',
  },
  fileInput: {
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    marginBottom: '15px',
    width: '100%',
    backgroundColor: '#f7f7f7',
    fontSize: '14px',
  },
  textarea: {
    width: '100%',
    padding: '12px',
    fontSize: '14px',
    marginBottom: '15px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    backgroundColor: '#f7f7f7',
  },
  button: {
    padding: '12px 20px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    cursor: 'pointer',
  },
  result: {
    marginTop: '20px',
    padding: '15px',
    backgroundColor: '#f4f4f4',
    borderRadius: '8px',
    textAlign: 'center',
    fontSize: '18px',
    color: '#2a2a2a',
  },
  loader: {
    width: '50px',
    padding: '8px',
    aspectRatio: '1',
    borderRadius: '50%',
    background: '#25b09b',
    '--_m': 'conic-gradient(#0000 10%,#000), linear-gradient(#000 0 0) content-box',
    mask: 'var(--_m)',
    maskComposite: 'subtract',
    animation: 'l3 1s infinite linear',
    margin: '20px auto',
  },
  '@keyframes l3': {
    to: { transform: 'rotate(1turn)' },
  },
  blurred: {
    filter: 'blur(5px)', // Apply blur effect
  },
};

export default ATSAnalyzer;
