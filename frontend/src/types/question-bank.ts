export interface QuestionBank {
  id: string;
  name: string;
  description?: string;
  category?: string;
  exam_type?: string;
  organization?: string;
  year?: number;
  subject?: string;
  topic?: string;
  subtopic?: string;
  difficulty_level: 'basic' | 'intermediate' | 'advanced' | 'expert' | 'mixed';
  target_audience: 'beginners' | 'intermediate' | 'advanced' | 'competitive_exam' | 'school_students' | 'college_students' | 'professionals' | 'general';
  language: string;
  state_specific?: string;
  tags: string[];
  custom_fields: Record<string, any>;
  question_types_included: string[];
  created_by: string;
  created_by_name?: string;
  is_public: boolean;
  is_featured: boolean;
  default_difficulty: 'basic' | 'intermediate' | 'advanced' | 'expert';
  default_marks: number;
  default_time_per_question?: number;
  total_questions: number;
  avg_difficulty?: string;
  usage_count: number;
  created_at: string;
  updated_at: string;
  user_permission?: QuestionBankPermission;
  can_access?: boolean;
}

export interface QuestionBankPermission {
  id: string;
  question_bank: string;
  user: string;
  user_name?: string;
  permission_type: 'view' | 'edit' | 'copy' | 'full';
  granted_by: string;
  granted_by_name?: string;
  granted_at: string;
  expires_at?: string;
  notes?: string;
  is_active: boolean;
  is_expired: boolean;
}

export interface QuestionBankStats {
  total_banks: number;
  public_banks: number;
  private_banks: number;
  shared_banks: number;
  banks_created: number;
  total_questions: number;
  avg_questions_per_bank: number;
  most_used_categories: Array<{
    category: string;
    count: number;
  }>;
  recent_activity: Array<{
    action: string;
    bank_name: string;
    timestamp: string;
  }>;
}

