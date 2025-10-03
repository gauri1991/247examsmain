'use client';

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';

interface StatementReasonQuestionProps {
  question: {
    id: string;
    question_text: string;
    statement: string;
    reason: string;
    marks: number;
  };
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function StatementReasonQuestion({ question, value, onChange, disabled }: StatementReasonQuestionProps) {
  const options = [
    { id: 'both_correct_reason', text: 'Both Statement and Reason are correct, and Reason is the correct explanation of Statement' },
    { id: 'both_correct_not_reason', text: 'Both Statement and Reason are correct, but Reason is NOT the correct explanation of Statement' },
    { id: 'statement_correct', text: 'Statement is correct, but Reason is incorrect' },
    { id: 'statement_incorrect', text: 'Statement is incorrect, but Reason is correct' },
    { id: 'both_incorrect', text: 'Both Statement and Reason are incorrect' }
  ];

  return (
    <div className="space-y-6">
      <div className="text-lg font-medium">{question.question_text}</div>
      
      <div className="grid gap-4">
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-4">
            <div className="font-semibold text-blue-800 mb-2">Statement:</div>
            <div className="text-blue-700">{question.statement}</div>
          </CardContent>
        </Card>
        
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-4">
            <div className="font-semibold text-green-800 mb-2">Reason:</div>
            <div className="text-green-700">{question.reason}</div>
          </CardContent>
        </Card>
      </div>
      
      <div>
        <Label className="text-base font-medium mb-3 block">Choose the correct option:</Label>
        <RadioGroup
          value={value || ''}
          onValueChange={onChange}
          disabled={disabled}
          className="space-y-3"
        >
          {options.map((option, index) => (
            <div key={option.id} className="flex items-start space-x-2">
              <RadioGroupItem value={option.id} id={option.id} className="mt-1" />
              <Label htmlFor={option.id} className="flex-1 cursor-pointer text-sm leading-relaxed">
                <span className="font-medium">({String.fromCharCode(65 + index)})</span> {option.text}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>
    </div>
  );
}