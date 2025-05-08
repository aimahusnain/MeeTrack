import type { Meeting } from "@/types"
import { Clock, MapPin, User } from "lucide-react"

interface MeetingBlockProps {
  meeting: Meeting
  timeSlotHeight: number
  layoutType: "single" | "dual-horizontal" | "triple" | "quad"
  layoutPosition: number
  availableWidth?: string
  totalMeetings?: number
}

export default function MeetingBlock({
  meeting,
  timeSlotHeight,
  layoutType,
  layoutPosition,
  availableWidth,
  totalMeetings = 1,
}: MeetingBlockProps) {
  let topPosition: number
  let height: number
  let durationInMinutes = 0

  if (meeting.startTimeIndex !== undefined && meeting.endTimeIndex !== undefined) {
    const startSlot = meeting.startTimeIndex - 1
    const endSlot = meeting.endTimeIndex - 1
    topPosition = startSlot * timeSlotHeight
    height = (endSlot - startSlot + 1) * timeSlotHeight
    durationInMinutes = (endSlot - startSlot + 1) * 15
  } else {
    const startHour = meeting.startTime.getHours()
    const startMinute = meeting.startTime.getMinutes()
    const endHour = meeting.endTime.getHours()
    const endMinute = meeting.endTime.getMinutes()

    const startTimeInMinutes = (startHour - 8) * 60 + startMinute
    const endTimeInMinutes = (endHour - 8) * 60 + endMinute
    durationInMinutes = endTimeInMinutes - startTimeInMinutes

    topPosition = (startTimeInMinutes / 15) * timeSlotHeight
    height = (durationInMinutes / 15) * timeSlotHeight
  }

  const bgColor = meeting.color || "bg-lime-950"
  const borderColor = bgColor.replace("bg-", "border-")

  const isShortMeeting = durationInMinutes <= 60
  const isSmallBlock = height < 150
  const isDivided = totalMeetings > 1
  const isLongMeeting = durationInMinutes >= 120

  const width = availableWidth || "100%"
  let left = "0%"

  switch (layoutType) {
    case "single":
      left = "4px"
      break
    case "dual-horizontal":
      left = layoutPosition === 0 ? "4px" : "calc(50% + 2px)"
      break
    case "triple":
      if (layoutPosition === 0) left = "4px"
      else if (layoutPosition === 1) left = "calc(33.33% + 2px)"
      else left = "calc(66.66% + 2px)"
      break
    case "quad":
      if (layoutPosition === 0) left = "4px"
      else if (layoutPosition === 1) left = "calc(25% + 2px)"
      else if (layoutPosition === 2) left = "calc(50% + 2px)"
      else left = "calc(75% + 2px)"
      break
  }

  const formatTime = (date: Date) => {
    // Get hours and minutes in English numerals
    const hours = date.getHours()
    const minutes = date.getMinutes().toString().padStart(2, "0")

    // Determine if it's AM or PM
    const isPM = hours >= 12
    const displayHours = hours % 12 || 12 // Convert to 12-hour format

    // Add Arabic AM/PM indicator
    const amPmIndicator = isPM ? "م" : "ص"

    return `${displayHours}:${minutes} ${amPmIndicator}`
  }

  const formatTimeRange = () => {
    const start = formatTime(meeting.startTime)
    const end = formatTime(meeting.endTime)
    return `${start} - ${end}`
  }

  const useTwoColumnLayout = layoutType === "dual-horizontal" && !isShortMeeting && height >= 80 && !isDivided

  if (isShortMeeting) {
    return (
      <div
        className={`absolute rounded-md shadow-md overflow-hidden z-10 transition-all hover:z-20 hover:shadow-lg ${bgColor}`}
        style={{
          top: `${topPosition}px`,
          height: `${Math.max(height, 25)}px`,
          width,
          left,
        }}
      >
        <div className="flex items-center justify-center h-full w-full">
          <h3 className="font-medium text-xs text-white px-1 text-center break-words">{meeting.name}</h3>
        </div>
      </div>
    )
  } else if (useTwoColumnLayout) {
    return (
      <div
        className={`absolute rounded-md shadow-md overflow-hidden z-10 transition-all hover:z-20 hover:shadow-lg bg-white border-r-4 ${borderColor}`}
        style={{
          top: `${topPosition}px`,
          height: `${Math.max(height, 25)}px`,
          width,
          left,
        }}
      >
        <div className="flex h-full">
          <div className={`w-1.5 ${bgColor} h-full`}></div>

          <div className="flex flex-col p-2 flex-1">
            <h3 className="font-semibold text-sm text-zinc-800 mb-1 line-clamp-2 break-words">{meeting.name}</h3>
            <div className="flex items-center text-xs text-zinc-500 mb-1">
              <Clock className="h-3 w-3 ml-1 flex-shrink-0" />
              <span className="break-words">{formatTimeRange()}</span>
            </div>
            <div className="flex flex-wrap gap-x-3 mt-auto">
              {meeting.organizer && (
                <div className="flex items-center text-xs text-zinc-500">
                  <User className="h-3 w-3 ml-1 flex-shrink-0" />
                  <span className="break-words">{meeting.organizer}</span>
                </div>
              )}
              {meeting.location && (
                <div className="flex items-center text-xs text-zinc-500">
                  <MapPin className="h-3 w-3 ml-1 flex-shrink-0" />
                  <span className="break-words">{meeting.location}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  } else if (isDivided && !isSmallBlock) {
    return (
      <div
        className="absolute rounded-md shadow-md overflow-hidden z-10 transition-all hover:z-20 hover:shadow-lg bg-white"
        style={{
          top: `${topPosition}px`,
          height: `${Math.max(height, 25)}px`,
          width,
          left,
        }}
      >
        <div className={`w-full ${bgColor} py-1 px-2`}>
          <h3 className="text-xs text-center text-white break-words">{meeting.organizer}</h3>
        </div>
        <div>
          <div className="flex items-center justify-center border-b border-zinc-200 bg-zinc-50 py-1">
            <div className="text-[10px] text-black flex gap-1 items-center">
              {formatTime(meeting.startTime)} - {formatTime(meeting.endTime)}
            </div>
          </div>
          <div className="flex flex-col items-center justify-center p-1">
            <span className="break-words text-center text-[12px]">{meeting.name}</span>
            <div className="text-[10px] text-black flex items-center mt-2">
              <MapPin className="h-3 w-3 ml-1 flex-shrink-0" />
              <span className="break-words">{meeting.location}</span>
            </div>
          </div>
        </div>
      </div>
    )
  } else if (isDivided && isSmallBlock) {
    return (
      <div
        className={`absolute rounded-md shadow-md overflow-hidden z-10 transition-all hover:z-20 hover:shadow-lg ${bgColor}`}
        style={{
          top: `${topPosition}px`,
          height: `${Math.max(height, 25)}px`,
          width,
          left,
        }}
      >
        <div className="flex flex-col h-full justify-between p-1">
          <h3 className="font-medium text-[10px] text-white text-center break-words">{meeting.name}</h3>
          <div className="text-[8px] text-zinc-500 mt-auto">{formatTime(meeting.startTime)}</div>
          <div className="text-[8px] text-zinc-500 mt-auto">{formatTime(meeting.endTime)}</div>
        </div>
      </div>
    )
  } else if (isDivided) {
    return (
      <div
        className="absolute rounded-md shadow-md overflow-hidden z-10 transition-all hover:z-20 hover:shadow-lg bg-white"
        style={{
          top: `${topPosition}px`,
          height: `${Math.max(height, 25)}px`,
          width,
          left,
        }}
      >
        <div className={`w-full ${bgColor} h-1.5`}></div>
        <div className="flex flex-col p-1.5 h-full justify-between">
          <h3 className="font-medium text-xs text-zinc-800 break-words">{meeting.name}</h3>
          <div className="text-[8px] text-zinc-500 mt-auto">{formatTime(meeting.startTime)}</div>
          <div className="text-[8px] text-zinc-500 mt-auto">{formatTime(meeting.endTime)}</div>
        </div>
      </div>
    )
  } else {
    return (
      <div
        className="absolute rounded-md shadow-md overflow-hidden z-10 transition-all hover:z-20 hover:shadow-lg bg-white"
        style={{
          top: `${topPosition}px`,
          height: `${Math.max(height, 25)}px`,
          width,
          left,
        }}
      >
        <div className={`w-full text-center text-sm text-white py-1.5 ${bgColor} flex items-center justify-center`}>
          {meeting.organizer ? (
            <span className="px-2 break-words">{meeting.organizer}</span>
          ) : (
            <span className="px-2 break-words">{meeting.name}</span>
          )}
        </div>
        <div
          className={`flex h-full border-t border-zinc-200 ${
            isLongMeeting ? "items-center justify-center text-center" : ""
          }`}
        >
          <div className={`w-14 p-1 flex-shrink-0 flex flex-col ${isLongMeeting ? "items-start justify-center" : ""} border-r border-zinc-200 bg-zinc-50`}>
            <div className="text-[10px] text-black whitespace-nowrap">{formatTime(meeting.startTime)}</div>
            <div className="text-[10px] text-black whitespace-nowrap mt-1">{formatTime(meeting.endTime)}</div>
          </div>
          <div className={`flex flex-col p-2 flex-1 ${isLongMeeting ? "items-center justify-center text-center" : ""}`}>
            {meeting.organizer && <h3 className="font-medium text-sm text-zinc-800 break-words">{meeting.name}</h3>}
            {meeting.location && (
              <div className="text-xs text-zinc-600 mt-1 flex items-center">
                <MapPin className="h-3 w-3 ml-1 flex-shrink-0" />
                <span className="break-words">{meeting.location}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }
}
