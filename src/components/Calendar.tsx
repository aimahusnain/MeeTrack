// src/components/Calendar.tsx
import TimeColumn from './TimeColumn';
import MeetingBlock from './MeetingBlock';
import { Meeting, WeekData } from '@/types';
import { Button } from "@/components/ui/button";

interface CalendarProps {
  weeks: WeekData[];
  meetings: Meeting[];
  currentWeek: number;
  setCurrentWeek: (week: number) => void;
}

export default function Calendar({ weeks, meetings, currentWeek, setCurrentWeek }: CalendarProps) {
  // Time slot height in pixels - must match other components
  const TIME_SLOT_HEIGHT = 30; // Increased height for better visibility
  
  // Generate time slots from 8:00 to 20:00 with 15-minute intervals
  const timeSlots = Array.from({ length: 49 }, (_, i) => {
    const hour = Math.floor(i / 4) + 8;
    const minute = (i % 4) * 15;
    const formattedHour = hour.toString().padStart(2, '0');
    const formattedMinute = minute.toString().padStart(2, '0');
    return `${formattedHour}:${formattedMinute}`;
  });

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const isDisplayedWeek = (weekIdx: number) => {
    return weekIdx === currentWeek;
  };

  // Function to check if two meetings overlap in time
  const doMeetingsOverlap = (meetingA: Meeting, meetingB: Meeting): boolean => {
    return meetingA.startTime < meetingB.endTime && meetingA.endTime > meetingB.startTime;
  };

  // Group meetings into overlap groups
  const groupOverlappingMeetings = (dayMeetings: Meeting[]): Map<string, Meeting[]> => {
    const overlapGroups = new Map<string, Meeting[]>();
    
    // Sort meetings by start time (and then by end time for equal start times)
    const sortedMeetings = [...dayMeetings].sort((a, b) => {
      const startDiff = a.startTime.getTime() - b.startTime.getTime();
      if (startDiff === 0) {
        return a.endTime.getTime() - b.endTime.getTime();
      }
      return startDiff;
    });
    
    // Process each meeting in the sorted order
    for (const meeting of sortedMeetings) {
      // Check if the meeting overlaps with any existing groups
      let foundGroup = false;
      
      for (const [groupId, groupMeetings] of overlapGroups.entries()) {
        // Check if the current meeting overlaps with any meeting in the group
        const overlapsWithGroup = groupMeetings.some(groupMeeting => 
          doMeetingsOverlap(meeting, groupMeeting)
        );
        
        if (overlapsWithGroup) {
          // Add the meeting to this group
          overlapGroups.set(groupId, [...groupMeetings, meeting]);
          foundGroup = true;
          break;
        }
      }
      
      // If the meeting doesn't overlap with any existing group, create a new group
      if (!foundGroup) {
        const groupId = `group_${overlapGroups.size + 1}`;
        overlapGroups.set(groupId, [meeting]);
      }
    }
    
    return overlapGroups;
  };

  const todayDate = new Date().toDateString();

  return (
    <div className="flex flex-col mt-6">
      {/* Week selector */}
      <div className="flex justify-center mb-6 overflow-x-auto">
        <div className="flex bg-zinc-800 rounded-lg p-1 shadow-inner">
          {weeks.map((week, idx) => {
            const startDateFormatted = formatDate(week.startDate);
            const endDateFormatted = formatDate(week.endDate);
            
            return (
              <Button
                key={week.weekNumber}
                variant={currentWeek === idx ? "default" : "ghost"}
                className={`px-4 py-2 text-sm transition-all ${
                  currentWeek === idx 
                    ? 'bg-lime-600 text-zinc-100 hover:bg-lime-700' 
                    : 'hover:bg-zinc-700 text-zinc-300'
                }`}
                onClick={() => setCurrentWeek(idx)}
              >
                <span className="hidden sm:inline mr-1">Week</span> {week.weekNumber}
                <span className="hidden md:inline ml-1 text-xs opacity-70">
                  ({startDateFormatted} - {endDateFormatted})
                </span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Calendar grid */}
      <div className="flex border border-zinc-800 rounded-lg overflow-hidden shadow-lg bg-zinc-900">
        {/* Time column */}
        <TimeColumn timeSlots={timeSlots} timeSlotHeight={TIME_SLOT_HEIGHT} />
        
        {/* Days columns */}
        {weeks.map((week, weekIdx) => (
          isDisplayedWeek(weekIdx) && (
            <div key={week.weekNumber} className="flex flex-1 overflow-x-auto">
              {Array.from({ length: 7 }, (_, dayIdx) => {
                const dayDate = new Date(week.startDate);
                dayDate.setDate(dayDate.getDate() + dayIdx);
                
                const dayMeetings = meetings.filter(meeting => {
                  const meetingDate = new Date(meeting.date);
                  return meetingDate.toDateString() === dayDate.toDateString();
                });

                // Group overlapping meetings
                const overlapGroups = groupOverlappingMeetings(dayMeetings);

                const dayName = dayDate.toLocaleDateString('en-US', { weekday: 'short' });
                const isToday = todayDate === dayDate.toDateString();
                
                return (
                  <div key={dayIdx} className="flex-1 min-w-[120px] relative border-l border-zinc-800">
                    {/* Day header */}
                    <div className={`h-16 sticky top-0 z-10 ${isToday ? 'bg-lime-900/30' : 'bg-zinc-900'} border-b border-zinc-800 px-2 flex flex-col justify-center items-center`}>
                      <p className={`font-medium ${isToday ? 'text-lime-400' : 'text-zinc-200'}`}>{dayName}</p>
                      <div className={`text-sm mt-0.5 ${isToday ? 'bg-lime-700 text-lime-100 px-2 rounded-full' : 'text-zinc-400'}`}>
                        {formatDate(dayDate)}
                      </div>
                    </div>
                    
                    {/* Time slots */}
                    <div className="relative">
                      {timeSlots.map((time, i) => {
                        const isHalfHour = time.endsWith('30');
                        const isFullHour = time.endsWith('00');
                        
                        return (
                          <div 
                            key={i} 
                            style={{ height: `${TIME_SLOT_HEIGHT}px` }}
                            className={`${
                              isFullHour 
                                ? 'border-b border-zinc-700 bg-zinc-800/20' 
                                : isHalfHour 
                                  ? 'border-b border-zinc-800' 
                                  : 'border-b border-zinc-800/50'
                            }`}
                          />
                        );
                      })}
                      
                      {/* Render meetings, handling overlaps */}
                      {Array.from(overlapGroups.values()).map(groupMeetings => (
                        groupMeetings.map((meeting, index) => (
                          <MeetingBlock 
                            key={meeting.id} 
                            meeting={meeting} 
                            timeSlotHeight={TIME_SLOT_HEIGHT}
                            overlappingMeetings={groupMeetings}
                            overlapIndex={index}
                          />
                        ))
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ))}
      </div>
    </div>
  );
}