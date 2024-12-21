import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Box, Button, Typography } from '@mui/material';
import FileUpload from './components/fileUpload';
import AgentPanel from './components/AgentPanel';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Route for Home */}
        <Route
          path="/"
          element={
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                backgroundColor: '#f5f5f5',
                padding: 4,
              }}
            >
              <Typography variant="h4" sx={{ marginBottom: 3 }}>
                Upload Project File
              </Typography>
              <FileUpload
                onUploadSuccess={(message) => console.log(message)}
                onUploadError={(message) => console.error(message)}
              />
              <Button
                variant="contained"
                sx={{ marginTop: 3, textTransform: 'none' }}
                component={Link}
                to="/agent-panel"
              >
                Go to Agent Panel
              </Button>
            </Box>
          }
        />

        {/* Route for Agent Panel */}
        <Route path="/agent-panel" element={<AgentPanel />} />
      </Routes>
    </Router>
  );
};

export default App;
