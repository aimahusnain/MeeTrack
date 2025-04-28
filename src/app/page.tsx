// src/app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Calendar from '@/components/Calendar';
import AddMeetingModal from '@/components/AddMeetingModal';
import { Meeting, WeekData } from '@/types';
import { Button } from "@/components/ui/button";
import { CalendarIcon, Plus } from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Home() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentWeek, setCurrentWeek] = useState(0);
  const [weeks, setWeeks] = useState<WeekData[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().getMonth().toString());
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());

  useEffect(() => {
    generateWeeks(parseInt(selectedMonth), parseInt(selectedYear));
  }, [selectedMonth, selectedYear]);

  const generateWeeks = (month: number, year: number) => {
    // Get the first day of the month
    const firstDay = new Date(year, month, 1);
    
    // Get the last day of the month
    const lastDay = new Date(year, month + 1, 0);
    
    // Find the first Sunday before or on the first day of the month
    const firstSunday = new Date(firstDay);
    firstSunday.setDate(firstSunday.getDate() - firstSunday.getDay());
    
    const generatedWeeks: WeekData[] = [];
    const currentDate = new Date(firstSunday);
    
    // Generate weeks until we go past the end of the month
    while (currentDate <= lastDay || generatedWeeks.length < 6) {
      const weekStartDate = new Date(currentDate);
      const weekEndDate = new Date(currentDate);
      weekEndDate.setDate(weekEndDate.getDate() + 6);
      
      generatedWeeks.push({
        weekNumber: getWeekNumber(weekStartDate),
        startDate: weekStartDate,
        endDate: weekEndDate
      });
      
      // Move to next week
      currentDate.setDate(currentDate.getDate() + 7);
      
      // Limit to 6 weeks max
      if (generatedWeeks.length >= 6) break;
    }
    
    setWeeks(generatedWeeks);
    setCurrentWeek(0);
  };

  const getWeekNumber = (date: Date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  const addMeeting = (meeting: Meeting) => {
    setMeetings([...meetings, meeting]);
    setIsModalOpen(false);
  };

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const years = Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - 1 + i).toString());

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="bg-zinc-900 border-b border-zinc-800 p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-lime-400 flex items-center">
            <CalendarIcon className="h-6 w-6 mr-2" />
            MeeTrack
          </h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Select
                value={selectedMonth}
                onValueChange={(value) => setSelectedMonth(value)}
              >
                <SelectTrigger className="w-[140px] bg-zinc-800 border-zinc-700">
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  {months.map((month, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={selectedYear}
                onValueChange={(value) => setSelectedYear(value)}
              >
                <SelectTrigger className="w-[100px] bg-zinc-800 border-zinc-700">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  {years.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              onClick={() => setIsModalOpen(true)}
              className="bg-lime-600 hover:bg-lime-700 text-zinc-100"
            >
              <Plus className="h-5 w-5 mr-1" />
              Add Meeting
            </Button>
          </div>
        </div>
      </header>
      
      <div className="container mx-auto p-4">
        <Calendar 
          weeks={weeks} 
          meetings={meetings} 
          currentWeek={currentWeek}
          setCurrentWeek={setCurrentWeek}
        />
      </div>
      
      {isModalOpen && (
        <AddMeetingModal 
          onClose={() => setIsModalOpen(false)} 
          onAdd={addMeeting}
          weeks={weeks}
        />
      )}
    </main>
  );
}