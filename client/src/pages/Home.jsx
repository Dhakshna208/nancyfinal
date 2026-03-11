import { useState } from 'react';
import ImageUpload from '../components/ImageUpload';
import AnalysisResult from '../components/AnalysisResult';
import { uploadAndAnalyze } from '../services/api';

function Home() {
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleUpload = async (file) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await uploadAndAnalyze(file);
      setResult(response.data);
    } catch (err) {
      setError(err.message || 'Failed to analyze image');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <ImageUpload onUpload={handleUpload} isLoading={isLoading} />

      {isLoading && (
        <div className="loading">
          <div className="spinner"></div>
          <p>Analyzing image...</p>
        </div>
      )}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {result && <AnalysisResult result={result} />}
    </div>
  );
}

export default Home;
