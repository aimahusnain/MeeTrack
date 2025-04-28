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

  // Determine layout type based on number of meetings
  const getLayoutType = (meetingCount: number) => {
    switch (meetingCount) {
      case 1: return 'single';
      case 2: return 'dual-horizontal';
      case 3: return 'triple';
      case 4: return 'quad';
      default: return 'single'; // Default to regular layout for more than 4
    }
  };

  // Group meetings that occur at the same time period
  const groupOverlappingMeetings = (dayMeetings: Meeting[]): Meeting[][] => {
    if (dayMeetings.length <= 1) return [dayMeetings];
    
    // If we have 2-4 meetings for the day, apply our special layouts
    if (dayMeetings.length >= 2 && dayMeetings.length <= 4) {
      return [dayMeetings];
    }
    
    // For more than 4 meetings, use traditional overlap detection
    const groups: Meeting[][] = [];
    const assigned = new Set<string>();
    
    // Sort meetings by start time
    const sortedMeetings = [...dayMeetings].sort(
      (a, b) => a.startTime.getTime() - b.startTime.getTime()
    );
    
    for (const meeting of sortedMeetings) {
      if (assigned.has(meeting.id)) continue;
      
      const group = [meeting];
      assigned.add(meeting.id);
      
      for (const otherMeeting of sortedMeetings) {
        if (assigned.has(otherMeeting.id)) continue;
        
        // Check if this meeting overlaps with any in the current group
        const hasOverlap = group.some(groupMeeting => 
          doMeetingsOverlap(groupMeeting, otherMeeting)
        );
        
        if (hasOverlap) {
          group.push(otherMeeting);
          assigned.add(otherMeeting.id);
        }
      }
      
      groups.push(group);
    }
    
    return groups;
  };

  // Filter EPT meetings for the current week - FIX: Added null check for weeks[weekIdx]
  const getEptMeetingsForWeek = (weekIdx: number): Meeting[] => {
    if (!isDisplayedWeek(weekIdx) || !weeks[weekIdx]) return [];
    
    const week = weeks[weekIdx];
    const weekStart = new Date(week.startDate);
    const weekEnd = new Date(week.endDate);
    weekEnd.setHours(23, 59, 59, 999); // End of the last day
    
    return meetings.filter(meeting => {
      const meetingDate = new Date(meeting.date);
      return meetingDate >= weekStart && 
             meetingDate <= weekEnd && 
             meeting.isEpt === true;
    });
  };
  
  // Get all EPT meetings for the currently displayed week
  // FIX: Ensure currentWeek is valid and weeks array has items
  const eptMeetings = weeks.length > 0 && currentWeek >= 0 && currentWeek < weeks.length
    ? getEptMeetingsForWeek(currentWeek) 
    : [];

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

      {/* Calendar grid - FIX: Check if weeks array has data */}
      {weeks.length > 0 ? (
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
                    return meetingDate.toDateString() === dayDate.toDateString() && !meeting.isEpt;
                  });

                  // Group meetings for this day
                  const meetingGroups = groupOverlappingMeetings(dayMeetings);

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
                        
                        {/* Render meeting groups */}
                        {meetingGroups.map((group, groupIndex) => {
                          // Determine layout type based on number of meetings in this group
                          const layoutType = getLayoutType(group.length);
                          
                          return group.map((meeting, meetingIndex) => (
                            <MeetingBlock 
                              key={meeting.id} 
                              meeting={meeting}
                              timeSlotHeight={TIME_SLOT_HEIGHT}
                              overlappingMeetings={group}
                              overlapIndex={meetingIndex}
                              layoutType={layoutType as any}
                              layoutPosition={meetingIndex}
                            />
                          ));
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center h-48 bg-zinc-900 rounded-lg border border-zinc-800">
          <p className="text-zinc-400">No calendar data available. Please select a month and year.</p>
        </div>
      )}

      {/* EPT Section */}
      {eptMeetings.length > 0 && (
        <div className="mt-8">
          <h2 className="font-semibold text-xl text-yellow-400 flex items-center mb-4">
            <span className="inline-block w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
            Engagement Pending Time (EPT)
          </h2>
          
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {eptMeetings.map(meeting => {
              const meetingDate = new Date(meeting.date);
              const dayName = meetingDate.toLocaleDateString('en-US', { weekday: 'short' });
              const dayDate = formatDate(meetingDate);
              
              // Get formatted times
              const startTime = meeting.startTime.toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit', 
                hour12: false 
              });
              
              const endTime = meeting.endTime.toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit', 
                hour12: false 
              });
              
              // Get color scheme based on meeting ID
              const colors = [
                { bg: 'bg-lime-950', border: 'border-lime-500', text: 'text-lime-400' },
                { bg: 'bg-indigo-950', border: 'border-indigo-500', text: 'text-indigo-400' },
                { bg: 'bg-amber-950', border: 'border-amber-500', text: 'text-amber-400' },
                { bg: 'bg-emerald-950', border: 'border-emerald-500', text: 'text-emerald-400' },
                { bg: 'bg-violet-950', border: 'border-violet-500', text: 'text-violet-400' },
                { bg: 'bg-rose-950', border: 'border-rose-500', text: 'text-rose-400' },
                { bg: 'bg-cyan-950', border: 'border-cyan-500', text: 'text-cyan-400' },
              ];
              
              const colorIndex = parseInt(meeting.id.slice(-1), 16) % colors.length;
              const colorScheme = colors[colorIndex];
              
              return (
                <div 
                  key={meeting.id}
                  className={`${colorScheme.bg} border-l-4 ${colorScheme.border} border-dashed rounded-md shadow-md overflow-hidden`}
                >
                  {/* Meeting card with EPT styling */}
                  <div className="p-3">
                    <h3 className={`font-medium ${colorScheme.text}`}>{meeting.name}</h3>
                    <div className="mt-2 flex items-center text-sm text-zinc-300">
                      <span className="bg-yellow-600 text-yellow-100 text-xs px-1.5 rounded mr-2">EPT</span>
                      <span>{dayName}, {dayDate}</span>
                    </div>
                    <div className="mt-1 text-sm text-zinc-400">
                      {startTime} - {endTime}
                    </div>
                    {meeting.description && (
                      <p className="mt-2 text-sm text-zinc-300 line-clamp-2">{meeting.description}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}