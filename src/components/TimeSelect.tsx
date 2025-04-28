// src/components/TimeSelect.tsx
"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { TimeOption } from "@/types"

// Generate time options from 8:00 to 18:15 with 15 minute intervals
const generateTimeOptions = (): TimeOption[] => {
  const options: TimeOption[] = []
  
  for (let hour = 8; hour <= 19; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      // Skip 19:15, 19:30, 19:45 (but allow 19:00)
      if (hour === 19 && minute > 0) continue
      
      const value = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
      const label = `${hour}:${minute.toString().padStart(2, "0")}`
      
      options.push({
        value,
        label,
        hour,
        minute,
      })
    }
  }
  
  return options
}

const timeOptions = generateTimeOptions()

interface TimeSelectProps {
  value: string
  onValueChange: (value: string) => void
  label: string
}

export function TimeSelect({ value, onValueChange, label }: TimeSelectProps) {
  const [open, setOpen] = React.useState(false)
  const selectedOption = timeOptions.find((option) => option.value === value)
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-zinc-800 border-zinc-700 text-zinc-100 hover:bg-zinc-700 hover:text-zinc-50"
        >
          {selectedOption ? selectedOption.label : label}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 bg-zinc-800 border-zinc-700">
        <Command className="bg-zinc-800">
          <CommandInput placeholder="Search time..." className="text-zinc-100" />
          <CommandList>
            <CommandEmpty className="text-zinc-400">
              No time found.
            </CommandEmpty>
            <CommandGroup>
              {timeOptions.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={() => {
                    onValueChange(option.value)
                    setOpen(false)
                  }}
                  className="text-zinc-100 hover:bg-zinc-700"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}