'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, BookOpen, Clock, Trophy, Users, ChevronRight, Filter, SlidersHorizontal, Building, X, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { apiRequest } from '@/lib/api';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth-context';
import { showErrorToast, showSuccessToast } from '@/lib/error-handler';
import { TableLoading, EmptyState } from '@/components/ui/loading-states';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { OrganizationBadge, OrganizationCard } from '@/components/ui/organization-badge';
import { organizations, getOrganizationsByCategory, getOrganizationById } from '@/types/organization';

interface Exam {
  id: string;
  name: string;
  description: string;
  category: string;
  exam_type: string;
  difficulty_level: string;
  organization_id?: string;
  is_active: boolean;
  tests_count: number;
  created_at: string;
}

const categoryDisplay: Record<string, string> = {
  mathematics: '📊 Mathematics',
  physics: '⚡ Physics',
  chemistry: '🧪 Chemistry',
  biology: '🧬 Biology',
  english: '📚 English Language',
  hindi: '🇮🇳 Hindi',
  history: '🏛️ History',
  geography: '🌍 Geography',
  economics: '💰 Economics',
  political_science: '🏛️ Political Science',
  sociology: '👥 Sociology',
  psychology: '🧠 Psychology',
  philosophy: '🤔 Philosophy',
  computer_science: '💻 Computer Science',
  engineering: '⚙️ Engineering',
  medical: '🏥 Medical',
  law: '⚖️ Law',
  commerce: '📈 Commerce',
  accountancy: '📋 Accountancy',
  business_studies: '💼 Business Studies',
  general_knowledge: '🎯 General Knowledge',
  current_affairs: '📰 Current Affairs',
  reasoning: '🧩 Logical Reasoning',
  quantitative_aptitude: '🔢 Quantitative Aptitude',
  data_interpretation: '📊 Data Interpretation',
  english_comprehension: '📖 English Comprehension',
  general_science: '🔬 General Science',
  indian_polity: '🏛️ Indian Polity',
  indian_economy: '💹 Indian Economy',
  indian_geography: '🗺️ Indian Geography',
  indian_history: '📜 Indian History',
  environment_ecology: '🌱 Environment & Ecology',
  sanskrit: '📿 Sanskrit',
  literature: '📚 Literature',
  linguistics: '🗣️ Linguistics',
  statistics: '📈 Statistics',
  agriculture: '🌾 Agriculture',
  home_science: '🏠 Home Science',
  physical_education: '🏃 Physical Education',
  fine_arts: '🎨 Fine Arts',
  music: '🎵 Music',
  other: '📋 Other',
};

const difficultyColors: Record<string, string> = {
  easy: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  hard: 'bg-red-100 text-red-800',
};

const examTypeColors: Record<string, string> = {
  upsc: 'bg-red-100 text-red-800',
  ssc: 'bg-blue-100 text-blue-800',
  banking: 'bg-green-100 text-green-800',
  railway: 'bg-orange-100 text-orange-800',
  defense: 'bg-purple-100 text-purple-800',
  state_psc: 'bg-indigo-100 text-indigo-800',
  teaching: 'bg-yellow-100 text-yellow-800',
  engineering: 'bg-cyan-100 text-cyan-800',
  medical: 'bg-pink-100 text-pink-800',
  management: 'bg-teal-100 text-teal-800',
  law: 'bg-violet-100 text-violet-800',
  judiciary: 'bg-amber-100 text-amber-800',
  police: 'bg-slate-100 text-slate-800',
  insurance: 'bg-emerald-100 text-emerald-800',
  academic: 'bg-lime-100 text-lime-800',
  other: 'bg-gray-100 text-gray-800',
};

interface FilterState {
  search: string;
  category: string;
  organization: string;
  difficulty: string;
  examType: string;
  dateRange: string;
  status: string;
  testsCount: string;
}

