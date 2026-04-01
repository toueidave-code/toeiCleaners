import { useState, useMemo } from 'react';
import type { Assignment, Cleaner, CleaningArea, AssignmentHistory } from '@/types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Calendar as CalendarIcon,
  ClipboardList,
  History,
  User,
  MapPin,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Users,
  CalendarDays,
  RefreshCw,
  X,
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface AssignmentDisplayProps {
  currentAssignments: Assignment[];
  cleaners: Cleaner[];
  areas: CleaningArea[];
  assignmentHistory: AssignmentHistory[];
  onGenerateAssignments: (date: string) => void;
  onGenerateMonthlySchedule: (year: number, month: number, skipWeekends: boolean) => void;
  onSubstituteCleaner: (assignmentId: string, newCleanerId: string, date: string) => Assignment | null;
  onClearAssignments: () => void;
  onLoadFromHistory: (date: string) => void;
  onClearHistory: () => void;
}

interface AreaAssignmentGroup {
  area: CleaningArea;
  cleaners: Cleaner[];
  assignments: Assignment[];
}

export function AssignmentDisplay({
  currentAssignments,
  cleaners,
  areas,
  assignmentHistory,
  onGenerateAssignments,
  onGenerateMonthlySchedule,
  onSubstituteCleaner,
  onClearAssignments,
  onLoadFromHistory,
  onClearHistory,
}: AssignmentDisplayProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isMonthlyDialogOpen, setIsMonthlyDialogOpen] = useState(false);
  const [isSubstituteDialogOpen, setIsSubstituteDialogOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [substituteCleanerId, setSubstituteCleanerId] = useState('');
  const [monthlyMonth, setMonthlyMonth] = useState(new Date().getMonth() + 1);
  const [monthlyYear, setMonthlyYear] = useState(new Date().getFullYear());
  const [skipWeekends, setSkipWeekends] = useState(true);

  const getCleanerById = (id: string) => cleaners.find((c) => c.id === id);
  const getAreaById = (id: string) => areas.find((a) => a.id === id);

  // Group assignments by area
  const groupedAssignments = useMemo(() => {
    const groups: Map<string, AreaAssignmentGroup> = new Map();
    
    currentAssignments.forEach((assignment) => {
      const area = getAreaById(assignment.areaId);
      const cleaner = getCleanerById(assignment.cleanerId);
      if (!area || !cleaner) return;

      if (!groups.has(area.id)) {
        groups.set(area.id, { area, cleaners: [], assignments: [] });
      }
      groups.get(area.id)!.cleaners.push(cleaner);
      groups.get(area.id)!.assignments.push(assignment);
    });

    return Array.from(groups.values());
  }, [currentAssignments, areas, cleaners]);

  const maleAreaGroups = groupedAssignments.filter((g) => g.area.gender === 'male');
  const femaleAreaGroups = groupedAssignments.filter((g) => g.area.gender === 'female');

  const handleGenerate = () => {
    const dateStr = selectedDate.toISOString().split('T')[0];
    onGenerateAssignments(dateStr);
  };

  const handleGenerateMonthly = () => {
    onGenerateMonthlySchedule(monthlyYear, monthlyMonth, skipWeekends);
    setIsMonthlyDialogOpen(false);
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      const dateStr = date.toISOString().split('T')[0];
      onLoadFromHistory(dateStr);
    }
  };

  const openSubstituteDialog = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setSubstituteCleanerId('');
    setIsSubstituteDialogOpen(true);
  };

  const handleSubstitute = () => {
    if (selectedAssignment && substituteCleanerId) {
      try {
        onSubstituteCleaner(selectedAssignment.id, substituteCleanerId, selectedAssignment.date);
        // Use setTimeout to ensure state updates complete before closing dialog
        setTimeout(() => {
          setIsSubstituteDialogOpen(false);
          setSelectedAssignment(null);
          setSubstituteCleanerId('');
        }, 0);
      } catch (error) {
        console.error('Error substituting cleaner:', error);
      }
    }
  };

  const renderAreaGroupList = (
    areaGroups: AreaAssignmentGroup[],
    title: string,
    bgColor: string,
    borderColor: string
  ) => (
    <div className={`rounded-lg border ${borderColor} overflow-hidden`}>
      <div className={`px-4 py-3 ${bgColor} border-b ${borderColor}`}>
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${title.includes('Girls') ? 'bg-pink-500' : 'bg-blue-500'}`}></span>
          {title} ({areaGroups.length} areas)
        </h3>
      </div>
      <div className="divide-y divide-gray-100">
        {areaGroups.length === 0 ? (
          <div className="p-8 text-center">
            <AlertCircle className="w-8 h-8 mx-auto text-gray-300 mb-2" />
            <p className="text-sm text-gray-400">No assignments yet</p>
          </div>
        ) : (
          areaGroups.map((group) => (
            <div
              key={group.area.id}
              className="p-4 hover:bg-gray-50 transition-colors"
            >
              {/* Area Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <MapPin className={`w-4 h-4 ${
                    group.area.gender === 'male' ? 'text-blue-500' : 'text-pink-500'
                  }`} />
                  <span className="font-semibold text-gray-900">{group.area.name}</span>
                </div>
                <Badge variant="outline" className="text-xs flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {group.cleaners.length} / {group.area.cleanerCount} cleaners
                </Badge>
              </div>
              
              {/* Cleaners List */}
              <div className="space-y-2 ml-6">
                {group.cleaners.map((cleaner, index) => {
                  const assignment = group.assignments[index];
                  return (
                    <div
                      key={cleaner.id}
                      className="flex items-center justify-between gap-3 text-sm group"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                          cleaner.gender === 'male' 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'bg-pink-100 text-pink-700'
                        }`}>
                          {index + 1}
                        </div>
                        <User className={`w-4 h-4 ${
                          cleaner.gender === 'male' ? 'text-blue-500' : 'text-pink-500'
                        }`} />
                        <span className="text-gray-700">{cleaner.name}</span>
                        <Badge
                          variant="secondary"
                          className={`text-xs ${
                            cleaner.gender === 'male'
                              ? 'bg-blue-50 text-blue-700'
                              : 'bg-pink-50 text-pink-700'
                          }`}
                        >
                          {cleaner.gender === 'male' ? 'Boy' : 'Girl'}
                        </Badge>
                      </div>
                      {assignment && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 h-7 px-2 text-xs"
                          onClick={() => openSubstituteDialog(assignment)}
                        >
                          <RefreshCw className="w-3 h-3 mr-1" />
                          Substitute
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const hasAssignments = currentAssignments.length > 0;
  const dateStr = selectedDate.toISOString().split('T')[0];
  const hasHistoryForDate = assignmentHistory.some((h) => h.date === dateStr);

  // Calculate total cleaners needed
  const totalCleanersNeeded = areas.reduce((sum, area) => sum + (area.cleanerCount || 1), 0);
  const maleCleanersNeeded = areas
    .filter((a) => a.gender === 'male')
    .reduce((sum, area) => sum + (area.cleanerCount || 1), 0);
  const femaleCleanersNeeded = areas
    .filter((a) => a.gender === 'female')
    .reduce((sum, area) => sum + (area.cleanerCount || 1), 0);

  // Get available substitutes for selected assignment
  const getAvailableSubstitutes = () => {
    if (!selectedAssignment) return [];
    const currentCleaner = getCleanerById(selectedAssignment.cleanerId);
    if (!currentCleaner) return [];
    
    try {
      return cleaners.filter(
        (c) => 
          c.gender === currentCleaner.gender && 
          c.id !== currentCleaner.id &&
          !currentAssignments.some((a) => a.cleanerId === c.id)
      );
    } catch (error) {
      console.error('Error getting available substitutes:', error);
      return [];
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <ClipboardList className="w-5 h-5" />
          Daily Assignments
        </CardTitle>
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'justify-start text-left font-normal',
                  !selectedDate && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, 'PPP') : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          {/* Monthly Schedule Dialog */}
          <Dialog open={isMonthlyDialogOpen} onOpenChange={setIsMonthlyDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <CalendarDays className="w-4 h-4 mr-1" />
                Monthly
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Generate Monthly Schedule</DialogTitle>
                <DialogDescription>
                  Create assignments for an entire month. This will generate schedules for all days in the selected month.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="month">Month</Label>
                    <Select
                      value={monthlyMonth.toString()}
                      onValueChange={(v) => setMonthlyMonth(parseInt(v))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 12 }, (_, i) => (
                          <SelectItem key={i + 1} value={(i + 1).toString()}>
                            {format(new Date(2024, i, 1), 'MMMM')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="year">Year</Label>
                    <Select
                      value={monthlyYear.toString()}
                      onValueChange={(v) => setMonthlyYear(parseInt(v))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[2024, 2025, 2026].map((y) => (
                          <SelectItem key={y} value={y.toString()}>
                            {y}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="skipWeekends"
                    checked={skipWeekends}
                    onCheckedChange={(checked) => setSkipWeekends(checked as boolean)}
                  />
                  <Label htmlFor="skipWeekends" className="text-sm font-normal cursor-pointer">
                    Skip weekends (Saturday & Sunday)
                  </Label>
                </div>
                <div className="bg-blue-50 rounded-lg p-3 text-sm text-blue-700">
                  <p>
                    Will generate schedule for <strong>{format(new Date(monthlyYear, monthlyMonth - 1), 'MMMM yyyy')}</strong>
                    {skipWeekends && ' (excluding weekends)'}.
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsMonthlyDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleGenerateMonthly}>
                  <CalendarDays className="w-4 h-4 mr-2" />
                  Generate Monthly Schedule
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon">
                <History className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <span>Assignment History</span>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      onClearHistory();
                      setIsHistoryOpen(false);
                    }}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Clear All
                  </Button>
                </DialogTitle>
                <DialogDescription>
                  View and manage past cleaning assignments
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                {assignmentHistory.length === 0 ? (
                  <div className="text-center py-8">
                    <History className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500">No assignment history yet</p>
                  </div>
                ) : (
                  assignmentHistory.map((history) => (
                    <div
                      key={history.date}
                      className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                      onClick={() => {
                        handleDateSelect(new Date(history.date));
                        setIsHistoryOpen(false);
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <CalendarIcon className="w-5 h-5 text-gray-400" />
                          <span className="font-medium">
                            {format(new Date(history.date), 'EEEE, MMMM d, yyyy')}
                          </span>
                        </div>
                        <Badge variant="secondary">
                          {history.assignments.length} assignments
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Requirements Info */}
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-sm text-gray-600 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Cleaners needed: <span className="font-medium">{totalCleanersNeeded}</span>
            <span className="text-gray-400">|</span>
            <span className="text-pink-600">{femaleCleanersNeeded} girls</span>
            <span className="text-gray-400">|</span>
            <span className="text-blue-600">{maleCleanersNeeded} boys</span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={handleGenerate}
            className="flex-1"
            disabled={hasAssignments && !hasHistoryForDate}
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            {hasHistoryForDate ? 'Regenerate' : 'Generate'} Assignments
          </Button>
          {hasAssignments && (
            <Button variant="outline" onClick={onClearAssignments}>
              <Trash2 className="w-4 h-4 mr-2" />
              Clear
            </Button>
          )}
        </div>

        {/* Info Alert */}
        {hasHistoryForDate && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5" />
            <div>
              <p className="text-sm text-blue-800 font-medium">
                Assignments exist for this date
              </p>
              <p className="text-xs text-blue-600">
                Loading from history. Click &quot;Regenerate&quot; to create new assignments.
              </p>
            </div>
          </div>
        )}

        {/* Assignment Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {renderAreaGroupList(
            femaleAreaGroups,
            'Girls Areas',
            'bg-pink-50',
            'border-pink-200'
          )}
          {renderAreaGroupList(
            maleAreaGroups,
            'Boys Areas',
            'bg-blue-50',
            'border-blue-200'
          )}
        </div>

        {/* Summary */}
        {hasAssignments && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Summary</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Total Areas:</span>{' '}
                <span className="font-medium">{groupedAssignments.length}</span>
              </div>
              <div>
                <span className="text-gray-500">Cleaners Assigned:</span>{' '}
                <span className="font-medium">
                  {new Set(currentAssignments.map((a) => a.cleanerId)).size}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Girls Areas:</span>{' '}
                <span className="font-medium">{femaleAreaGroups.length}</span>
              </div>
              <div>
                <span className="text-gray-500">Boys Areas:</span>{' '}
                <span className="font-medium">{maleAreaGroups.length}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>

      {/* Substitute Dialog */}
      <Dialog open={isSubstituteDialogOpen} onOpenChange={setIsSubstituteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Substitute Cleaner</DialogTitle>
            <DialogDescription>
              {selectedAssignment && (
                <>
                  Replace <strong>{getCleanerById(selectedAssignment.cleanerId)?.name}</strong> with a substitute.
                  The substitute must be the same gender and not already assigned today.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Select Substitute</Label>
              <Select
                value={substituteCleanerId}
                onValueChange={setSubstituteCleanerId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a substitute..." />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableSubstitutes().length === 0 ? (
                    <SelectItem value="" disabled>
                      No available substitutes
                    </SelectItem>
                  ) : (
                    getAvailableSubstitutes().map((cleaner) => (
                      <SelectItem key={cleaner.id} value={cleaner.id}>
                        {cleaner.name} ({cleaner.assignmentCount} assignments)
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {getAvailableSubstitutes().length === 0 && (
                <p className="text-sm text-orange-600">
                  No available substitutes. All cleaners of this gender are already assigned.
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSubstituteDialogOpen(false)}>
              <X className="w-4 h-4 mr-1" />
              Cancel
            </Button>
            <Button 
              onClick={handleSubstitute}
              disabled={!substituteCleanerId || getAvailableSubstitutes().length === 0}
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Confirm Substitute
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
