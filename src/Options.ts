import { type Dayjs } from 'dayjs';

export type Options = {
  offset_hours?: number; 
  offset_minutes?: number; 
  time?: Dayjs;
  debug?: boolean;
  outputIntervals?: boolean; 
  outputColor?: boolean;
  outputWeekly?: boolean; 
  printIntervals?: boolean;
};
