'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Lock, Unlock, Users, Eye, Edit3, Copy, 
  BookOpen, Clock, Target, Star, Calendar,
  MoreHorizontal, Share2, Settings
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { QuestionBank, getPermissionLabel, getPermissionColor, getDifficultyColor } from '@/types/question-bank';

interface QuestionBankCardProps {
  questionBank: QuestionBank;
  onView?: (bank: QuestionBank) => void;
  onEdit?: (bank: QuestionBank) => void;
  onShare?: (bank: QuestionBank) => void;
  onCopy?: (bank: QuestionBank) => void;
  onSettings?: (bank: QuestionBank) => void;
  currentUserId?: string;
}

export function QuestionBankCard({ 
  questionBank, 
  onView, 
  onEdit, 
  onShare, 
  onCopy, 
  onSettings,
  currentUserId = 'current-user'
}: QuestionBankCardProps) {
  const isOwner = questionBank.created_by === currentUserId;
  const permission = questionBank.user_permission;
  const canView = questionBank.can_access;
  const canEdit = isOwner || permission?.permission_type === 'edit' || permission?.permission_type === 'full';
  const canCopy = isOwner || permission?.permission_type === 'copy' || permission?.permission_type === 'full';

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getAccessIcon = () => {
    if (questionBank.is_public) {
      return <Unlock className="h-4 w-4 text-green-600" />;
    } else if (permission || isOwner) {
      return <Users className="h-4 w-4 text-blue-600" />;
    } else {
      return <Lock className="h-4 w-4 text-red-600" />;
    }
  };

  const getAccessLabel = () => {
    if (questionBank.is_public) return 'Public';
    if (isOwner) return 'Owner';
    if (permission) return getPermissionLabel(permission.permission_type);
    return 'Private';
  };

  const getAccessColor = () => {
    if (questionBank.is_public) return 'bg-green-100 text-green-800';
    if (isOwner) return 'bg-purple-100 text-purple-800';
    if (permission) return getPermissionColor(permission.permission_type);
    return 'bg-red-100 text-red-800';
  };

  return (
    <Card className={`group hover:shadow-lg transition-all duration-200 ${!canView ? 'opacity-60' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-lg leading-tight cursor-pointer hover:text-primary" 
                onClick={() => canView && onView?.(questionBank)}>
                {questionBank.name}
              </CardTitle>
              {questionBank.is_featured && (
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
              )}
            </div>
            
            <div className="flex items-center gap-2 mb-2">
              {getAccessIcon()}
              <Badge variant="secondary" className={getAccessColor()}>
                {getAccessLabel()}
              </Badge>
              <Badge variant="outline" className={getDifficultyColor(questionBank.difficulty_level)}>
                {questionBank.difficulty_level}
              </Badge>
            </div>

            {questionBank.description && (
              <CardDescription className="text-sm line-clamp-2">
                {questionBank.description}
              </CardDescription>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {canView && (
                <DropdownMenuItem onClick={() => onView?.(questionBank)}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Questions
                </DropdownMenuItem>
              )}
              {canEdit && (
                <DropdownMenuItem onClick={() => onEdit?.(questionBank)}>
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit Bank
                </DropdownMenuItem>
              )}
              {canCopy && (
                <DropdownMenuItem onClick={() => onCopy?.(questionBank)}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Questions
                </DropdownMenuItem>
              )}
              {isOwner && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onShare?.(questionBank)}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Manage Sharing
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onSettings?.(questionBank)}>
                    <Settings className="h-4 w-4 mr-2" />
                    Bank Settings
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <BookOpen className="h-4 w-4" />
            <span>{questionBank.total_questions} questions</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Target className="h-4 w-4" />
            <span>{questionBank.usage_count} uses</span>
          </div>
          {questionBank.default_time_per_question && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{questionBank.default_time_per_question}s avg</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(questionBank.updated_at)}</span>
          </div>
        </div>

        {/* Tags */}
        {questionBank.tags.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {questionBank.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {questionBank.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{questionBank.tags.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Permission info for shared banks */}
        {permission && !isOwner && (
          <div className="mb-4 p-2 bg-muted rounded-lg">
            <div className="text-xs text-muted-foreground">
              Shared by <span className="font-medium">{permission.granted_by_name}</span>
              {permission.expires_at && (
                <span> • Expires {formatDate(permission.expires_at)}</span>
              )}
            </div>
            {permission.notes && (
              <div className="text-xs text-muted-foreground mt-1">
                {permission.notes}
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          {canView && (
            <Button 
              variant="default" 
              size="sm" 
              className="flex-1"
              onClick={() => onView?.(questionBank)}
            >
              <Eye className="h-4 w-4 mr-2" />
              View
            </Button>
          )}
          
          {canEdit && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onEdit?.(questionBank)}
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
          
          {canCopy && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onCopy?.(questionBank)}
            >
              <Copy className="h-4 w-4" />
            </Button>
          )}

          {!canView && (
            <Button variant="outline" size="sm" className="flex-1" disabled>
              <Lock className="h-4 w-4 mr-2" />
              No Access
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}