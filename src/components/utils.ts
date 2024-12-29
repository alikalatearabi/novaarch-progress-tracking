import dayjs from 'dayjs';
import { Task, ProjectStats } from './types';

export const calculateProjectStats = (tasks: Task[]): ProjectStats => {
  return {
    totalTasks: tasks.length,
    completedTasks: tasks.filter(task => task.progress === 100).length,
    inProgressTasks: tasks.filter(task => task.progress > 0 && task.progress < 100).length,
    startDate: tasks.reduce((earliest, task) => 
      task.start < earliest ? task.start : earliest, 
      tasks[0].start
    ),
    endDate: tasks.reduce((latest, task) => 
      task.end > latest ? task.end : latest, 
      tasks[0].end
    )
  };
};

export const generateSCurveProgressData = () => {
  const months = [
    'فروردین 1402', 'اردیبهشت 1402', 'خرداد 1402', 
    'تیر 1402', 'مرداد 1402', 'شهریور 1402',
    'مهر 1402', 'آبان 1402', 'آذر 1402',
    'دی 1402', 'بهمن 1402', 'اسفند 1402'
  ];

  const progress = months.map((_, index) => {
    const x = index / (months.length - 1);
    return Math.round(100 / (1 + Math.exp(-10 * (x - 0.5))));
  });

  return {
    labels: months,
    datasets: [{
      label: 'پیشرفت پروژه',
      data: progress,
      borderColor: '#1976d2',
      backgroundColor: 'rgba(25, 118, 210, 0.1)',
      tension: 0.4,
      fill: true
    }]
  };
};

export const prepareGanttData = (tasks: Task[]) => {
  const formattedTasks = tasks.map(task => ({
    ...task,
    start: dayjs(task.start).toDate(),
    end: dayjs(task.end).toDate()
  }));

  const links = tasks.reduce((acc, task) => {
    if (task.parent) {
      acc.push({ 
        id: `link-${task.id}`, 
        source: task.parent, 
        target: task.id, 
        type: "e2e" 
      });
    }
    return acc;
  }, [] as { id: string; source: number; target: number; type: string }[]);

  return { formattedTasks, links };
};