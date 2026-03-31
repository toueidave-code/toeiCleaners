import type { Cleaner, CleaningArea, AssignmentHistory } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  BarChart3,
  Users,
  MapPin,
  TrendingUp,
  Award,
  Calendar,
} from 'lucide-react';

interface StatisticsProps {
  cleaners: Cleaner[];
  areas: CleaningArea[];
  assignmentHistory: AssignmentHistory[];
}

export function Statistics({ cleaners, areas, assignmentHistory }: StatisticsProps) {
  const maleCleaners = cleaners.filter((c) => c.gender === 'male');
  const femaleCleaners = cleaners.filter((c) => c.gender === 'female');
  const maleAreas = areas.filter((a) => a.gender === 'male');
  const femaleAreas = areas.filter((a) => a.gender === 'female');

  const totalAssignments = cleaners.reduce(
    (sum, c) => sum + c.assignmentCount,
    0
  );

  const getMostActiveCleaner = (gender: 'male' | 'female') => {
    const genderCleaners = cleaners.filter((c) => c.gender === gender);
    if (genderCleaners.length === 0) return null;
    return genderCleaners.reduce((max, c) =>
      c.assignmentCount > max.assignmentCount ? c : max
    );
  };

  const getLeastActiveCleaner = (gender: 'male' | 'female') => {
    const genderCleaners = cleaners.filter((c) => c.gender === gender);
    if (genderCleaners.length === 0) return null;
    return genderCleaners.reduce((min, c) =>
      c.assignmentCount < min.assignmentCount ? c : min
    );
  };

  const mostActiveGirl = getMostActiveCleaner('female');
  const mostActiveBoy = getMostActiveCleaner('male');
  const leastActiveGirl = getLeastActiveCleaner('female');
  const leastActiveBoy = getMostActiveCleaner('male');

  const maxAssignments = Math.max(...cleaners.map((c) => c.assignmentCount), 1);

  const renderCleanerStats = (
    cleanerList: Cleaner[],
    title: string,
    colorClass: string
  ) => (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
        {title}
      </h3>
      {cleanerList.length === 0 ? (
        <p className="text-sm text-gray-400 italic">No {title.toLowerCase()} yet</p>
      ) : (
        <div className="space-y-2">
          {cleanerList
            .sort((a, b) => b.assignmentCount - a.assignmentCount)
            .map((cleaner) => (
              <div key={cleaner.id} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700">{cleaner.name}</span>
                  <span className="text-gray-500">{cleaner.assignmentCount}</span>
                </div>
                <Progress
                  value={(cleaner.assignmentCount / maxAssignments) * 100}
                  className={`h-2 ${colorClass}`}
                />
              </div>
            ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Cleaners</p>
                <p className="text-2xl font-bold">{cleaners.length}</p>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <div className="mt-2 flex gap-2 text-xs">
              <span className="text-pink-600">{femaleCleaners.length} Girls</span>
              <span className="text-gray-300">|</span>
              <span className="text-blue-600">{maleCleaners.length} Boys</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Areas</p>
                <p className="text-2xl font-bold">{areas.length}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <MapPin className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="mt-2 flex gap-2 text-xs">
              <span className="text-pink-600">{femaleAreas.length} Girls</span>
              <span className="text-gray-300">|</span>
              <span className="text-blue-600">{maleAreas.length} Boys</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Assignments</p>
                <p className="text-2xl font-bold">{totalAssignments}</p>
              </div>
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-orange-600" />
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              Across {assignmentHistory.length} days
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">History</p>
                <p className="text-2xl font-bold">{assignmentHistory.length}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              Days recorded
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assignment Distribution */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Assignment Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {renderCleanerStats(
              femaleCleaners,
              'Girls',
              'bg-pink-500'
            )}
            {renderCleanerStats(
              maleCleaners,
              'Boys',
              'bg-blue-500'
            )}
          </CardContent>
        </Card>

        {/* Rotation Insights */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Award className="w-5 h-5" />
              Rotation Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Most Active */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                Most Active
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {mostActiveGirl && (
                  <div className="bg-pink-50 border border-pink-200 rounded-lg p-3">
                    <Badge className="bg-pink-100 text-pink-800 mb-2">Girl</Badge>
                    <p className="font-semibold text-gray-900">{mostActiveGirl.name}</p>
                    <p className="text-sm text-gray-500">
                      {mostActiveGirl.assignmentCount} assignments
                    </p>
                  </div>
                )}
                {mostActiveBoy && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <Badge className="bg-blue-100 text-blue-800 mb-2">Boy</Badge>
                    <p className="font-semibold text-gray-900">{mostActiveBoy.name}</p>
                    <p className="text-sm text-gray-500">
                      {mostActiveBoy.assignmentCount} assignments
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Next in Line */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                Next in Line (Least Assigned)
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {leastActiveGirl && (
                  <div className="bg-pink-50 border border-pink-200 rounded-lg p-3">
                    <Badge className="bg-pink-100 text-pink-800 mb-2">Girl</Badge>
                    <p className="font-semibold text-gray-900">{leastActiveGirl.name}</p>
                    <p className="text-sm text-gray-500">
                      {leastActiveGirl.assignmentCount} assignments
                    </p>
                  </div>
                )}
                {leastActiveBoy && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <Badge className="bg-blue-100 text-blue-800 mb-2">Boy</Badge>
                    <p className="font-semibold text-gray-900">{leastActiveBoy.name}</p>
                    <p className="text-sm text-gray-500">
                      {leastActiveBoy.assignmentCount} assignments
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Balance Indicator */}
            {cleaners.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                  Assignment Balance
                </h3>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600">Variance</span>
                    <span className="font-medium">
                      {Math.max(
                        ...cleaners.map((c) => c.assignmentCount)
                      ) -
                        Math.min(
                          ...cleaners.map((c) => c.assignmentCount),
                          Infinity
                        ) || 0}{' '}
                      assignments
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Lower variance indicates fairer rotation. The system prioritizes
                    cleaners with fewer assignments.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
