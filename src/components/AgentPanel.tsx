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
  alpha,
  CssBaseline,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import TaskTree from './TaskTree';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const AgentPanel: React.FC = () => {
  const theme = createTheme({
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            margin: 0,
            padding: 0,
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            padding: '12px',
          },
        },
      },
    },
  });
  const [projectNames, setProjectNames] = useState<string[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = () => {
    fetch('http://localhost:5000/api/tasks/projects')
      .then((response) => response.json())
      .then((data) => setProjectNames(data))
      .catch((error) => console.error('Error fetching project names:', error));
  };

  const handleDeleteClick = (projectName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setProjectToDelete(projectName);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setProjectToDelete(null);
    setDialogOpen(false);
  };

  const handleConfirmDelete = () => {
    if (projectToDelete) {
      fetch(`http://localhost:5000/api/tasks/projects/${projectToDelete}`, {
        method: 'DELETE',
      })
        .then((response) => {
          if (response.ok) {
            setProjectNames((prev) =>
              prev.filter((name) => name !== projectToDelete)
            );
            handleCloseDialog();
          } else {
            console.error('Failed to delete project');
          }
        })
        .catch((error) => console.error('Error deleting project:', error));
    }
  };

  if (selectedProject) {
    return (
      <Box
        sx={{
          padding: 4,
          backgroundColor: theme.palette.background.default,
          minHeight: '100vh'
        }}
      >
        <Button
          startIcon={<FolderOpenIcon />}
          variant="outlined"
          sx={{
            marginBottom: 3,
            borderRadius: 2,
            textTransform: 'none',
          }}
          onClick={() => setSelectedProject(null)}
        >
          Back to Projects
        </Button>
        <TaskTree projectId={selectedProject} />
      </Box>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          backgroundColor: theme.palette.background.default,
          minHeight: '100vh',
        }}
      >
        {/* Modern Header */}
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
            color: 'white',
            marginBottom: 4,
            padding: 3,
            boxShadow: theme.shadows[4],
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontWeight: 'bold',
              letterSpacing: '0.05em',
              textShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}
          >
            Project Management
          </Typography>
        </Box>

        {/* Table Container */}
        <TableContainer
          component={Paper}
          sx={{
            maxWidth: 1200,
            width: '100%',
            borderRadius: 3,
            boxShadow: theme.shadows[6],
            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
          }}
        >
          <Table>
            <TableHead>
              <TableRow
                sx={{
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                }}
              >
                <TableCell
                  align="center"
                  sx={{
                    fontWeight: 'bold',
                    color: theme.palette.primary.main,
                    fontSize: '1.1rem',
                  }}
                >
                  Project Names
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    fontWeight: 'bold',
                    color: theme.palette.primary.main,
                    fontSize: '1.1rem',
                  }}
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {projectNames.map((name, index) => (
                <TableRow
                  key={index}
                  sx={{
                    transition: 'all 0.3s ease',
                    '&:nth-of-type(odd)': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.05)
                    },
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      boxShadow: theme.shadows[1],
                      cursor: 'pointer'
                    },
                  }}
                  onClick={() => setSelectedProject(name)}
                >
                  <TableCell
                    align="center"
                    sx={{
                      fontSize: '1rem',
                      fontWeight: 500,
                      color: theme.palette.text.primary,
                    }}
                  >
                    {name}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      color="error"
                      onClick={(e) => handleDeleteClick(name, e)}
                      sx={{
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.error.main, 0.1),
                          transform: 'scale(1.2)',
                          color: theme.palette.error.dark
                        }
                      }}
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
              borderRadius: 3,
              boxShadow: theme.shadows[24],
            },
          }}
        >
          <DialogTitle
            sx={{
              fontWeight: 'bold',
              color: theme.palette.error.main,
              textAlign: 'center'
            }}
          >
            Confirm Deletion
          </DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ textAlign: 'center' }}>
              Are you sure you want to delete the project{' '}
              <strong>{projectToDelete}</strong>? This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
            <Button
              onClick={handleCloseDialog}
              variant="outlined"
              color="primary"
              sx={{ mr: 2, borderRadius: 2 }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmDelete}
              variant="contained"
              color="error"
              sx={{ borderRadius: 2 }}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
};

export default AgentPanel;