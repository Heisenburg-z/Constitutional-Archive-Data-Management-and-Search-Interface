## Development Workflow
1. Create a branch: `git checkout -b your-feature`
2. Push changes: `git push origin your-feature`
3. Open a PR and request a review.
4. Merge only after approvals and passing CI checks.

5. import React, { useState } from 'react';

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [uploadMessage, setUploadMessage] = useState('');

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  // Handle file drop
  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
    }
  };

  // Handle file drag over
  const handleDragOver = (e) => {
    e.preventDefault(); // Allows for the drop to happen
  };

  // Handle form submission
  const handleSubmit = () => {
    if (file) {
      setUploadMessage('File uploaded successfully!');
    } else {
      setUploadMessage('Please select or drag and drop a file.');
    }
  };

  return (
    <section className="upload-container">
      <header>
        <h2>Upload Your File</h2>
      </header>

      {/* Drag and drop or file input */}
      <article
        className="file-upload"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        aria-label="Drag and drop your file here or click to select"
      >
        {/* Hidden file input */}
        <input
          type="file"
          id="file-input"
          onChange={handleFileChange}
          hidden
          accept=".png, .jpg, .jpeg, .pdf"
        />
        <label htmlFor="file-input">
          Drag and drop a file here or click to select
        </label>

        {file && <p>Selected file: {file.name}</p>}
      </article>

      {/* Submit button */}
      <footer>
        <button onClick={handleSubmit}>Upload</button>
      </footer>

      {/* Upload message */}
      {uploadMessage && <p>{uploadMessage}</p>}
    </section>
  );
};

export default FileUpload;
