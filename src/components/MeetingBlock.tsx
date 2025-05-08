"use client";

import type { Meeting } from "@/types";
import { Clock, ScanEye, MapPin, User } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

interface MeetingBlockProps {
  meeting: Meeting;
  timeSlotHeight: number;
  layoutType: "single" | "dual-horizontal" | "triple" | "quad";
  layoutPosition: number;
  availableWidth?: string;
  totalMeetings?: number;
}

export default function MeetingBlock({
  meeting,
  timeSlotHeight,
  layoutType,
  layoutPosition,
  availableWidth,
  totalMeetings = 1,
}: MeetingBlockProps) {
  // Replace with this new implementation that only considers very light colors
  const isVeryLightColor = (color: string): boolean => {
    // Extract the color name from the Tailwind class
    const colorMatch =
      color.match(/bg-\[#([0-9A-Fa-f]{6})\]/) ||
      color.match(/bg-([a-z]+-[0-9]+)/);

    if (!colorMatch) return false;

    // If it's a hex color
    if (
      colorMatch &&
      (colorMatch[1].startsWith("#") || colorMatch[0].includes("[#"))
    ) {
      const hex = colorMatch[1].replace("#", "");
      // Convert hex to RGB
      const r = Number.parseInt(hex.substring(0, 2), 16);
      const g = Number.parseInt(hex.substring(2, 4), 16);
      const b = Number.parseInt(hex.substring(4, 6), 16);

      // Calculate relative luminance
      // Using the formula: 0.299*R + 0.587*G + 0.114*B
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

      // Only return true for very light colors (luminance > 0.75)
      return luminance > 0.75;
    }

    // For Tailwind color classes - only include the lightest variants
    const veryLightColors = [
      "bg-white",
      "bg-zinc-100",
      "bg-gray-100",
      "bg-slate-100",
      "bg-amber-100",
      "bg-yellow-100",
      "bg-lime-100",
      "bg-green-100",
      "bg-emerald-100",
      "bg-teal-100",
      "bg-cyan-100",
      "bg-sky-100",
      "bg-blue-100",
      "bg-indigo-100",
      "bg-violet-100",
      "bg-purple-100",
      "bg-fuchsia-100",
      "bg-pink-100",
      "bg-rose-100",
      "bg-orange-100",
      "bg-red-100",
      // Add specific colors that should have black text
      "bg-[#C8EEFD]", // Light blue color from your constants
    ];

    return veryLightColors.some((lightColor) => color.includes(lightColor));
  };

  // Get text color based on background color
  const getTextColor = (bgColor: string): string => {
    return isVeryLightColor(bgColor) ? "text-black" : "text-white";
  };

  let topPosition: number;
  let height: number;
  let durationInMinutes = 0;

  if (
    meeting.startTimeIndex !== undefined &&
    meeting.endTimeIndex !== undefined
  ) {
    const startSlot = meeting.startTimeIndex - 1;
    const endSlot = meeting.endTimeIndex - 1;
    topPosition = startSlot * timeSlotHeight;
    height = (endSlot - startSlot + 1) * timeSlotHeight;
    durationInMinutes = (endSlot - startSlot + 1) * 15;
  } else {
    const startHour = meeting.startTime.getHours();
    const startMinute = meeting.startTime.getMinutes();
    const endHour = meeting.endTime.getHours();
    const endMinute = meeting.endTime.getMinutes();

    const startTimeInMinutes = (startHour - 8) * 60 + startMinute;
    const endTimeInMinutes = (endHour - 8) * 60 + endMinute;
    durationInMinutes = endTimeInMinutes - startTimeInMinutes;

    topPosition = (startTimeInMinutes / 15) * timeSlotHeight;
    height = (durationInMinutes / 15) * timeSlotHeight;
  }

  const bgColor = meeting.color || "bg-lime-950";
  const borderColor = bgColor.replace("bg-", "border-");

  const isShortMeeting = durationInMinutes <= 60;
  const isSmallBlock = height < 150;
  const isDivided = totalMeetings > 1;
  const isLongMeeting = durationInMinutes >= 120;

  const width = availableWidth || "100%";
  let left = "0%";

  switch (layoutType) {
    case "single":
      left = "4px";
      break;
    case "dual-horizontal":
      left = layoutPosition === 0 ? "4px" : "calc(50% + 2px)";
      break;
    case "triple":
      if (layoutPosition === 0) left = "4px";
      else if (layoutPosition === 1) left = "calc(33.33% + 2px)";
      else left = "calc(66.66% + 2px)";
      break;
    case "quad":
      if (layoutPosition === 0) left = "4px";
      else if (layoutPosition === 1) left = "calc(25% + 2px)";
      else if (layoutPosition === 2) left = "calc(50% + 2px)";
      else left = "calc(75% + 2px)";
      break;
  }

  const formatTime = (date: Date) => {
    // Get hours and minutes in English numerals
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");

    // Determine if it's AM or PM
    const isPM = hours >= 12;
    const displayHours = hours % 12 || 12; // Convert to 12-hour format

    // Add Arabic AM/PM indicator
    const amPmIndicator = isPM ? "م" : "ص";

    return `${displayHours}:${minutes} ${amPmIndicator}`;
  };

  const formatTimeRange = () => {
    const start = formatTime(meeting.startTime);
    const end = formatTime(meeting.endTime);
    return `${start} - ${end}`;
  };

  const useTwoColumnLayout =
    layoutType === "dual-horizontal" &&
    !isShortMeeting &&
    height >= 80 &&
    !isDivided;
    const InfoButton = () => (
      <Dialog>
        <DialogTrigger asChild>
          <button
            className="absolute bottom-2 right-2 p-1 rounded-md bg-zinc-800/50 backdrop-blur-xl hover:bg-zinc-700 text-white shadow-lg z-30 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={(e) => e.stopPropagation()}
          >
            <ScanEye className="h-3 w-3" />
          </button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-lg border-0 p-0 shadow-xl rounded-xl overflow-hidden bg-white" dir="rtl">
          {/* Header */}
          <div className={`${bgColor} ${getTextColor(bgColor)} px-5 py-4 flex justify-between items-center`}>
            <DialogTitle className="text-lg font-medium">{meeting.name}</DialogTitle>
            <DialogClose className="rounded-full p-1 hover:bg-white/20 transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </DialogClose>
          </div>
          
          {/* Content - 2 rows layout */}
          <div className="p-5 space-y-4">
            {/* First row - Time information */}
            <div className="bg-zinc-50 p-4 rounded-lg w-full">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:gap-8">
                <div className="mb-4 sm:mb-0">
                  <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 mb-1">وقت البدء</p>
                  <div className="flex items-center justify-end">
                    <span className="text-sm font-medium text-zinc-900">{formatTime(meeting.startTime)}</span>
                  </div>
                </div>
                
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 mb-1">وقت الانتهاء</p>
                  <div className="flex items-center justify-end">
                    <span className="text-sm font-medium text-zinc-900">{formatTime(meeting.endTime)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Second row - 2 columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* First column - Organizer */}
              {meeting.organizer && meeting.organizer !== "undefined" && meeting.organizer !== "غير متوفر" ? (
                <div className="bg-zinc-50 p-3 rounded-lg">
                  <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 mb-1">المنظّم</p>
                  <div className="flex items-center justify-end">
                    <span className="text-sm font-medium text-zinc-900">{meeting.organizer}</span>
                    <div className="w-6 h-6 rounded-full bg-zinc-200 flex items-center justify-center text-zinc-600 mr-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3 w-3"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="hidden sm:block" /> // Empty placeholder for grid alignment when no organizer
              )}
              
              {/* Second column - Location */}
              {meeting.location && (
                <div className="bg-zinc-50 p-3 rounded-lg">
                  <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 mb-1">الموقع</p>
                  <div className="flex items-center justify-end">
                    <span className="text-sm font-medium text-zinc-900">{meeting.location}</span>
                    <div className="w-6 h-6 rounded-full bg-zinc-200 flex items-center justify-center text-zinc-600 mr-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3 w-3"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                      </svg>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Close button */}
            <div className="mt-5 flex justify-end">
              <DialogClose className="px-4 py-2 text-xs font-medium text-white bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500">
                إغلاق
              </DialogClose>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );

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
          <h3
            className={`font-medium text-xs ${getTextColor(
              bgColor
            )} px-1 text-center break-words`}
          >
            {meeting.name}
          </h3>
        </div>
        <InfoButton />
      </div>
    );
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
            <h3 className="font-semibold text-sm text-zinc-800 mb-1 line-clamp-2 break-words">
              {meeting.name}
            </h3>
            <div className="flex items-center text-xs text-zinc-500 mb-1">
              <Clock className="h-3 w-3 ml-1 flex-shrink-0" />
              <span className="break-words">{formatTimeRange()}</span>
            </div>
            <div className="flex flex-wrap gap-x-3 mt-auto">
              {meeting.organizer &&
                meeting.organizer !== "undefined" &&
                meeting.organizer !== "غير متوفر" && (
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
        <InfoButton />
      </div>
    );
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
          <h3
            className={`text-xs text-center ${getTextColor(
              bgColor
            )} break-words`}
          >
            {meeting.organizer}
          </h3>
        </div>
        <div>
          <div className="flex items-center justify-center border-b border-zinc-200 bg-zinc-50 py-1">
            <div className="text-[10px] text-black flex gap-1 items-center">
              {formatTime(meeting.startTime)} - {formatTime(meeting.endTime)}
            </div>
          </div>
          <div className="flex flex-col items-center justify-center p-1">
            <span className="break-words text-center text-[12px]">
              {meeting.name}
            </span>
            <div className="text-[10px] text-black flex items-center mt-2">
              <MapPin className="h-3 w-3 ml-1 flex-shrink-0" />
              <span className="break-words">{meeting.location}</span>
            </div>
          </div>
        </div>
        <InfoButton />
      </div>
    );
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
          <h3
            className={`font-medium text-[10px] ${getTextColor(
              bgColor
            )} text-center break-words`}
          >
            {meeting.name}
          </h3>
          <div className="text-[8px] text-zinc-500 mt-auto">
            {formatTime(meeting.startTime)}
          </div>
          <div className="text-[8px] text-zinc-500 mt-auto">
            {formatTime(meeting.endTime)}
          </div>
        </div>
        <InfoButton />
      </div>
    );
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
          <h3 className="font-medium text-xs text-zinc-800 break-words">
            {meeting.name}
          </h3>
          <div className="text-[8px] text-zinc-500 mt-auto">
            {formatTime(meeting.startTime)}
          </div>
          <div className="text-[8px] text-zinc-500 mt-auto">
            {formatTime(meeting.endTime)}
          </div>
        </div>
        <InfoButton />
      </div>
    );
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
        <div
          className={`w-full text-center text-sm ${getTextColor(
            bgColor
          )} py-1.5 ${bgColor} flex items-center justify-center`}
        >
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
          <div
            className={`w-14 p-1 pt-3 flex-shrink-0 flex flex-col ${
              isLongMeeting ? "items-start justify-center" : ""
            } border-r border-zinc-200 bg-zinc-50`}
          >
            <div className="text-[10px] text-black whitespace-nowrap">
              {formatTime(meeting.startTime)}
            </div>
            <div className="text-[10px] text-black whitespace-nowrap mt-1">
              {formatTime(meeting.endTime)}
            </div>
          </div>
          <div
            className={`flex flex-col p-2 flex-1 ${
              isLongMeeting ? "items-center justify-center text-center" : ""
            }`}
          >
            {meeting.organizer && (
              <h3 className="font-medium text-sm text-zinc-800 break-words">
                {meeting.name}
              </h3>
            )}
            {meeting.location && (
              <div className="text-xs text-zinc-600 mt-1 flex items-center">
                <MapPin className="h-3 w-3 ml-1 flex-shrink-0" />
                <span className="break-words">{meeting.location}</span>
              </div>
            )}
          </div>
        </div>
        <InfoButton />
      </div>
    );
  }
}
