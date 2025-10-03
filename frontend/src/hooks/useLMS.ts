import { useState, useCallback } from 'react';
import { apiRequest } from '@/lib/api';
import { showErrorToast, showSuccessToast } from '@/lib/error-handler';

// LMS types and interfaces
export interface StudyMaterial {
  id: string;
  title: string;
  description: string;
  type: 'document' | 'video' | 'audio' | 'interactive';
  category: string;
  subject: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // in minutes
  fileUrl?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  isPremium: boolean;
  viewCount: number;
  rating: number;
  ratingCount: number;
}

export interface VideoLecture {
  id: string;
  title: string;
  description: string;
  instructor: string;
  instructorBio?: string;
  subject: string;
  chapter: string;
  duration: number; // in seconds
  videoUrl: string;
  thumbnailUrl: string;
  transcriptUrl?: string;
  slides?: string[];
  resources?: StudyResource[];
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  isPremium: boolean;
  views: number;
  likes: number;
  rating: number;
  ratingCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface StudyResource {
  id: string;
  title: string;
  type: 'pdf' | 'doc' | 'ppt' | 'url' | 'quiz';
  url: string;
  size?: number; // in bytes
  description?: string;
}

export interface StudyProgress {
  id: string;
  userId: string;
  materialId: string;
  materialType: 'document' | 'video' | 'audio' | 'interactive';
  progressPercentage: number;
  timeSpent: number; // in minutes
  lastAccessed: string;
  completed: boolean;
  notes?: string;
  bookmarks?: StudyBookmark[];
}

export interface StudyBookmark {
  id: string;
  timestamp: number; // for videos, position in seconds
  title: string;
  note?: string;
  createdAt: string;
}

export interface StudyPlan {
  id: string;
  title: string;
  description: string;
  subjects: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedWeeks: number;
  materials: StudyMaterial[];
  lectures: VideoLecture[];
  milestones: StudyMilestone[];
  isPersonalized: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StudyMilestone {
  id: string;
  title: string;
  description: string;
  targetDate: string;
  completed: boolean;
  completedAt?: string;
  requirements: string[];
}

export interface LMSStats {
  totalMaterials: number;
  completedMaterials: number;
  totalVideos: number;
  watchedVideos: number;
  totalWatchTime: number; // in minutes
  averageScore: number;
  studyStreak: number;
  rank: number;
  totalLearners: number;
}

interface UseLMSOptions {
  userId?: string;
  subject?: string;
}

export function useLMS(options: UseLMSOptions = {}) {
  const { userId, subject } = options;

  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [lectures, setLectures] = useState<VideoLecture[]>([]);
  const [progress, setProgress] = useState<StudyProgress[]>([]);
  const [studyPlans, setStudyPlans] = useState<StudyPlan[]>([]);
  const [stats, setStats] = useState<LMSStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Mock data for development
  const mockMaterials: StudyMaterial[] = [
    {
      id: 'mat_1',
      title: 'Introduction to Data Structures',
      description: 'Comprehensive guide to fundamental data structures including arrays, linked lists, stacks, and queues.',
      type: 'document',
      category: 'Computer Science',
      subject: 'Data Structures',
      difficulty: 'beginner',
      duration: 45,
      fileUrl: '/materials/intro-ds.pdf',
      thumbnailUrl: '/thumbnails/ds-intro.jpg',
      tags: ['data-structures', 'algorithms', 'programming', 'fundamentals'],
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      isPremium: false,
      viewCount: 1245,
      rating: 4.5,
      ratingCount: 89
    },
    {
      id: 'mat_2',
      title: 'Advanced Algorithms Masterclass',
      description: 'Deep dive into advanced algorithmic concepts including dynamic programming, graph algorithms, and optimization techniques.',
      type: 'video',
      category: 'Computer Science',
      subject: 'Algorithms',
      difficulty: 'advanced',
      duration: 120,
      videoUrl: '/videos/advanced-algorithms.mp4',
      thumbnailUrl: '/thumbnails/algorithms.jpg',
      tags: ['algorithms', 'dynamic-programming', 'graphs', 'optimization'],
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      isPremium: true,
      viewCount: 856,
      rating: 4.8,
      ratingCount: 67
    },
    {
      id: 'mat_3',
      title: 'Interactive Sorting Visualization',
      description: 'Interactive module to understand different sorting algorithms through visual demonstrations and hands-on exercises.',
      type: 'interactive',
      category: 'Computer Science',
      subject: 'Algorithms',
      difficulty: 'intermediate',
      duration: 60,
      fileUrl: '/interactive/sorting-viz',
      thumbnailUrl: '/thumbnails/sorting.jpg',
      tags: ['sorting', 'algorithms', 'visualization', 'interactive'],
      createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
      isPremium: false,
      viewCount: 2103,
      rating: 4.7,
      ratingCount: 156
    }
  ];

  const mockLectures: VideoLecture[] = [
    {
      id: 'lec_1',
      title: 'Introduction to Object-Oriented Programming',
      description: 'Learn the fundamentals of OOP including classes, objects, inheritance, and polymorphism.',
      instructor: 'Dr. Sarah Johnson',
      instructorBio: 'Professor of Computer Science with 15+ years of teaching experience',
      subject: 'Programming',
      chapter: 'OOP Fundamentals',
      duration: 2700, // 45 minutes
      videoUrl: '/lectures/oop-intro.mp4',
      thumbnailUrl: '/thumbnails/oop.jpg',
      transcriptUrl: '/transcripts/oop-intro.vtt',
      slides: [
        '/slides/oop-slide-1.jpg',
        '/slides/oop-slide-2.jpg',
        '/slides/oop-slide-3.jpg'
      ],
      resources: [
        {
          id: 'res_1',
          title: 'OOP Reference Guide',
          type: 'pdf',
          url: '/resources/oop-guide.pdf',
          size: 2048000,
          description: 'Comprehensive reference for OOP concepts'
        },
        {
          id: 'res_2',
          title: 'Practice Exercises',
          type: 'quiz',
          url: '/quizzes/oop-practice',
          description: 'Interactive exercises to practice OOP concepts'
        }
      ],
      tags: ['oop', 'programming', 'classes', 'inheritance'],
      difficulty: 'beginner',
      isPremium: false,
      views: 5432,
      likes: 487,
      rating: 4.6,
      ratingCount: 234,
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'lec_2',
      title: 'Advanced Database Design Patterns',
      description: 'Explore advanced database design patterns, normalization, and optimization techniques for enterprise applications.',
      instructor: 'Prof. Michael Chen',
      instructorBio: 'Database architect and consultant with expertise in enterprise systems',
      subject: 'Database Systems',
      chapter: 'Advanced Design',
      duration: 3600, // 60 minutes
      videoUrl: '/lectures/db-patterns.mp4',
      thumbnailUrl: '/thumbnails/database.jpg',
      transcriptUrl: '/transcripts/db-patterns.vtt',
      resources: [
        {
          id: 'res_3',
          title: 'Database Schema Examples',
          type: 'doc',
          url: '/resources/schema-examples.docx',
          size: 1024000,
          description: 'Real-world database schema examples'
        }
      ],
      tags: ['database', 'design-patterns', 'normalization', 'optimization'],
      difficulty: 'advanced',
      isPremium: true,
      views: 2156,
      likes: 312,
      rating: 4.9,
      ratingCount: 78,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  const mockProgress: StudyProgress[] = [
    {
      id: 'prog_1',
      userId: userId || 'user_1',
      materialId: 'mat_1',
      materialType: 'document',
      progressPercentage: 75,
      timeSpent: 34,
      lastAccessed: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      completed: false,
      notes: 'Review linked list implementation',
      bookmarks: [
        {
          id: 'book_1',
          timestamp: 15,
          title: 'Array vs Linked List',
          note: 'Important comparison point',
          createdAt: new Date().toISOString()
        }
      ]
    },
    {
      id: 'prog_2',
      userId: userId || 'user_1',
      materialId: 'lec_1',
      materialType: 'video',
      progressPercentage: 100,
      timeSpent: 45,
      lastAccessed: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      completed: true,
      notes: 'Great introduction to OOP concepts'
    }
  ];

  const mockStats: LMSStats = {
    totalMaterials: 156,
    completedMaterials: 23,
    totalVideos: 89,
    watchedVideos: 12,
    totalWatchTime: 1240, // minutes
    averageScore: 85.5,
    studyStreak: 7,
    rank: 245,
    totalLearners: 15678
  };

  // Fetch study materials
  const fetchMaterials = useCallback(async (filters?: { category?: string; difficulty?: string; type?: string }) => {
    setLoading(true);
    try {
      // In production: const response = await apiRequest('/lms/materials/', { params: filters });
      
      let filteredMaterials = mockMaterials;
      
      if (filters) {
        if (filters.category) {
          filteredMaterials = filteredMaterials.filter(m => m.category === filters.category);
        }
        if (filters.difficulty) {
          filteredMaterials = filteredMaterials.filter(m => m.difficulty === filters.difficulty);
        }
        if (filters.type) {
          filteredMaterials = filteredMaterials.filter(m => m.type === filters.type);
        }
      }

      setMaterials(filteredMaterials);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch materials:', err);
      setError(err);
      showErrorToast(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch video lectures
  const fetchLectures = useCallback(async (filters?: { subject?: string; difficulty?: string }) => {
    setLoading(true);
    try {
      let filteredLectures = mockLectures;
      
      if (filters) {
        if (filters.subject) {
          filteredLectures = filteredLectures.filter(l => l.subject === filters.subject);
        }
        if (filters.difficulty) {
          filteredLectures = filteredLectures.filter(l => l.difficulty === filters.difficulty);
        }
      }

      setLectures(filteredLectures);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch lectures:', err);
      setError(err);
      showErrorToast(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch user progress
  const fetchProgress = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const userProgress = mockProgress.filter(p => p.userId === userId);
      setProgress(userProgress);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch progress:', err);
      setError(err);
      showErrorToast(err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Fetch LMS statistics
  const fetchStats = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    try {
      setStats(mockStats);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch stats:', err);
      setError(err);
      showErrorToast(err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Update progress
  const updateProgress = useCallback(async (materialId: string, progressData: Partial<StudyProgress>) => {
    setLoading(true);
    try {
      const existingProgress = progress.find(p => p.materialId === materialId);
      
      if (existingProgress) {
        // Update existing progress
        const updatedProgress = progress.map(p => 
          p.materialId === materialId 
            ? { ...p, ...progressData, lastAccessed: new Date().toISOString() }
            : p
        );
        setProgress(updatedProgress);
      } else {
        // Create new progress entry
        const newProgress: StudyProgress = {
          id: `prog_${Date.now()}`,
          userId: userId || 'user_1',
          materialId,
          materialType: progressData.materialType || 'document',
          progressPercentage: 0,
          timeSpent: 0,
          lastAccessed: new Date().toISOString(),
          completed: false,
          ...progressData
        };
        setProgress([...progress, newProgress]);
      }

      showSuccessToast('Progress updated successfully!');
    } catch (err: any) {
      console.error('Failed to update progress:', err);
      showErrorToast(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [progress, userId]);

  // Add bookmark
  const addBookmark = useCallback(async (materialId: string, bookmark: Omit<StudyBookmark, 'id' | 'createdAt'>) => {
    setLoading(true);
    try {
      const newBookmark: StudyBookmark = {
        id: `book_${Date.now()}`,
        createdAt: new Date().toISOString(),
        ...bookmark
      };

      const updatedProgress = progress.map(p => 
        p.materialId === materialId 
          ? { 
              ...p, 
              bookmarks: [...(p.bookmarks || []), newBookmark]
            }
          : p
      );
      
      setProgress(updatedProgress);
      showSuccessToast('Bookmark added successfully!');
    } catch (err: any) {
      console.error('Failed to add bookmark:', err);
      showErrorToast(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [progress]);

  // Remove bookmark
  const removeBookmark = useCallback(async (materialId: string, bookmarkId: string) => {
    setLoading(true);
    try {
      const updatedProgress = progress.map(p => 
        p.materialId === materialId 
          ? { 
              ...p, 
              bookmarks: p.bookmarks?.filter(b => b.id !== bookmarkId) || []
            }
          : p
      );
      
      setProgress(updatedProgress);
      showSuccessToast('Bookmark removed successfully!');
    } catch (err: any) {
      console.error('Failed to remove bookmark:', err);
      showErrorToast(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [progress]);

  // Get progress for specific material
  const getProgressForMaterial = useCallback((materialId: string) => {
    return progress.find(p => p.materialId === materialId);
  }, [progress]);

  return {
    materials,
    lectures,
    progress,
    studyPlans,
    stats,
    loading,
    error,
    fetchMaterials,
    fetchLectures,
    fetchProgress,
    fetchStats,
    updateProgress,
    addBookmark,
    removeBookmark,
    getProgressForMaterial
  };
}