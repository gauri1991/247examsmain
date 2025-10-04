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
import { Badge } from '@/components/ui/badge';
import { Search, Clock, FileText, Target } from 'lucide-react';
import { apiRequest } from '@/lib/api';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth-context';
import { showErrorToast } from '@/lib/error-handler';
import { TableLoading, EmptyState } from '@/components/ui/loading-states';

interface TestAttempt {
  id: string;
  test_name: string;
  exam_name: string;
  score: number | string;
  total_marks: number | string;
  percentage: number | string | null;
  status: string;
  started_at: string;
  completed_at: string | null;
  duration_minutes: number | string;
  questions_count: number | string;
  correct_answers: number | string;
}

export default function TestsPage() {
  const [attempts, setAttempts] = useState<TestAttempt[]>([]);
  const [filteredAttempts, setFilteredAttempts] = useState<TestAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/sign-in');
      return;
    }
    
    fetchAttempts();
  }, [isAuthenticated]);

  const fetchAttempts = async () => {
    try {
      console.log('Fetching test attempts...');
      const response = await apiRequest('/exams/test-attempts/', { retries: 2 });
      console.log('Test attempts response:', response);
      setAttempts(response.results || []);
    } catch (error) {
      console.error('Failed to fetch test attempts:', error);
      showErrorToast(error);
    } finally {
      setLoading(false);
    }
  };

  // Search filtering logic
  useEffect(() => {
    let result = [...attempts];

    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(attempt =>
        attempt.test_name.toLowerCase().includes(searchLower) ||
        attempt.exam_name.toLowerCase().includes(searchLower)
      );
    }

    setFilteredAttempts(result);
  }, [attempts, searchTerm]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800">Completed</Badge>;
      case 'in_progress':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">In Progress</Badge>;
      case 'submitted':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800">Submitted</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPerformanceBadge = (percentage: number | string | null) => {
    const numPercentage = Number(percentage || 0);
    if (numPercentage >= 80) {
      return <Badge variant="default" className="bg-green-100 text-green-800">Excellent</Badge>;
    } else if (numPercentage >= 60) {
      return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Good</Badge>;
    } else if (numPercentage >= 40) {
      return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Average</Badge>;
    } else {
      return <Badge variant="destructive" className="bg-red-100 text-red-800">Needs Improvement</Badge>;
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString() + ' ' + new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
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
          <h1 className="text-2xl font-bold mb-4">My Test Attempts</h1>
          
          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Search tests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Tests Table */}
        {filteredAttempts.length > 0 ? (
          <div className="w-full overflow-x-auto">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap">Test Details</TableHead>
                  <TableHead className="text-center whitespace-nowrap">Score</TableHead>
                  <TableHead className="text-center whitespace-nowrap">Performance</TableHead>
                  <TableHead className="text-center whitespace-nowrap">Duration</TableHead>
                  <TableHead className="text-center whitespace-nowrap">Status</TableHead>
                  <TableHead className="whitespace-nowrap">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAttempts.map((attempt) => (
                  <TableRow key={attempt.id}>
                    <TableCell className="max-w-0 w-full">
                      <div className="truncate">
                        <h3 className="font-medium truncate">{attempt.test_name}</h3>
                        <p className="text-sm text-muted-foreground truncate">{attempt.exam_name}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-center whitespace-nowrap">
                      <div className="font-medium">{Number(attempt.score || 0)}/{Number(attempt.total_marks || 0)}</div>
                      <div className="text-sm text-muted-foreground">{Number(attempt.percentage || 0).toFixed(1)}%</div>
                    </TableCell>
                    <TableCell className="text-center whitespace-nowrap">
                      {getPerformanceBadge(attempt.percentage)}
                    </TableCell>
                    <TableCell className="text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDuration(Number(attempt.duration_minutes || 0))}
                      </div>
                    </TableCell>
                    <TableCell className="text-center whitespace-nowrap">
                      {getStatusBadge(attempt.status)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm">
                      {formatDateTime(attempt.started_at)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-medium text-muted-foreground">No test attempts found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {searchTerm.trim() 
                ? "No test attempts match your search criteria."
                : "You haven't taken any tests yet."
              }
            </p>
            {!searchTerm.trim() && (
              <div className="mt-4">
                <Button onClick={() => router.push('/exams')}>
                  <Target className="mr-2 h-4 w-4" />
                  Browse Exams
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}