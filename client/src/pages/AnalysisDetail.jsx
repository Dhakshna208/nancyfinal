import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAnalysisById } from '../services/api';
import AnalysisResult from '../components/AnalysisResult';

function AnalysisDetail() {
  const { id } = useParams();
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalysis = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await getAnalysisById(id);
        setResult(response.data);
      } catch (err) {
        setError(err.message || 'Failed to fetch analysis');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalysis();
  }, [id]);

  if (isLoading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading analysis...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="error-message">{error}</div>
        <Link to="/history" style={{ color: 'var(--primary-color)' }}>
          ← Back to History
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link 
        to="/history" 
        style={{ 
          color: 'var(--primary-color)', 
          textDecoration: 'none',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginBottom: '1rem'
        }}
      >
        ← Back to History
      </Link>
      <AnalysisResult result={result} />
    </div>
  );
}

export default AnalysisDetail;
