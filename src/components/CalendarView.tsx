import { useMemo } from 'react';
import type { Assignment } from '@/types';
import { getDaysInMonth, getFirstDayOfMonth } from '@/lib/dateUtils';

interface CalendarViewProps {
  currentDate: Date;
  assignments: Assignment[];
  cleaners: Array<{ id: string; name: string }>;
  areas: Array<{ id: string; name: string }>;
}

export function CalendarView({
  currentDate,
  assignments,
  cleaners,
  areas,
}: CalendarViewProps) {
  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfMonth = getFirstDayOfMonth(year, month);

  // Group assignments by date
  const assignmentsByDate = useMemo(() => {
    const map: Record<string, Assignment[]> = {};
    assignments.forEach((assignment) => {
      const assignmentDate = new Date(assignment.date);
      if (
        assignmentDate.getMonth() === month &&
        assignmentDate.getFullYear() === year
      ) {
        const dateKey = assignment.date;
        if (!map[dateKey]) map[dateKey] = [];
        map[dateKey].push(assignment);
      }
    });
    return map;
  }, [assignments, month, year]);

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const days: (number | null)[] = [
    ...Array.from({ length: firstDayOfMonth }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1)
  ];

  const getCleanerName = (cleanerId: string) => {
    return cleaners.find((c) => c.id === cleanerId)?.name || 'Unknown';
  };

  const getAreaName = (areaId: string) => {
    return areas.find((a) => a.id === areaId)?.name || 'Unknown';
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold">
          {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h2>
      </div>

      <div className="space-y-2">
        {/* Week headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map((day) => (
            <div
              key={day}
              className="text-center font-semibold text-sm p-2 bg-slate-100 rounded"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => {
            const dateStr = day
              ? `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
              : null;
            const dayAssignments = dateStr ? assignmentsByDate[dateStr] || [] : [];
            const isToday =
              day &&
              new Date().toDateString() ===
                new Date(year, month, day).toDateString();

            return (
              <div
                key={index}
                className={`min-h-24 p-2 border rounded text-sm overflow-y-auto ${
                  day
                    ? `bg-white ${isToday ? 'border-blue-500 border-2 bg-blue-50' : 'border-gray-200'}`
                    : 'bg-gray-50'
                }`}
              >
                {day && (
                  <div className="space-y-1">
                    <div className={`font-semibold ${isToday ? 'text-blue-600' : ''}`}>
                      {day}
                    </div>
                    <div className="space-y-0.5 max-h-32 overflow-y-auto">
                      {dayAssignments.map((assignment) => (
                        <div
                          key={assignment.id}
                          className="text-xs bg-amber-50 p-1 rounded border border-amber-200"
                        >
                          <div className="font-medium text-amber-900">
                            {getCleanerName(assignment.cleanerId)}
                          </div>
                          <div className="text-amber-700 truncate">
                            {getAreaName(assignment.areaId)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t">
        <h3 className="font-semibold text-sm mb-2">Legend:</h3>
        <div className="flex items-center gap-2 text-xs">
          <div className="w-4 h-4 bg-amber-50 border border-amber-200 rounded" />
          <span>Assignment</span>
        </div>
      </div>
    </div>
  );
}
