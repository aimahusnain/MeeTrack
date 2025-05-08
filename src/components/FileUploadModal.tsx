"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import type { Meeting } from "@/types"
import { AlertCircle, FileUp } from "lucide-react"
import { useState } from "react"
import * as XLSX from "xlsx"
import { MEETING_TYPES } from "@/constants/meeting-types"

interface FileUploadModalProps {
  onClose: () => void
  onImport: (meetings: Meeting[], arabicDates: string[]) => void
}

// Define types for Excel data
type ExcelRow = (string | number | boolean | undefined)[]
type ExcelData = ExcelRow[]

export default function FileUploadModal({ onClose, onImport }: FileUploadModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<ExcelRow[]>([])
  const [arabicDates, setArabicDates] = useState<string[]>([])
  const [rawData, setRawData] = useState<ExcelData>([])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null)
    setPreview([])

    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    // Check file extension for validation
    const fileExtension = selectedFile.name.split(".").pop()?.toLowerCase()
    if (fileExtension !== "xlsx" && fileExtension !== "xlsm") {
      setError("الرجاء تحميل ملف XLSX أو XLSM")
      return
    }

    setFile(selectedFile)
    processFile(selectedFile)
  }

  // Update the processFile function to better format the preview data
  const processFile = async (file: File) => {
    setIsLoading(true)

    try {
      // Process XLSX/XLSM file
      const arrayBuffer = await file.arrayBuffer()
      const workbook = XLSX.read(arrayBuffer)

      // Check if "Data" sheet exists
      if (!workbook.SheetNames.includes("Data")) {
        throw new Error('لم يتم العثور على ورقة "Data" في المصنف')
      }

      const worksheet = workbook.Sheets["Data"]

      // Extract Arabic dates from A2:E2 (right-to-left)
      const arabicDatesRange: string[] = []
      for (let col = 0; col < 5; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: 1, c: col }) // A2, B2, C2, D2, E2
        const cell = worksheet[cellAddress]
        arabicDatesRange.push(cell ? String(cell.v) : "")
      }
      // Reverse the array to account for right-to-left reading
      setArabicDates(arabicDatesRange.reverse())

      // Extract meeting data (all rows below row 3)
      // First get the raw data for processing later
      const rawData = XLSX.utils.sheet_to_json<ExcelRow>(worksheet, { header: 1, range: 3 })
      setRawData(rawData)

      // Then get formatted data for preview
      const data = XLSX.utils.sheet_to_json<ExcelRow>(worksheet, { header: 1, range: 3, raw: false })

      // Filter out empty rows
      const filteredData = data.filter(
        (row) => Array.isArray(row) && row.length > 0 && row.some((cell) => cell !== undefined && cell !== ""),
      )

      // Format the preview data for display
      const formattedPreview = filteredData.map((row) => {
        // Create a copy of the row to avoid modifying the original data
        const formattedRow = [...row] as ExcelRow

        // Format date (column 4) if it's a number
        if (typeof row[4] === "number") {
          // Convert Excel date serial to JS Date
          const excelDate = new Date(Date.UTC(1899, 11, 30 + Math.floor(row[4])))
          formattedRow[4] = excelDate.toLocaleDateString("ar-SA", { day: "2-digit", month: "2-digit", year: "numeric" })
        }

        // Format start time (column 5) if it's a number
        if (typeof row[5] === "number") {
          const hours = Math.floor(row[5] * 24)
          const minutes = Math.floor((row[5] * 24 * 60) % 60)
          const ampm = hours < 12 ? "ص" : "م"
          const hour12 = hours % 12 || 12
          formattedRow[5] = `${hour12}:${minutes.toString().padStart(2, "0")} ${ampm}`
        }

        // Format end time (column 6) if it's a number
        if (typeof row[6] === "number") {
          const hours = Math.floor(row[6] * 24)
          const minutes = Math.floor((row[6] * 24 * 60) % 60)
          const ampm = hours < 12 ? "ص" : "م"
          const hour12 = hours % 12 || 12
          formattedRow[6] = `${hour12}:${minutes.toString().padStart(2, "0")} ${ampm}`
        }

        return formattedRow
      })

      // Show preview of first 5 rows
      setPreview(formattedPreview.slice(0, 2))
      setIsLoading(false)
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : "فشل في تحليل الملف. يرجى التحقق من التنسيق.")
      setIsLoading(false)
    }
  }

  // Update the handleImport function to correctly parse Excel numeric formats
  const handleImport = () => {
    if (!file || rawData.length === 0) return

    try {
      setIsLoading(true)

      // Filter out empty rows from raw data
      const filteredData = rawData.filter(
        (row) => Array.isArray(row) && row.length > 0 && row.some((cell) => cell !== undefined && cell !== ""),
      )

      // Process all data rows
      const parsedMeetings: Meeting[] = filteredData.map((row, index) => {
        if (!row || row.length < 7) {
          throw new Error(`بيانات غير صالحة في الصف ${index + 4}`) // +4 because we start from row 4
        }

        // Extract data from columns based on the expected format
        const meetingType = row[1] // النوع
        const meetingTitle = row[2] // عنوان الاجتماع
        // Ensure organizer is properly extracted from column D (index 3)
        const organizer = row[3] !== undefined && row[3] !== "" ? String(row[3]) : "غير متوفر"
        console.log(`Row ${index}: Organizer from column D:`, organizer)
        const dateValue = row[4] // التاريخ (Excel serial number or string)
        const startTimeValue = row[5] // وقت البدء (Excel fraction or string)
        const endTimeValue = row[6] // وقت النهاية (Excel fraction or string)
        const location = row[7] // المكان (location)
        const needsPreparation = row[8] // تجهيز اجتماع (نعم/لا) - moved to column 8

        // Get the time indices if available (columns 11 and 12)
        const startTimeIndex = row[11] !== undefined ? Number(row[11]) : undefined
        const endTimeIndex = row[12] !== undefined ? Number(row[12]) : undefined

        // Parse date from Excel serial number or string
        let meetingDate: Date
        if (typeof dateValue === "number") {
          // Excel date serial number (days since 1900-01-00)
          meetingDate = new Date(Date.UTC(1899, 11, 30 + Math.floor(dateValue)))
        } else if (typeof dateValue === "string") {
          // Try to parse date string (DD/MM/YYYY)
          const dateParts = dateValue.split("/").map(Number)
          if (dateParts.length === 3) {
            const [day, month, year] = dateParts
            meetingDate = new Date(year, month - 1, day)
          } else {
            // If date format is not as expected, use current date
            meetingDate = new Date()
          }
        } else {
          throw new Error(`تنسيق تاريخ غير صالح في الصف ${index + 4}`)
        }

        // Create a copy of the meeting date for time calculations
        const startTime = new Date(meetingDate)
        const endTime = new Date(meetingDate)

        // Parse start time from Excel fraction or string
        if (typeof startTimeValue === "number") {
          // Excel time (fraction of day)
          const totalMinutes = Math.round(startTimeValue * 24 * 60)
          const hours = Math.floor(totalMinutes / 60)
          const minutes = totalMinutes % 60
          startTime.setHours(hours, minutes, 0, 0)
        } else if (typeof startTimeValue === "string") {
          // Parse time string (e.g., "10:30 am")
          const timeObj = parseTimeString(startTimeValue, meetingDate)
          startTime.setHours(timeObj.getHours(), timeObj.getMinutes(), 0, 0)
        }

        // Parse end time from Excel fraction or string
        if (typeof endTimeValue === "number") {
          // Excel time (fraction of day)
          const totalMinutes = Math.round(endTimeValue * 24 * 60)
          const hours = Math.floor(totalMinutes / 60)
          const minutes = totalMinutes % 60
          endTime.setHours(hours, minutes, 0, 0)
        } else if (typeof endTimeValue === "string") {
          // Parse time string (e.g., "11:45 am")
          const timeObj = parseTimeString(endTimeValue, meetingDate)
          endTime.setHours(timeObj.getHours(), timeObj.getMinutes(), 0, 0)
        }

        // Get color based on meeting type
        const meetingTypeStr = meetingType !== undefined ? String(meetingType) : ""

        // Use the new color system
        const typeColors = MEETING_TYPES[meetingTypeStr as keyof typeof MEETING_TYPES]
        const colorClass = typeColors ? `bg-[${typeColors.main}]` : "bg-zinc-700"

        return {
          id: `import-${Date.now()}-${index}`,
          name: meetingTitle !== undefined ? String(meetingTitle) : "اجتماع بدون عنوان",
          date: meetingDate,
          startTime,
          endTime,
          description: meetingType !== undefined ? String(meetingType) : "",
          organizer, // Already handled above
          location: location !== undefined ? String(location) : "",
          color: colorClass,
          isEpt: needsPreparation === "نعم" || needsPreparation === true,
          startTimeIndex,
          endTimeIndex,
        }
      })

      onImport(parsedMeetings, arabicDates)
      setIsLoading(false)
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : "فشل في استيراد الاجتماعات")
      setIsLoading(false)
    }
  }

  // Helper function to parse time strings like "10:30 am" or "14:45"
  const parseTimeString = (timeStr: string | number, baseDate: Date): Date => {
    const result = new Date(baseDate)

    if (typeof timeStr === "string") {
      // Handle formats like "10:30 am" or "2:45 pm"
      const isAM = timeStr.toLowerCase().includes("am")
      const isPM = timeStr.toLowerCase().includes("pm")

      // Remove am/pm and trim
      const timeOnly = timeStr
        .toLowerCase()
        .replace("am", "")
        .replace("pm", "")
        .replace("ص", "") // Arabic AM
        .replace("م", "") // Arabic PM
        .trim()

      const timeParts = timeOnly.split(":")
      if (timeParts.length >= 2) {
        const hourStr = timeParts[0]
        const minuteStr = timeParts[1]
        let hour = Number.parseInt(hourStr, 10)
        const minute = Number.parseInt(minuteStr, 10)

        if (!isNaN(hour) && !isNaN(minute)) {
          // Adjust hour for PM
          if (isPM && hour < 12) {
            hour += 12
          }
          // Adjust hour for AM 12
          if (isAM && hour === 12) {
            hour = 0
          }

          result.setHours(hour, minute, 0, 0)
        }
      }
    } else if (typeof timeStr === "number") {
      // Handle Excel time (fraction of day)
      const totalMinutes = Math.round(timeStr * 24 * 60)
      const hour = Math.floor(totalMinutes / 60)
      const minute = totalMinutes % 60
      result.setHours(hour, minute, 0, 0)
    }

    return result
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-white border-zinc-100 md:max-w-2xl h-[92vh] overflow-y-scroll">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center justify-between">
            استيراد الاجتماعات
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="file-upload" className="text-zinc-600 mb-2 block">
              حدد ملف XLSM
            </Label>
            <div className="border-2 border-dashed border-zinc-700 rounded-lg p-6 text-center hover:border-lime-500 transition-colors">
              <input id="file-upload" type="file" accept=".xlsx,.xlsm" onChange={handleFileChange} className="hidden" />
              <label htmlFor="file-upload" className="cursor-pointer">
                <div className="flex flex-col items-center">
                  <FileUp className="h-12 w-12 text-zinc-500 mb-3" />
                  <p className="text-zinc-700 mb-1">{file ? file.name : "انقر للتحميل أو اسحب وأفلت"}</p>
                  <p className="text-zinc-500 text-sm">ملفات XLSX أو XLSM فقط</p>
                </div>
              </label>
            </div>
          </div>

          {error && (
            <div className="bg-red-900/30 border border-red-800 rounded-md p-3 flex items-start">
              <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 ml-2 flex-shrink-0" />
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          {arabicDates.length > 0 && (
            <div className="bg-zinc-100 rounded-md p-3">
              <p className="text-zinc-700 font-medium mb-2">التواريخ المستخرجة:</p>
              <div className="flex flex-wrap gap-2">
                {arabicDates.map((date, i) => (
                  <div key={i} className="bg-zinc-200 px-2 py-1 rounded text-sm">
                    {date}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Preview section - Now only visible on non-mobile screens */}
          {preview.length > 0 && (
            <div className="hidden md:block bg-zinc-100 rounded-md p-3 overflow-x-auto">
              <p className="text-zinc-900 font-medium mb-2">معاينة:</p>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-zinc-700">
                    <th className="text-right py-1 px-2">#</th>
                    <th className="text-right py-1 px-2">النوع</th>
                    <th className="text-right py-1 px-2">عنوان الاجتماع</th>
                    <th className="text-right py-1 px-2">المنظم</th>
                    <th className="text-right py-1 px-2">التاريخ</th>
                    <th className="text-right py-1 px-2">وقت البدء</th>
                    <th className="text-right py-1 px-2">وقت النهاية</th>
                    <th className="text-right py-1 px-2">المكان</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.map((row, i) => (
                    <tr key={i} className="border-t border-zinc-200">
                      <td className="py-1 px-2 text-right">{row[0]}</td>
                      <td className="py-1 px-2 text-right">{row[1]}</td>
                      <td className="py-1 px-2 text-right">{row[2]}</td>
                      <td className="py-1 px-2 text-right">{row[3]}</td>
                      <td className="py-1 px-2 text-right">{row[4]}</td>
                      <td className="py-1 px-2 text-right">{row[5]}</td>
                      <td className="py-1 px-2 text-right">{row[6]}</td>
                      <td className="py-1 px-2 text-right">{row[7]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {preview.length > 5 && <p className="text-zinc-500 text-xs mt-2">عرض أول 5 صفوف...</p>}
            </div>
          )}

          {/* Mobile message when preview is available but hidden */}
          {preview.length > 0 && (
            <div className="md:hidden bg-zinc-100 rounded-md p-3 text-center">
              <p className="text-zinc-700 text-sm">
                تم تحميل الملف بنجاح. اضغط على &quot;استيراد الاجتماعات&quot; لإكمال العملية.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 md:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="border-zinc-300 text-zinc-800 mr-2 hover:bg-zinc-200 hover"
          >
            إلغاء
          </Button>
          <Button
            type="button"
            onClick={handleImport}
            className="bg-lime-600 hover:bg-lime-700"
            disabled={!file || isLoading || preview.length === 0}
          >
            {isLoading ? "جاري الاستيراد..." : "استيراد الاجتماعات"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
