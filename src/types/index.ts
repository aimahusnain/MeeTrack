// src/types.ts
export interface Meeting {
  id: string;
  name: string;
  date: Date;
  startTime: Date;
  endTime: Date;
  description?: string;
  color?: string;
  isEpt?: boolean; // Flag for Engagement Pending Time
}

export type WeekData = {
  weekNumber: number;
  startDate: Date;
  endDate: Date;
};

export type TimeOption = {
  value: string;
  label: string;
  hour: number;
  minute: number;
};