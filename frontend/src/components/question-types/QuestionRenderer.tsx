'use client';

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { TrueFalseQuestion } from './TrueFalseQuestion';
import { FillBlankQuestion } from './FillBlankQuestion';
import { StatementReasonQuestion } from './StatementReasonQuestion';
import { MultiSelectQuestion } from './MultiSelectQuestion';

interface Question {
  id: string;
  question_text: string;
  question_type: string;
  marks: number;
  options?: {
    id: string;
    option_text: string;
  }[];
  statement?: string;
  reason?: string;
}

interface QuestionRendererProps {
  question: Question;
  value?: any;
  onChange: (value: any) => void;
  disabled?: boolean;
}

export function QuestionRenderer({ question, value, onChange, disabled }: QuestionRendererProps) {
  const renderQuestion = () => {
    switch (question.question_type) {
      case 'mcq':
        return (
          <div className="space-y-4">
            <div className="text-lg font-medium">{question.question_text}</div>
            <RadioGroup
              value={value || ''}
              onValueChange={onChange}
              disabled={disabled}
              className="space-y-3"
            >
              {question.options?.map((option, index) => (
                <div key={option.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.id} id={option.id} />
                  <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                    <span className="font-medium">({String.fromCharCode(65 + index)})</span> {option.option_text}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );

      case 'true_false':
        return (
          <TrueFalseQuestion
            question={question}
            value={value}
            onChange={onChange}
            disabled={disabled}
          />
        );

      case 'fill_blank':
        return (
          <FillBlankQuestion
            question={question}
            value={value}
            onChange={onChange}
            disabled={disabled}
          />
        );

      case 'statement_reason':
        return (
          <StatementReasonQuestion
            question={{
              ...question,
              statement: question.statement || 'Statement not provided',
              reason: question.reason || 'Reason not provided'
            }}
            value={value}
            onChange={onChange}
            disabled={disabled}
          />
        );

      case 'multi_select':
        return (
          <MultiSelectQuestion
            question={question}
            value={value}
            onChange={onChange}
            disabled={disabled}
          />
        );

      default:
        // Fallback to MCQ for unknown types
        return (
          <div className="space-y-4">
            <div className="text-lg font-medium">{question.question_text}</div>
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm">
                ⚠️ Unsupported question type: {question.question_type}. Displaying as MCQ.
              </p>
            </div>
            {question.options && (
              <RadioGroup
                value={value || ''}
                onValueChange={onChange}
                disabled={disabled}
                className="space-y-3"
              >
                {question.options.map((option, index) => (
                  <div key={option.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.id} id={option.id} />
                    <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                      <span className="font-medium">({String.fromCharCode(65 + index)})</span> {option.option_text}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}
          </div>
        );
    }
  };

  return (
    <div className="space-y-4">
      {renderQuestion()}
      
      {/* Question metadata */}
      <div className="flex items-center justify-between text-sm text-muted-foreground pt-2 border-t">
        <span>Marks: {question.marks}</span>
        <span className="capitalize">{question.question_type.replace('_', ' ')}</span>
      </div>
    </div>
  );
}