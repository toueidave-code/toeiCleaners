import { useState, useCallback, useEffect } from 'react';
import type { Cleaner, Gender } from '@/types';

const STORAGE_KEY = 'cleaners-data';

export function useCleaners() {
  const [cleaners, setCleaners] = useState<Cleaner[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaners));
  }, [cleaners]);

  const addCleaner = useCallback((name: string, gender: Gender) => {
    const newCleaner: Cleaner = {
      id: crypto.randomUUID(),
      name: name.trim(),
      gender,
      lastAssignedDate: null,
      assignmentCount: 0,
    };
    setCleaners((prev) => [...prev, newCleaner]);
    return newCleaner.id;
  }, []);

  const addCleanersBatch = useCallback((names: string[], gender: Gender) => {
    const newCleaners: Cleaner[] = names
      .map((name) => name.trim())
      .filter((name) => name.length > 0)
      .map((name) => ({
        id: crypto.randomUUID(),
        name,
        gender,
        lastAssignedDate: null,
        assignmentCount: 0,
      }));
    
    setCleaners((prev) => [...prev, ...newCleaners]);
    return newCleaners.length;
  }, []);

  const updateCleaner = useCallback((id: string, updates: Partial<Omit<Cleaner, 'id'>>) => {
    setCleaners((prev) =>
      prev.map((cleaner) =>
        cleaner.id === id ? { ...cleaner, ...updates } : cleaner
      )
    );
  }, []);

  const deleteCleaner = useCallback((id: string) => {
    setCleaners((prev) => prev.filter((cleaner) => cleaner.id !== id));
  }, []);

  const getCleanersByGender = useCallback((gender: Gender) => {
    return cleaners.filter((cleaner) => cleaner.gender === gender);
  }, [cleaners]);

  const updateCleanerAssignment = useCallback((cleanerId: string, date: string) => {
    setCleaners((prev) =>
      prev.map((cleaner) =>
        cleaner.id === cleanerId
          ? {
              ...cleaner,
              lastAssignedDate: date,
              assignmentCount: cleaner.assignmentCount + 1,
            }
          : cleaner
      )
    );
  }, []);

  const resetAllAssignments = useCallback(() => {
    setCleaners((prev) =>
      prev.map((cleaner) => ({
        ...cleaner,
        lastAssignedDate: null,
        assignmentCount: 0,
      }))
    );
  }, []);

  return {
    cleaners,
    addCleaner,
    addCleanersBatch,
    updateCleaner,
    deleteCleaner,
    getCleanersByGender,
    updateCleanerAssignment,
    resetAllAssignments,
  };
}
