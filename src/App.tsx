import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { useCleaners } from '@/hooks/useCleaners';
import { useAreas } from '@/hooks/useAreas';
import { useAssignments } from '@/hooks/useAssignments';
import { CleanerManagement } from '@/sections/CleanerManagement';
import { AreaManagement } from '@/sections/AreaManagement';
import { AssignmentDisplay } from '@/sections/AssignmentDisplay';
import { Statistics } from '@/sections/Statistics';
import { CalendarExport } from '@/sections/CalendarExport';
import {
  Users,
  MapPin,
  ClipboardList,
  BarChart3,
  Calendar,
  Sparkles,
  RotateCcw,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import './App.css';

function App() {
  const {
    cleaners,
    addCleaner,
    addCleanersBatch,
    updateCleaner,
    deleteCleaner,
    getCleanersByGender,
    updateCleanerAssignment,
    resetAllAssignments,
  } = useCleaners();

  const {
    areas,
    addArea,
    updateArea,
    deleteArea,
    getAreasByGender,
    resetToDefaults,
  } = useAreas();

  const {
    currentAssignments,
    assignmentHistory,
    generateAssignments,
    generateMonthlySchedule,
    substituteCleaner,
    clearAssignments,
    loadFromHistory,
    clearHistory,
  } = useAssignments(cleaners, updateCleanerAssignment);

  const [activeTab, setActiveTab] = useState('assignments');
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);

  const handleGenerateAssignments = (date: string) => {
    // Check if we have enough cleaners
    const maleCleaners = getCleanersByGender('male');
    const femaleCleaners = getCleanersByGender('female');
    const maleAreas = getAreasByGender('male');
    const femaleAreas = getAreasByGender('female');

    // Calculate total cleaners needed (sum of cleanerCount for each area)
    const maleCleanersNeeded = maleAreas.reduce((sum, area) => sum + (area.cleanerCount || 1), 0);
    const femaleCleanersNeeded = femaleAreas.reduce((sum, area) => sum + (area.cleanerCount || 1), 0);

    if (maleCleaners.length < maleCleanersNeeded) {
      toast.error(
        `Not enough boys! Need ${maleCleanersNeeded} boys for ${maleAreas.length} areas, but only have ${maleCleaners.length}.`
      );
      return;
    }

    if (femaleCleaners.length < femaleCleanersNeeded) {
      toast.error(
        `Not enough girls! Need ${femaleCleanersNeeded} girls for ${femaleAreas.length} areas, but only have ${femaleCleaners.length}.`
      );
      return;
    }

    generateAssignments(areas, date);
    toast.success('Assignments generated successfully!');
  };

  const handleClearAssignments = () => {
    clearAssignments();
    toast.info('Current assignments cleared');
  };

  const handleLoadFromHistory = (date: string) => {
    const loaded = loadFromHistory(date);
    if (loaded) {
      toast.success(`Loaded assignments from ${date}`);
    }
  };

  const handleClearHistory = () => {
    clearHistory();
    toast.info('All assignment history cleared');
  };

  const handleGenerateMonthlySchedule = (year: number, month: number, skipWeekends: boolean) => {
    // Check if we have enough cleaners
    const maleCleaners = getCleanersByGender('male');
    const femaleCleaners = getCleanersByGender('female');
    const maleAreas = getAreasByGender('male');
    const femaleAreas = getAreasByGender('female');

    const maleCleanersNeeded = maleAreas.reduce((sum, area) => sum + (area.cleanerCount || 1), 0);
    const femaleCleanersNeeded = femaleAreas.reduce((sum, area) => sum + (area.cleanerCount || 1), 0);

    if (maleCleaners.length < maleCleanersNeeded) {
      toast.error(
        `Not enough boys! Need ${maleCleanersNeeded} boys for ${maleAreas.length} areas, but only have ${maleCleaners.length}.`
      );
      return;
    }

    if (femaleCleaners.length < femaleCleanersNeeded) {
      toast.error(
        `Not enough girls! Need ${femaleCleanersNeeded} girls for ${femaleAreas.length} areas, but only have ${femaleCleaners.length}.`
      );
      return;
    }

    const schedule = generateMonthlySchedule(areas, year, month, skipWeekends);
    toast.success(`Monthly schedule generated! Created ${schedule.length} days of assignments.`);
  };

  const handleSubstituteCleaner = (assignmentId: string, newCleanerId: string, date: string) => {
    try {
      const result = substituteCleaner(assignmentId, newCleanerId, date);
      if (result) {
        const newCleaner = cleaners.find((c) => c.id === newCleanerId);
        toast.success(`Substituted with ${newCleaner?.name} successfully!`);
      } else {
        toast.error('Failed to substitute cleaner');
      }
      return result;
    } catch (error) {
      console.error('Substitute cleaner error:', error);
      toast.error('An unexpected error occurred while substituting cleaner');
      return null;
    }
  };

  const handleResetAllData = () => {
    // Clear localStorage
    localStorage.removeItem('cleaners-data');
    localStorage.removeItem('areas-data');
    localStorage.removeItem('assignments-data');
    localStorage.removeItem('assignment-history');
    
    // Reset state
    resetAllAssignments();
    resetToDefaults();
    clearHistory();
    
    setIsResetDialogOpen(false);
    toast.success('All data has been reset to defaults');
    
    // Reload page to ensure clean state
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Cleaners Assignment
                </h1>
                <p className="text-xs text-gray-500">Rotation Management System</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <AlertDialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                    <RotateCcw className="w-4 h-4 mr-1" />
                    Reset All
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Reset All Data?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will reset all cleaners, areas, and assignment history to default values.
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleResetAllData} className="bg-red-600 hover:bg-red-700">
                      Reset Everything
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Info Banner */}
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">How it works:</p>
            <ul className="list-disc list-inside space-y-1 text-blue-700">
              <li>Each cleaner is assigned to an area matching their gender</li>
              <li>Areas can have multiple cleaners (configure in Areas tab)</li>
              <li>The system rotates cleaners fairly - least assigned get priority</li>
              <li>No cleaner is assigned to multiple areas on the same day</li>
              <li>Assignment history is saved automatically for reference</li>
              <li>Hover over a cleaner and click &quot;Substitute&quot; to transfer their assignment</li>
            </ul>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
            <TabsTrigger value="assignments" className="flex items-center gap-2">
              <ClipboardList className="w-4 h-4" />
              <span className="hidden sm:inline">Assignments</span>
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Calendar</span>
            </TabsTrigger>
            <TabsTrigger value="cleaners" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Cleaners</span>
            </TabsTrigger>
            <TabsTrigger value="areas" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span className="hidden sm:inline">Areas</span>
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Statistics</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="assignments" className="space-y-6">
            <AssignmentDisplay
              currentAssignments={currentAssignments}
              cleaners={cleaners}
              areas={areas}
              assignmentHistory={assignmentHistory}
              onGenerateAssignments={handleGenerateAssignments}
              onGenerateMonthlySchedule={handleGenerateMonthlySchedule}
              onSubstituteCleaner={handleSubstituteCleaner}
              onClearAssignments={handleClearAssignments}
              onLoadFromHistory={handleLoadFromHistory}
              onClearHistory={handleClearHistory}
            />
          </TabsContent>

          <TabsContent value="calendar" className="space-y-6">
            <CalendarExport
              assignments={assignmentHistory.flatMap((h) => h.assignments)}
              cleaners={cleaners}
              areas={areas}
            />
          </TabsContent>

          <TabsContent value="cleaners" className="space-y-6">
            <CleanerManagement
              cleaners={cleaners}
              addCleaner={addCleaner}
              addCleanersBatch={addCleanersBatch}
              updateCleaner={updateCleaner}
              deleteCleaner={deleteCleaner}
              resetAllAssignments={resetAllAssignments}
            />
          </TabsContent>

          <TabsContent value="areas" className="space-y-6">
            <AreaManagement
              areas={areas}
              addArea={addArea}
              updateArea={updateArea}
              deleteArea={deleteArea}
              resetToDefaults={resetToDefaults}
            />
          </TabsContent>

          <TabsContent value="stats" className="space-y-6">
            <Statistics
              cleaners={cleaners}
              areas={areas}
              assignmentHistory={assignmentHistory}
            />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              Cleaners Assignment System - Fair rotation for everyone
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>{cleaners.length} cleaners</span>
              <span className="text-gray-300">|</span>
              <span>{areas.length} areas</span>
              <span className="text-gray-300">|</span>
              <span>{assignmentHistory.length} days recorded</span>
            </div>
          </div>
        </div>
      </footer>

      <Toaster position="top-right" />
    </div>
  );
}

export default App;
