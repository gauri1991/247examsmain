'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  FileText, 
  Monitor, 
  Shield,
  Info
} from 'lucide-react';

interface TestInstructionsProps {
  testTitle: string;
  duration: number;
  totalQuestions: number;
  totalMarks: number;
  negativeMarking?: boolean;
  onConfirm: () => void;
}

export function TestInstructions({
  testTitle,
  duration,
  totalQuestions,
  totalMarks,
  negativeMarking = false,
  onConfirm
}: TestInstructionsProps) {
  const [hasReadInstructions, setHasReadInstructions] = useState(false);
  const [hasConfirmedDetails, setHasConfirmedDetails] = useState(false);

  const canProceed = hasReadInstructions && hasConfirmedDetails;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader className="text-center bg-primary/5">
          <CardTitle className="text-2xl font-bold text-primary">
            TEST INSTRUCTIONS
          </CardTitle>
          <CardDescription className="text-lg">
            {testTitle}
          </CardDescription>
          
          {/* Test Details Summary */}
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            <Badge variant="secondary" className="text-sm px-3 py-1">
              <Clock className="w-4 h-4 mr-1" />
              Duration: {duration} minutes
            </Badge>
            <Badge variant="secondary" className="text-sm px-3 py-1">
              <FileText className="w-4 h-4 mr-1" />
              Questions: {totalQuestions}
            </Badge>
            <Badge variant="secondary" className="text-sm px-3 py-1">
              <CheckCircle className="w-4 h-4 mr-1" />
              Total Marks: {totalMarks}
            </Badge>
            {negativeMarking && (
              <Badge variant="destructive" className="text-sm px-3 py-1">
                <XCircle className="w-4 h-4 mr-1" />
                Negative Marking
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <ScrollArea className="h-96 pr-4">
            <div className="space-y-6">
              
              {/* General Instructions */}
              <section>
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <Info className="w-5 h-5 mr-2 text-blue-500" />
                  General Instructions
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    This is a Computer Based Test (CBT) designed to assess your knowledge and skills.
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    The test contains <strong>{totalQuestions} questions</strong> to be answered in <strong>{duration} minutes</strong>.
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Each question carries equal marks. Total marks for this test: <strong>{totalMarks}</strong>.
                  </li>
                  {negativeMarking && (
                    <li className="flex items-start text-red-600">
                      <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <strong>Negative Marking:</strong> Wrong answers will result in deduction of marks.
                    </li>
                  )}
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    There is no penalty for unanswered questions.
                  </li>
                </ul>
              </section>

              <Separator />

              {/* Navigation Instructions */}
              <section>
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <Monitor className="w-5 h-5 mr-2 text-green-500" />
                  Navigation & Interface
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Use the question navigation panel to move between questions.
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Questions are color-coded: <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs ml-1">Current</span> <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs ml-1">Answered</span> <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs ml-1">Marked for Review</span> <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs ml-1">Not Visited</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    You can mark questions for review and revisit them later.
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Use "Clear Response" to remove your answer for a question.
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Your progress is automatically saved as you answer questions.
                  </li>
                </ul>
              </section>

              <Separator />

              {/* Time Management */}
              <section>
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-orange-500" />
                  Time Management
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    The timer at the top shows remaining time. Plan your time accordingly.
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    The test will auto-submit when time expires.
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    You can submit the test early if you finish before time.
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Recommended time per question: ~{Math.round(duration/totalQuestions * 10)/10} minutes.
                  </li>
                </ul>
              </section>

              <Separator />

              {/* Important Guidelines */}
              <section>
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />
                  Important Guidelines
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Do not refresh the browser or press the back button during the test.
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Ensure stable internet connection throughout the test.
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Close all other applications and browser tabs for optimal performance.
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Do not use any external help or reference materials.
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Maintain exam integrity and follow all rules and regulations.
                  </li>
                </ul>
              </section>

              <Separator />

              {/* System Requirements */}
              <section>
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-purple-500" />
                  System Requirements & Best Practices
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Use a modern web browser (Chrome, Firefox, Safari, Edge).
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Enable JavaScript and disable popup blockers.
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Keep your device charged or connected to power.
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Use a comfortable seating arrangement and proper lighting.
                  </li>
                </ul>
              </section>

            </div>
          </ScrollArea>

          <div className="mt-6 space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="read-instructions" 
                checked={hasReadInstructions}
                onCheckedChange={(checked) => setHasReadInstructions(checked as boolean)}
              />
              <label 
                htmlFor="read-instructions" 
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I have read and understood all the above instructions
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="confirm-details" 
                checked={hasConfirmedDetails}
                onCheckedChange={(checked) => setHasConfirmedDetails(checked as boolean)}
              />
              <label 
                htmlFor="confirm-details" 
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I confirm that all the test details are correct and I am ready to begin
              </label>
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <Button 
              onClick={onConfirm}
              disabled={!canProceed}
              size="lg"
              className="px-8 py-3 text-lg"
            >
              {canProceed ? 'Begin Test' : 'Please read instructions above'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}