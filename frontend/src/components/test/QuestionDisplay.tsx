'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Save, Trash2, Flag, LoaderIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Question {
  id: string;
  question_text: string;
  question_type: 'mcq' | 'multi_select' | 'true_false' | 'fill_blank' | 'essay';
  marks: number;
  image?: string;
  options?: Array<{
    id: string;
    option_text: string;
    is_correct: boolean;
  }>;
}

interface TestQuestion {
  id: string;
  question: Question;
  order: number;
  marks: number;
}

interface UserAnswer {
  question_id: string;
  selected_options?: string[];
  text_answer?: string;
  boolean_answer?: boolean;
  marked_for_review?: boolean;
}

interface QuestionDisplayProps {
  question: TestQuestion;
  questionIndex: number;
  totalQuestions: number;
  answer?: UserAnswer;
  onAnswerChange: (answerData: Partial<UserAnswer>) => void;
  onMarkForReview: () => void;
  onClearAnswer: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onSaveAndNext: () => void;
  canGoPrevious: boolean;
  canGoNext: boolean;
  saving?: boolean;
}

export function QuestionDisplay({
  question,
  questionIndex,
  totalQuestions,
  answer,
  onAnswerChange,
  onMarkForReview,
  onClearAnswer,
  onPrevious,
  onNext,
  onSaveAndNext,
  canGoPrevious,
  canGoNext,
  saving = false
}: QuestionDisplayProps) {
  const [localAnswer, setLocalAnswer] = useState(answer);

  const handleAnswerUpdate = (newAnswer: Partial<UserAnswer>) => {
    const updatedAnswer = { ...localAnswer, ...newAnswer };
    setLocalAnswer(updatedAnswer);
    onAnswerChange(updatedAnswer);
  };

  const renderQuestionContent = () => {
    switch (question.question.question_type) {
      case 'mcq':
        return (
          <div className="space-y-3">
            <RadioGroup
              value={answer?.selected_options?.[0] || ''}
              onValueChange={(value) => handleAnswerUpdate({ selected_options: [value] })}
            >
              {question.question.options?.map((option) => (
                <div key={option.id} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                  <RadioGroupItem value={option.id} id={option.id} />
                  <Label htmlFor={option.id} className="flex-1 cursor-pointer text-sm">
                    {option.option_text}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );

      case 'multi_select':
        return (
          <div className="space-y-3">
            {question.question.options?.map((option) => (
              <div key={option.id} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                <Checkbox
                  id={option.id}
                  checked={answer?.selected_options?.includes(option.id) || false}
                  onCheckedChange={(checked) => {
                    const currentSelections = answer?.selected_options || [];
                    const newSelections = checked
                      ? [...currentSelections, option.id]
                      : currentSelections.filter(id => id !== option.id);
                    handleAnswerUpdate({ selected_options: newSelections });
                  }}
                />
                <Label htmlFor={option.id} className="flex-1 cursor-pointer text-sm">
                  {option.option_text}
                </Label>
              </div>
            ))}
          </div>
        );

      case 'true_false':
        return (
          <div className="space-y-3">
            <RadioGroup
              value={answer?.boolean_answer?.toString() || ''}
              onValueChange={(value) => handleAnswerUpdate({ boolean_answer: value === 'true' })}
            >
              <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                <RadioGroupItem value="true" id="true" />
                <Label htmlFor="true" className="flex-1 cursor-pointer text-sm">
                  True
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                <RadioGroupItem value="false" id="false" />
                <Label htmlFor="false" className="flex-1 cursor-pointer text-sm">
                  False
                </Label>
              </div>
            </RadioGroup>
          </div>
        );

      case 'fill_blank':
        return (
          <div className="space-y-3">
            <Label htmlFor="fill-blank-answer" className="text-sm font-medium">
              Enter your answer:
            </Label>
            <Input
              id="fill-blank-answer"
              value={answer?.text_answer || ''}
              onChange={(e) => handleAnswerUpdate({ text_answer: e.target.value })}
              placeholder="Type your answer here..."
              className="w-full"
            />
          </div>
        );

      case 'essay':
        return (
          <div className="space-y-3">
            <Label htmlFor="essay-answer" className="text-sm font-medium">
              Write your answer:
            </Label>
            <Textarea
              id="essay-answer"
              value={answer?.text_answer || ''}
              onChange={(e) => handleAnswerUpdate({ text_answer: e.target.value })}
              placeholder="Write your detailed answer here..."
              className="w-full min-h-[150px] resize-y"
            />
            <div className="text-xs text-muted-foreground">
              Characters: {answer?.text_answer?.length || 0}
            </div>
          </div>
        );

      default:
        return <div>Unsupported question type</div>;
    }
  };

  const getQuestionTypeLabel = () => {
    switch (question.question.question_type) {
      case 'mcq': return 'Single Choice';
      case 'multi_select': return 'Multiple Choice';
      case 'true_false': return 'True/False';
      case 'fill_blank': return 'Fill in the Blank';
      case 'essay': return 'Essay Type';
      default: return 'Unknown';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline">{getQuestionTypeLabel()}</Badge>
              <Badge variant="secondary">{question.marks} Mark{question.marks > 1 ? 's' : ''}</Badge>
              {answer?.marked_for_review && (
                <Badge variant="destructive" className="bg-amber-500">
                  <Flag className="w-3 h-3 mr-1" />
                  Marked for Review
                </Badge>
              )}
            </div>
            <h2 className="text-lg font-semibold">
              Question {questionIndex + 1} of {totalQuestions}
            </h2>
          </div>
          
          <div className="flex items-center gap-2">
            {saving && (
              <div className="flex items-center text-sm text-muted-foreground">
                <LoaderIcon className="w-4 h-4 mr-1 animate-spin" />
                Saving...
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Question Layout: Two columns on larger screens */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Question Text */}
          <div className="space-y-4">
            <div className="prose prose-sm max-w-none">
              <div dangerouslySetInnerHTML={{ __html: question.question.question_text }} />
            </div>
            
            {/* Question Image */}
            {question.question.image && (
              <div className="mt-4">
                <img
                  src={question.question.image}
                  alt="Question illustration"
                  className="max-w-full h-auto rounded-lg shadow-sm border"
                />
              </div>
            )}
          </div>

          {/* Right Column: Answer Options */}
          <div className="space-y-4">
            <div className="text-sm font-medium text-gray-700 mb-3">
              Choose your answer:
            </div>
            {renderQuestionContent()}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-6 border-t">
          <Button
            variant="outline"
            onClick={onPrevious}
            disabled={!canGoPrevious}
            className={cn(!canGoPrevious && "opacity-50 cursor-not-allowed")}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={onClearAnswer}
              className="text-gray-600 hover:text-gray-900"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear Answer
            </Button>

            <Button
              variant="outline"
              onClick={onMarkForReview}
              className={cn(
                "transition-colors",
                answer?.marked_for_review 
                  ? "bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100" 
                  : "hover:bg-amber-50"
              )}
            >
              <Flag className="w-4 h-4 mr-2" />
              {answer?.marked_for_review ? 'Unmark Review' : 'Mark for Review'}
            </Button>

            <Button onClick={onSaveAndNext} className="bg-blue-600 hover:bg-blue-700">
              <Save className="w-4 h-4 mr-2" />
              Save & Next
            </Button>
          </div>

          <Button
            variant="outline"
            onClick={onNext}
            disabled={!canGoNext}
            className={cn(!canGoNext && "opacity-50 cursor-not-allowed")}
          >
            Next
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}