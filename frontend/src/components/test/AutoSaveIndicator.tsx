'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Cloud, CloudOff, Save, Clock, Wifi, WifiOff,
  CheckCircle2, AlertTriangle, Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AutoSaveIndicatorProps {
  isLoading: boolean;
  unsavedChanges: boolean;
  lastSaveTime: Date | null;
  onManualSave?: () => void;
  className?: string;
}

export function AutoSaveIndicator({ 
  isLoading, 
  unsavedChanges, 
  lastSaveTime, 
  onManualSave,
  className 
}: AutoSaveIndicatorProps) {
  const [isOnline, setIsOnline] = useState(true);
  const [timeAgo, setTimeAgo] = useState('');

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    setIsOnline(navigator.onLine);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Update time ago
  useEffect(() => {
    if (!lastSaveTime) return;

    const updateTimeAgo = () => {
      const now = new Date();
      const diff = Math.floor((now.getTime() - lastSaveTime.getTime()) / 1000);
      
      if (diff < 60) {
        setTimeAgo('just now');
      } else if (diff < 3600) {
        const minutes = Math.floor(diff / 60);
        setTimeAgo(`${minutes}m ago`);
      } else {
        const hours = Math.floor(diff / 3600);
        setTimeAgo(`${hours}h ago`);
      }
    };

    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [lastSaveTime]);

  const getStatus = () => {
    if (!isOnline) {
      return {
        icon: WifiOff,
        text: 'Offline',
        variant: 'destructive' as const,
        description: 'Answers will be saved when connection is restored'
      };
    }

    if (isLoading) {
      return {
        icon: Loader2,
        text: 'Saving...',
        variant: 'secondary' as const,
        description: 'Auto-saving your answers',
        animate: true
      };
    }

    if (unsavedChanges) {
      return {
        icon: AlertTriangle,
        text: 'Unsaved changes',
        variant: 'outline' as const,
        description: 'Your answers will be auto-saved shortly'
      };
    }

    if (lastSaveTime) {
      return {
        icon: CheckCircle2,
        text: `Saved ${timeAgo}`,
        variant: 'default' as const,
        description: 'All your answers are safely saved'
      };
    }

    return {
      icon: Cloud,
      text: 'Auto-save enabled',
      variant: 'secondary' as const,
      description: 'Your answers will be automatically saved'
    };
  };

  const status = getStatus();
  const Icon = status.icon;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Badge 
        variant={status.variant}
        className={cn(
          "flex items-center gap-1.5 px-2 py-1",
          status.variant === 'destructive' && "bg-red-50 text-red-700 border-red-200",
          status.variant === 'default' && "bg-green-50 text-green-700 border-green-200"
        )}
      >
        <Icon 
          className={cn(
            "h-3 w-3",
            status.animate && "animate-spin"
          )} 
        />
        <span className="text-xs font-medium">{status.text}</span>
      </Badge>

      {/* Manual save button when there are unsaved changes or offline */}
      {(unsavedChanges || !isOnline) && onManualSave && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onManualSave}
          disabled={isLoading}
          className="h-7 px-2 text-xs"
        >
          <Save className="h-3 w-3 mr-1" />
          Save Now
        </Button>
      )}

      {/* Tooltip-like description on hover */}
      <div className="sr-only">{status.description}</div>
    </div>
  );
}

// Compact version for mobile/small screens
export function CompactAutoSaveIndicator({ 
  isLoading, 
  unsavedChanges, 
  lastSaveTime,
  onManualSave,
  className 
}: AutoSaveIndicatorProps) {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    setIsOnline(navigator.onLine);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const getStatusIcon = () => {
    if (!isOnline) return { icon: WifiOff, color: 'text-red-500' };
    if (isLoading) return { icon: Loader2, color: 'text-blue-500', animate: true };
    if (unsavedChanges) return { icon: Clock, color: 'text-yellow-500' };
    if (lastSaveTime) return { icon: CheckCircle2, color: 'text-green-500' };
    return { icon: Cloud, color: 'text-gray-500' };
  };

  const { icon: Icon, color, animate } = getStatusIcon();

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <Icon 
        className={cn(
          "h-4 w-4",
          color,
          animate && "animate-spin"
        )} 
      />
      
      {(unsavedChanges || !isOnline) && onManualSave && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onManualSave}
          disabled={isLoading}
          className="h-6 w-6 p-0"
        >
          <Save className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}