// Define the mapping between meeting types and their colors
export const MEETING_TYPES = {
  "الصلاة - الراحة": {
    main: "#5D7070",
    background: "#A9B7B7",
  },
  "المؤتمرات والفعاليات الدولية": {
    main: "#C8EEFD",
    background: "#E6F7FE",
  },
  "الاجتماعات متعددة الأطراف": {
    main: "#039BD4",
    background: "#95E2FD",
  },
  "الاجتماعات الثنائية": {
    main: "#032059",
    background: "#BFD4FD",
  },
  "الفعاليات والرحلات المحلية": {
    main: "#4CB480",
    background: "#D9EFE4",
  },
  "اجتماعات السياحة": {
    main: "#3B876A",
    background: "#CEEADF",
  },
  "اجتماعات اللجان والمجالس": {
    main: "#338F92",
    background: "#C7EAEB",
  },
  "القطاع الخاص (دولي)": {
    main: "#4D4785",
    background: "#DEDCEC",
  },
  "القطاع الخاص (محلي)": {
    main: "#7484A9",
    background: "#D4D9E4",
  },
  "اجتماعات أخرى": {
    main: "#334C4C",
    background: "#C6D8D8",
  },
  العطلات: {
    main: "#B0B0B0",
    background: "#D7D7D7",
  },
}

// Helper function to convert hex color to Tailwind bg class
export function getColorClass(hexColor: string): string {
  // Default fallback color
  const defaultColor = "bg-red-500"

  // Map of known hex colors to Tailwind classes
  const colorMap: Record<string, string> = {
    "#5D7070": "bg-[#5D7070]",
    "#C8EEFD": "bg-[#C8EEFD]",
    "#039BD4": "bg-[#039BD4]",
    "#032059": "bg-[#032059]",
    "#4CB480": "bg-[#4CB480]",
    "#3B876A": "bg-[#3B876A]",
    "#338F92": "bg-[#338F92]",
    "#4D4785": "bg-[#4D4785]",
    "#7484A9": "bg-[#7484A9]",
    "#334C4C": "bg-[#334C4C]",
    "#B0B0B0": "bg-[#B0B0B0]",
  }

  return colorMap[hexColor] || defaultColor
}

// Helper function to get background color class based on meeting type
export function getBackgroundColorClass(meetingType: string): string {
  const typeColors = MEETING_TYPES[meetingType as keyof typeof MEETING_TYPES]
  return typeColors ? `bg-[${typeColors.background}]` : "bg-zinc-100" // Default background if type not found
}

// Helper function to get main color class based on meeting type
export function getColorClassByType(meetingType: string): string {
  const typeColors = MEETING_TYPES[meetingType as keyof typeof MEETING_TYPES]
  return typeColors ? `bg-[${typeColors.main}]` : "bg-zinc-700" // Default color if type not found
}
