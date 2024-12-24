import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Collapse,
  IconButton,
  useTheme,
  alpha,
  LinearProgress,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import { 
  ExpandMore, 
  ExpandLess, 
  CheckCircleOutline,
  TableChart,
  InsertChart,
} from '@mui/icons-material';
import GanttChart from './GanttChart'; 
import DateGanttChart from './dateGanttChart';

interface Task {
  id: string;
  name: string;
  progress?: number;
  children: Task[];
  startDate?: string;
  endDate?: string;
  duration: {value: string}
}

interface TaskTreeProps {
  projectId: string;
}

const TaskTree: React.FC<TaskTreeProps> = ({ projectId }) => {
  const theme = useTheme();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'list' | 'chart'>('list');

  useEffect(() => {
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
        return { ...task, progress };
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
      const dotCount = task.id.split('.').length - 1;
      const isEditable = dotCount === 2;
      const progress = task.progress ?? 0;

      return (
        <Box
          key={task.id}
          sx={{
            marginBottom: 2,
            paddingLeft: `${dotCount * 16}px`,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: theme.palette.background.paper,
              padding: '12px 16px',
              borderRadius: 2,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              boxShadow: theme.shadows[1],
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: theme.shadows[3],
              },
              cursor: task.children.length > 0 ? 'pointer' : 'default',
            }}
            onClick={() => task.children.length > 0 && toggleExpand(task.id)}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
              {task.children.length > 0 && (
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleExpand(task.id);
                  }}
                  sx={{ 
                    marginRight: 1,
                    color: theme.palette.primary.main,
                  }}
                >
                  {expandedTasks.has(task.id) ? <ExpandLess /> : <ExpandMore />}
                </IconButton>
              )}
              <Box sx={{ flexGrow: 1 }}>
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: dotCount === 0 ? 'bold' : 'normal',
                    color: dotCount === 0 ? theme.palette.text.primary : theme.palette.text.secondary,
                    textAlign: 'right',
                  }}
                >
                  {task.name} ({task.id})
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={progress}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    marginTop: 1,
                    backgroundColor: alpha(theme.palette.primary.main, 0.2),
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: progress === 100 
                        ? theme.palette.success.main 
                        : theme.palette.primary.main,
                    },
                  }}
                />
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {isEditable ? (
                <TextField
                  size="small"
                  type="number"
                  variant="outlined"
                  value={progress}
                  onChange={(e) => handleProgressChange(task.id, Number(e.target.value))}
                  onClick={(e) => e.stopPropagation()}
                  sx={{
                    width: 100,
                    '& input': {
                      direction: 'ltr',
                      textAlign: 'center',
                    },
                  }}
                />
              ) : (
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontWeight: 'bold', 
                    width: 100, 
                    textAlign: 'center',
                    color: progress === 100 
                      ? theme.palette.success.main 
                      : theme.palette.text.secondary,
                  }}
                >
                  {progress.toFixed(0)}%
                </Typography>
              )}
            </Box>
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

  const calculateDuration = (startDate?: string, endDate?: string): number => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const durationInMs = end.getTime() - start.getTime();
      return Math.ceil(durationInMs / (1000 * 60 * 60 * 24)); // Convert milliseconds to days
    }
    return 1; // Default duration if dates are missing
  };

  const transformTasksForGantt = (tasks: Task[]): any[] => {
    return tasks.map((task) => ({
      id: parseInt(task.id),
      text: task.name,
      start: task.startDate ? new Date(task.startDate) : new Date(),
      end: task.endDate ? new Date(task.endDate) : new Date(),
      duration: calculateDuration(task.startDate, task.endDate), // Duration could be dynamically calculated
      progress: task.progress ?? 0,
      type: task.children.length > 0 ? 'summary' : 'task',
      parent: task.children.length > 0 ? undefined : parseInt(task.id.split('.').slice(0, -1).join('.')),
    }));
  };

  return (
    <Box
      sx={{
        direction: 'rtl',
        backgroundColor: theme.palette.background.default,
        padding: 3,
        borderRadius: 3,
        boxShadow: theme.shadows[2],
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 3 
      }}>
        <Typography
          variant="h4"
          sx={{
            textAlign: 'right',
            fontWeight: 'bold',
            color: theme.palette.primary.main,
          }}
        >
          وظایف پروژه: {projectId}
        </Typography>
        
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={(e, value) => value && setViewMode(value)}
          sx={{
            '& .MuiToggleButton-root': {
              borderRadius: 2,
            }
          }}
          style={{direction: 'ltr'}}
        >
          <ToggleButton value="list">
            <TableChart />
          </ToggleButton>
          <ToggleButton value="chart" style={{borderLeft: '1px solid rgba(0, 0, 0, 0.12)', marginLeft: '10px'}}>
            <InsertChart />
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {viewMode === 'list' ? (
        <>
          {renderTasks(tasks)}
          <Button
            variant="contained"
            color="primary"
            startIcon={<CheckCircleOutline style={{marginLeft: '15px'}}/>}
            sx={{
              marginTop: 3,
              padding: '12px 24px',
              fontSize: '1rem',
              borderRadius: 2,
              boxShadow: theme.shadows[3],
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: theme.shadows[6],
              },
            }}
            onClick={() => console.log('Submit data to backend:', tasks)}
          >
            ذخیره پیشرفت
          </Button>
        </>
      ) : (
        <DateGanttChart tasks={transformTasksForGantt(tasks)}/> 
      )}
    </Box>
  );
};

export default TaskTree;