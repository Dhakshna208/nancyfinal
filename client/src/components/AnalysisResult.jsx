function AnalysisResult({ result }) {
  if (!result) return null;

  const { 
    imageName, 
    imagePath, 
    overallResult, 
    summary, 
    aiDetection, 
    manipulationDetection,
    reverseSearch 
  } = result;

  const getStatusClass = () => {
    switch (overallResult) {
      case 'clean':
        return 'status-clean';
      case 'suspicious':
        return 'status-suspicious';
      case 'ai-generated':
        return 'status-ai-generated';
      case 'manipulated':
        return 'status-manipulated';
      default:
        return 'status-unknown';
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 70) return '#ef4444';
    if (confidence >= 40) return '#f59e0b';
    return '#10b981';
  };

  return (
    <div className="result-container">
      <div className="result-header">
        <img 
          src={imagePath} 
          alt={imageName} 
          className="result-image"
        />
        <div>
          <h2>{imageName}</h2>
          <span className={`result-status ${getStatusClass()}`}>
            {overallResult}
          </span>
        </div>
      </div>

      <p className="result-summary">{summary}</p>

      <div className="analysis-section">
        <h3>AI Detection</h3>
        <div className="analysis-card">
          <div className="analysis-label">AI Generated</div>
          <div className="analysis-value">
            {aiDetection?.isAIGenerated === null 
              ? 'Unknown' 
              : aiDetection?.isAIGenerated 
                ? 'Yes' 
                : 'No'}
            {aiDetection?.confidence !== null && (
              <span style={{ color: getConfidenceColor(aiDetection.confidence) }}>
                ({aiDetection.confidence}%)
              </span>
            )}
          </div>
          {aiDetection?.confidence !== null && (
            <div className="confidence-bar">
              <div 
                className="confidence-fill"
                style={{
                  width: `${aiDetection.confidence}%`,
                  backgroundColor: getConfidenceColor(aiDetection.confidence)
                }}
              />
            </div>
          )}
        </div>
      </div>

      <div className="analysis-section">
        <h3>Manipulation Detection</h3>
        <div className="analysis-card">
          <div className="analysis-label">Manipulated Content</div>
          <div className="analysis-value">
            {manipulationDetection?.isManipulated === null 
              ? 'Unknown' 
              : manipulationDetection?.isManipulated 
                ? `Yes - ${manipulationDetection.type}` 
                : 'No'}
            {manipulationDetection?.confidence !== null && (
              <span style={{ color: getConfidenceColor(manipulationDetection.confidence) }}>
                ({manipulationDetection.confidence}%)
              </span>
            )}
          </div>
          {manipulationDetection?.confidence !== null && (
            <div className="confidence-bar">
              <div 
                className="confidence-fill"
                style={{
                  width: `${manipulationDetection.confidence}%`,
                  backgroundColor: getConfidenceColor(manipulationDetection.confidence)
                }}
              />
            </div>
          )}
        </div>
      </div>

      {reverseSearch?.performed && reverseSearch?.similarImages?.length > 0 && (
        <div className="analysis-section">
          <h3>Similar Images Found ({reverseSearch.similarImages.length})</h3>
          <div className="similar-images">
            {reverseSearch.similarImages.map((img, index) => (
              <a 
                key={index}
                href={img.link}
                target="_blank"
                rel="noopener noreferrer"
                className="similar-image-card"
              >
                {img.thumbnail && (
                  <img src={img.thumbnail} alt={img.title} />
                )}
                <div className="similar-image-info">
                  <div className="similar-image-title">{img.title}</div>
                  <div className="similar-image-source">{img.source}</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default AnalysisResult;
