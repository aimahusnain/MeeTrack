export interface Meeting {
  id: string
  name: string
  date: Date
  startTime: Date
  endTime: Date
  description?: string
  organizer?: string // Optional field for organizer
  location?: string // Optional field for location
  color?: string
  isEpt?: boolean // Flag for Engagement Pending Time
  startTimeIndex?: number // Added field for start time index
  endTimeIndex?: number // Added field for end time index
}

export type WeekData = {
  weekNumber: number
  startDate: Date
  endDate: Date
}

export type TimeOption = {
  value: string
  label: string
  hour: number
  minute: number
}