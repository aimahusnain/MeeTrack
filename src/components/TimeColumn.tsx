// src/components/TimeColumn.tsx
interface TimeColumnProps {
  timeSlots: string[];
  timeSlotHeight: number;
}

export default function TimeColumn({ timeSlots, timeSlotHeight }: TimeColumnProps) {
  return (
    <div className="w-16 sm:w-24 bg-zinc-900 border-r border-zinc-800 flex-shrink-0">
      <div className="h-16"></div> {/* Spacer for day header */}
      <div>
        {timeSlots.map((time, i) => {
          const isFullHour = time.endsWith('00');
          const isHalfHour = time.endsWith('30');
          const is15Min = time.endsWith('15') || time.endsWith('45');
          
          return (
            <div 
              key={i} 
              className="relative"
              style={{ height: `${timeSlotHeight}px` }}
            >
              {/* Text positioned at the bottom of the previous cell, above the line */}
              {isFullHour && (
                <span className="absolute bottom-0 right-2 text-zinc-300 text-sm font-medium whitespace-nowrap transform translate-y-[-50%]">
                  {time.split(':')[0]}
                </span>
              )}
              {isHalfHour && (
                <span className="absolute bottom-0 right-2 text-zinc-400 text-xs whitespace-nowrap transform translate-y-[-50%]">
                  {time}
                </span>
              )}
              {is15Min && (
                <span className="absolute bottom-0 right-2 text-zinc-500 text-xs whitespace-nowrap transform translate-y-[-50%]">
                  {time}
                </span>
              )}
              
              {/* Border line at the bottom of the cell */}
              <div 
                className={`absolute bottom-0 w-full ${
                  isFullHour 
                    ? 'border-b border-zinc-700 bg-zinc-800/20' 
                    : isHalfHour 
                      ? 'border-b border-zinc-800' 
                      : 'border-b border-zinc-800/50'
                }`}
              ></div>
            </div>
          );
        })}
      </div>
    </div>
  );
}