import { useState } from 'react';
import type { Cleaner, Gender } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Badge } from '@/components/ui/badge';
import { Plus, Edit2, Trash2, User, RotateCcw, Users } from 'lucide-react';

interface CleanerManagementProps {
  cleaners: Cleaner[];
  addCleaner: (name: string, gender: Gender) => void;
  addCleanersBatch: (names: string[], gender: Gender) => number;
  updateCleaner: (id: string, updates: Partial<Omit<Cleaner, 'id'>>) => void;
  deleteCleaner: (id: string) => void;
  resetAllAssignments: () => void;
}

export function CleanerManagement({
  cleaners,
  addCleaner,
  addCleanersBatch,
  updateCleaner,
  deleteCleaner,
  resetAllAssignments,
}: CleanerManagementProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isBatchDialogOpen, setIsBatchDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCleaner, setEditingCleaner] = useState<Cleaner | null>(null);
  const [newCleanerName, setNewCleanerName] = useState('');
  const [newCleanerGender, setNewCleanerGender] = useState<Gender>('female');
  const [batchNames, setBatchNames] = useState('');
  const [batchGender, setBatchGender] = useState<Gender>('female');

  const maleCleaners = cleaners.filter((c) => c.gender === 'male');
  const femaleCleaners = cleaners.filter((c) => c.gender === 'female');

  const handleAddCleaner = () => {
    if (newCleanerName.trim()) {
      addCleaner(newCleanerName, newCleanerGender);
      setNewCleanerName('');
      setNewCleanerGender('female');
      setIsAddDialogOpen(false);
    }
  };

  const handleBatchAdd = () => {
    const names = batchNames
      .split('\n')
      .map((n) => n.trim())
      .filter((n) => n.length > 0);
    
    if (names.length > 0) {
      addCleanersBatch(names, batchGender);
      setBatchNames('');
      setBatchGender('female');
      setIsBatchDialogOpen(false);
    }
  };

  const handleEditCleaner = () => {
    if (editingCleaner && newCleanerName.trim()) {
      updateCleaner(editingCleaner.id, {
        name: newCleanerName,
        gender: newCleanerGender,
      });
      setEditingCleaner(null);
      setNewCleanerName('');
      setIsEditDialogOpen(false);
    }
  };

  const openEditDialog = (cleaner: Cleaner) => {
    setEditingCleaner(cleaner);
    setNewCleanerName(cleaner.name);
    setNewCleanerGender(cleaner.gender);
    setIsEditDialogOpen(true);
  };

  const getGenderBadgeColor = (gender: Gender) => {
    return gender === 'male'
      ? 'bg-blue-100 text-blue-800 hover:bg-blue-100'
      : 'bg-pink-100 text-pink-800 hover:bg-pink-100';
  };

  const renderCleanerList = (cleanerList: Cleaner[], title: string, iconColor: string) => (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${iconColor}`}></span>
        {title} ({cleanerList.length})
      </h3>
      <div className="space-y-2">
        {cleanerList.length === 0 ? (
          <p className="text-sm text-gray-400 italic">No {title.toLowerCase()} added yet</p>
        ) : (
          cleanerList.map((cleaner) => (
            <div
              key={cleaner.id}
              className="flex items-center justify-between p-3 bg-white border rounded-lg hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  cleaner.gender === 'male' ? 'bg-blue-50' : 'bg-pink-50'
                }`}>
                  <User className={`w-4 h-4 ${
                    cleaner.gender === 'male' ? 'text-blue-500' : 'text-pink-500'
                  }`} />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{cleaner.name}</p>
                  <p className="text-xs text-gray-500">
                    Assignments: {cleaner.assignmentCount}
                    {cleaner.lastAssignedDate && (
                      <span className="ml-2">
                        Last: {new Date(cleaner.lastAssignedDate).toLocaleDateString()}
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className={getGenderBadgeColor(cleaner.gender)}>
                  {cleaner.gender === 'male' ? 'Boy' : 'Girl'}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openEditDialog(cleaner)}
                  className="h-8 w-8"
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteCleaner(cleaner.id)}
                  className="h-8 w-8 text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  // Preview count for batch
  const batchPreviewCount = batchNames
    .split('\n')
    .map((n) => n.trim())
    .filter((n) => n.length > 0).length;

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <User className="w-5 h-5" />
          Cleaners Management
        </CardTitle>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={resetAllAssignments}
            className="text-orange-600 border-orange-200 hover:bg-orange-50"
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            Reset Stats
          </Button>
          
          {/* Batch Add Dialog */}
          <Dialog open={isBatchDialogOpen} onOpenChange={setIsBatchDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Users className="w-4 h-4 mr-1" />
                Batch Add
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add Multiple Cleaners</DialogTitle>
                <DialogDescription>
                  Enter multiple names, one per line. All will be added with the same gender.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="batch-gender">Gender for All</Label>
                  <Select
                    value={batchGender}
                    onValueChange={(value: Gender) => setBatchGender(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="female">Girls</SelectItem>
                      <SelectItem value="male">Boys</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="batch-names">
                    Names <span className="text-gray-400">(one per line)</span>
                  </Label>
                  <Textarea
                    id="batch-names"
                    placeholder="Alice&#10;Bob&#10;Charlie&#10;..."
                    value={batchNames}
                    onChange={(e) => setBatchNames(e.target.value)}
                    rows={8}
                  />
                  {batchPreviewCount > 0 && (
                    <p className="text-sm text-gray-500">
                      Will add <span className="font-medium">{batchPreviewCount}</span> cleaners
                    </p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsBatchDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleBatchAdd}
                  disabled={batchPreviewCount === 0}
                >
                  Add {batchPreviewCount > 0 && `(${batchPreviewCount})`} Cleaners
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Single Add Dialog */}
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Add Cleaner
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Cleaner</DialogTitle>
                <DialogDescription>
                  Enter the cleaner's name and select their gender.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter cleaner name"
                    value={newCleanerName}
                    onChange={(e) => setNewCleanerName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                    value={newCleanerGender}
                    onValueChange={(value: Gender) => setNewCleanerGender(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="female">Girl</SelectItem>
                      <SelectItem value="male">Boy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddCleaner}>Add Cleaner</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {renderCleanerList(femaleCleaners, 'Girls', 'bg-pink-500')}
        {renderCleanerList(maleCleaners, 'Boys', 'bg-blue-500')}
      </CardContent>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Cleaner</DialogTitle>
            <DialogDescription>Update the cleaner's information.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                placeholder="Enter cleaner name"
                value={newCleanerName}
                onChange={(e) => setNewCleanerName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-gender">Gender</Label>
              <Select
                value={newCleanerGender}
                onValueChange={(value: Gender) => setNewCleanerGender(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="female">Girl</SelectItem>
                  <SelectItem value="male">Boy</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditCleaner}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
