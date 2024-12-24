import React from 'react';
// @ts-ignore
import { Gantt, Willow } from 'wx-react-gantt';
import 'wx-react-gantt/dist/gantt.css';
import dayjs from 'dayjs';
import jalaliday from 'jalaliday';

dayjs.extend(jalaliday); 

interface Task {
  id: number;
  text: string;
  start: Date;
  end: Date;
  duration: number;
  progress: number;
  type: string;
  parent?: number;
}

interface GanttChartProps {
  tasks: Task[];
}

const DateGanttChart: React.FC<GanttChartProps> = ({ tasks }) => {
  const links = tasks.reduce((acc, task) => {
    if (task.parent) {
      acc.push({ id: `link-${task.id}`, source: task.parent, target: task.id, type: 'e2e' });
    }
    return acc;
  }, [] as { id: string; source: number; target: number; type: string }[]);

  const scales = [
    {
      unit: 'month',
      step: 1,
      format: (date: Date) => 
        dayjs(date).calendar('jalali').locale('fa').format('MMMM YYYY'),
    },
  ];

  const cellWidth = 100;
  const cellHeight = 30;

  // Format tasks with Jalali dates
  const formattedTasks = tasks.map((task) => ({
    ...task,
    start: dayjs(task.start).calendar('jalali').toDate(),
    end: dayjs(task.end).calendar('jalali').toDate(),
  }));

  return (
    <Willow>
      <Gantt
        tasks={formattedTasks}
        links={links}
        scales={scales}
        cellWidth={cellWidth}
        cellHeight={cellHeight}
      />
    </Willow>
  );
};

export default DateGanttChart;
