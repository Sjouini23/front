// PhotoUpload.js
import React, { useState } from 'react';

function PhotoUpload() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState('');
  const [message, setMessage] = useState('Welcome! Select a photo to upload.');

  // When user selects a file
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setMessage(`Selected: ${file.name}`);
      console.log('File selected:', file);
    }
  };

  // Upload the file to Cloudinary
  const uploadPhoto = async () => {
    if (!selectedFile) {
      setMessage('Please select a photo first!');
      return;
    }

    setUploading(true);
    setMessage('Uploading your photo...');

    try {
      // Prepare the data for Cloudinary
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('upload_preset', process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET);

      // Send to Cloudinary
      const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
      const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

      console.log('Uploading to Cloudinary...');
      console.log('Cloud name:', cloudName);
      console.log('Upload preset:', process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET);

      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      console.log('Cloudinary response:', result);

      if (response.ok) {
        setUploadedUrl(result.secure_url);
        setMessage('✅ Upload successful!');
        console.log('SUCCESS! Image URL:', result.secure_url);
      } else {
        setMessage(`❌ Upload failed: ${result.error?.message || 'Unknown error'}`);
        console.error('Upload failed:', result);
      }

    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{
      maxWidth: '600px',
      margin: '20px auto',
      padding: '20px',
      border: '1px solid #ddd',
      borderRadius: '10px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h2>📷 Photo Upload Test</h2>
      
      {/* File input */}
      <div style={{ marginBottom: '20px' }}>
        <input 
          type="file" 
          accept="image/*" 
          onChange={handleFileChange}
          style={{
            padding: '10px',
            border: '1px solid #ccc',
            borderRadius: '5px',
            width: '100%',
            marginBottom: '10px'
          }}
        />
        
        <button 
          onClick={uploadPhoto}
          disabled={!selectedFile || uploading}
          style={{
            padding: '12px 24px',
            backgroundColor: uploading ? '#ccc' : (selectedFile ? '#007bff' : '#ccc'),
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: uploading ? 'wait' : (selectedFile ? 'pointer' : 'not-allowed'),
            fontSize: '16px',
            width: '100%'
          }}
        >
          {uploading ? '⏳ Uploading...' : '📤 Upload Photo'}
        </button>
      </div>

      {/* Status message */}
      <div style={{
        padding: '15px',
        backgroundColor: uploadedUrl ? '#d4edda' : '#f8f9fa',
        border: `1px solid ${uploadedUrl ? '#c3e6cb' : '#dee2e6'}`,
        borderRadius: '5px',
        marginBottom: '20px'
      }}>
        <strong>Status:</strong> {message}
      </div>

      {/* Show uploaded image */}
      {uploadedUrl && (
        <div style={{ marginBottom: '20px' }}>
          <h3>🎉 Success! Your photo is uploaded:</h3>
          <img 
            src={uploadedUrl} 
            alt="Uploaded photo" 
            style={{
              width: '100%',
              maxHeight: '400px',
              objectFit: 'contain',
              border: '2px solid #28a745',
              borderRadius: '8px',
              marginBottom: '10px'
            }}
          />
          <div style={{
            backgroundColor: '#f8f9fa',
            padding: '10px',
            borderRadius: '5px',
            fontSize: '14px'
          }}>
            <strong>Image URL:</strong><br />
            <input 
              type="text" 
              value={uploadedUrl} 
              readOnly
              style={{
                width: '100%',
                padding: '5px',
                border: '1px solid #ccc',
                borderRadius: '3px',
                fontSize: '12px'
              }}
            />
          </div>
        </div>
      )}

      {/* Debug information */}
      <div style={{
        backgroundColor: '#f1f3f4',
        padding: '10px',
        borderRadius: '5px',
        fontSize: '12px',
        color: '#666'
      }}>
        <strong>🔍 Debug Info:</strong><br />
        Cloud Name: {process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || '❌ NOT SET'}<br />
        Upload Preset: {process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET || '❌ NOT SET'}<br />
        File Selected: {selectedFile ? `✅ ${selectedFile.name}` : '❌ None'}
      </div>
    </div>
  );
}

export default PhotoUpload;