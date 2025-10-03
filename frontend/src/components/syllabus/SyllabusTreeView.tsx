'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  ChevronDown, ChevronRight, BookOpen, Clock, Target,
  CheckCircle2, Circle, PlayCircle, Star, FileText, Video, HelpCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SyllabusItem, SyllabusProgress } from '@/types/syllabus';

interface SyllabusTreeViewProps {
  syllabusItems: SyllabusItem[];
  userProgress: SyllabusProgress[];
  onItemClick?: (item: SyllabusItem) => void;
  onStartTopic?: (item: SyllabusItem) => void;
}

export function SyllabusTreeView({ 
  syllabusItems, 
  userProgress, 
  onItemClick, 
  onStartTopic 
}: SyllabusTreeViewProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  
  const progressMap = new Map(userProgress.map(p => [p.syllabusItemId, p]));
  
  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const getStatusIcon = (item: SyllabusItem) => {
    const progress = progressMap.get(item.id);
    const status = progress?.status || 'not_started';
    
    switch (status) {
      case 'completed':
      case 'mastered':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'in_progress':
        return <PlayCircle className="h-4 w-4 text-blue-600" />;
      default:
        return <Circle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (item: SyllabusItem) => {
    const progress = progressMap.get(item.id);
    const status = progress?.status || 'not_started';
    
    switch (status) {
      case 'completed':
      case 'mastered':
        return 'bg-green-50 border-green-200';
      case 'in_progress':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getImportanceBadge = (importance: string) => {
    const colors = {
      critical: 'bg-red-100 text-red-800',
      high: 'bg-orange-100 text-orange-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-gray-100 text-gray-800'
    };
    return (
      <Badge variant="secondary" className={colors[importance as keyof typeof colors] || colors.medium}>
        {importance}
      </Badge>
    );
  };

  const getDifficultyBadge = (difficulty: string) => {
    const colors = {
      hard: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      easy: 'bg-green-100 text-green-800'
    };
    return (
      <Badge variant="outline" className={colors[difficulty as keyof typeof colors] || colors.medium}>
        {difficulty}
      </Badge>
    );
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'pdf':
      case 'article':
        return <FileText className="h-3 w-3" />;
      case 'video':
        return <Video className="h-3 w-3" />;
      case 'quiz':
      case 'practice':
        return <HelpCircle className="h-3 w-3" />;
      default:
        return <BookOpen className="h-3 w-3" />;
    }
  };

  const buildTree = (parentId?: string): SyllabusItem[] => {
    return syllabusItems
      .filter(item => item.parentId === parentId)
      .sort((a, b) => a.order - b.order);
  };

  const renderItem = (item: SyllabusItem, level: number = 0) => {
    const children = buildTree(item.id);
    const hasChildren = children.length > 0;
    const isExpanded = expandedItems.has(item.id);
    const progress = progressMap.get(item.id);
    const progressPercentage = progress?.progressPercentage || 0;

    return (
      <div key={item.id} className={cn("mb-2", level > 0 && "ml-6")}>
        <Card className={cn("transition-all duration-200 hover:shadow-md", getStatusColor(item))}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <div className="flex items-center gap-2">
                  {getStatusIcon(item)}
                  {hasChildren && (
                    <Collapsible open={isExpanded} onOpenChange={() => toggleExpanded(item.id)}>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="p-0 h-auto">
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                      </CollapsibleTrigger>
                    </Collapsible>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <CardTitle className="text-base cursor-pointer hover:text-primary" 
                      onClick={() => onItemClick?.(item)}>
                      {item.title}
                    </CardTitle>
                    {getImportanceBadge(item.importance)}
                    {getDifficultyBadge(item.difficulty)}
                  </div>
                  
                  {item.description && (
                    <CardDescription className="text-sm mb-2">
                      {item.description}
                    </CardDescription>
                  )}
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    {item.estimatedHours && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {item.estimatedHours}h
                      </div>
                    )}
                    {progress?.timeSpent && (
                      <div className="flex items-center gap-1">
                        <Target className="h-3 w-3" />
                        {Math.round(progress.timeSpent / 60)}h spent
                      </div>
                    )}
                    <Badge variant="outline" className="text-xs">
                      {item.type}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                {progress?.status !== 'completed' && progress?.status !== 'mastered' && (
                  <Button 
                    size="sm" 
                    variant={progress?.status === 'in_progress' ? 'default' : 'outline'}
                    onClick={() => onStartTopic?.(item)}
                  >
                    {progress?.status === 'in_progress' ? 'Continue' : 'Start'}
                  </Button>
                )}
                
                {progressPercentage > 0 && (
                  <div className="w-24">
                    <Progress value={progressPercentage} className="h-2" />
                    <span className="text-xs text-muted-foreground">{progressPercentage}%</span>
                  </div>
                )}
              </div>
            </div>
          </CardHeader>

          {(item.tags.length > 0 || item.resources?.length || item.learningObjectives?.length) && (
            <CardContent className="pt-0">
              {item.learningObjectives && item.learningObjectives.length > 0 && (
                <div className="mb-3">
                  <h4 className="text-sm font-medium mb-1">Learning Objectives:</h4>
                  <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                    {item.learningObjectives.map((objective, idx) => (
                      <li key={idx}>{objective}</li>
                    ))}
                  </ul>
                </div>
              )}

              {item.resources && item.resources.length > 0 && (
                <div className="mb-3">
                  <h4 className="text-sm font-medium mb-2">Resources:</h4>
                  <div className="flex flex-wrap gap-2">
                    {item.resources.map((resource) => (
                      <Badge key={resource.id} variant="outline" className="text-xs">
                        <div className="flex items-center gap-1">
                          {getResourceIcon(resource.type)}
                          {resource.title}
                          {resource.duration && (
                            <span className="text-muted-foreground">({resource.duration}min)</span>
                          )}
                        </div>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {item.tags.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-1">Tags:</h4>
                  <div className="flex flex-wrap gap-1">
                    {item.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          )}
        </Card>

        {hasChildren && (
          <Collapsible open={isExpanded}>
            <CollapsibleContent className="mt-2">
              {children.map(child => renderItem(child, level + 1))}
            </CollapsibleContent>
          </Collapsible>
        )}
      </div>
    );
  };

  const rootItems = buildTree();

  return (
    <div className="space-y-4">
      {rootItems.map(item => renderItem(item))}
    </div>
  );
}