// Mock data for question banks
export const mockQuestionBanks: QuestionBank[] = [
  {
    id: 'qb-upsc-gs1',
    name: 'UPSC General Studies Paper 1',
    description: 'Comprehensive question bank for UPSC GS Paper 1 covering Indian History, Geography, Art & Culture',
    category: 'indian_history',
    exam_type: 'upsc',
    organization: 'UPSC',
    year: 2024,
    subject: 'General Studies',
    topic: 'Paper 1',
    difficulty_level: 'advanced',
    target_audience: 'competitive_exam',
    language: 'english',
    tags: ['upsc', 'gs1', 'history', 'geography', 'culture'],
    custom_fields: {},
    question_types_included: ['mcq', 'multi_select', 'statement_reason'],
    created_by: 'admin-1',
    created_by_name: 'UPSC Content Team',
    is_public: true,
    is_featured: true,
    default_difficulty: 'advanced',
    default_marks: 2,
    default_time_per_question: 90,
    total_questions: 450,
    avg_difficulty: 'advanced',
    usage_count: 1250,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-09-20T15:30:00Z',
    can_access: true
  },
  {
    id: 'qb-ssc-reasoning',
    name: 'SSC Logical Reasoning',
    description: 'Complete reasoning question bank for SSC CGL, CHSL, and MTS examinations',
    category: 'reasoning',
    exam_type: 'ssc',
    organization: 'SSC',
    year: 2024,
    subject: 'Reasoning',
    difficulty_level: 'intermediate',
    target_audience: 'competitive_exam',
    language: 'english',
    tags: ['ssc', 'reasoning', 'logical', 'analytical'],
    custom_fields: {},
    question_types_included: ['mcq', 'analogy', 'coding_decoding', 'classification'],
    created_by: 'teacher-1',
    created_by_name: 'Prof. Rajesh Kumar',
    is_public: false,
    is_featured: false,
    default_difficulty: 'intermediate',
    default_marks: 1,
    default_time_per_question: 60,
    total_questions: 320,
    avg_difficulty: 'intermediate',
    usage_count: 890,
    created_at: '2024-02-10T09:00:00Z',
    updated_at: '2024-09-15T12:00:00Z',
    user_permission: {
      id: 'perm-1',
      question_bank: 'qb-ssc-reasoning',
      user: 'current-user',
      permission_type: 'view',
      granted_by: 'teacher-1',
      granted_by_name: 'Prof. Rajesh Kumar',
      granted_at: '2024-09-01T10:00:00Z',
      notes: 'Access granted for SSC preparation',
      is_active: true,
      is_expired: false
    },
    can_access: true
  },
  {
    id: 'qb-banking-quant',
    name: 'Banking Quantitative Aptitude',
    description: 'Comprehensive quantitative aptitude questions for IBPS, SBI, and other banking exams',
    category: 'quantitative_aptitude',
    exam_type: 'banking',
    organization: 'IBPS',
    year: 2024,
    subject: 'Quantitative Aptitude',
    difficulty_level: 'intermediate',
    target_audience: 'competitive_exam',
    language: 'english',
    tags: ['banking', 'quant', 'mathematics', 'ibps', 'sbi'],
    custom_fields: {},
    question_types_included: ['mcq', 'mathematical_calculation', 'data_interpretation'],
    created_by: 'teacher-2',
    created_by_name: 'Dr. Priya Sharma',
    is_public: false,
    is_featured: true,
    default_difficulty: 'intermediate',
    default_marks: 1,
    default_time_per_question: 75,
    total_questions: 280,
    avg_difficulty: 'intermediate',
    usage_count: 650,
    created_at: '2024-03-05T14:00:00Z',
    updated_at: '2024-09-18T16:45:00Z',
    can_access: false
  },
  {
    id: 'qb-gate-cs',
    name: 'GATE Computer Science',
    description: 'Technical questions for GATE Computer Science and Information Technology',
    category: 'computer_science',
    exam_type: 'engineering',
    organization: 'IIT',
    year: 2024,
    subject: 'Computer Science',
    difficulty_level: 'expert',
    target_audience: 'advanced',
    language: 'english',
    tags: ['gate', 'computer science', 'algorithms', 'data structures'],
    custom_fields: {},
    question_types_included: ['mcq', 'multi_select', 'fill_blank'],
    created_by: 'teacher-3',
    created_by_name: 'Prof. Amit Singh',
    is_public: true,
    is_featured: false,
    default_difficulty: 'expert',
    default_marks: 2,
    default_time_per_question: 120,
    total_questions: 180,
    avg_difficulty: 'expert',
    usage_count: 420,
    created_at: '2024-04-12T11:00:00Z',
    updated_at: '2024-09-22T14:20:00Z',
    can_access: true
  },
  {
    id: 'qb-private-math',
    name: 'Advanced Mathematics Practice',
    description: 'Private collection of advanced mathematics problems for competitive exams',
    category: 'mathematics',
    exam_type: 'academic',
    subject: 'Mathematics',
    difficulty_level: 'advanced',
    target_audience: 'advanced',
    language: 'english',
    tags: ['mathematics', 'calculus', 'algebra', 'geometry'],
    custom_fields: {},
    question_types_included: ['mcq', 'fill_blank', 'essay'],
    created_by: 'current-user',
    created_by_name: 'Current User',
    is_public: false,
    is_featured: false,
    default_difficulty: 'advanced',
    default_marks: 3,
    default_time_per_question: 180,
    total_questions: 95,
    avg_difficulty: 'advanced',
    usage_count: 25,
    created_at: '2024-08-20T16:00:00Z',
    updated_at: '2024-09-25T10:30:00Z',
    can_access: true
  }
];

