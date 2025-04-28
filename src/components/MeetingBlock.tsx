'use client';
import { Meeting } from '@/types';
import { X } from 'lucide-react';
import {
  MorphingDialog,
  MorphingDialogTrigger,
  MorphingDialogContent,
  MorphingDialogTitle,
  MorphingDialogSubtitle,
  MorphingDialogClose,
  MorphingDialogDescription,
  MorphingDialogContainer,
} from '@/components/ui/morphing-dialog';

interface MeetingBlockProps {
  meeting: Meeting;
  timeSlotHeight: number;
  overlappingMeetings: Meeting[];
  overlapIndex: number;
  layoutType: 'single' | 'dual-horizontal' | 'triple' | 'quad';
  layoutPosition: number; // 0-3 for position in the layout
}

export default function MeetingBlock({ 
  meeting, 
  timeSlotHeight,
  overlappingMeetings,
  overlapIndex,
  layoutType,
  layoutPosition,
}: MeetingBlockProps) {
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

  // Calculate position and size based on layout type
  let width = "100%";
  let left = "0%";
  let height = `${baseHeight}px`;
  let top = `${startPosition * timeSlotHeight}px`;
  let style: React.CSSProperties = {};
  let isCompact = false;

  switch (layoutType) {
    case 'single':
      // Single meeting takes full width
      width = "calc(100% - 4px)";
      left = "2px";
      style = {
        top,
        height: `${baseHeight + 2}px`,
        minHeight: `${timeSlotHeight}px`,
        width,
        left,
      };
      break;
      
    case 'dual-horizontal':
      // Two meetings stacked horizontally
      const isTop = layoutPosition === 0;
      height = isTop 
        ? `${baseHeight / 2 - 2}px` 
        : `${baseHeight / 2}px`;
      top = isTop 
        ? `${startPosition * timeSlotHeight}px` 
        : `${(startPosition * timeSlotHeight) + (baseHeight / 2)}px`;
      width = "calc(100% - 4px)";
      left = "2px";
      isCompact = true;
      style = { top, height, width, left };
      break;
      
    case 'triple':
      // Improved layout for three meetings:
      // All meetings get equal width at 33%
      width = "calc(33.33% - 3px)";
      
      if (layoutPosition === 0) {
        left = "1px";
      } else if (layoutPosition === 1) {
        left = "calc(33.33% + 1px)";
      } else {
        left = "calc(66.66% + 1px)";
      }
      
      // All meetings get full height
      height = `${baseHeight}px`;
      isCompact = baseHeight < 80; // Only compact if relatively short
      
      style = { top, height, width, left };
      break;
      
    case 'quad':
      // Four meetings in a 2x2 grid
      width = "calc(50% - 3px)";
      height = `${baseHeight / 2 - (layoutPosition < 2 ? 2 : 0)}px`;
      left = layoutPosition % 2 === 0 
        ? "2px" 
        : "calc(50% + 1px)";
      top = layoutPosition < 2 
        ? `${startPosition * timeSlotHeight}px` 
        : `${(startPosition * timeSlotHeight) + (baseHeight / 2)}px`;
      isCompact = true;
      style = { top, height, width, left };
      break;
  }

  const isEpt = meeting.isEpt === true;
  
  // Add a subtle indicator for EPT meetings
  const eptClasses = isEpt ? 'border-dashed' : '';

  return (
    <MorphingDialog
      transition={{
        type: 'spring',
        bounce: 0.05,
        duration: 0.25,
      }}
    >
      <MorphingDialogTrigger
        className={`absolute my-1 rounded-md ${colorScheme.bg} border-l-4 ${colorScheme.border} ${eptClasses} shadow-md overflow-hidden backdrop-blur-sm z-10 transition-all hover:shadow-lg group`}
        style={style}
      >
        {/* Top Header */}
        <div className={`w-full ${colorScheme.dark} px-2 py-1`}>
          <p className={`text-xs font-medium ${colorScheme.darkText} truncate flex items-center`}>
            <span className="truncate">Muhammad Husnain</span>
            {isEpt && <span className="ml-auto text-xs bg-yellow-600 px-1 rounded">EPT</span>}
          </p>
        </div>

        {/* Content */}
        <div className="p-2 h-full overflow-hidden flex flex-col">
          <div className="flex flex-col gap-1">
            {/* Title */}
            <MorphingDialogTitle>
              <p className={`text-sm font-medium ${colorScheme.text} truncate`} title={meeting.name}>
                {meeting.name}
              </p>
            </MorphingDialogTitle>

            {/* Time badge - hide in compact mode */}
            {!isCompact && !isShortMeeting && (
              <MorphingDialogSubtitle>
                <span className="text-xs bg-zinc-900/60 rounded-md px-1.5 py-0.5 text-zinc-300">
                  {startTimeDisplay} - {endTimeDisplay}
                </span>
              </MorphingDialogSubtitle>
            )}
          </div>

          {/* Description - hide in compact mode */}
          {!isCompact && baseHeight > 48 && meeting.description && (
            <p className="text-xs text-zinc-300 mt-1 line-clamp-2 overflow-hidden">
              {meeting.description}
            </p>
          )}

          {/* Footer - hide in compact mode */}
          {!isCompact && (
            <div className="flex justify-between items-center mt-auto">
              <span className="text-xs text-zinc-400 truncate">{location}</span>
            </div>
          )}
        </div>
      </MorphingDialogTrigger>

      <MorphingDialogContainer>
        <MorphingDialogContent
          className={`pointer-events-auto relative flex h-auto w-full flex-col overflow-hidden border ${colorScheme.border} ${eptClasses} ${colorScheme.bg} rounded-lg shadow-xl max-w-md`}
        >
          {/* Dialog Header */}
          <div className={`w-full ${colorScheme.dark} px-4 py-3`}>
            <MorphingDialogTitle className="text-lg font-bold text-white flex items-center justify-between">
              <span>{meeting.name}</span>
              {isEpt && <span className="text-xs bg-yellow-600 px-2 py-1 rounded">Engagement Pending Time</span>}
            </MorphingDialogTitle>
          </div>
          
          {/* Dialog Content */}
          <div className="p-4 flex flex-col space-y-4">
            <MorphingDialogSubtitle className="flex flex-col space-y-2">
              <p className="text-sm text-zinc-300">
                <strong>By:</strong> Muhammad Husnain
              </p>
              <p className="text-sm text-zinc-300">
                <strong>Time:</strong> {startTimeDisplay} - {endTimeDisplay}
              </p>
              <p className="text-sm text-zinc-300">
                <strong>Location:</strong> {location}
              </p>
              {isEpt && (
                <p className="text-sm text-yellow-400">
                  <strong>Status:</strong> Engagement Pending (awaiting confirmation)
                </p>
              )}
            </MorphingDialogSubtitle>
            
            {meeting.description && (
              <MorphingDialogDescription
                disableLayoutAnimation
                variants={{
                  initial: { opacity: 0, scale: 0.95, y: 20 },
                  animate: { opacity: 1, scale: 1, y: 0 },
                  exit: { opacity: 0, scale: 0.95, y: 20 },
                }}
                className="text-sm text-zinc-200 whitespace-pre-wrap border-t border-zinc-700 pt-4"
              >
                {meeting.description}
              </MorphingDialogDescription>
            )}
          </div>
          
          <MorphingDialogClose className="absolute top-3 right-3 text-zinc-400 hover:text-white">
            <X size={20} />
          </MorphingDialogClose>
        </MorphingDialogContent>
      </MorphingDialogContainer>
    </MorphingDialog>
  );
}