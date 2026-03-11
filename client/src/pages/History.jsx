import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAnalysisHistory, deleteAnalysis } from '../services/api';

function History() {
  const [history, setHistory] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHistory = async (page = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getAnalysisHistory(page, 10);
      setHistory(response.data);
      setPagination(response.pagination);
    } catch (err) {
      setError(err.message || 'Failed to fetch history');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!window.confirm('Are you sure you want to delete this analysis?')) {
      return;
    }

    try {
      await deleteAnalysis(id);
      fetchHistory(pagination.page);
    } catch (err) {
      alert(err.message || 'Failed to delete analysis');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusClass = (status) => {
    switch (status) {
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

  const renderPagination = () => {
    if (pagination.pages <= 1) return null;

    const pages = [];
    for (let i = 1; i <= pagination.pages; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => fetchHistory(i)}
          className={pagination.page === i ? 'active' : ''}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="pagination">
        <button
          onClick={() => fetchHistory(pagination.page - 1)}
          disabled={pagination.page === 1}
        >
          Previous
        </button>
        {pages}
        <button
          onClick={() => fetchHistory(pagination.page + 1)}
          disabled={pagination.page === pagination.pages}
        >
          Next
        </button>
      </div>
    );
  };

  return (
    <div className="history-container">
      <div className="history-header">
        <h1 className="history-title">Analysis History</h1>
        <span style={{ color: 'var(--text-secondary)' }}>
          {pagination.total} total analyses
        </span>
      </div>

      {isLoading ? (
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading history...</p>
        </div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : history.length === 0 ? (
        <div className="empty-state">
          <p>No analyses yet. Upload an image to get started!</p>
        </div>
      ) : (
        <>
          <div className="history-list">
            {history.map((item) => (
              <Link
                key={item._id}
                to={`/history/${item._id}`}
                className="history-item"
              >
                <img
                  src={item.imagePath}
                  alt={item.imageName}
                  className="history-item-image"
                />
                <div className="history-item-info">
                  <div className="history-item-name">{item.imageName}</div>
                  <div className="history-item-date">
                    {formatDate(item.createdAt)}
                  </div>
                </div>
                <span className={`history-item-status ${getStatusClass(item.overallResult)}`}>
                  {item.overallResult}
                </span>
                <button
                  onClick={(e) => handleDelete(e, item._id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0.5rem',
                    color: 'var(--danger-color)'
                  }}
                  title="Delete"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>
              </Link>
            ))}
          </div>
          {renderPagination()}
        </>
      )}
    </div>
  );
}

export default History;
