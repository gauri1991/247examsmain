'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  BookOpen, Clock, Trophy, Users, ChevronRight, ArrowLeft,
  Calendar, Target, FileText, CheckCircle2, XCircle, AlertCircle, Eye, EyeOff
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
  const [activeTab, setActiveTab] = useState('info');
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
      // Show specific error message from the API
      const errorMessage = error.message || error.error || error.detail || 'Failed to start test';
      toast.error(errorMessage);
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
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-3xl font-bold text-foreground">{exam.name}</h1>
            <Button 
              variant="ghost" 
              onClick={() => router.push('/exams')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Exams
            </Button>
          </div>
          <p className="text-muted-foreground mb-4">{exam.description}</p>
        </div>


        {/* Content Tabs */}
        <div className="grid lg:grid-cols-1 gap-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="info">Exam Info</TabsTrigger>
              <TabsTrigger value="syllabus">Syllabus</TabsTrigger>
              <TabsTrigger value="tests">Available Tests</TabsTrigger>
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
                <div className="w-full overflow-x-auto">
                  <Table className="min-w-full">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="whitespace-nowrap">Test Name</TableHead>
                        <TableHead className="whitespace-nowrap">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tests.map((test) => {
                        const isAvailable = test.is_published && 
                          (!test.start_time || new Date(test.start_time) <= new Date()) &&
                          (!test.end_time || new Date(test.end_time) >= new Date());
                        
                        return (
                          <TableRow key={test.id}>
                            <TableCell className="max-w-0 w-full">
                              <div className="truncate">
                                <h3 className="font-medium truncate">{test.title}</h3>
                              </div>
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              <Button 
                                onClick={() => handleStartTest(test.id)}
                                disabled={!isAvailable || startingTest === test.id}
                                size="sm"
                              >
                                {startingTest === test.id ? (
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
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
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
  const [showTopics, setShowTopics] = useState(false);
  const isAvailable = test.is_published && 
    (!test.start_time || new Date(test.start_time) <= new Date()) &&
    (!test.end_time || new Date(test.end_time) >= new Date());

  // Mock data for syllabus coverage - in real app this would come from API
  const syllabusData = {
    coverage: "Partial", // or "Full"
    topics: [
      "Quantitative Aptitude",
      "Logical Reasoning", 
      "English Language",
      "General Awareness",
      "Computer Knowledge"
    ]
  };

  return (
    <Card className="border rounded-md">
      <CardHeader>
        <div>
          <CardTitle className="text-foreground">{test.title}</CardTitle>
        </div>
      </CardHeader>
      <CardFooter className="pt-4">
        <Button 
          onClick={() => onStart(test.id)}
          disabled={!isAvailable || isStarting}
          size="sm"
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