import { useState, useCallback, useEffect } from 'react';
import type { Assignment, AssignmentHistory, Cleaner, CleaningArea } from '@/types';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isWeekend } from 'date-fns';

const STORAGE_KEY = 'assignments-data';
const HISTORY_KEY = 'assignment-history';

export function useAssignments(
  cleaners: Cleaner[],
  updateCleanerAssignment: (cleanerId: string, date: string) => void
) {
  const [currentAssignments, setCurrentAssignments] = useState<Assignment[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  const [assignmentHistory, setAssignmentHistory] = useState<AssignmentHistory[]>(() => {
    const stored = localStorage.getItem(HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentAssignments));
  }, [currentAssignments]);

  useEffect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(assignmentHistory));
  }, [assignmentHistory]);

  // Generate assignments for a single day
  const generateDayAssignments = useCallback(
    (
      areas: CleaningArea[],
      date: string,
      tempCleanerState: Map<string, Cleaner> = new Map()
    ): Assignment[] => {
      const newAssignments: Assignment[] = [];
      const assignedCleanerIds: string[] = [];

      // Get cleaner state (either from temp state or actual state)
      const getCleanerState = (cleanerId: string): Cleaner => {
        return tempCleanerState.get(cleanerId) || cleaners.find((c) => c.id === cleanerId)!;
      };

      // Get available cleaners with temp state consideration
      const getAvailableWithTempState = (gender: 'male' | 'female', excludeIds: string[]) => {
        return cleaners
          .filter((c) => c.gender === gender && !excludeIds.includes(c.id))
          .sort((a, b) => {
            const stateA = getCleanerState(a.id);
            const stateB = getCleanerState(b.id);
            if (stateA.assignmentCount !== stateB.assignmentCount) {
              return stateA.assignmentCount - stateB.assignmentCount;
            }
            if (stateA.lastAssignedDate && stateB.lastAssignedDate) {
              return new Date(stateA.lastAssignedDate).getTime() - new Date(stateB.lastAssignedDate).getTime();
            }
            return stateA.lastAssignedDate ? 1 : -1;
          });
      };

      // Group areas by gender
      const maleAreas = areas.filter((area) => area.gender === 'male');
      const femaleAreas = areas.filter((area) => area.gender === 'female');

      // Helper function to assign cleaners to areas
      const assignCleanersToAreas = (areasList: CleaningArea[], gender: 'male' | 'female') => {
        areasList.forEach((area) => {
          const cleanersNeeded = area.cleanerCount || 1;

          for (let i = 0; i < cleanersNeeded; i++) {
            const availableCleaners = getAvailableWithTempState(gender, assignedCleanerIds);
            if (availableCleaners.length > 0) {
              const selectedCleaner = availableCleaners[0];
              newAssignments.push({
                id: crypto.randomUUID(),
                areaId: area.id,
                cleanerId: selectedCleaner.id,
                date,
              });
              assignedCleanerIds.push(selectedCleaner.id);

              // Update temp state
              const currentState = getCleanerState(selectedCleaner.id);
              tempCleanerState.set(selectedCleaner.id, {
                ...currentState,
                lastAssignedDate: date,
                assignmentCount: currentState.assignmentCount + 1,
              });
            }
          }
        });
      };

      assignCleanersToAreas(maleAreas, 'male');
      assignCleanersToAreas(femaleAreas, 'female');

      return newAssignments;
    },
    [cleaners]
  );

  // Generate new assignments with rotation logic
  const generateAssignments = useCallback(
    (areas: CleaningArea[], date: string = new Date().toISOString().split('T')[0]) => {
      const newAssignments = generateDayAssignments(areas, date);

      // Update actual cleaner states
      newAssignments.forEach((assignment) => {
        updateCleanerAssignment(assignment.cleanerId, date);
      });

      setCurrentAssignments(newAssignments);

      // Add to history
      const historyEntry: AssignmentHistory = {
        date,
        assignments: newAssignments,
      };
      setAssignmentHistory((prev) => {
        const filtered = prev.filter((h) => h.date !== date);
        return [...filtered, historyEntry].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
      });

      return newAssignments;
    },
    [generateDayAssignments, updateCleanerAssignment]
  );

  // Generate monthly schedule
  const generateMonthlySchedule = useCallback(
    (
      areas: CleaningArea[],
      year: number,
      month: number,
      skipWeekends: boolean = true
    ): { date: string; assignments: Assignment[] }[] => {
      const start = startOfMonth(new Date(year, month - 1));
      const end = endOfMonth(start);
      const allDays = eachDayOfInterval({ start, end });

      const schedule: { date: string; assignments: Assignment[] }[] = [];
      const tempCleanerState = new Map<string, Cleaner>();

      // Initialize temp state from current cleaners
      cleaners.forEach((c) => tempCleanerState.set(c.id, { ...c }));

      allDays.forEach((day) => {
        if (skipWeekends && isWeekend(day)) {
          return;
        }

        const dateStr = format(day, 'yyyy-MM-dd');
        const dayAssignments = generateDayAssignments(areas, dateStr, tempCleanerState);

        if (dayAssignments.length > 0) {
          schedule.push({ date: dateStr, assignments: dayAssignments });

          // Add to history
          const historyEntry: AssignmentHistory = {
            date: dateStr,
            assignments: dayAssignments,
          };
          setAssignmentHistory((prev) => {
            const filtered = prev.filter((h) => h.date !== dateStr);
            return [...filtered, historyEntry].sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            );
          });
        }
      });

      // Update actual cleaner states with final counts
      tempCleanerState.forEach((cleaner, id) => {
        const original = cleaners.find((c) => c.id === id);
        if (original) {
          const countDiff = cleaner.assignmentCount - original.assignmentCount;
          for (let i = 0; i < countDiff; i++) {
            updateCleanerAssignment(id, cleaner.lastAssignedDate || format(end, 'yyyy-MM-dd'));
          }
        }
      });

      return schedule;
    },
    [cleaners, generateDayAssignments, updateCleanerAssignment]
  );

  // Substitute a cleaner in an assignment
  const substituteCleaner = useCallback(
    (
      assignmentId: string,
      newCleanerId: string,
      date: string
    ): Assignment | null => {
      // Find the assignment
      const assignment = currentAssignments.find((a) => a.id === assignmentId);
      if (!assignment) return null;

      const newCleaner = cleaners.find((c) => c.id === newCleanerId);
      if (!newCleaner) return null;

      // Check gender match
      const oldCleaner = cleaners.find((c) => c.id === assignment.cleanerId);
      if (oldCleaner && oldCleaner.gender !== newCleaner.gender) {
        return null; // Cannot substitute across genders
      }

      // Create updated assignment
      const updatedAssignment: Assignment = {
        ...assignment,
        cleanerId: newCleanerId,
      };

      // Update current assignments
      setCurrentAssignments((prev) =>
        prev.map((a) => (a.id === assignmentId ? updatedAssignment : a))
      );

      // Update history
      setAssignmentHistory((prev) =>
        prev.map((h) =>
          h.date === date
            ? {
                ...h,
                assignments: h.assignments.map((a) =>
                  a.id === assignmentId ? updatedAssignment : a
                ),
              }
            : h
        )
      );

      // Update cleaner stats
      updateCleanerAssignment(newCleanerId, date);

      return updatedAssignment;
    },
    [currentAssignments, cleaners, updateCleanerAssignment]
  );

  // Clear current assignments
  const clearAssignments = useCallback(() => {
    setCurrentAssignments([]);
  }, []);

  // Get assignment history for a specific date
  const getHistoryByDate = useCallback(
    (date: string) => {
      return assignmentHistory.find((h) => h.date === date);
    },
    [assignmentHistory]
  );

  // Load assignments from history
  const loadFromHistory = useCallback(
    (date: string) => {
      const history = getHistoryByDate(date);
      if (history) {
        setCurrentAssignments(history.assignments);
        return history.assignments;
      }
      return null;
    },
    [getHistoryByDate]
  );

  // Clear all history
  const clearHistory = useCallback(() => {
    setAssignmentHistory([]);
    setCurrentAssignments([]);
  }, []);

  return {
    currentAssignments,
    assignmentHistory,
    generateAssignments,
    generateMonthlySchedule,
    substituteCleaner,
    clearAssignments,
    getHistoryByDate,
    loadFromHistory,
    clearHistory,
  };
}
