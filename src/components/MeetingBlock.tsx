'use client';
import { useState } from 'react';
import { Meeting } from '@/types';
import { X } from 'lucide-react';

interface MeetingBlockProps {
  meeting: Meeting;
  timeSlotHeight: number;
  overlappingMeetings: Meeting[];
  overlapIndex: number;
}

export default function MeetingBlock({ 
  meeting, 
  timeSlotHeight,
  overlappingMeetings,
  overlapIndex
}: MeetingBlockProps) {
  const [isOpen, setIsOpen] = useState(false);

  const getTimePosition = (date: Date): number => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const totalMinutes = hours * 60 + minutes;
    const startMinutes = 8 * 60;
    const position = (totalMinutes - startMinutes) / 15;
    return Math.max(0, position);
  };

  const startPosition = getTimePosition(meeting.startTime);
  const durationMs = meeting.endTime.getTime() - meeting.startTime.getTime();
  const durationMinutes = durationMs / (1000 * 60);
  const durationSlots = durationMinutes / 15;
  const baseHeight = Math.max(timeSlotHeight, durationSlots * timeSlotHeight);
  const isShortMeeting = baseHeight < 60;

  const startTimeDisplay = meeting.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  const endTimeDisplay = meeting.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

  const colors = [
    { bg: 'bg-lime-950', border: 'border-lime-500', text: 'text-lime-400', dark: 'bg-lime-900', darkText: 'text-lime-100' },
    { bg: 'bg-indigo-950', border: 'border-indigo-500', text: 'text-indigo-400', dark: 'bg-indigo-900', darkText: 'text-indigo-100' },
    { bg: 'bg-amber-950', border: 'border-amber-500', text: 'text-amber-400', dark: 'bg-amber-900', darkText: 'text-amber-100' },
    { bg: 'bg-emerald-950', border: 'border-emerald-500', text: 'text-emerald-400', dark: 'bg-emerald-900', darkText: 'text-emerald-100' },
    { bg: 'bg-violet-950', border: 'border-violet-500', text: 'text-violet-400', dark: 'bg-violet-900', darkText: 'text-violet-100' },
    { bg: 'bg-rose-950', border: 'border-rose-500', text: 'text-rose-400', dark: 'bg-rose-900', darkText: 'text-rose-100' },
    { bg: 'bg-cyan-950', border: 'border-cyan-500', text: 'text-cyan-400', dark: 'bg-cyan-900', darkText: 'text-cyan-100' },
  ];

  const colorIndex = parseInt(meeting.id.slice(-1), 16) % colors.length;
  const colorScheme = colors[colorIndex];

  const location = "Bahria Town / Zoom";

  // Calculate overlap width and position
  const totalOverlaps = overlappingMeetings.length;
  const overlapWidth = totalOverlaps > 0 ? 100 / totalOverlaps : 100;
  const overlapLeft = overlapIndex * overlapWidth;

  return (
    <>
      {/* Meeting Block - visible when not expanded */}
      <div
        onClick={() => setIsOpen(true)}
        className={`absolute my-1 rounded-md ${colorScheme.bg} border-l-4 ${colorScheme.border} shadow-md overflow-hidden backdrop-blur-sm z-10 transition-all hover:shadow-lg group cursor-pointer`}
        style={{
          top: `${startPosition * timeSlotHeight}px`,
          height: `${baseHeight + 22}px`,
          minHeight: `${timeSlotHeight}px`,
          width: `calc(${overlapWidth}% - 2px)`,
          left: `${overlapLeft}%`,
        }}
      >
        {/* Top Header */}
        <div className={`w-full ${colorScheme.dark} px-2 py-1`}>
          <p className={`text-xs font-medium ${colorScheme.darkText} truncate`}>Muhammad Husnain</p>
        </div>

        {/* Content */}
        <div className="p-2 h-full overflow-hidden flex flex-col">
          <div className="flex flex-col gap-1">
            {/* Title */}
            <div className="relative w-full group">
              <p className={`text-sm font-medium ${colorScheme.text} truncate`} title={meeting.name}>
                {meeting.name}
              </p>
              <div className="absolute left-0 bottom-full mb-1 hidden group-hover:block z-20">
                <div className="bg-zinc-800 text-white text-xs p-1 rounded shadow-lg max-w-xs whitespace-normal">
                  {meeting.name}
                </div>
              </div>
            </div>

            {/* Time badge */}
            {!isShortMeeting && (
              <span className="text-xs bg-zinc-900/60 rounded-md px-1.5 py-0.5 text-zinc-300">
                {startTimeDisplay} - {endTimeDisplay}
              </span>
            )}
          </div>

          {/* Description */}
          {baseHeight > 48 && meeting.description && (
            <p className="text-xs text-zinc-300 mt-1 line-clamp-2 overflow-hidden">
              {meeting.description}
            </p>
          )}

          {/* Footer */}
          <div className="flex items-center mt-auto">
            <span className="text-xs text-zinc-400 truncate">{location}</span>
          </div>
        </div>
      </div>

      {/* Modal Dialog - visible when expanded */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setIsOpen(false)}>
          <div 
            className={`w-11/12 max-w-md bg-zinc-900 text-white shadow-xl rounded-lg p-6 border ${colorScheme.border}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">{meeting.name}</h2>
              <button 
                onClick={() => setIsOpen(false)} 
                className="p-1 rounded-full hover:bg-zinc-800"
              >
                <X size={20} className="text-zinc-400 hover:text-white" />
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="flex">
                <div className="w-24 text-sm font-medium text-zinc-400">Organizer:</div>
                <div className="text-sm text-zinc-300">Muhammad Husnain</div>
              </div>
              
              <div className="flex">
                <div className="w-24 text-sm font-medium text-zinc-400">Time:</div>
                <div className="text-sm text-zinc-300">
                  {startTimeDisplay} - {endTimeDisplay}
                </div>
              </div>
              
              <div className="flex">
                <div className="w-24 text-sm font-medium text-zinc-400">Location:</div>
                <div className="text-sm text-zinc-300">{location}</div>
              </div>
            </div>
            
            {meeting.description && (
              <div className="pt-4 border-t border-zinc-800 mt-4">
                <div className="text-sm font-medium text-zinc-400 mb-2">Description:</div>
                <div className="text-sm text-zinc-200 whitespace-pre-wrap">
                  {meeting.description}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}