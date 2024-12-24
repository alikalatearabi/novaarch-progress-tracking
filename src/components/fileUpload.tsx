import React, { useState, useRef, DragEvent } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Snackbar, 
  Alert, 
  useTheme,
  IconButton
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import ClearIcon from '@mui/icons-material/Clear';

interface FileUploadProps {
  onUploadSuccess?: (message: string) => void;
  onUploadError?: (message: string) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ 
  onUploadSuccess, 
  onUploadError 
}) => {
  const theme = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [projectName, setProjectName] = useState<string>('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [openSuccessSnackbar, setOpenSuccessSnackbar] = useState(false);
  const [openErrorSnackbar, setOpenErrorSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const handleFileSelect = (selectedFile: File) => {
    // Validate file type if needed
    setFile(selectedFile);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      handleFileSelect(event.target.files[0]);
    }
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false);

    const droppedFiles = event.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleFileSelect(droppedFiles[0]);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
          setSnackbarMessage(data.message || 'File uploaded successfully');
          setOpenSuccessSnackbar(true);
          onUploadSuccess?.(data.message);
          setFile(null);
          setProjectName('');
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        })
        .catch((error) => {
          setSnackbarMessage(error.message || 'Failed to upload file. Please try again.');
          setOpenErrorSnackbar(true);
          onUploadError?.(error.message);
        });
    } else {
      setSnackbarMessage('Please select a file and enter a project name.');
      setOpenErrorSnackbar(true);
      onUploadError?.('Please select a file and enter a project name.');
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        backgroundColor: theme.palette.background.default,
        padding: 4,
        borderRadius: 3,
        boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
        maxWidth: 500,
        width: '100%',
        gap: 3,
      }}
    >
      {/* Project Name Input */}
      <Box 
        sx={{
          width: '100%', 
          position: 'relative',
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`,
          transition: 'all 0.3s ease',
          '&:focus-within': {
            boxShadow: `0 0 0 2px ${theme.palette.primary.main}`,
          }
        }}
      >
        <input 
          type="text"
          placeholder="Enter Project Name"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          style={{
            width: '100%',
            padding: '15px',
            border: 'none',
            borderRadius: 8,
            fontSize: '16px',
            outline: 'none',
            backgroundColor: 'transparent',
          }}
        />
      </Box>

      {/* Drag and Drop File Upload Area */}
      <Box
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        sx={{
          width: '90%',
          border: `2px dashed ${isDragOver ? theme.palette.primary.main : theme.palette.divider}`,
          borderRadius: 2,
          padding: 3,
          textAlign: 'center',
          transition: 'all 0.3s ease',
          backgroundColor: isDragOver 
            ? theme.palette.primary.light + '20' 
            : 'transparent',
        }}
      >
        <input 
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: 'none' }}
          id="file-upload"
        />
        <label 
          htmlFor="file-upload" 
          style={{ 
            cursor: 'pointer', 
            width: '100%',
            display: 'block',
          }}
        >
          <Box 
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <CloudUploadIcon 
              sx={{ 
                fontSize: 60, 
                color: isDragOver 
                  ? theme.palette.primary.main 
                  : theme.palette.text.secondary
              }} 
            />
            <Typography 
              variant="body1" 
              color={isDragOver ? 'primary' : 'textSecondary'}
            >
              {isDragOver 
                ? 'Drop your file here' 
                : 'Drag and drop or click to upload'}
            </Typography>
          </Box>
        </label>

        {file && (
          <Box 
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: 2,
              padding: 1.5,
              backgroundColor: theme.palette.action.selected,
              borderRadius: 1,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AttachFileIcon />
              <Typography variant="body2">{file.name}</Typography>
            </Box>
            <IconButton 
              size="small" 
              onClick={handleRemoveFile}
              sx={{
                color: theme.palette.error.main,
              }}
            >
              <ClearIcon fontSize="small" />
            </IconButton>
          </Box>
        )}
      </Box>

      {/* Upload Button */}
      <Button
        variant="contained"
        onClick={handleUpload}
        disabled={!file || !projectName}
        sx={{
          width: '100%',
          padding: '15px',
          borderRadius: 2,
          textTransform: 'none',
          fontSize: '16px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 6px 8px rgba(0,0,0,0.15)',
          },
          '&.Mui-disabled': {
            backgroundColor: theme.palette.action.disabledBackground,
            color: theme.palette.action.disabled,
          }
        }}
      >
        Upload File
      </Button>

      {/* Snackbars */}
      <Snackbar
        open={openSuccessSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSuccessSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setOpenSuccessSnackbar(false)} 
          severity="success" 
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

      <Snackbar
        open={openErrorSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenErrorSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setOpenErrorSnackbar(false)} 
          severity="error" 
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default FileUpload;