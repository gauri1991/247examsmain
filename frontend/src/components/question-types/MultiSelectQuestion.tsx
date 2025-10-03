'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface MultiSelectQuestionProps {
  question: {
    id: string;
    question_text: string;
    marks: number;
    options: {
      id: string;
      option_text: string;
    }[];
  };
  value?: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
}

export function MultiSelectQuestion({ question, value = [], onChange, disabled }: MultiSelectQuestionProps) {
  const handleOptionChange = (optionId: string, checked: boolean) => {
    if (checked) {
      onChange([...value, optionId]);
    } else {
      onChange(value.filter(id => id !== optionId));
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-lg font-medium">{question.question_text}</div>
      
      <div className="space-y-1 mb-3">
        <p className="text-sm text-blue-600 font-medium">
          📝 Multiple answers may be correct. Select all that apply.
        </p>
      </div>
      
      <div className="space-y-3">
        {question.options.map((option, index) => (
          <div key={option.id} className="flex items-start space-x-3">
            <Checkbox
              id={option.id}
              checked={value.includes(option.id)}
              onCheckedChange={(checked) => handleOptionChange(option.id, checked as boolean)}
              disabled={disabled}
              className="mt-1"
            />
            <Label htmlFor={option.id} className="flex-1 cursor-pointer leading-relaxed">
              <span className="font-medium">({String.fromCharCode(65 + index)})</span> {option.option_text}
            </Label>
          </div>
        ))}
      </div>
      
      {value.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            <strong>Selected:</strong> {value.length} option{value.length > 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  );
}