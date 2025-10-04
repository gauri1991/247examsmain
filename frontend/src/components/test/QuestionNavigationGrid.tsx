'use client';

import { CheckCircle2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Question {
  id: string;
  question_text: string;
  question_type: 'mcq' | 'multi_select' | 'true_false' | 'fill_blank' | 'essay';
  marks: number;
  image?: string;
}

interface TestQuestion {
  id: string;
  question: Question;
  order: number;
  marks: number;
}

interface QuestionNavigationGridProps {
  questions: TestQuestion[];
  currentIndex: number;
  getQuestionState: (index: number) => 'current' | 'answered' | 'marked' | 'answered-marked' | 'unanswered';
  onQuestionClick: (index: number) => void;
}

export function QuestionNavigationGrid({
  questions,
  currentIndex,
  getQuestionState,
  onQuestionClick
}: QuestionNavigationGridProps) {
  const getQuestionButtonClass = (index: number) => {
    const state = getQuestionState(index);
    const baseClass = 'relative min-w-[42px] min-h-[42px] text-sm font-semibold transition-all duration-200 hover:scale-105';
    
    switch (state) {
      case 'current':
        return cn(baseClass, 'bg-blue-500 text-white border-2 border-blue-600 shadow-lg scale-110');
      case 'answered':
        return cn(baseClass, 'bg-green-100 text-green-800 border-2 border-green-500 hover:bg-green-200');
      case 'marked':
        return cn(baseClass, 'bg-amber-100 text-amber-800 border-2 border-amber-500 hover:bg-amber-200');
      case 'answered-marked':
        return cn(baseClass, 'bg-green-100 text-green-800 border-2 border-green-500 hover:bg-green-200');
      default:
        return cn(baseClass, 'bg-gray-100 text-gray-600 border-2 border-gray-300 hover:bg-gray-200');
    }
  };

  const renderQuestionIcon = (index: number) => {
    const state = getQuestionState(index);
    
    switch (state) {
      case 'answered':
        return (
          <CheckCircle2 className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 text-white rounded-full p-0.5" />
        );
      case 'marked':
        return (
          <AlertTriangle className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-white rounded-full p-0.5" />
        );
      case 'answered-marked':
        return (
          <>
            <CheckCircle2 className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 text-white rounded-full p-0.5" />
            <AlertTriangle className="absolute -bottom-1 -right-1 w-4 h-4 bg-amber-500 text-white rounded-full p-0.5" />
          </>
        );
      default:
        return null;
    }
  };

  // Calculate statistics
  const stats = questions.reduce(
    (acc, _, index) => {
      const state = getQuestionState(index);
      switch (state) {
        case 'answered':
        case 'answered-marked':
          acc.answered++;
          break;
        case 'marked':
          acc.marked++;
          break;
        default:
          acc.unanswered++;
      }
      return acc;
    },
    { answered: 0, marked: 0, unanswered: 0 }
  );

  return (
    <Card className="sticky top-24">
      <CardHeader className="pb-4">
        <CardTitle className="text-base">Question Navigation</CardTitle>
        
        {/* Statistics */}
        <div className="flex flex-wrap gap-2 text-xs">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            {stats.answered} Answered
          </Badge>
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            <AlertTriangle className="w-3 h-3 mr-1" />
            {stats.marked} Marked
          </Badge>
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
            {stats.unanswered} Pending
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {/* Question Grid */}
        <div className="grid grid-cols-5 gap-2 mb-6 max-h-96 overflow-y-auto">
          {questions.map((_, index) => (
            <Button
              key={index}
              variant="outline"
              className={getQuestionButtonClass(index)}
              onClick={() => onQuestionClick(index)}
            >
              {index + 1}
              {renderQuestionIcon(index)}
            </Button>
          ))}
        </div>

        {/* Legend */}
        <div className="space-y-3 text-xs border-t pt-4">
          <div className="font-medium text-gray-900 mb-3">Legend:</div>
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded border-2 border-blue-500 bg-blue-500 flex items-center justify-center text-white text-xs font-semibold">
              1
            </div>
            <span className="text-gray-700">Current Question</span>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded border-2 border-green-500 bg-green-100 flex items-center justify-center text-green-700 text-xs font-semibold relative">
              2
              <CheckCircle2 className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 text-white rounded-full p-0.5" />
            </div>
            <span className="text-gray-700">Answered</span>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded border-2 border-amber-500 bg-amber-100 flex items-center justify-center text-amber-700 text-xs font-semibold relative">
              3
              <AlertTriangle className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-white rounded-full p-0.5" />
            </div>
            <span className="text-gray-700">Marked for Review</span>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded border-2 border-green-500 bg-green-100 flex items-center justify-center text-green-700 text-xs font-semibold relative">
              4
              <CheckCircle2 className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 text-white rounded-full p-0.5" />
              <AlertTriangle className="absolute -bottom-1 -right-1 w-4 h-4 bg-amber-500 text-white rounded-full p-0.5" />
            </div>
            <span className="text-gray-700">Answered + Review</span>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded border-2 border-gray-300 bg-gray-100 flex items-center justify-center text-gray-600 text-xs font-semibold">
              5
            </div>
            <span className="text-gray-700">Not Answered</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}