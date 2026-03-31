import { useState } from 'react';
import type { CleaningArea, Gender } from '@/types';
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
import { Plus, Edit2, Trash2, MapPin, RotateCcw, Users } from 'lucide-react';

interface AreaManagementProps {
  areas: CleaningArea[];
  addArea: (name: string, gender: Gender, cleanerCount: number, description?: string) => void;
  updateArea: (id: string, updates: Partial<Omit<CleaningArea, 'id'>>) => void;
  deleteArea: (id: string) => void;
  resetToDefaults: () => void;
}

export function AreaManagement({
  areas,
  addArea,
  updateArea,
  deleteArea,
  resetToDefaults,
}: AreaManagementProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingArea, setEditingArea] = useState<CleaningArea | null>(null);
  const [newAreaName, setNewAreaName] = useState('');
  const [newAreaGender, setNewAreaGender] = useState<Gender>('female');
  const [newAreaCleanerCount, setNewAreaCleanerCount] = useState(1);
  const [newAreaDescription, setNewAreaDescription] = useState('');

  const maleAreas = areas.filter((a) => a.gender === 'male');
  const femaleAreas = areas.filter((a) => a.gender === 'female');

  const handleAddArea = () => {
    if (newAreaName.trim()) {
      addArea(
        newAreaName,
        newAreaGender,
        newAreaCleanerCount,
        newAreaDescription.trim() || undefined
      );
      setNewAreaName('');
      setNewAreaGender('female');
      setNewAreaCleanerCount(1);
      setNewAreaDescription('');
      setIsAddDialogOpen(false);
    }
  };

  const handleEditArea = () => {
    if (editingArea && newAreaName.trim()) {
      updateArea(editingArea.id, {
        name: newAreaName,
        gender: newAreaGender,
        cleanerCount: newAreaCleanerCount,
        description: newAreaDescription.trim() || undefined,
      });
      setEditingArea(null);
      setNewAreaName('');
      setNewAreaCleanerCount(1);
      setNewAreaDescription('');
      setIsEditDialogOpen(false);
    }
  };

  const openEditDialog = (area: CleaningArea) => {
    setEditingArea(area);
    setNewAreaName(area.name);
    setNewAreaGender(area.gender);
    setNewAreaCleanerCount(area.cleanerCount);
    setNewAreaDescription(area.description || '');
    setIsEditDialogOpen(true);
  };

  const getGenderBadgeColor = (gender: Gender) => {
    return gender === 'male'
      ? 'bg-blue-100 text-blue-800 hover:bg-blue-100'
      : 'bg-pink-100 text-pink-800 hover:bg-pink-100';
  };

  const renderAreaList = (areaList: CleaningArea[], title: string, iconColor: string) => (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${iconColor}`}></span>
        {title} ({areaList.length})
      </h3>
      <div className="space-y-2">
        {areaList.length === 0 ? (
          <p className="text-sm text-gray-400 italic">No {title.toLowerCase()} defined yet</p>
        ) : (
          areaList.map((area) => (
            <div
              key={area.id}
              className="flex items-center justify-between p-3 bg-white border rounded-lg hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  area.gender === 'male' ? 'bg-blue-50' : 'bg-pink-50'
                }`}>
                  <MapPin className={`w-4 h-4 ${
                    area.gender === 'male' ? 'text-blue-500' : 'text-pink-500'
                  }`} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900">{area.name}</p>
                    <Badge variant="outline" className="text-xs flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {area.cleanerCount} cleaner{area.cleanerCount > 1 ? 's' : ''}
                    </Badge>
                  </div>
                  {area.description && (
                    <p className="text-xs text-gray-500">{area.description}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className={getGenderBadgeColor(area.gender)}>
                  {area.gender === 'male' ? 'Boys Only' : 'Girls Only'}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openEditDialog(area)}
                  className="h-8 w-8"
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteArea(area.id)}
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

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Cleaning Areas
        </CardTitle>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={resetToDefaults}
            className="text-orange-600 border-orange-200 hover:bg-orange-50"
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            Reset Default
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Add Area
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Cleaning Area</DialogTitle>
                <DialogDescription>
                  Define a new cleaning area and specify how many cleaners are needed.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="area-name">Area Name</Label>
                  <Input
                    id="area-name"
                    placeholder="e.g., Pantry, Boys Toilet"
                    value={newAreaName}
                    onChange={(e) => setNewAreaName(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="area-gender">Assigned Gender</Label>
                    <Select
                      value={newAreaGender}
                      onValueChange={(value: Gender) => setNewAreaGender(value)}
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
                    <Label htmlFor="area-cleaner-count">Cleaners Needed</Label>
                    <Input
                      id="area-cleaner-count"
                      type="number"
                      min={1}
                      max={10}
                      value={newAreaCleanerCount}
                      onChange={(e) => setNewAreaCleanerCount(Math.max(1, parseInt(e.target.value) || 1))}
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  Only cleaners of the selected gender will be assigned to this area.
                </p>
                <div className="space-y-2">
                  <Label htmlFor="area-description">Description (Optional)</Label>
                  <Textarea
                    id="area-description"
                    placeholder="Brief description of the area"
                    value={newAreaDescription}
                    onChange={(e) => setNewAreaDescription(e.target.value)}
                    rows={2}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddArea}>Add Area</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {renderAreaList(femaleAreas, 'Girls Areas', 'bg-pink-500')}
        {renderAreaList(maleAreas, 'Boys Areas', 'bg-blue-500')}
      </CardContent>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Cleaning Area</DialogTitle>
            <DialogDescription>Update the area information.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-area-name">Area Name</Label>
              <Input
                id="edit-area-name"
                placeholder="e.g., Pantry, Boys Toilet"
                value={newAreaName}
                onChange={(e) => setNewAreaName(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-area-gender">Assigned Gender</Label>
                <Select
                  value={newAreaGender}
                  onValueChange={(value: Gender) => setNewAreaGender(value)}
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
                <Label htmlFor="edit-area-cleaner-count">Cleaners Needed</Label>
                <Input
                  id="edit-area-cleaner-count"
                  type="number"
                  min={1}
                  max={10}
                  value={newAreaCleanerCount}
                  onChange={(e) => setNewAreaCleanerCount(Math.max(1, parseInt(e.target.value) || 1))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-area-description">Description (Optional)</Label>
              <Textarea
                id="edit-area-description"
                placeholder="Brief description of the area"
                value={newAreaDescription}
                onChange={(e) => setNewAreaDescription(e.target.value)}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditArea}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
