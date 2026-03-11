import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

function ImageUpload({ onUpload, isLoading }) {
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      onUpload(acceptedFiles[0]);
    }
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
      'image/gif': ['.gif']
    },
    maxSize: 10 * 1024 * 1024,
    disabled: isLoading,
    multiple: false
  });

  return (
    <div className="upload-container">
      <h2 className="upload-title">Upload Image for Analysis</h2>
      <div 
        {...getRootProps()} 
        className={`dropzone ${isDragActive ? 'active' : ''}`}
      >
        <input {...getInputProps()} />
        <svg className="dropzone-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        {isDragActive ? (
          <p className="dropzone-text">Drop the image here...</p>
        ) : (
          <>
            <p className="dropzone-text">
              Drag & drop an image here, or click to select one
            </p>
            <p className="dropzone-hint">
              Supports JPG, PNG, WEBP, GIF (max 10MB)
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default ImageUpload;
