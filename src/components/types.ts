export interface Task {
    id: number;
    text: string;
    start: Date;
    end: Date;
    duration: number;
    progress: number;
    type: string;
    parent?: number;
  }
  
  export interface ProjectStats {
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    startDate: Date;
    endDate: Date;
  }