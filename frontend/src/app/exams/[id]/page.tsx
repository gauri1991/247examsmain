'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, Clock, Trophy, Users, ChevronRight, ArrowLeft,
  Calendar, Target, FileText, CheckCircle2, XCircle, AlertCircle
} from 'lucide-react';
import { apiRequest } from '@/lib/api';
import { toast } from 'sonner';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { useAuth } from '@/contexts/auth-context';

interface Exam {
  id: string;
  name: string;
  description: string;
  category: string;
  exam_type: string;
  difficulty_level: string;
  created_by_name: string;
  tests_count: number;
}

interface Test {
  id: string;
  title: string;
  description: string;
  duration_minutes: number;
  total_marks: number;
  pass_percentage: number;
  is_published: boolean;
  randomize_questions: boolean;
  show_result_immediately: boolean;
  allow_review: boolean;
  max_attempts: number;
  questions_count: number;
  attempts_count: number;
  start_time: string | null;
  end_time: string | null;
}

export default function ExamDetailPage() {
  const params = useParams();
  const router = useRouter();
  const examId = params.id as string;
  const { isAuthenticated } = useAuth();
  
  const [exam, setExam] = useState<Exam | null>(null);
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tests');
  const [startingTest, setStartingTest] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/sign-in');
      return;
    }
    
    if (examId) {
      fetchExamDetails();
      fetchExamTests();
    }
  }, [examId, isAuthenticated]);

  const fetchExamDetails = async () => {
    try {
      const response = await apiRequest(`/exams/exams/${examId}/`);
      setExam(response);
    } catch (error) {
      console.error('Failed to fetch exam details:', error);
      toast.error('Failed to load exam details');
    }
  };

  const fetchExamTests = async () => {
    try {
      const response = await apiRequest(`/exams/exams/${examId}/tests/`);
      setTests(response);
    } catch (error) {
      console.error('Failed to fetch tests:', error);
      toast.error('Failed to load tests');
    } finally {
      setLoading(false);
    }
  };

  const handleStartTest = async (testId: string) => {
    setStartingTest(testId);
    try {
      const response = await apiRequest(`/exams/tests/${testId}/start_attempt/`, {
        method: 'POST'
      });
      
      if (response.id) {
        toast.success('Test started successfully!');
        router.push(`/tests/${testId}/attempt/${response.id}`);
      }
    } catch (error: any) {
      console.error('Failed to start test:', error);
      toast.error(error.error || 'Failed to start test');
    } finally {
      setStartingTest(null);
    }
  };

  // Helper functions for consistent styling
  const getOrganization = (examType: string, examName: string) => {
    const name = (examName || '').toLowerCase();
    const type = examType || '';
    if (type === 'upsc' || name.includes('upsc')) return 'UPSC';
    if (type === 'ssc' || name.includes('ssc')) return 'SSC';
    if (type === 'banking' || name.includes('bank') || name.includes('sbi') || name.includes('ibps')) return 'Banking';
    if (type === 'railway' || name.includes('railway') || name.includes('rrb')) return 'Railway';
    if (type === 'defense' || name.includes('nda') || name.includes('cds') || name.includes('defence')) return 'Defense';
    if (type === 'medical' || name.includes('neet') || name.includes('aiims')) return 'Medical Boards';
    if (type === 'engineering' || name.includes('gate') || name.includes('jee')) return 'Technical Boards';
    if (type === 'teaching' || name.includes('ctet') || name.includes('net') || name.includes('kvs')) return 'Education';
    if (type === 'management' || name.includes('cmat')) return 'Management';
    return 'Others';
  };

  const getQualification = (examName: string, examType: string) => {
    const name = (examName || '').toLowerCase();
    const type = examType || '';
    if (name.includes('pg') || name.includes('post graduate') || name.includes('fellowship') || name.includes('ph.d')) return 'Post Graduate';
    if (name.includes('graduate') || name.includes('degree') || type === 'upsc' || type === 'ssc') return 'Graduate';
    if (name.includes('12th') || name.includes('higher secondary') || name.includes('intermediate')) return '12th Pass';
    if (name.includes('10th') || name.includes('matriculation')) return '10th Pass';
    if (name.includes('diploma')) return 'Diploma';
    if (type === 'medical' || type === 'engineering' || type === 'management') return 'Graduate';
    if (type === 'banking' || type === 'ssc') return 'Graduate';
    return 'Graduate';
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

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  if (loading) {
    return (
      <>
        <DashboardHeader title="Loading..." />
        <div className="flex-1 overflow-auto px-6 py-8">
          <div className="flex items-center justify-center min-h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        </div>
      </>
    );
  }

  if (!exam) {
    return (
      <>
        <DashboardHeader title="Exam Not Found" />
        <div className="flex-1 overflow-auto px-6 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4 text-foreground">Exam not found</h2>
            <Button onClick={() => router.push('/exams')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Exams
            </Button>
          </div>
        </div>
      </>
    );
  }

  const organization = getOrganization(exam.exam_type, exam.name);
  const qualification = getQualification(exam.name, exam.exam_type);

  return (
    <>
      <DashboardHeader title={exam.name} />
      
      <div className="flex-1 overflow-auto px-6 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/exams')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Exams
          </Button>
        </div>

        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-3 text-foreground">{exam.name}</h1>
          <p className="text-muted-foreground mb-4">{exam.description}</p>
          <div className="flex gap-2 flex-wrap">
            <Badge className={examTypeColors[exam.exam_type] || 'bg-gray-100'} variant="secondary">
              {(exam.exam_type || 'other').toUpperCase()}
            </Badge>
            <Badge variant="outline">{organization}</Badge>
            <Badge variant="outline">{qualification}</Badge>
            <Badge variant="secondary" className="capitalize">{exam.difficulty_level || 'intermediate'}</Badge>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Tests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <BookOpen className="h-5 w-5 text-primary mr-3" />
                <div className="text-2xl font-bold text-foreground">{tests.length}</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg Duration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-primary mr-3" />
                <div className="text-2xl font-bold text-foreground">
                  {tests.length > 0 
                    ? Math.round(tests.reduce((acc, t) => acc + t.duration_minutes, 0) / tests.length)
                    : 0} min
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Target className="h-5 w-5 text-primary mr-3" />
                <div className="text-2xl font-bold text-foreground">
                  {tests.reduce((acc, t) => acc + t.questions_count, 0)}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Attempts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Trophy className="h-5 w-5 text-primary mr-3" />
                <div className="text-2xl font-bold text-foreground">
                  {tests.reduce((acc, t) => acc + t.attempts_count, 0)}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content Tabs */}
        <div className="grid lg:grid-cols-1 gap-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="tests">Available Tests</TabsTrigger>
              <TabsTrigger value="syllabus">Syllabus</TabsTrigger>
              <TabsTrigger value="info">Exam Info</TabsTrigger>
            </TabsList>

            <TabsContent value="tests" className="space-y-4">
              {tests.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2 text-foreground">No tests available</h3>
                    <p className="text-muted-foreground">Tests will be added soon for this exam</p>
                  </CardContent>
                </Card>
              ) : (
                tests.map(test => (
                  <TestCard 
                    key={test.id} 
                    test={test} 
                    onStart={handleStartTest}
                    isStarting={startingTest === test.id}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="syllabus">
              <Card>
                <CardHeader>
                  <CardTitle>Exam Syllabus</CardTitle>
                  <CardDescription>Comprehensive syllabus and study materials</CardDescription>
                </CardHeader>
                <CardContent className="text-center py-8">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2 text-foreground">Coming Soon</h3>
                  <p className="text-muted-foreground">Detailed syllabus will be available soon</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="info">
              <Card>
                <CardHeader>
                  <CardTitle>Exam Information</CardTitle>
                  <CardDescription>Detailed information about this exam</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Organization</p>
                      <p className="font-medium text-foreground">{organization}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Qualification Required</p>
                      <p className="font-medium text-foreground">{qualification}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Category</p>
                      <p className="font-medium text-foreground capitalize">{(exam.category || 'general').replace('_', ' ')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Exam Type</p>
                      <p className="font-medium text-foreground uppercase">{exam.exam_type || 'other'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Difficulty Level</p>
                      <p className="font-medium capitalize text-foreground">{exam.difficulty_level || 'intermediate'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Available Tests</p>
                      <p className="font-medium text-foreground">{tests.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}

function TestCard({ 
  test, 
  onStart, 
  isStarting 
}: { 
  test: Test; 
  onStart: (id: string) => void;
  isStarting: boolean;
}) {
  const isAvailable = test.is_published && 
    (!test.start_time || new Date(test.start_time) <= new Date()) &&
    (!test.end_time || new Date(test.end_time) >= new Date());

  return (
    <Card className="border rounded-md">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-foreground">{test.title}</CardTitle>
            <CardDescription className="text-muted-foreground mt-1">{test.description}</CardDescription>
          </div>
          {isAvailable ? (
            <Badge className="bg-green-100 text-green-800" variant="secondary">Available</Badge>
          ) : (
            <Badge className="bg-gray-100 text-gray-800" variant="secondary">Not Available</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Duration</p>
            <div className="flex items-center">
              <Clock className="h-4 w-4 text-muted-foreground mr-2" />
              <p className="font-medium text-foreground">{test.duration_minutes} min</p>
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Total Marks</p>
            <div className="flex items-center">
              <Trophy className="h-4 w-4 text-muted-foreground mr-2" />
              <p className="font-medium text-foreground">{test.total_marks}</p>
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Questions</p>
            <div className="flex items-center">
              <FileText className="h-4 w-4 text-muted-foreground mr-2" />
              <p className="font-medium text-foreground">{test.questions_count}</p>
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Pass %</p>
            <div className="flex items-center">
              <Target className="h-4 w-4 text-muted-foreground mr-2" />
              <p className="font-medium text-foreground">{test.pass_percentage}%</p>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {test.show_result_immediately && (
            <Badge variant="outline" className="text-xs">
              <CheckCircle2 className="mr-1 h-3 w-3" />
              Instant Results
            </Badge>
          )}
          {test.allow_review && (
            <Badge variant="outline" className="text-xs">
              <CheckCircle2 className="mr-1 h-3 w-3" />
              Review Allowed
            </Badge>
          )}
          {test.randomize_questions && (
            <Badge variant="outline" className="text-xs">
              <AlertCircle className="mr-1 h-3 w-3" />
              Randomized
            </Badge>
          )}
          {test.max_attempts && (
            <Badge variant="outline" className="text-xs">
              Max Attempts: {test.max_attempts}
            </Badge>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-4">
        <Button 
          onClick={() => onStart(test.id)}
          disabled={!isAvailable || isStarting}
          className="w-full"
        >
          {isStarting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
              Starting...
            </>
          ) : (
            <>
              Start Test
              <ChevronRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}