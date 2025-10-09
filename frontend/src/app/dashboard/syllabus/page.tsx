'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  BookOpen, Search, Filter, Calendar, Clock, Target,
  TrendingUp, Star, Award, CheckCircle2, PlayCircle, Circle
} from 'lucide-react';
import { SyllabusOverview } from '@/components/syllabus/SyllabusOverview';
import { SyllabusTreeView } from '@/components/syllabus/SyllabusTreeView';
import { 
  ExamSyllabus, 
  SyllabusItem, 
  SyllabusProgress, 
  SyllabusStats,
  mockSyllabusData,
  getSyllabusForExam,
  getSyllabusProgress,
  calculateSyllabusStats
} from '@/types/syllabus';

export default function SyllabusPage() {
  const [selectedExam, setSelectedExam] = useState<string>('upsc_cse');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [syllabus, setSyllabus] = useState<ExamSyllabus | null>(null);
  const [userProgress, setUserProgress] = useState<SyllabusProgress[]>([]);
  const [stats, setStats] = useState<SyllabusStats | null>(null);

  // Mock user ID - in production, get from auth context
  const userId = 'current-user-id';

  useEffect(() => {
    loadSyllabusData();
  }, [selectedExam]);

  const loadSyllabusData = () => {
    const syllabusData = getSyllabusForExam(selectedExam);
    if (syllabusData) {
      setSyllabus(syllabusData);
      
      // Generate mock progress data
      const mockProgress: SyllabusProgress[] = syllabusData.syllabus.map(item => {
        const randomStatus = Math.random();
        let status: 'not_started' | 'in_progress' | 'completed' | 'mastered';
        if (randomStatus < 0.3) status = 'completed';
        else if (randomStatus < 0.5) status = 'in_progress';
        else if (randomStatus < 0.7) status = 'not_started';
        else status = 'mastered';

        return {
          syllabusItemId: item.id,
          userId,
          status,
          progressPercentage: status === 'not_started' ? 0 : 
                            status === 'completed' || status === 'mastered' ? 100 :
                            Math.floor(Math.random() * 80) + 10,
          timeSpent: status === 'not_started' ? 0 : Math.floor(Math.random() * 120) + 30,
          lastAccessed: new Date(),
          notes: ''
        };
      });

      setUserProgress(mockProgress);
      
      // Calculate stats with mock weak areas and recommendations
      const calculatedStats = calculateSyllabusStats(syllabusData.syllabus, mockProgress);
      const enhancedStats: SyllabusStats = {
        ...calculatedStats,
        weakAreas: ['Modern History', 'Physical Geography', 'Constitutional Law'],
        strongAreas: ['Ancient History', 'Indian Culture', 'Geography'],
        recommendedNext: ['Medieval History', 'Indian Politics', 'Current Affairs']
      };
      
      setStats(enhancedStats);
    }
  };

  const handleItemClick = (item: SyllabusItem) => {
    console.log('Navigate to item:', item.title);
    // In production: navigate to detailed topic view
  };

  const handleStartTopic = (item: SyllabusItem) => {
    console.log('Start studying:', item.title);
    // In production: start study session for topic
  };

  const filteredSyllabusItems = syllabus?.syllabus.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (!matchesSearch) return false;
    
    if (filterStatus === 'all') return true;
    
    const progress = userProgress.find(p => p.syllabusItemId === item.id);
    const status = progress?.status || 'not_started';
    
    return status === filterStatus;
  }) || [];

  const availableExams = Object.keys(mockSyllabusData);

  return (
    <div className="container mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <BookOpen className="h-6 w-6 sm:h-8 sm:w-8" />
            Syllabus Management
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Track your study progress and manage exam syllabus
          </p>
        </div>

        <div className="w-full sm:w-auto">
          <Select value={selectedExam} onValueChange={setSelectedExam}>
            <SelectTrigger className="w-full sm:w-64">
              <SelectValue placeholder="Select exam" />
            </SelectTrigger>
            <SelectContent>
              {availableExams.map(examId => {
                const exam = mockSyllabusData[examId];
                return (
                  <SelectItem key={examId} value={examId}>
                    {exam.examName}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      </div>

      {syllabus && stats && (
        <Tabs defaultValue="overview" className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
            <TabsTrigger value="syllabus" className="text-xs sm:text-sm">Syllabus</TabsTrigger>
            <TabsTrigger value="progress" className="text-xs sm:text-sm">Progress</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <SyllabusOverview syllabus={syllabus} stats={stats} />
          </TabsContent>

          <TabsContent value="syllabus" className="space-y-6">
            {/* Search and Filter Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Syllabus Navigation</CardTitle>
                <CardDescription>
                  Explore topics, track progress, and access study materials
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search topics, descriptions, or tags..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-full sm:w-48">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Topics</SelectItem>
                      <SelectItem value="not_started">Not Started</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="mastered">Mastered</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div className="text-center p-2 sm:p-3 bg-muted rounded-lg">
                    <div className="text-xl sm:text-2xl font-bold text-green-600">{stats.completedTopics}</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">Completed</div>
                  </div>
                  <div className="text-center p-2 sm:p-3 bg-muted rounded-lg">
                    <div className="text-xl sm:text-2xl font-bold text-blue-600">{stats.inProgressTopics}</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">In Progress</div>
                  </div>
                  <div className="text-center p-2 sm:p-3 bg-muted rounded-lg">
                    <div className="text-xl sm:text-2xl font-bold text-gray-600">{stats.notStartedTopics}</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">Not Started</div>
                  </div>
                  <div className="text-center p-2 sm:p-3 bg-muted rounded-lg">
                    <div className="text-xl sm:text-2xl font-bold text-purple-600">{Math.round(stats.overallProgress)}%</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">Overall</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <SyllabusTreeView 
              syllabusItems={filteredSyllabusItems}
              userProgress={userProgress}
              onItemClick={handleItemClick}
              onStartTopic={handleStartTopic}
            />
          </TabsContent>

          <TabsContent value="progress" className="space-y-4 sm:space-y-6">
            {/* Progress Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                    Study Progress Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs sm:text-sm">This Week</span>
                      <Badge variant="outline" className="text-xs">12h studied</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs sm:text-sm">This Month</span>
                      <Badge variant="outline" className="text-xs">45h studied</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs sm:text-sm">Total Time</span>
                      <Badge className="text-xs">{Math.floor(stats.totalTimeSpent / 60)}h {stats.totalTimeSpent % 60}m</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                    <Target className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
                    Study Goals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs sm:text-sm">Daily Goal</span>
                      <Badge variant="outline" className="text-xs">2h / 3h</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs sm:text-sm">Weekly Goal</span>
                      <Badge variant="outline" className="text-xs">12h / 20h</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs sm:text-sm">Monthly Goal</span>
                      <Badge className="text-xs">45h / 80h</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
                  Recent Study Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 sm:space-y-3">
                  {userProgress
                    .filter(p => p.status === 'in_progress' || p.status === 'completed')
                    .slice(0, 5)
                    .map(progress => {
                      const item = syllabus.syllabus.find(s => s.id === progress.syllabusItemId);
                      if (!item) return null;

                      return (
                        <div key={progress.syllabusItemId} className="flex items-center justify-between gap-2 p-2 sm:p-3 bg-muted rounded-lg">
                          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                            {progress.status === 'completed' ? (
                              <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-green-600" />
                            ) : (
                              <PlayCircle className="h-4 w-4 flex-shrink-0 text-blue-600" />
                            )}
                            <div className="min-w-0 flex-1">
                              <div className="font-medium text-sm sm:text-base truncate">{item.title}</div>
                              <div className="text-xs sm:text-sm text-muted-foreground">
                                {Math.floor(progress.timeSpent / 60)}h {progress.timeSpent % 60}m studied
                              </div>
                            </div>
                          </div>
                          <Badge variant={progress.status === 'completed' ? 'default' : 'secondary'} className="text-xs flex-shrink-0">
                            {progress.progressPercentage}%
                          </Badge>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}