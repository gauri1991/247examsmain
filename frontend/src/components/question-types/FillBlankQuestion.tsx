'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface FillBlankQuestionProps {
  question: {
    id: string;
    question_text: string;
    marks: number;
  };
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function FillBlankQuestion({ question, value, onChange, disabled }: FillBlankQuestionProps) {
  return (
    <div className="space-y-4">
      <div className="text-lg font-medium">{question.question_text}</div>
      
      <div className="space-y-2">
        <Label htmlFor="answer" className="text-sm font-medium">
          Your Answer:
        </Label>
        <Input
          id="answer"
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder="Type your answer here..."
          className="text-base"
        />
        <p className="text-sm text-muted-foreground">
          💡 Tip: Be precise with your answer. Check spelling and formatting.
        </p>
      </div>
    </div>
  );
}