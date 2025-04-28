// src/components/AddMeetingModal.tsx
import { useState } from 'react';
import { Meeting, WeekData } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TimeSelect } from "@/components/TimeSelect";
import { X } from 'lucide-react';

interface AddMeetingModalProps {
  onClose: () => void;
  onAdd: (meeting: Meeting) => void;
  weeks: WeekData[];
}

export default function AddMeetingModal({ onClose, onAdd, weeks }: AddMeetingModalProps) {
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [description, setDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState('bg-lime-950');

  const colorOptions = [
    { value: 'bg-lime-950', label: 'Lime', textColor: 'text-lime-400', border: 'border-lime-500' },
    { value: 'bg-blue-950', label: 'Blue', textColor: 'text-blue-400', border: 'border-blue-500' },
    { value: 'bg-amber-950', label: 'Amber', textColor: 'text-amber-400', border: 'border-amber-500' },
    { value: 'bg-emerald-950', label: 'Emerald', textColor: 'text-emerald-400', border: 'border-emerald-500' },
    { value: 'bg-violet-950', label: 'Violet', textColor: 'text-violet-400', border: 'border-violet-500' },
    { value: 'bg-rose-950', label: 'Rose', textColor: 'text-rose-400', border: 'border-rose-500' },
    { value: 'bg-cyan-950', label: 'Cyan', textColor: 'text-cyan-400', border: 'border-cyan-500' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !date || !startTime || !endTime) {
      return;
    }
    
    const selectedDate = new Date(date);
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    
    const startDateTime = new Date(selectedDate);
    startDateTime.setHours(startHour, startMinute, 0);
    
    const endDateTime = new Date(selectedDate);
    endDateTime.setHours(endHour, endMinute, 0);
    
    const newMeeting: Meeting = {
      id: Date.now().toString(),
      name,
      date: selectedDate,
      startTime: startDateTime,
      endTime: endDateTime,
      description,
      color: selectedColor
    };
    
    onAdd(newMeeting);
  };

  // Generate dates for the current visible weeks
  const getDatesFromWeeks = () => {
    const dates: Date[] = [];
    weeks.forEach(week => {
      const startDate = new Date(week.startDate);
      for (let i = 0; i < 7; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        dates.push(date);
      }
    });
    return dates.sort((a, b) => a.getTime() - b.getTime());
  };

  const availableDates = getDatesFromWeeks();

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-zinc-100 flex items-center justify-between">
            Add New Meeting
            <Button variant="ghost" size="icon" onClick={onClose} className="text-zinc-400 hover:text-zinc-200">
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-zinc-300">Meeting Name</Label>
            <Input 
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-zinc-800 border-zinc-700 text-zinc-100 focus-visible:ring-lime-500"
              placeholder="Enter meeting name"
              required
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date" className="text-zinc-300">Date</Label>
              <Select value={date} onValueChange={setDate}>
                <SelectTrigger id="date" className="bg-zinc-800 border-zinc-700 text-zinc-100">
                  <SelectValue placeholder="Select date" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-100">
                  {availableDates.map((date, idx) => (
                    <SelectItem key={idx} value={date.toISOString()}>
                      {date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-zinc-300">Color</Label>
              <div className="flex space-x-2 mt-2">
                {colorOptions.map(color => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setSelectedColor(color.value)}
                    className={`h-8 w-8 rounded-full ${color.value} border-2 ${
                      selectedColor === color.value ? `ring-2 ring-offset-1 ring-lime-500 ${color.border}` : 'border-zinc-700'
                    }`}
                    title={color.label}
                  />
                ))}
              </div>
            </div>
            
            <div>
              <Label htmlFor="startTime" className="text-zinc-300">Start Time</Label>
              <TimeSelect
                label="Select time"
                value={startTime}
                onValueChange={(value) => {
                  setStartTime(value);
                  if (!endTime || value >= endTime) {
                    // Automatically set end time to be 30 minutes after start
                    const [hour, minute] = value.split(':').map(Number);
                    let newMinute = minute + 30;
                    let newHour = hour;
                    
                    if (newMinute >= 60) {
                      newMinute -= 60;
                      newHour += 1;
                    }
                    
                    if (newHour < 20) {
                      setEndTime(`${newHour.toString().padStart(2, '0')}:${newMinute.toString().padStart(2, '0')}`);
                    }
                  }
                }}
              />
            </div>
            
            <div>
              <Label htmlFor="endTime" className="text-zinc-300">End Time</Label>
              <TimeSelect
                label="Select time"
                value={endTime}
                onValueChange={setEndTime}
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="description" className="text-zinc-300">Description (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-zinc-800 border-zinc-700 text-zinc-100 focus-visible:ring-lime-500"
              placeholder="Add meeting details..."
              rows={3}
            />
          </div>
          
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-lime-600 hover:bg-lime-700 text-zinc-100"
            >
              Add Meeting
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}