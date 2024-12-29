import React from "react";
import { Gantt, Willow } from "wx-react-gantt";
import "wx-react-gantt/dist/gantt.css";
import dayjs from "dayjs";
import jalaliday from "jalaliday";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { ChartOptions } from "chart.js";

dayjs.extend(jalaliday);

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend);

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
  // Generate links for Gantt chart
  const links = tasks.reduce((acc, task) => {
    if (task.parent) {
      acc.push({ id: `link-${task.id}`, source: task.parent, target: task.id, type: "e2e" });
    }
    return acc;
  }, [] as { id: string; source: number; target: number; type: string }[]);

  const scales = [
    {
      unit: "month",
      step: 1,
      format: (date: Date) => dayjs(date).calendar("jalali").locale("fa").format("MMMM YYYY"),
    },
  ];

  const cellWidth = 100;
  const cellHeight = 30;

  // Format tasks with Jalali dates
  const formattedTasks = tasks.map((task) => ({
    ...task,
    start: dayjs(task.start).calendar("jalali").toDate(),
    end: dayjs(task.end).calendar("jalali").toDate(),
  }));

  // Generate the ideal S-curve data
  const generateSmoothSCurveData = () => {
    const months = [
      "فروردین 1402",
      "اردیبهشت 1402",
      "خرداد 1402",
      "تیر 1402",
      "مرداد 1402",
      "شهریور 1402",
      "مهر 1402",
      "آبان 1402",
      "آذر 1402",
      "دی 1402",
      "بهمن 1402",
      "اسفند 1402",
    ];

    const progress = months.map((_, index) => {
      const x = index / (months.length - 1);
      return Math.round(100 / (1 + Math.exp(-10 * (x - 0.5))));
    });

    return { labels: months, idealProgress: progress };
  };

  // Generate the realistic progress curve data
  const generateRealisticProgressData = (idealProgress: number[]) => {
    return idealProgress.map((value, index) => {
      if (index < idealProgress.length / 2) {
        return value * (0.8 - 0.5 * Math.random()); // Random variation below ideal
      }
      return value * 0.5; // After mid-project, realistic progress plateaus
    });
  };

  const { labels, idealProgress } = generateSmoothSCurveData();
  const realisticProgress = generateRealisticProgressData(idealProgress);

  const sCurveData = {
    labels,
    datasets: [
      {
        label: "پیشرفت ایده‌آل (%)",
        data: idealProgress,
        borderColor: "#4CAF50",
        backgroundColor: "rgba(76, 175, 80, 0.2)",
        tension: 0.4,
        fill: true,
      },
      {
        label: "پیشرفت واقعی (%)",
        data: realisticProgress,
        borderColor: "#FF9800",
        backgroundColor: "rgba(255, 152, 0, 0.2)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const sCurveOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        title: {
          display: true,
          text: "زمان (ماه)",
        },
        ticks: {
          autoSkip: false,
        },
      },
      y: {
        title: {
          display: true,
          text: "پیشرفت (%)",
        },
        min: 0,
        max: 100,
      },
    },
    plugins: {
      legend: {
        display: true,
        position: "bottom",
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `${context.dataset.label}: ${context.raw}%`;
          },
        },
      },
    },
  };

  const nearFutureWorks = tasks.filter((task) => {
    const today = dayjs();
    const startDate = dayjs(task.start);
    return startDate.isAfter(today) && startDate.diff(today, "days") <= 30;
  });

  const finishedTasks = tasks.filter((task) => task.progress === 100);

  return (
    <div style={{ margin: "20px", fontFamily: "'Roboto', sans-serif" }}>
      <Willow>
        <Gantt
          tasks={formattedTasks}
          links={links}
          scales={scales}
          cellWidth={cellWidth}
          cellHeight={cellHeight}
        />
      </Willow>
      <div style={{ height: "300px", marginTop: "40px" }}>
        <Line data={sCurveData} options={sCurveOptions} />
      </div>

      {/* Task Boxes Container */}
      <div
        style={{
          marginTop: "40px",
          display: "flex",
          gap: "30px",
          justifyContent: "center",
          alignItems: "flex-start",
          flexWrap: "wrap",
        }}
      >
        {/* Near Future Works Box */}
        <div
          style={{
            flex: "1 1 300px",
            padding: "20px",
            backgroundColor: "#ffffff",
            borderRadius: "8px",
            boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.15)",
            borderLeft: "6px solid #2196f3",
          }}
        >
          <h3 style={{ textAlign: "center", color: "#1976d2", marginBottom: "20px" }}>
            کارهای نزدیک آینده
          </h3>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "right" }}>
            <thead>
              <tr style={{ backgroundColor: "#e3f2fd" }}>
                <th style={{ padding: "10px", border: "1px solid #ddd" }}>نام وظیفه</th>
                <th style={{ padding: "10px", border: "1px solid #ddd" }}>تاریخ شروع</th>
              </tr>
            </thead>
            <tbody>
              {nearFutureWorks.length > 0 ? (
                nearFutureWorks.map((task) => (
                  <tr key={task.id}>
                    <td style={{ padding: "10px", border: "1px solid #ddd" }}>{task.text}</td>
                    <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                      {dayjs(task.start).calendar("jalali").locale("fa").format("YYYY/MM/DD")}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={2}
                    style={{
                      padding: "10px",
                      border: "1px solid #ddd",
                      textAlign: "center",
                      color: "#999",
                    }}
                  >
                    هیچ وظیفه‌ای در آینده نزدیک نیست.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Finished Tasks Box */}
        <div
          style={{
            flex: "1 1 300px",
            padding: "20px",
            backgroundColor: "#ffffff",
            borderRadius: "8px",
            boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.15)",
            borderLeft: "6px solid #4caf50",
          }}
        >
          <h3 style={{ textAlign: "center", color: "#388e3c", marginBottom: "20px" }}>
            کارهای انجام شده
          </h3>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "right" }}>
            <thead>
              <tr style={{ backgroundColor: "#e8f5e9" }}>
                <th style={{ padding: "10px", border: "1px solid #ddd" }}>نام وظیفه</th>
                <th style={{ padding: "10px", border: "1px solid #ddd" }}>تاریخ پایان</th>
              </tr>
            </thead>
            <tbody>
              {finishedTasks.length > 0 ? (
                finishedTasks.map((task) => (
                  <tr key={task.id}>
                    <td style={{ padding: "10px", border: "1px solid #ddd" }}>{task.text}</td>
                    <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                      {dayjs(task.end).calendar("jalali").locale("fa").format("YYYY/MM/DD")}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={2}
                    style={{
                      padding: "10px",
                      border: "1px solid #ddd",
                      textAlign: "center",
                      color: "#999",
                    }}
                  >
                    هیچ وظیفه‌ای تا کنون به پایان نرسیده است.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DateGanttChart;