export default function ExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [filteredExams, setFilteredExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);
  
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    category: 'all',
    organization: 'all',
    difficulty: 'all',
    examType: 'all',
    dateRange: 'all',
    status: 'all',
    testsCount: 'all'
  });
  const [selectedQualification, setSelectedQualification] = useState('all');
  const [sortBy, setSortBy] = useState('organization');
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [examTests, setExamTests] = useState<any[]>([]);
  const [loadingTests, setLoadingTests] = useState(false);
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/sign-in');
      return;
    }
    
    fetchExams();
    fetchCategories();
  }, [isAuthenticated]);

  const fetchExams = async () => {
    try {
      console.log('Fetching exams...');
      const response = await apiRequest('/exams/exams/', { retries: 2 });
      console.log('Exams response:', response);
      setExams(response.results || []);
    } catch (error) {
      console.error('Failed to fetch exams:', error);
      showErrorToast(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await apiRequest('/exams/exams/categories/', { retries: 1 });
      setCategories(response.categories || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      showErrorToast('Failed to load exam categories');
    }
  };

  // Helper function to determine organization ID from exam type
  const getOrganizationId = (examType: string, examName: string): string => {
    const name = examName.toLowerCase();
    if (examType === 'upsc' || name.includes('upsc') || name.includes('civil services')) return 'upsc';
    if (examType === 'ssc' || name.includes('ssc') || name.includes('staff selection')) return 'ssc';
    if (name.includes('sbi') || name.includes('state bank')) return 'sbi';
    if (examType === 'banking' || name.includes('ibps') || name.includes('bank')) return 'ibps';
    if (examType === 'railway' || name.includes('railway') || name.includes('rrb')) return 'railway';
    if (name.includes('gate') || (examType === 'engineering' && name.includes('gate'))) return 'gate';
    if (name.includes('cat') || name.includes('common admission test')) return 'cat';
    if (name.includes('jee') || name.includes('neet') || name.includes('net') || name.includes('cuet')) return 'nta';
    // Default mappings for common exam types
    if (examType === 'medical' || examType === 'engineering') return 'nta';
    if (examType === 'defense' || name.includes('nda') || name.includes('cds')) return 'upsc';
    return 'upsc'; // Default fallback
  };

  // Helper function to determine qualification level
  const getQualification = (examName: string, examType: string) => {
    const name = examName.toLowerCase();
    if (name.includes('pg') || name.includes('post graduate') || name.includes('fellowship') || name.includes('ph.d')) return 'Post Graduate';
    if (name.includes('graduate') || name.includes('degree') || examType === 'upsc' || examType === 'ssc') return 'Graduate';
    if (name.includes('12th') || name.includes('higher secondary') || name.includes('intermediate')) return '12th Pass';
    if (name.includes('10th') || name.includes('matriculation')) return '10th Pass';
    if (name.includes('diploma')) return 'Diploma';
    // Default based on exam type
    if (examType === 'medical' || examType === 'engineering' || examType === 'management') return 'Graduate';
    if (examType === 'banking' || examType === 'ssc') return 'Graduate';
    return 'Graduate';
  };

  // Enhanced filtering logic
  useEffect(() => {
    let result = [...exams];

    // Search filter
    if (filters.search.trim()) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(exam =>
        exam.name.toLowerCase().includes(searchLower) ||
        exam.description.toLowerCase().includes(searchLower) ||
        exam.category.toLowerCase().includes(searchLower) ||
        exam.exam_type.toLowerCase().includes(searchLower)
      );
    }

    // Category filter
    if (filters.category !== 'all') {
      result = result.filter(exam => exam.category === filters.category);
    }

    // Organization filter
    if (filters.organization !== 'all') {
      result = result.filter(exam => {
        const orgId = getOrganizationId(exam.exam_type, exam.name);
        return orgId === filters.organization;
      });
    }

    // Difficulty filter
    if (filters.difficulty !== 'all') {
      result = result.filter(exam => exam.difficulty_level === filters.difficulty);
    }

    // Exam type filter
    if (filters.examType !== 'all') {
      result = result.filter(exam => exam.exam_type === filters.examType);
    }

    // Status filter
    if (filters.status !== 'all') {
      if (filters.status === 'active') {
        result = result.filter(exam => exam.is_active);
      } else if (filters.status === 'inactive') {
        result = result.filter(exam => !exam.is_active);
      }
    }

    // Tests count filter
    if (filters.testsCount !== 'all') {
      switch (filters.testsCount) {
        case 'none':
          result = result.filter(exam => exam.tests_count === 0);
          break;
        case 'few':
          result = result.filter(exam => exam.tests_count > 0 && exam.tests_count <= 5);
          break;
        case 'many':
          result = result.filter(exam => exam.tests_count > 5);
          break;
      }
    }

    // Date range filter (based on created_at)
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (filters.dateRange) {
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
        case 'quarter':
          filterDate.setMonth(now.getMonth() - 3);
          break;
        case 'year':
          filterDate.setFullYear(now.getFullYear() - 1);
          break;
      }
      
      if (filters.dateRange !== 'all') {
        result = result.filter(exam => new Date(exam.created_at) >= filterDate);
      }
    }

    setFilteredExams(result);
  }, [exams, filters]);

  // Count active filters
  useEffect(() => {
    const count = Object.entries(filters).filter(([key, value]) => 
      key !== 'search' && value !== 'all'
    ).length + (filters.search.trim() ? 1 : 0);
    setActiveFiltersCount(count);
  }, [filters]);

  const updateFilter = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearAllFilters = () => {
    setFilters({
      search: '',
      category: 'all',
      organization: 'all',
      difficulty: 'all',
      examType: 'all',
      dateRange: 'all',
      status: 'all',
      testsCount: 'all'
    });
  };

  const quickFilters = [
    { label: 'UPSC Exams', filter: { organization: 'upsc' } },
    { label: 'SSC Exams', filter: { organization: 'ssc' } },
    { label: 'Banking', filter: { organization: 'ibps' } },
    { label: 'Railway', filter: { organization: 'railway' } },
    { label: 'Active Only', filter: { status: 'active' } },
    { label: 'With Tests', filter: { testsCount: 'few' } },
  ];

  const applyQuickFilter = (quickFilter: Record<string, string>) => {
    setFilters(prev => ({ ...prev, ...quickFilter }));
  };

  // Legacy compatibility - keeping existing variables for backward compatibility
  const searchTerm = filters.search;
  const selectedCategory = filters.category;
  const selectedOrganization = filters.organization;

  const handleViewExam = (examId: string) => {
    router.push(`/exams/${examId}`);
  };

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader />
        <div className="container mx-auto px-4 py-6">
          <TableLoading rows={8} columns={6} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <DashboardHeader title="Exams" />
      
      <div className="flex-1 overflow-x-hidden overflow-y-auto px-6 py-8">
        <div className="w-full max-w-full">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2 text-foreground">Available Exams</h1>
            <p className="text-muted-foreground">Browse and purchase exam preparation courses</p>
          </div>

          {/* Organization Overview */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Building className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Exam Organizations</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {organizations.filter(org => org.isActive).map(org => (
                <OrganizationCard
                  key={org.id}
                  organization={org}
                  selected={selectedOrganization === org.id}
                  onClick={() => updateFilter('organization', selectedOrganization === org.id ? 'all' : org.id)}
                  className="h-32"
                />
              ))}
            </div>
          </div>

          {/* Enhanced Search and Filter */}
          <div className="mb-6 space-y-4">
            {/* Search Bar */}
            <div className="flex gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search exams by name, description, category..."
                  value={filters.search}
                  onChange={(e) => updateFilter('search', e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </div>

            {/* Quick Filters */}
            <div className="flex gap-2 flex-wrap">
              <span className="text-sm font-medium text-muted-foreground py-1">Quick filters:</span>
              {quickFilters.map((quick, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => applyQuickFilter(quick.filter)}
                  className="h-7 text-xs"
                >
                  {quick.label}
                </Button>
              ))}
              {activeFiltersCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="h-7 text-xs text-muted-foreground hover:text-destructive gap-1"
                >
                  <X className="h-3 w-3" />
                  Clear all
                </Button>
              )}
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="bg-card border rounded-lg p-4 space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-medium">Advanced Filters</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Category Filter */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Category</label>
                    <Select value={filters.category} onValueChange={(value) => updateFilter('category', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map(category => (
                          <SelectItem key={category} value={category}>
                            {categoryDisplay[category] || category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Difficulty Filter */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Difficulty</label>
                    <Select value={filters.difficulty} onValueChange={(value) => updateFilter('difficulty', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Levels" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Levels</SelectItem>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Exam Type Filter */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Exam Type</label>
                    <Select value={filters.examType} onValueChange={(value) => updateFilter('examType', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="upsc">UPSC</SelectItem>
                        <SelectItem value="ssc">SSC</SelectItem>
                        <SelectItem value="banking">Banking</SelectItem>
                        <SelectItem value="railway">Railway</SelectItem>
                        <SelectItem value="defense">Defense</SelectItem>
                        <SelectItem value="state_psc">State PSC</SelectItem>
                        <SelectItem value="teaching">Teaching</SelectItem>
                        <SelectItem value="engineering">Engineering</SelectItem>
                        <SelectItem value="medical">Medical</SelectItem>
                        <SelectItem value="management">Management</SelectItem>
                        <SelectItem value="law">Law</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Status Filter */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Status</label>
                    <Select value={filters.status} onValueChange={(value) => updateFilter('status', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            Active
                          </div>
                        </SelectItem>
                        <SelectItem value="inactive">
                          <div className="flex items-center gap-2">
                            <XCircle className="h-3 w-3 text-gray-500" />
                            Inactive
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Tests Count Filter */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Tests Available</label>
                    <Select value={filters.testsCount} onValueChange={(value) => updateFilter('testsCount', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Any Amount" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Any Amount</SelectItem>
                        <SelectItem value="none">No Tests</SelectItem>
                        <SelectItem value="few">1-5 Tests</SelectItem>
                        <SelectItem value="many">5+ Tests</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Date Range Filter */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Added</label>
                    <Select value={filters.dateRange} onValueChange={(value) => updateFilter('dateRange', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Any Time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Any Time</SelectItem>
                        <SelectItem value="week">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3" />
                            Last Week
                          </div>
                        </SelectItem>
                        <SelectItem value="month">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3" />
                            Last Month
                          </div>
                        </SelectItem>
                        <SelectItem value="quarter">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3" />
                            Last 3 Months
                          </div>
                        </SelectItem>
                        <SelectItem value="year">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3" />
                            Last Year
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-sm text-muted-foreground">
                    Showing {filteredExams.length} of {exams.length} exams
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearAllFilters}
                    disabled={activeFiltersCount === 0}
                  >
                    Clear All Filters
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {filteredExams.length} exam{filteredExams.length !== 1 ? 's' : ''} found
              </span>
              {activeFiltersCount > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Filters active:</span>
                  <Badge variant="secondary" className="text-xs">
                    {activeFiltersCount}
                  </Badge>
                </div>
              )}
            </div>
          </div>

          {/* Empty State */}
          {filteredExams.length === 0 && !loading && (
            <EmptyState
              icon={BookOpen}
              title="No exams found"
              description={
                activeFiltersCount > 0
                  ? "No exams match your current filters. Try adjusting your search criteria."
                  : "No exams are currently available."
              }
              action={
                activeFiltersCount > 0 ? (
                  <Button variant="outline" onClick={clearAllFilters}>
                    Clear Filters
                  </Button>
                ) : null
              }
            />
          )}

          {/* Exams Table */}
          {filteredExams.length > 0 && (
            <div className="border rounded-md overflow-x-auto">
              <Table className="w-full table-fixed">
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-0 max-w-[200px]">Exam Name</TableHead>
                    <TableHead className="min-w-0 w-[100px]">Organization</TableHead>
                    <TableHead className="min-w-0 w-[100px]">Qualification</TableHead>
                    <TableHead className="min-w-0 w-[90px]">Category</TableHead>
                    <TableHead className="min-w-0 w-[70px]">Type</TableHead>
                    <TableHead className="w-[60px] text-center">Tests</TableHead>
                    <TableHead className="w-[70px]">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExams.length > 0 ? (
                    filteredExams.map((exam) => {
                      const organizationId = exam.organization_id || getOrganizationId(exam.exam_type, exam.name);
                      const qualification = getQualification(exam.name, exam.exam_type);
                      
                      return (
                        <TableRow key={exam.id}>
                          <TableCell className="font-medium">
                            <div className="min-w-0">
                              <div className="font-semibold text-foreground truncate" title={exam.name}>{exam.name}</div>
                              <div className="text-sm text-muted-foreground line-clamp-1 mt-1" title={exam.description}>
                                {exam.description}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <OrganizationBadge organizationId={organizationId} size="sm" variant="outline" />
                          </TableCell>
                          <TableCell className="truncate" title={qualification}>{qualification}</TableCell>
                          <TableCell>
                            <span className="text-sm truncate block" title={categoryDisplay[exam.category] || exam.category}>
                              {categoryDisplay[exam.category] || exam.category}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge className={examTypeColors[exam.exam_type] || 'bg-gray-100'} variant="secondary">
                              {exam.exam_type}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            {exam.tests_count || 0}
                          </TableCell>
                          <TableCell>
                            <Button 
                              onClick={() => handleViewExam(exam.id)} 
                              variant="outline"
                              size="sm"
                            >
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12">
                        <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium text-foreground mb-2">No exams found</h3>
                        <p className="text-muted-foreground">Try adjusting your search or filters</p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

