import React from 'react';
import { 
  Box,
  useTheme,
} from '@mui/material';
import { Bar } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { format, parseISO, differenceInDays } from 'date-fns';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface Task {
  id: string;
  name: string;
  progress?: number;
  children: Task[];
  startDate?: string;
  endDate?: string;
}

interface GanttChartProps {
  tasks: Task[];
}

const GanttChart: React.FC<GanttChartProps> = ({ tasks }) => {
  const theme = useTheme();

  // Filter only top-level tasks (without dots in ID)
  const topLevelTasks = tasks.filter(task => !task.id.includes('.'));

  const labels = topLevelTasks.map(task => task.name);
  const startDates = topLevelTasks.map(task => 
    task.startDate ? format(parseISO(task.startDate), 'yyyy-MM-dd') : ''
  );
  const durations = topLevelTasks.map(task => 
    task.startDate && task.endDate 
      ? differenceInDays(parseISO(task.endDate), parseISO(task.startDate)) 
      : 0
  );

  const data = {
    labels,
    datasets: [
      {
        label: 'Task Duration',
        data: durations,
        backgroundColor: durations.map(duration => 
          duration > 0 ? theme.palette.primary.main : theme.palette.error.main
        ),
        borderColor: durations.map(duration => 
          duration > 0 ? theme.palette.primary.dark : theme.palette.error.dark
        ),
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    indexAxis: 'y' as const,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: 'Project Tasks Timeline',
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const task = topLevelTasks[context.dataIndex];
            return [
              `Start Date: ${task.startDate || 'N/A'}`,
              `End Date: ${task.endDate || 'N/A'}`,
              `Duration: ${context.parsed.x} days`
            ];
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Duration (Days)',
        },
      },
    },
  };

  return (
    <Box sx={{ width: '100%', height: 400 }}>
      <Bar data={data} options={options} />
    </Box>
  );
};

export default GanttChart;