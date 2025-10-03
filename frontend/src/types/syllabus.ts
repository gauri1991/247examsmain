export interface SyllabusItem {
  id: string;
  title: string;
  description?: string;
  type: 'unit' | 'chapter' | 'topic' | 'subtopic';
  parentId?: string;
  order: number;
  estimatedHours?: number;
  difficulty: 'easy' | 'medium' | 'hard';
  importance: 'low' | 'medium' | 'high' | 'critical';
  tags: string[];
  resources?: {
    id: string;
    type: 'pdf' | 'video' | 'article' | 'quiz' | 'practice';
    title: string;
    url?: string;
    duration?: number;
  }[];
  prerequisites?: string[];
  learningObjectives?: string[];
}

export interface SyllabusProgress {
  syllabusItemId: string;
  userId: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'mastered';
  progressPercentage: number;
  timeSpent: number; // in minutes
  lastAccessed: Date;
  testScores?: {
    testId: string;
    score: number;
    totalMarks: number;
    attemptedAt: Date;
  }[];
  notes?: string;
}

export interface ExamSyllabus {
  id: string;
  examId: string;
  examName: string;
  organizationId: string;
  totalItems: number;
  totalHours: number;
  syllabus: SyllabusItem[];
  lastUpdated: Date;
  version: string;
}

export interface SyllabusStats {
  totalTopics: number;
  completedTopics: number;
  inProgressTopics: number;
  notStartedTopics: number;
  totalTimeSpent: number;
  estimatedTimeRemaining: number;
  overallProgress: number;
  weakAreas: string[];
  strongAreas: string[];
  recommendedNext: string[];
}

// Mock syllabus data for different exams
export const mockSyllabusData: Record<string, ExamSyllabus> = {
  upsc_cse: {
    id: 'upsc_cse_syllabus',
    examId: 'upsc_cse',
    examName: 'UPSC Civil Services Examination',
    organizationId: 'upsc',
    totalItems: 45,
    totalHours: 800,
    lastUpdated: new Date('2025-09-01'),
    version: '2025.1',
    syllabus: [
      {
        id: 'gs_paper1',
        title: 'General Studies Paper I',
        type: 'unit',
        order: 1,
        estimatedHours: 200,
        difficulty: 'hard',
        importance: 'critical',
        tags: ['prelims', 'mains'],
        learningObjectives: [
          'Understand Indian history and culture',
          'Analyze geographical patterns',
          'Study art and literature evolution'
        ]
      },
      {
        id: 'indian_history',
        title: 'Indian History',
        type: 'chapter',
        parentId: 'gs_paper1',
        order: 1,
        estimatedHours: 80,
        difficulty: 'hard',
        importance: 'critical',
        tags: ['ancient', 'medieval', 'modern'],
        prerequisites: ['basic_history'],
        learningObjectives: [
          'Trace the evolution of Indian civilization',
          'Understand major historical events and personalities',
          'Analyze causes and effects of historical changes'
        ]
      },
      {
        id: 'ancient_history',
        title: 'Ancient Indian History',
        type: 'topic',
        parentId: 'indian_history',
        order: 1,
        estimatedHours: 25,
        difficulty: 'medium',
        importance: 'high',
        tags: ['harappan', 'vedic', 'mauryan', 'gupta'],
        resources: [
          {
            id: 'res1',
            type: 'pdf',
            title: 'NCERT Ancient India',
            duration: 300
          },
          {
            id: 'res2',
            type: 'video',
            title: 'Harappan Civilization',
            duration: 45
          }
        ]
      },
      {
        id: 'medieval_history',
        title: 'Medieval Indian History',
        type: 'topic',
        parentId: 'indian_history',
        order: 2,
        estimatedHours: 30,
        difficulty: 'medium',
        importance: 'high',
        tags: ['delhi_sultanate', 'mughal', 'vijayanagara'],
        resources: [
          {
            id: 'res3',
            type: 'pdf',
            title: 'Medieval India - NCERT',
            duration: 360
          }
        ]
      },
      {
        id: 'modern_history',
        title: 'Modern Indian History',
        type: 'topic',
        parentId: 'indian_history',
        order: 3,
        estimatedHours: 25,
        difficulty: 'hard',
        importance: 'critical',
        tags: ['british_rule', 'freedom_movement', 'independence'],
        resources: [
          {
            id: 'res4',
            type: 'pdf',
            title: 'Modern India - Spectrum',
            duration: 400
          },
          {
            id: 'res5',
            type: 'quiz',
            title: 'Freedom Movement Quiz',
            duration: 30
          }
        ]
      },
      {
        id: 'geography',
        title: 'Geography',
        type: 'chapter',
        parentId: 'gs_paper1',
        order: 2,
        estimatedHours: 60,
        difficulty: 'medium',
        importance: 'high',
        tags: ['physical', 'human', 'economic'],
        learningObjectives: [
          'Understand physical features of India',
          'Analyze climate and weather patterns',
          'Study population and settlements'
        ]
      },
      {
        id: 'physical_geography',
        title: 'Physical Geography',
        type: 'topic',
        parentId: 'geography',
        order: 1,
        estimatedHours: 20,
        difficulty: 'medium',
        importance: 'high',
        tags: ['mountains', 'rivers', 'climate']
      }
    ]
  },
  ssc_cgl: {
    id: 'ssc_cgl_syllabus',
    examId: 'ssc_cgl',
    examName: 'SSC Combined Graduate Level',
    organizationId: 'ssc',
    totalItems: 25,
    totalHours: 300,
    lastUpdated: new Date('2025-09-01'),
    version: '2025.1',
    syllabus: [
      {
        id: 'reasoning',
        title: 'General Intelligence & Reasoning',
        type: 'unit',
        order: 1,
        estimatedHours: 80,
        difficulty: 'medium',
        importance: 'critical',
        tags: ['logical', 'analytical'],
        learningObjectives: [
          'Master logical reasoning patterns',
          'Solve analytical puzzles',
          'Understand verbal and non-verbal reasoning'
        ]
      },
      {
        id: 'quantitative',
        title: 'Quantitative Aptitude',
        type: 'unit',
        order: 2,
        estimatedHours: 100,
        difficulty: 'hard',
        importance: 'critical',
        tags: ['mathematics', 'numerical'],
        learningObjectives: [
          'Solve mathematical problems quickly',
          'Master arithmetic and algebra',
          'Understand geometry and mensuration'
        ]
      }
    ]
  }
};

