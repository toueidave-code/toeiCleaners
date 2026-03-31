import { useState, useCallback, useEffect } from 'react';
import type { CleaningArea, Gender } from '@/types';

const STORAGE_KEY = 'areas-data';

// Default cleaning areas
const defaultAreas: CleaningArea[] = [
  { id: '1', name: 'Pantry', gender: 'female', description: 'Kitchen and pantry area', cleanerCount: 2 },
  { id: '2', name: 'Boys Toilet', gender: 'male', description: 'Male restroom', cleanerCount: 1 },
  { id: '3', name: 'Girls Toilet', gender: 'female', description: 'Female restroom', cleanerCount: 1 },
  { id: '4', name: 'Corridor', gender: 'female', description: 'Main corridor areas', cleanerCount: 2 },
  { id: '5', name: 'Staircase', gender: 'male', description: 'Staircase cleaning', cleanerCount: 2 },
  { id: '6', name: 'Reception', gender: 'female', description: 'Reception area', cleanerCount: 1 },
  { id: '7', name: 'Meeting Room', gender: 'male', description: 'Meeting and conference rooms', cleanerCount: 1 },
  { id: '8', name: 'Office Area', gender: 'female', description: 'General office spaces', cleanerCount: 2 },
];

export function useAreas() {
  const [areas, setAreas] = useState<CleaningArea[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : defaultAreas;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(areas));
  }, [areas]);

  const addArea = useCallback((name: string, gender: Gender, cleanerCount: number = 1, description?: string) => {
    const newArea: CleaningArea = {
      id: crypto.randomUUID(),
      name: name.trim(),
      gender,
      cleanerCount: Math.max(1, cleanerCount),
      description: description?.trim(),
    };
    setAreas((prev) => [...prev, newArea]);
    return newArea.id;
  }, []);

  const updateArea = useCallback((id: string, updates: Partial<Omit<CleaningArea, 'id'>>) => {
    setAreas((prev) =>
      prev.map((area) =>
        area.id === id ? { ...area, ...updates } : area
      )
    );
  }, []);

  const deleteArea = useCallback((id: string) => {
    setAreas((prev) => prev.filter((area) => area.id !== id));
  }, []);

  const getAreasByGender = useCallback((gender: Gender) => {
    return areas.filter((area) => area.gender === gender);
  }, [areas]);

  const resetToDefaults = useCallback(() => {
    setAreas(defaultAreas);
  }, []);

  return {
    areas,
    addArea,
    updateArea,
    deleteArea,
    getAreasByGender,
    resetToDefaults,
  };
}
