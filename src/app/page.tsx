"use client";

import { useState } from "react";
import Calendar from "@/components/Calendar";
import AddMeetingModal from "@/components/AddMeetingModal";
import FileUploadModal from "@/components/FileUploadModal";
import type { Meeting, WeekData } from "@/types";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Plus, Upload } from "lucide-react";

export default function Home() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [arabicDates, setArabicDates] = useState<string[]>([]);
  const [hasImportedData, setHasImportedData] = useState(false);

  // Create a single week that will be updated when file is imported
  const [currentWeek, setCurrentWeek] = useState<WeekData>({
    weekNumber: 1,
    startDate: new Date(),
    endDate: new Date(),
  });

  const addMeeting = (meeting: Meeting) => {
    setMeetings([...meetings, meeting]);
    setIsAddModalOpen(false);
  };

  const importMeetings = (
    importedMeetings: Meeting[],
    importedArabicDates: string[]
  ) => {
    // Set the imported meetings
    setMeetings(importedMeetings);

    // Set the Arabic dates
    setArabicDates(importedArabicDates);

    // Find the earliest and latest dates from the imported meetings
    if (importedMeetings.length > 0) {
      // Sort meetings by date
      const sortedMeetings = [...importedMeetings].sort(
        (a, b) => a.date.getTime() - b.date.getTime()
      );

      // Get the earliest and latest dates
      const earliestDate = new Date(sortedMeetings[0].date);
      const latestDate = new Date(
        sortedMeetings[sortedMeetings.length - 1].date
      );

      // Set the current week to span from earliest to latest date
      setCurrentWeek({
        weekNumber: 1,
        startDate: earliestDate,
        endDate: latestDate,
      });

      setHasImportedData(true);
    }

    setIsImportModalOpen(false);

    // Show success notification
    alert(`تم استيراد ${importedMeetings.length} اجتماعات بنجاح`);
  };

  return (
    <main className="min-h-screen bg-zinc-100" dir="rtl">
      <header className="bg-white border-b border-zinc-200 p-3 md:p-4">
        <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-0">
          <h1 className="text-xl sm:text-2xl font-bold text-[#0C4C1E] flex items-center order-1">
            <CalendarIcon className="h-5 w-5 sm:h-6 sm:w-6 ml-1 sm:ml-2" />
            <span>جدول الاجتماعات</span>
          </h1>
          <div className="flex md:flex-row flex-col items-center gap-2 w-full sm:w-auto order-2">
            <Button
              onClick={() => setIsImportModalOpen(true)}
              variant="outline"
              className="border-zinc-300 bg-zinc-200 hover:bg-zinc-200 text-sm sm:text-base px-2 sm:px-3 py-1 flex-1 sm:flex-none"
            >
              <Upload className="h-3.5 w-3.5 sm:h-4 sm:w-4 ml-1" />
              <span>استيراد</span>
            </Button>
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-[#0D4E1E] hover:bg-lime-700 text-zinc-100 text-sm sm:text-base px-2 sm:px-3 py-1 flex-1 sm:flex-none"
            >
              <Plus className="h-4 w-4 sm:h-5 sm:w-5 ml-1" />
              <span>إضافة اجتماع</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="container md:p-4">
        {hasImportedData ? (
          <Calendar
            week={currentWeek}
            meetings={meetings}
            arabicDates={arabicDates}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-[60vh] bg-zinc-200 rounded-lg border border-zinc-300 p-8">
            <Upload className="h-16 w-16 text-zinc-700 mb-4" />
            <h2 className="text-xl font-semibold mb-2">لا توجد بيانات</h2>
            <p className="text-zinc-500 text-center mb-6">
              قم بتحميل ملف XLSM لعرض جدول الاجتماعات
            </p>
            <Button
              onClick={() => setIsImportModalOpen(true)}
              className="bg-[#025F5F] hover:bg-[#014242] text-zinc-100"
            >
              <Upload className="h-4 w-4 ml-1" />
              استيراد ملف
            </Button>
          </div>
        )}
      </div>

      {isAddModalOpen && (
        <AddMeetingModal
          onClose={() => setIsAddModalOpen(false)}
          onAdd={addMeeting}
          weeks={[currentWeek]}
        />
      )}

      {isImportModalOpen && (
        <FileUploadModal
          onClose={() => setIsImportModalOpen(false)}
          onImport={importMeetings}
        />
      )}
    </main>
  );
}
