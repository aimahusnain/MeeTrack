"use client"

import TimeColumn from "./TimeColumn"
import MeetingBlock from "./MeetingBlock"
import type { Meeting, WeekData } from "@/types"

interface TimeSlot {
  time: string
  index: number
}

interface CalendarProps {
  week: WeekData
  meetings: Meeting[]
  arabicDates?: string[] // Add this prop for Arabic dates
}

export default function Calendar({ week, meetings, arabicDates = [] }: CalendarProps) {
  // Time slot height in pixels - must match other components
  const TIME_SLOT_HEIGHT = 30 // Increased height for better visibility

  // Generate time slots from 8:00 to 20:00 with 15-minute intervals
  // We'll start from 10:00 AM (index 1) to match the user's time indices
  const timeSlots: TimeSlot[] = Array.from({ length: 41 }, (_, i) => {
    const hour = Math.floor(i / 4) + 10 // Start from 10:00 AM
    const minute = (i % 4) * 15
    const formattedHour = hour.toString().padStart(2, "0")
    const formattedMinute = minute.toString().padStart(2, "0")
    return {
      time: `${formattedHour}:${formattedMinute}`,
      index: i + 1, // Start index at 1
    }
  })

  // Extract just the time strings for the TimeColumn component
  const timeStrings = timeSlots.map((slot) => slot.time)

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("ar-SA", { month: "short", day: "numeric" })
  }

  // Function to check if two meetings overlap in time
  const doMeetingsOverlap = (meetingA: Meeting, meetingB: Meeting): boolean => {
    // If we have time indices, use those for overlap detection
    if (
      meetingA.startTimeIndex !== undefined &&
      meetingA.endTimeIndex !== undefined &&
      meetingB.startTimeIndex !== undefined &&
      meetingB.endTimeIndex !== undefined
    ) {
      return meetingA.startTimeIndex <= meetingB.endTimeIndex && meetingA.endTimeIndex >= meetingB.startTimeIndex
    }

    // Otherwise use the original time-based overlap detection
    return meetingA.startTime < meetingB.endTime && meetingA.endTime > meetingB.startTime
  }

  // Determine layout type based on number of meetings
  const getLayoutType = (meetingCount: number) => {
    switch (meetingCount) {
      case 1:
        return "single"
      case 2:
        return "dual-horizontal"
      case 3:
        return "triple"
      case 4:
        return "quad"
      default:
        return "single" // Default to regular layout for more than 4
    }
  }

  // Group meetings that occur at the same time period
  const groupOverlappingMeetings = (dayMeetings: Meeting[]): Meeting[][] => {
    if (dayMeetings.length <= 1) return [dayMeetings]

    const groups: Meeting[][] = []
    const assigned = new Set<string>()

    // Sort meetings by start time or start time index
    const sortedMeetings = [...dayMeetings].sort((a, b) => {
      // If both have time indices, use those
      if (a.startTimeIndex !== undefined && b.startTimeIndex !== undefined) {
        return a.startTimeIndex - b.startTimeIndex
      }
      // Otherwise fall back to start time
      return a.startTime.getTime() - b.startTime.getTime()
    })

    for (const meeting of sortedMeetings) {
      if (assigned.has(meeting.id)) continue

      const group = [meeting]
      assigned.add(meeting.id)

      for (const otherMeeting of sortedMeetings) {
        if (assigned.has(otherMeeting.id)) continue

        // Check if this meeting actually overlaps with any in the current group
        const hasOverlap = group.some((groupMeeting) => doMeetingsOverlap(groupMeeting, otherMeeting))

        if (hasOverlap) {
          group.push(otherMeeting)
          assigned.add(otherMeeting.id)
        }
      }

      groups.push(group)
    }

    return groups
  }

  const todayDate = new Date().toDateString()

  // Generate an array of 5 days starting from the week's start date
  const daysOfWeek = Array.from({ length: 5 }, (_, i) => {
    const day = new Date(week.startDate)
    day.setDate(day.getDate() + i)
    return day
  })

  return (
    <div className="flex flex-col md:mt-2">
      {/* Calendar grid */}
      <div className="flex border border-zinc-200 rounded-lg overflow-hidden shadow-lg bg-white">
        {/* Time column - moved to right side */}
        <TimeColumn timeSlots={timeStrings} timeSlotHeight={TIME_SLOT_HEIGHT} />
        {/* Days columns */}
        <div className="flex flex-1 overflow-x-auto">
          {daysOfWeek.map((dayDate, dayIdx) => {
            // Filter meetings for this day - IMPORTANT: Don't filter out EPT meetings
            const dayMeetings = meetings.filter((meeting) => {
              const meetingDate = new Date(meeting.date)
              return meetingDate.toDateString() === dayDate.toDateString()
            })

            // Group meetings for this day
            const meetingGroups = groupOverlappingMeetings(dayMeetings)

            // Use Arabic date from imported file if available, otherwise use formatted date
            const dayName =
              arabicDates && arabicDates[dayIdx]
                ? arabicDates[dayIdx]
                : dayDate.toLocaleDateString("ar-SA", { weekday: "short" })

            const isTodayDate = todayDate === dayDate.toDateString()

            return (
              <div key={dayIdx} className="flex-1 md:min-w-[120px] min-w-[250px] relative border-l border-zinc-200">
                {/* Day header */}
                <div
                  className={`h-16 sticky top-0 z-10 ${
                    isTodayDate ? "bg-[#025F5F]/80" : "bg-[#025F5F]"
                  } border-b border-zinc-200 px-2 flex flex-col justify-center items-center`}
                >
                  <p className="font-medium text-white">{dayName}</p>
                  <p className="text-sm text-zinc-200">{formatDate(dayDate)}</p>
                </div>

                {/* Time slots */}
                <div className="relative">
                  {timeSlots.map((slot, i) => {
                    const minute = slot.time.split(":")[1]
                    const hideBorder = minute === "00" || minute === "30"

                    return (
                      <div
                        key={i}
                        style={{ height: `${TIME_SLOT_HEIGHT}px` }}
                        className={hideBorder ? "" : "border-b border-zinc-400"}
                      />
                    )
                  })}

                  {/* Render meeting groups */}
                  {meetingGroups.map((group) => {
                    // Determine layout type based on number of meetings in this group
                    const layoutType = getLayoutType(group.length)

                    // Calculate available width per meeting
                    const availableWidth = group.length > 1 ? `calc(${100 / group.length}% - 6px)` : "calc(100% - 8px)"

                    return group.map((meeting, meetingIndex) => (
                      <MeetingBlock
                        key={meeting.id}
                        meeting={meeting}
                        timeSlotHeight={TIME_SLOT_HEIGHT}
                        layoutType={layoutType}
                        layoutPosition={meetingIndex}
                        availableWidth={availableWidth}
                        totalMeetings={group.length}
                      />
                    ))
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
