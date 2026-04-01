import { useState, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, Download, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { CalendarView } from '@/components/CalendarView';
import type { Assignment } from '@/types';

interface CalendarExportProps {
  assignments: Assignment[];
  cleaners: Array<{ id: string; name: string }>;
  areas: Array<{ id: string; name: string }>;
}

export function CalendarExport({
  assignments,
  cleaners,
  areas,
}: CalendarExportProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isExporting, setIsExporting] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  const handleExportPDF = async () => {
    if (!calendarRef.current) return;

    try {
      setIsExporting(true);
      const canvas = await html2canvas(calendarRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 280;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 10, position + 10, imgWidth, imgHeight);
      heightLeft -= 277;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position + 10, imgWidth, imgHeight);
        heightLeft -= 277;
      }

      const month = currentDate.toLocaleString('default', { month: 'long' });
      const year = currentDate.getFullYear();
      pdf.save(`assignment-calendar-${month}-${year}.pdf`);
      toast.success('Calendar exported as PDF');
    } catch (error) {
      toast.error('Failed to export PDF');
      console.error('PDF Export Error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportImage = async () => {
    if (!calendarRef.current) return;

    try {
      setIsExporting(true);
      const canvas = await html2canvas(calendarRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
      });

      const link = document.createElement('a');
      const month = currentDate.toLocaleString('default', { month: 'long' });
      const year = currentDate.getFullYear();
      link.href = canvas.toDataURL('image/png');
      link.download = `assignment-calendar-${month}-${year}.png`;
      link.click();
      toast.success('Calendar exported as PNG image');
    } catch (error) {
      toast.error('Failed to export image');
      console.error('Image Export Error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handlePreviousMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            <CardTitle>Calendar View</CardTitle>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleToday}
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousMonth}
            >
              ←
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextMonth}
            >
              →
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Calendar Display */}
            <div
              ref={calendarRef}
              className="p-6 bg-white rounded-lg"
            >
              <CalendarView
                currentDate={currentDate}
                assignments={assignments}
                cleaners={cleaners}
                areas={areas}
              />
            </div>

            {/* Export Buttons */}
            <div className="flex gap-3 justify-end pt-4 border-t">
              <Button
                onClick={handleExportPDF}
                disabled={isExporting}
                variant="outline"
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                {isExporting ? 'Exporting...' : 'Export PDF'}
              </Button>
              <Button
                onClick={handleExportImage}
                disabled={isExporting}
                className="gap-2"
              >
                <ImageIcon className="h-4 w-4" />
                {isExporting ? 'Exporting...' : 'Export PNG'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
