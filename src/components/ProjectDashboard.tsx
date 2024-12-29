import React, { useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  styled
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot
} from '@mui/lab';
import { Gantt, Willow } from "wx-react-gantt";
import "wx-react-gantt/dist/gantt.css";
import dayjs from "dayjs";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from 'chart.js';

import { Task, ProjectStats } from './types';
import {
  calculateProjectStats,
  generateSCurveProgressData,
  prepareGanttData
} from './utils';

// Chart.js registration
ChartJS.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

// Styled Components
const DashboardPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  boxShadow: theme.shadows[3],
  transition: 'transform 0.3s ease-in-out',
  '&:hover': {
    transform: 'scale(1.02)',
  }
}));

const scales = [
  {
    unit: "month",
    step: 1,
    format: (date: Date) => dayjs(date).calendar("jalali").locale("fa").format("MMMM YYYY"),
  },
];

const ProjectDashboard: React.FC<{ tasks: Task[] }> = ({ tasks }) => {
  const [selectedView, setSelectedView] = useState<'gantt' | 'timeline' | 'progress'>('gantt');

  const projectStats = calculateProjectStats(tasks);
  const { formattedTasks, links } = prepareGanttData(tasks);

  const renderContent = () => {
    switch (selectedView) {
      case 'gantt':
        return (
          <Willow>
            <Gantt
              tasks={formattedTasks}
              scales={scales}
              links={links}
              cellWidth={100}
              cellHeight={30}
            />
          </Willow>
        );
      case 'timeline':
        return (
          <Timeline>
            {tasks.map((task, index) => (
              <TimelineItem key={task.id}>
                <TimelineSeparator>
                  <TimelineDot
                    color={task.progress === 100 ? 'success' : 'primary'}
                  />
                  {index < tasks.length - 1 && <TimelineConnector />}
                </TimelineSeparator>
                <TimelineContent>
                  <Typography variant="h6">
                    {task.text}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {dayjs(task.start).format('YYYY-MM-DD')} -
                    {dayjs(task.end).format('YYYY-MM-DD')}
                  </Typography>
                </TimelineContent>
              </TimelineItem>
            ))}
          </Timeline>
        );
      case 'progress':
        return (
          <Box sx={{ height: '400px' }}>
            <Line
              data={generateSCurveProgressData()}
              options={{
                responsive: true,
                maintainAspectRatio: false
              }}
            />
          </Box>
        );
    }
  };

  return (
    <Container maxWidth="xl">
      <Grid container spacing={3}>
        {/* View Selection Chips */}
        <Grid item xs={12}>
          <Box display="flex" justifyContent="center" gap={2} mb={3}>
            {['gantt', 'timeline', 'progress'].map(view => (
              <Chip
                key={view}
                label={view.charAt(0).toUpperCase() + view.slice(1)}
                color={selectedView === view ? 'primary' : 'default'}
                onClick={() => setSelectedView(view as any)}
              />
            ))}
          </Box>
        </Grid>

        {/* Main Content */}
        <Grid item xs={12}>
          <DashboardPaper>
            {renderContent()}
          </DashboardPaper>
        </Grid>

        {/* Project Statistics */}
        <Grid item xs={12} md={4}>
          <DashboardPaper>
            <Typography variant="h6" gutterBottom>
              Project Overview
            </Typography>
            <Box>
              <Typography>Total Tasks: {projectStats.totalTasks}</Typography>
              <Typography>Completed Tasks: {projectStats.completedTasks}</Typography>
              <Typography>In Progress Tasks: {projectStats.inProgressTasks}</Typography>
              <Typography>
                Project Duration: {dayjs(projectStats.startDate).format('YYYY-MM-DD')} -
                {dayjs(projectStats.endDate).format('YYYY-MM-DD')}
              </Typography>
            </Box>
          </DashboardPaper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ProjectDashboard;