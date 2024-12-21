import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Input } from '@mui/material';

interface FileUploadProps {
  onUploadSuccess: (message: string) => void;
  onUploadError: (message: string) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onUploadSuccess, onUploadError }) => {
  const [file, setFile] = useState<File | null>(null);
  const [projectName, setProjectName] = useState<string>('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  const handleProjectNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setProjectName(event.target.value);
  };

  const handleUpload = () => {
    if (file && projectName) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('projectName', projectName);

      fetch('http://localhost:5000/api/tasks/upload', {
        method: 'POST',
        body: formData,
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error('Upload failed');
          }
          return response.json();
        })
        .then((data) => {
          onUploadSuccess(data.message);
        })
        .catch(() => {
          onUploadError('Failed to upload file. Please try again.');
        });
    } else {
      onUploadError('Please select a file and enter a project name.');
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        padding: 4,
        borderRadius: 2,
        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
        maxWidth: 400,
        width: '100%',
      }}
    >
      <TextField
        label="Project Name"
        variant="outlined"
        fullWidth
        sx={{ marginBottom: 3 }}
        value={projectName}
        onChange={handleProjectNameChange}
      />
      <Button
        variant="contained"
        component="label"
        sx={{ marginBottom: 3, textTransform: 'none', width: '100%' }}
      >
        Select File
        <Input
          type="file"
          onChange={handleFileChange}
          sx={{ display: 'none' }}
        />
      </Button>
      {file && (
        <Typography variant="body2" color="textSecondary" sx={{ marginBottom: 3 }}>
          Selected File: {file.name}
        </Typography>
      )}
      <Button
        variant="contained"
        color="primary"
        fullWidth
        onClick={handleUpload}
        sx={{ textTransform: 'none' }}
      >
        Upload
      </Button>
    </Box>
  );
};

export default FileUpload;
