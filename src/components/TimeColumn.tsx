interface TimeColumnProps {
  timeSlots: string[]
  timeSlotHeight: number
}

export default function TimeColumn({ timeSlots, timeSlotHeight }: TimeColumnProps) {
  // Convert 24-hour format times to 12-hour format with ص/م
  const format12Hour = (time24h: string): string => {
    const [hourStr, minuteStr] = time24h.split(":")
    const hour = Number.parseInt(hourStr, 10)
    const minute = Number.parseInt(minuteStr, 10)

    const hour12 = hour % 12 || 12
    const amPm = hour < 12 ? "ص" : "م"

    return `${hour12}:${minute.toString().padStart(2, "0")} ${amPm}`
  }

  return (
    <div className="w-24 md:w-32 bg-[#025F5F] flex-shrink-0">
      <div className="h-16"></div> {/* Spacer for day header */}
      <div>
        {timeSlots.map((time, i) => {
          const formattedTime = format12Hour(time)
          const minute = time.split(":")[1]

          // Styling based on time
          let textSizeClass = "text-sm text-gray-100"
          if (minute === "15" || minute === "45") {
            textSizeClass = "text-[10px] mb-6 text-gray-400"
          } else if (minute === "30") {
            textSizeClass = "text-[13px] text-gray-300"
          }

          // Hide border for :00 and :30
          const hideBorder = minute === "00" || minute === "30"

          return (
            <div key={i} className="relative" style={{ height: `${timeSlotHeight}px` }}>
              <span className={`absolute bottom-0 right-2 mb-5 ${textSizeClass} font-medium whitespace-nowrap`}>
                {formattedTime}
              </span>

              {!hideBorder && (
  <div className="absolute bottom-0 left-0 w-full h-[1px]">
    <div className="w-full h-full bg-gradient-to-r from-gray-300/100 via-gray-300/0"></div>
  </div>
)}

            </div>
          )
        })}
      </div>
    </div>
  )
}