export const mockPermissions: QuestionBankPermission[] = [
  {
    id: 'perm-1',
    question_bank: 'qb-ssc-reasoning',
    user: 'current-user',
    user_name: 'Current User',
    permission_type: 'view',
    granted_by: 'teacher-1',
    granted_by_name: 'Prof. Rajesh Kumar',
    granted_at: '2024-09-01T10:00:00Z',
    notes: 'Access granted for SSC preparation',
    is_active: true,
    is_expired: false
  },
  {
    id: 'perm-2',
    question_bank: 'qb-banking-quant',
    user: 'student-1',
    user_name: 'Rahul Verma',
    permission_type: 'copy',
    granted_by: 'teacher-2',
    granted_by_name: 'Dr. Priya Sharma',
    granted_at: '2024-09-10T14:00:00Z',
    expires_at: '2024-12-31T23:59:59Z',
    notes: 'Copy access for practice test creation',
    is_active: true,
    is_expired: false
  },
  {
    id: 'perm-3',
    question_bank: 'qb-gate-cs',
    user: 'student-2',
    user_name: 'Anita Patel',
    permission_type: 'edit',
    granted_by: 'teacher-3',
    granted_by_name: 'Prof. Amit Singh',
    granted_at: '2024-09-15T09:00:00Z',
    notes: 'Edit access for content contribution',
    is_active: true,
    is_expired: false
  }
];

export const getQuestionBankStats = (): QuestionBankStats => {
  const banks = mockQuestionBanks;
  const totalBanks = banks.length;
  const publicBanks = banks.filter(b => b.is_public).length;
  const privateBanks = banks.filter(b => !b.is_public).length;
  const sharedBanks = banks.filter(b => b.user_permission).length;
  const banksCreated = banks.filter(b => b.created_by === 'current-user').length;
  const totalQuestions = banks.reduce((sum, b) => sum + b.total_questions, 0);

  const categoryCount: Record<string, number> = {};
  banks.forEach(bank => {
    if (bank.category) {
      categoryCount[bank.category] = (categoryCount[bank.category] || 0) + 1;
    }
  });

  const mostUsedCategories = Object.entries(categoryCount)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const recentActivity = [
    { action: 'Created', bank_name: 'Advanced Mathematics Practice', timestamp: '2024-09-25T10:30:00Z' },
    { action: 'Updated', bank_name: 'GATE Computer Science', timestamp: '2024-09-22T14:20:00Z' },
    { action: 'Shared', bank_name: 'UPSC General Studies Paper 1', timestamp: '2024-09-20T15:30:00Z' },
    { action: 'Used', bank_name: 'Banking Quantitative Aptitude', timestamp: '2024-09-18T16:45:00Z' },
    { action: 'Updated', bank_name: 'SSC Logical Reasoning', timestamp: '2024-09-15T12:00:00Z' }
  ];

  return {
    total_banks: totalBanks,
    public_banks: publicBanks,
    private_banks: privateBanks,
    shared_banks: sharedBanks,
    banks_created: banksCreated,
    total_questions: totalQuestions,
    avg_questions_per_bank: Math.round(totalQuestions / totalBanks),
    most_used_categories: mostUsedCategories,
    recent_activity: recentActivity
  };
};

export const getQuestionBanksForUser = (userId: string = 'current-user'): QuestionBank[] => {
  return mockQuestionBanks.filter(bank => {
    // User can access if:
    // 1. Bank is public
    // 2. User is the creator
    // 3. User has explicit permission
    return bank.is_public || 
           bank.created_by === userId || 
           bank.user_permission?.is_active;
  });
};

export const getPermissionLabel = (type: string): string => {
  const labels = {
    view: 'View Only',
    edit: 'View & Edit',
    copy: 'View & Copy',
    full: 'Full Access'
  };
  return labels[type as keyof typeof labels] || type;
};

export const getPermissionColor = (type: string): string => {
  const colors = {
    view: 'bg-blue-100 text-blue-800',
    edit: 'bg-green-100 text-green-800',
    copy: 'bg-yellow-100 text-yellow-800',
    full: 'bg-purple-100 text-purple-800'
  };
  return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
};

export const getDifficultyColor = (difficulty: string): string => {
  const colors = {
    basic: 'bg-green-100 text-green-800',
    intermediate: 'bg-yellow-100 text-yellow-800',
    advanced: 'bg-orange-100 text-orange-800',
    expert: 'bg-red-100 text-red-800',
    mixed: 'bg-blue-100 text-blue-800'
  };
  return colors[difficulty as keyof typeof colors] || 'bg-gray-100 text-gray-800';
};