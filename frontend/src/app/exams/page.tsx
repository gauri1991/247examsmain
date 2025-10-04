'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, BookOpen } from 'lucide-react';
import { apiRequest } from '@/lib/api';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth-context';
import { showErrorToast, showSuccessToast } from '@/lib/error-handler';
import { TableLoading, EmptyState } from '@/components/ui/loading-states';
import { ErrorBoundary } from '@/components/ui/error-boundary';

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




export default function ExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [filteredExams, setFilteredExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/sign-in');
      return;
    }
    
    fetchExams();
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



  // Simple search filtering logic
  useEffect(() => {
    let result = [...exams];

    // Search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(exam =>
        exam.name.toLowerCase().includes(searchLower) ||
        exam.description.toLowerCase().includes(searchLower) ||
        exam.category.toLowerCase().includes(searchLower) ||
        exam.exam_type.toLowerCase().includes(searchLower)
      );
    }

    setFilteredExams(result);
  }, [exams, searchTerm]);

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
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-4">Available Exams</h1>
          
          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Search exams..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Exams Table */}
        {filteredExams.length > 0 ? (
          <div className="w-full overflow-x-auto">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap">Exam Details</TableHead>
                  <TableHead className="text-center whitespace-nowrap">Tests</TableHead>
                  <TableHead className="whitespace-nowrap">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExams.map((exam) => (
                  <TableRow key={exam.id}>
                    <TableCell className="max-w-0 w-full">
                      <div className="truncate">
                        <h3 className="font-medium truncate">{exam.name}</h3>
                        <p className="text-sm text-muted-foreground truncate">{exam.description}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-center whitespace-nowrap">
                      {exam.tests_count || 0}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <Button 
                        onClick={() => handleViewExam(exam.id)} 
                        size="sm"
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-medium text-muted-foreground">No exams found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {searchTerm.trim() 
                ? "No exams match your search criteria."
                : "No exams are currently available."
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

