import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import TaskTree from './TaskTree'; // Import TaskTree component

const AgentPanel: React.FC = () => {
  const [projectNames, setProjectNames] = useState<string[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null); // Selected project to show tasks
  const [dialogOpen, setDialogOpen] = useState(false); // Dialog visibility

  // Fetch project names from backend
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = () => {
    fetch('http://localhost:5000/api/tasks/projects')
      .then((response) => response.json())
      .then((data) => setProjectNames(data))
      .catch((error) => console.error('Error fetching project names:', error));
  };

  const handleDeleteClick = (projectName: string) => {
    setSelectedProject(projectName);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setSelectedProject(null);
    setDialogOpen(false);
  };

  const handleConfirmDelete = () => {
    if (selectedProject) {
      fetch(`http://localhost:5000/api/tasks/projects/${selectedProject}`, {
        method: 'DELETE',
      })
        .then((response) => {
          if (response.ok) {
            setProjectNames((prev) =>
              prev.filter((name) => name !== selectedProject)
            );
          } else {
            console.error('Failed to delete project');
          }
        })
        .catch((error) => console.error('Error deleting project:', error))
        .finally(() => {
          setSelectedProject(null);
          setDialogOpen(false);
        });
    }
  };

  if (selectedProject) {
    return (
      <Box sx={{ padding: 4 }}>
        <Button
          variant="contained"
          sx={{ marginBottom: 3 }}
          onClick={() => setSelectedProject(null)}
        >
          Back to Projects
        </Button>
        <TaskTree projectId={selectedProject} /> {/* Render TaskTree */}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: 4,
        backgroundColor: '#f7f9fc',
        minHeight: '100vh',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          width: '100%',
          padding: 2,
          backgroundColor: '#1976d2',
          color: 'white',
          borderRadius: 1,
          marginBottom: 4,
        }}
      >
        <Typography variant="h4" align="center">
          Agent Panel
        </Typography>
      </Box>

      {/* Table */}
      <TableContainer
        component={Paper}
        sx={{
          maxWidth: 700,
          borderRadius: 2,
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f0f4f8' }}>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                Project Names
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {projectNames.map((name, index) => (
              <TableRow
                key={index}
                sx={{
                  '&:nth-of-type(odd)': { backgroundColor: '#f9fbfd' },
                  '&:hover': { backgroundColor: '#eef3f8', cursor: 'pointer' },
                }}
                onClick={() => setSelectedProject(name)} // Open TaskTree on row click
              >
                <TableCell align="center" sx={{ fontSize: '1rem' }}>
                  {name}
                </TableCell>
                <TableCell align="center">
                  <IconButton
                    color="error"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent triggering row click
                      handleDeleteClick(name);
                    }}
                    sx={{ '&:hover': { color: '#d32f2f' } }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Confirmation Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: 2,
            boxShadow: '0px 6px 18px rgba(0, 0, 0, 0.2)',
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 'bold', color: '#d32f2f' }}>
          Confirm Deletion
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the project{' '}
            <strong>{selectedProject}</strong>? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary" variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AgentPanel;
