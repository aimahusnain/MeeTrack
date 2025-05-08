"use client"

import type React from "react"

import { useState } from "react"
import type { Meeting, WeekData, TimeOption } from "@/types"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, CalendarIcon, Clock } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"

interface AddMeetingModalProps {
  onClose: () => void
  onAdd: (meeting: Meeting) => void
  weeks: WeekData[]
}

export default function AddMeetingModal({ onClose, onAdd, weeks }: AddMeetingModalProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [organizer, setOrganizer] = useState("")
  const [location, setLocation] = useState("")
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [startTime, setStartTime] = useState<string>("")
  const [endTime, setEndTime] = useState<string>("")
  const [isEpt, setIsEpt] = useState(false)

  // Generate available dates from the weeks
  const availableDates: { value: string; label: string; date: Date }[] = []
  weeks.forEach((week) => {
    const startDate = new Date(week.startDate)
    for (let i = 0; i < 5; i++) {
      const date = new Date(startDate)
      date.setDate(date.getDate() + i)

      const formattedDate = date.toISOString().split("T")[0]
      const dayName = date.toLocaleDateString("ar-SA", { weekday: "long" })
      const dayNumber = date.toLocaleDateString("ar-SA", { day: "numeric" })
      const monthName = date.toLocaleDateString("ar-SA", { month: "long" })

      availableDates.push({
        value: formattedDate,
        label: `${dayName} ${dayNumber} ${monthName}`,
        date,
      })
    }
  })

  // Generate time options (8:00 AM to 8:00 PM in 15-minute increments)
  const timeOptions: TimeOption[] = []
  for (let hour = 8; hour <= 20; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const hourStr = hour.toString().padStart(2, "0")
      const minuteStr = minute.toString().padStart(2, "0")
      const time24h = `${hourStr}:${minuteStr}`

      // Format for 12-hour display
      const hour12 = hour % 12 || 12
      const amPm = hour < 12 ? "ص" : "م"
      const time12h = `${hour12}:${minuteStr} ${amPm}`

      timeOptions.push({
        value: time24h,
        label: time12h,
        hour,
        minute,
      })
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name || !selectedDate || !startTime || !endTime) {
      alert("الرجاء ملء جميع الحقول المطلوبة")
      return
    }

    // Parse the selected date
    const dateObj = new Date(selectedDate)

    // Parse start time
    const startTimeOption = timeOptions.find((option) => option.value === startTime)
    if (!startTimeOption) return

    const startTimeObj = new Date(dateObj)
    startTimeObj.setHours(startTimeOption.hour, startTimeOption.minute, 0, 0)

    // Parse end time
    const endTimeOption = timeOptions.find((option) => option.value === endTime)
    if (!endTimeOption) return

    const endTimeObj = new Date(dateObj)
    endTimeObj.setHours(endTimeOption.hour, endTimeOption.minute, 0, 0)

    // Validate that end time is after start time
    if (endTimeObj <= startTimeObj) {
      alert("يجب أن يكون وقت النهاية بعد وقت البدء")
      return
    }

    // Generate random color
    const colorOptions = [
      "bg-lime-900",
      "bg-blue-900",
      "bg-amber-900",
      "bg-emerald-900",
      "bg-violet-900",
      "bg-rose-900",
      "bg-cyan-900",
    ]
    const randomColor = colorOptions[Math.floor(Math.random() * colorOptions.length)]

    // Create meeting object
    const meeting: Meeting = {
      id: `meeting-${Date.now()}`,
      name,
      date: dateObj,
      startTime: startTimeObj,
      endTime: endTimeObj,
      description,
      organizer,
      location,
      color: randomColor,
      isEpt,
    }

    onAdd(meeting)
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-zinc-100 border-zinc-200 md:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center justify-between">
            إضافة اجتماع جديد
            <Button variant="ghost" size="icon" onClick={onClose} className="text-zinc-400 hover:text-zinc-200">
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-zinc-300">
              عنوان الاجتماع *
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-zinc-800 border-zinc-700 text-zinc-100"
              placeholder="أدخل عنوان الاجتماع"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-zinc-300">
              الوصف
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-zinc-800 border-zinc-700 text-zinc-100 min-h-[80px]"
              placeholder="أدخل وصف الاجتماع"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="organizer" className="text-zinc-300">
                المنظم
              </Label>
              <Input
                id="organizer"
                value={organizer}
                onChange={(e) => setOrganizer(e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-zinc-100"
                placeholder="اسم المنظم"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location" className="text-zinc-300">
                المكان
              </Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-zinc-100"
                placeholder="مكان الاجتماع"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date" className="text-zinc-300 flex items-center">
              <CalendarIcon className="h-4 w-4 ml-1" />
              التاريخ *
            </Label>
            <Select value={selectedDate} onValueChange={setSelectedDate} required>
              <SelectTrigger className="bg-zinc-800 border-zinc-700">
                <SelectValue placeholder="اختر تاريخ" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-700">
                {availableDates.map((date) => (
                  <SelectItem key={date.value} value={date.value}>
                    {date.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime" className="text-zinc-300 flex items-center">
                <Clock className="h-4 w-4 ml-1" />
                وقت البدء *
              </Label>
              <Select value={startTime} onValueChange={setStartTime} required>
                <SelectTrigger className="bg-zinc-800 border-zinc-700">
                  <SelectValue placeholder="وقت البدء" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700 max-h-[200px]">
                  {timeOptions.map((time) => (
                    <SelectItem key={time.value} value={time.value}>
                      {time.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime" className="text-zinc-300 flex items-center">
                <Clock className="h-4 w-4 ml-1" />
                وقت النهاية *
              </Label>
              <Select value={endTime} onValueChange={setEndTime} required>
                <SelectTrigger className="bg-zinc-800 border-zinc-700">
                  <SelectValue placeholder="وقت النهاية" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700 max-h-[200px]">
                  {timeOptions.map((time) => (
                    <SelectItem key={time.value} value={time.value}>
                      {time.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2 space-x-reverse">
            <Checkbox id="isEpt" checked={isEpt} onCheckedChange={(checked) => setIsEpt(checked as boolean)} />
            <Label htmlFor="isEpt" className="text-zinc-300 cursor-pointer">
              تجهيز اجتماع (EPT)
            </Label>
          </div>

          <DialogFooter className="gap-2 md:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
            >
              إلغاء
            </Button>
            <Button type="submit" className="bg-lime-600 hover:bg-lime-700 text-zinc-100">
              إضافة اجتماع
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
