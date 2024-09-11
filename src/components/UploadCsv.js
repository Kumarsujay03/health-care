import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const UploadCsv = () => {
  const [file, setFile] = useState(null);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/upload-csv', {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      alert('File uploaded successfully!');
      navigate('/dashboard'); 
    } else {
      alert('Failed to upload file');
    }
  };

  return (
    <div>
      <h2>Upload CSV</h2>
      <form onSubmit={handleSubmit}>
        <input type="file" onChange={handleFileChange} accept=".csv" required />
        <button type="submit">Upload</button>
      </form>
    </div>
  );
};

export default UploadCsv;
