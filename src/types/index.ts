// Types for Cleaners Assignment System

export type Gender = 'male' | 'female';

export interface Cleaner {
  id: string;
  name: string;
  gender: Gender;
  lastAssignedDate: string | null;
  assignmentCount: number;
}

export interface CleaningArea {
  id: string;
  name: string;
  gender: Gender;
  description?: string;
  cleanerCount: number;
}

export interface Assignment {
  id: string;
  areaId: string;
  cleanerId: string;
  date: string;
}

export interface AssignmentHistory {
  date: string;
  assignments: Assignment[];
}

export interface AppState {
  cleaners: Cleaner[];
  areas: CleaningArea[];
  currentAssignments: Assignment[];
  assignmentHistory: AssignmentHistory[];
}