export const getSyllabusForExam = (examId: string): ExamSyllabus | null => {
  return mockSyllabusData[examId] || null;
};

export const getSyllabusProgress = (userId: string, syllabusItemId: string): SyllabusProgress => {
  // Mock progress data - in production, fetch from API
  return {
    syllabusItemId,
    userId,
    status: 'not_started',
    progressPercentage: 0,
    timeSpent: 0,
    lastAccessed: new Date(),
    notes: ''
  };
};

export const calculateSyllabusStats = (syllabus: SyllabusItem[], userProgress: SyllabusProgress[]): SyllabusStats => {
  const progressMap = new Map(userProgress.map(p => [p.syllabusItemId, p]));
  
  let completedCount = 0;
  let inProgressCount = 0;
  let notStartedCount = 0;
  let totalTimeSpent = 0;
  let totalEstimatedTime = 0;

  syllabus.forEach(item => {
    const progress = progressMap.get(item.id);
    totalEstimatedTime += item.estimatedHours || 0;
    
    if (progress) {
      totalTimeSpent += progress.timeSpent;
      switch (progress.status) {
        case 'completed':
        case 'mastered':
          completedCount++;
          break;
        case 'in_progress':
          inProgressCount++;
          break;
        default:
          notStartedCount++;
      }
    } else {
      notStartedCount++;
    }
  });

  const totalTopics = syllabus.length;
  const overallProgress = totalTopics > 0 ? (completedCount / totalTopics) * 100 : 0;
  const estimatedTimeRemaining = Math.max(0, totalEstimatedTime - (totalTimeSpent / 60));

  return {
    totalTopics,
    completedTopics: completedCount,
    inProgressTopics: inProgressCount,
    notStartedTopics: notStartedCount,
    totalTimeSpent,
    estimatedTimeRemaining,
    overallProgress,
    weakAreas: [], // To be implemented with test score analysis
    strongAreas: [],
    recommendedNext: []
  };
};