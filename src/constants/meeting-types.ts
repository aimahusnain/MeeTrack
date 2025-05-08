// Define the mapping between meeting types and their colors
export const MEETING_TYPES = {
    "الصلاة - الراحة": "#5D7070",
    "المؤتمرات والفعاليات الدولية": "#C8EEFD",
    "الاجتماعات متعددة الأطراف": "#039BD4",
    "الاجتماعات الثنائية": "#032059",
    "الفعاليات والرحلات المحلية": "#4CB480",
    "اجتماعات السياحة": "#3B876A",
    "اجتماعات اللجان والمجالس": "#338F92",
    "القطاع الخاص (دولي)": "#4D4785",
    "القطاع الخاص (محلي)": "#7484A9",
    "اجتماعات أخرى": "#334C4C",
    العطلات: "#B0B0B0",
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
  
  // Helper function to get color class based on meeting type
  export function getColorClassByType(meetingType: string): string {
    const hexColor = MEETING_TYPES[meetingType as keyof typeof MEETING_TYPES]
    return hexColor ? getColorClass(hexColor) : "bg-zinc-700" // Default color if type not found
  }
  