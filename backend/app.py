from waitress import serve
from flask import Flask, request, jsonify
from flask_cors import CORS
from sklearn.feature_extraction.text import TfidfVectorizer
import re

app = Flask(__name__)
CORS(app)

def clean_text(text):
    return re.sub(r'[^a-zA-Z0-9\s]', '', text.lower()) if text else ""

@app.route('/')
def home():
    return "✅ Resume Keyword Analyzer API is running!"

@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.get_json()

    if not data:
        return jsonify({'error': 'No input data provided'}), 400

    resume_text = data.get('resume', '')
    job_desc_text = data.get('job_desc', '')

    if not resume_text.strip() or not job_desc_text.strip():
        return jsonify({'error': 'Resume and job description cannot be empty'}), 400

    resume_cleaned = clean_text(resume_text)
    job_desc_cleaned = clean_text(job_desc_text)

    vectorizer = TfidfVectorizer()
    vectors = vectorizer.fit_transform([resume_cleaned, job_desc_cleaned])
    feature_names = vectorizer.get_feature_names_out()

    resume_vec, job_desc_vec = vectors.toarray()

    keyword_scores = []
    for i, word in enumerate(feature_names):
        if job_desc_vec[i] > 0:
            keyword_scores.append({
                'keyword': word,
                'in_resume': resume_vec[i] > 0,
                'importance': round(job_desc_vec[i], 4)
            })

    keyword_scores.sort(key=lambda x: x['importance'], reverse=True)

    missing_keywords = [kw for kw in keyword_scores if not kw['in_resume']]
    match_percentage = 100 * (1 - len(missing_keywords) / len(keyword_scores)) if keyword_scores else 0

    return jsonify({
        'match_percentage': round(match_percentage, 2),
        'total_keywords': len(keyword_scores),
        'missing_keywords': [kw['keyword'] for kw in missing_keywords],
        'suggestions': keyword_scores
    })

if __name__ == '__main__':
    # Use Waitress for production server
    serve(app, host='0.0.0.0', port=5000)
