// src/types.ts
export interface Meeting {
  id: string;
  name: string;
  date: Date;
  startTime: Date;
  endTime: Date;
  description?: string;
  color?: string;
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