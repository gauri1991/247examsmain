'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  FileText, Video, Headphones, Monitor, Search, Filter,
  Star, Eye, Clock, Download, BookOpen, Play, Pause,
  Bookmark, BookmarkCheck, ChevronRight, Users
} from 'lucide-react';
import { StudyMaterial, VideoLecture, useLMS } from '@/hooks/useLMS';
import { useAuth } from '@/contexts/auth-context';

interface StudyMaterialsLibraryProps {
  className?: string;
}

export function StudyMaterialsLibrary({ className }: StudyMaterialsLibraryProps) {
  const { user } = useAuth();
  const {
    materials,
    lectures,
    progress,
    loading,
    fetchMaterials,
    fetchLectures,
    fetchProgress,
    updateProgress,
    getProgressForMaterial
  } = useLMS({ userId: user?.id });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<'all' | 'document' | 'video' | 'audio' | 'interactive'>('all');
  const [currentView, setCurrentView] = useState<'materials' | 'lectures'>('materials');

  useEffect(() => {
    fetchMaterials();
    fetchLectures();
    fetchProgress();
  }, [fetchMaterials, fetchLectures, fetchProgress]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'document':
        return <FileText className="w-5 h-5" />;
      case 'video':
        return <Video className="w-5 h-5" />;
      case 'audio':
        return <Headphones className="w-5 h-5" />;
      case 'interactive':
        return <Monitor className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const formatVideoDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleMaterialClick = async (material: StudyMaterial) => {
    const materialProgress = getProgressForMaterial(material.id);
    if (!materialProgress) {
      await updateProgress(material.id, {
        materialType: material.type,
        progressPercentage: 0,
        timeSpent: 0
      });
    }
    
    // In a real implementation, this would navigate to the material viewer
    console.log('Opening material:', material.title);
  };

  const handleLectureClick = async (lecture: VideoLecture) => {
    const lectureProgress = getProgressForMaterial(lecture.id);
    if (!lectureProgress) {
      await updateProgress(lecture.id, {
        materialType: 'video',
        progressPercentage: 0,
        timeSpent: 0
      });
    }
    
    // In a real implementation, this would navigate to the video player
    console.log('Opening lecture:', lecture.title);
  };

  const filteredMaterials = materials.filter(material => {
    const matchesSearch = material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         material.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         material.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || material.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || material.difficulty === selectedDifficulty;
    const matchesType = selectedType === 'all' || material.type === selectedType;
    
    return matchesSearch && matchesCategory && matchesDifficulty && matchesType;
  });

  const filteredLectures = lectures.filter(lecture => {
    const matchesSearch = lecture.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         lecture.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         lecture.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesDifficulty = selectedDifficulty === 'all' || lecture.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesDifficulty;
  });

  const categories = [...new Set(materials.map(m => m.category))];
  const subjects = [...new Set(lectures.map(l => l.subject))];

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Study Materials Library</h1>
          <p className="text-muted-foreground">Access comprehensive study resources and video lectures</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            <BookOpen className="w-4 h-4 mr-1" />
            {materials.length} Materials
          </Badge>
          <Badge variant="secondary">
            <Video className="w-4 h-4 mr-1" />
            {lectures.length} Lectures
          </Badge>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search materials, lectures, topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <SelectTrigger>
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Content Tabs */}
      <Tabs value={currentView} onValueChange={(value) => setCurrentView(value as any)}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="materials" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Study Materials ({filteredMaterials.length})
          </TabsTrigger>
          <TabsTrigger value="lectures" className="flex items-center gap-2">
            <Video className="w-4 h-4" />
            Video Lectures ({filteredLectures.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="materials" className="space-y-4 mt-6">
          {currentView === 'materials' && (
            <div className="mb-4">
              <Select value={selectedType} onValueChange={(value) => setSelectedType(value as any)}>
                <SelectTrigger className="w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Material Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="document">Documents</SelectItem>
                  <SelectItem value="video">Videos</SelectItem>
                  <SelectItem value="audio">Audio</SelectItem>
                  <SelectItem value="interactive">Interactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredMaterials.map((material) => {
              const materialProgress = getProgressForMaterial(material.id);
              return (
                <Card key={material.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                          {getTypeIcon(material.type)}
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg line-clamp-2">{material.title}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={getDifficultyColor(material.difficulty)}>
                              {material.difficulty}
                            </Badge>
                            {material.isPremium && (
                              <Badge className="bg-purple-100 text-purple-800">Premium</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <CardDescription className="line-clamp-3">
                      {material.description}
                    </CardDescription>
                    
                    {materialProgress && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{materialProgress.progressPercentage}%</span>
                        </div>
                        <Progress value={materialProgress.progressPercentage} className="h-2" />
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {formatDuration(material.duration)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {material.viewCount}
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          {material.rating}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                      {material.tags.slice(0, 3).map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {material.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{material.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                    
                    <Button 
                      onClick={() => handleMaterialClick(material)}
                      className="w-full"
                      variant={materialProgress?.completed ? "outline" : "default"}
                    >
                      {materialProgress?.completed ? 'Review' : 'Start Learning'}
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          
          {filteredMaterials.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No materials found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="lectures" className="space-y-4 mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            {filteredLectures.map((lecture) => {
              const lectureProgress = getProgressForMaterial(lecture.id);
              return (
                <Card key={lecture.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader className="pb-4">
                    <div className="flex items-start gap-4">
                      <div className="relative">
                        <div className="w-20 h-16 bg-gray-200 rounded-lg overflow-hidden">
                          <img 
                            src={lecture.thumbnailUrl} 
                            alt={lecture.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder-video.jpg';
                            }}
                          />
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-8 h-8 bg-white bg-opacity-90 rounded-full flex items-center justify-center">
                            <Play className="w-4 h-4 text-gray-700 ml-0.5" />
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <CardTitle className="text-lg line-clamp-2">{lecture.title}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          by {lecture.instructor}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge className={getDifficultyColor(lecture.difficulty)}>
                            {lecture.difficulty}
                          </Badge>
                          {lecture.isPremium && (
                            <Badge className="bg-purple-100 text-purple-800">Premium</Badge>
                          )}
                          <Badge variant="outline">{lecture.subject}</Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <CardDescription className="line-clamp-2">
                      {lecture.description}
                    </CardDescription>
                    
                    {lectureProgress && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Watch Progress</span>
                          <span>{lectureProgress.progressPercentage}%</span>
                        </div>
                        <Progress value={lectureProgress.progressPercentage} className="h-2" />
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {formatVideoDuration(lecture.duration)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {lecture.views}
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          {lecture.rating}
                        </div>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={() => handleLectureClick(lecture)}
                      className="w-full"
                      variant={lectureProgress?.completed ? "outline" : "default"}
                    >
                      {lectureProgress?.completed ? 'Watch Again' : 'Watch Lecture'}
                      <Play className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          
          {filteredLectures.length === 0 && (
            <div className="text-center py-12">
              <Video className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No lectures found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}