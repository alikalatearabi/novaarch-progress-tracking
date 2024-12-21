import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Collapse,
  IconButton,
} from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';

interface Task {
  id: string;
  name: string;
  progress?: number; // Optional progress
  children: Task[];
}

interface TaskTreeProps {
  projectId: string;
}

const TaskTree: React.FC<TaskTreeProps> = ({ projectId }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Fetch project data from backend
    fetch(`http://localhost:5000/api/tasks/${projectId}`)
      .then((response) => response.json())
      .then((data) => setTasks(data))
      .catch((error) => console.error('Error fetching tasks:', error));
  }, [projectId]);

  const toggleExpand = (taskId: string) => {
    setExpandedTasks((prev) =>
      prev.has(taskId) ? new Set([...prev].filter((id) => id !== taskId)) : new Set([...prev, taskId])
    );
  };

  const handleProgressChange = (taskId: string, progress: number) => {
    const updatedTasks = updateTaskProgress(tasks, taskId, progress);
    setTasks(updatedTasks);
  };

  const updateTaskProgress = (tasks: Task[], taskId: string, progress: number): Task[] => {
    return tasks.map((task) => {
      if (task.id === taskId) {
        return { ...task, progress }; // Update the task's progress
      } else if (task.children.length > 0) {
        const updatedChildren = updateTaskProgress(task.children, taskId, progress);
        const parentProgress = calculateParentProgress(updatedChildren);
        return { ...task, progress: parentProgress, children: updatedChildren };
      } else {
        return task;
      }
    });
  };

  const calculateParentProgress = (children: Task[]): number => {
    const totalProgress = children.reduce(
      (sum, child) => sum + (child.progress ?? 0),
      0
    );
    return totalProgress / children.length;
  };

  const renderTasks = (tasks: Task[]): JSX.Element[] => {
    return tasks.map((task) => {
      const dotCount = task.id.split('.').length - 1; // Count the number of dots in the ID
      const isEditable = dotCount === 2; // Editable only for two-dot tasks

      return (
        <Box
          key={task.id}
          sx={{
            marginBottom: 2,
            paddingLeft: `${dotCount * 16}px`, // Indentation based on dot count
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: isEditable ? '#f9fbfd' : '#ffffff',
              padding: '8px 16px',
              borderRadius: 1,
              border: '1px solid #e0e0e0',
              boxShadow: isEditable ? '0 2px 4px rgba(0, 0, 0, 0.1)' : 'none',
              cursor: task.children.length > 0 ? 'pointer' : 'default', // Pointer cursor for expandable rows
            }}
            onClick={() => task.children.length > 0 && toggleExpand(task.id)} // Toggle when clicking on the row
          >
            <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
              {task.children.length > 0 && (
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent row click event
                    toggleExpand(task.id);
                  }}
                  sx={{ marginRight: 1 }}
                >
                  {expandedTasks.has(task.id) ? <ExpandLess /> : <ExpandMore />}
                </IconButton>
              )}
              <Typography
                variant="body1"
                sx={{
                  fontWeight: dotCount === 0 ? 'bold' : 'normal',
                  color: dotCount === 0 ? '#333' : '#555',
                  flexGrow: 1,
                  textAlign: 'right', // Align text to the right for Persian
                }}
              >
                {task.name} ({task.id})
              </Typography>
            </Box>
            {isEditable ? (
              <TextField
                size="small"
                type="number"
                variant="outlined"
                value={task.progress ?? 0} // Default progress to 0
                onChange={(e) => handleProgressChange(task.id, Number(e.target.value))}
                onClick={(e) => e.stopPropagation()} // Prevent row click event
                sx={{
                  width: 80,
                  '& input': {
                    textAlign: 'center', // Align text inside input
                  },
                }}
              />
            ) : (
              <Typography variant="body2" sx={{ fontWeight: 'bold', width: 80, textAlign: 'center' }}>
                {(task.progress ?? 0).toFixed(2)}% {/* Default progress to 0 */}
              </Typography>
            )}
          </Box>
          {task.children.length > 0 && (
            <Collapse in={expandedTasks.has(task.id)} timeout="auto" unmountOnExit>
              {renderTasks(task.children)}
            </Collapse>
          )}
        </Box>
      );
    });
  };

  return (
    <Box
      sx={{
        direction: 'rtl', // Add RTL directionality for Persian text
        backgroundColor: '#f7f9fc',
        padding: 3,
        borderRadius: 2,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      }}
    >
      <Typography
        variant="h5"
        sx={{
          marginBottom: 3,
          textAlign: 'right', // Align text to the right for Persian
          fontWeight: 'bold',
        }}
      >
        وظایف پروژه: {projectId}
      </Typography>
      {renderTasks(tasks)}
      <Button
        variant="contained"
        color="primary"
        sx={{
          marginTop: 3,
          padding: '10px 20px',
          fontSize: '1rem',
        }}
        onClick={() => console.log('Submit data to backend:', tasks)}
      >
        ذخیره پیشرفت
      </Button>
    </Box>
  );
};

export default TaskTree;
