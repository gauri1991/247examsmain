'use client';

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface TrueFalseQuestionProps {
  question: {
    id: string;
    question_text: string;
    marks: number;
  };
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function TrueFalseQuestion({ question, value, onChange, disabled }: TrueFalseQuestionProps) {
  return (
    <div className="space-y-4">
      <div className="text-lg font-medium">{question.question_text}</div>
      
      <RadioGroup
        value={value || ''}
        onValueChange={onChange}
        disabled={disabled}
        className="space-y-3"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="true" id="true" />
          <Label htmlFor="true" className="flex-1 cursor-pointer text-base">
            ✅ True
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="false" id="false" />
          <Label htmlFor="false" className="flex-1 cursor-pointer text-base">
            ❌ False
          </Label>
        </div>
      </RadioGroup>
    </div>
  );
}