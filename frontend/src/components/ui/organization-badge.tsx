'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Organization, getOrganizationById } from '@/types/organization';

interface OrganizationBadgeProps {
  organizationId?: string;
  organization?: Organization;
  variant?: 'default' | 'outline' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  showFullName?: boolean;
  className?: string;
}

export function OrganizationBadge({ 
  organizationId, 
  organization, 
  variant = 'default',
  size = 'md',
  showFullName = false,
  className 
}: OrganizationBadgeProps) {
  const org = organization || (organizationId ? getOrganizationById(organizationId) : null);
  
  if (!org) {
    return (
      <Badge variant="outline" className={cn("text-gray-500", className)}>
        Unknown
      </Badge>
    );
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  const displayText = showFullName ? org.name : org.code;

  if (variant === 'outline') {
    return (
      <Badge 
        variant="outline" 
        className={cn(
          sizeClasses[size],
          "border-2 font-medium",
          className
        )}
        style={{
          borderColor: org.color,
          color: org.color,
        }}
      >
        {displayText}
      </Badge>
    );
  }

  return (
    <Badge 
      variant={variant}
      className={cn(
        sizeClasses[size],
        "font-medium border-0",
        className
      )}
      style={{
        backgroundColor: org.backgroundColor,
        color: org.color,
      }}
    >
      {displayText}
    </Badge>
  );
}

interface OrganizationCardProps {
  organization: Organization;
  onClick?: () => void;
  selected?: boolean;
  className?: string;
}

export function OrganizationCard({ 
  organization, 
  onClick, 
  selected = false,
  className 
}: OrganizationCardProps) {
  return (
    <div
      className={cn(
        "p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md",
        selected 
          ? "ring-2 ring-offset-2" 
          : "hover:border-gray-300",
        className
      )}
      style={{
        borderColor: selected ? organization.color : '#e5e7eb',
        backgroundColor: selected ? organization.backgroundColor : 'white',
        ringColor: selected ? organization.color : undefined,
      }}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <OrganizationBadge 
            organization={organization} 
            variant="outline" 
            size="sm"
          />
          <span className="text-xs text-gray-500 capitalize">
            {organization.category}
          </span>
        </div>
      </div>
      
      <h3 className="font-semibold text-gray-900 mb-1">
        {organization.name}
      </h3>
      
      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
        {organization.description}
      </p>
      
      <div className="flex flex-wrap gap-1">
        {organization.examTypes.slice(0, 3).map((examType) => (
          <Badge 
            key={examType} 
            variant="secondary" 
            className="text-xs uppercase"
          >
            {examType.replace('_', ' ')}
          </Badge>
        ))}
        {organization.examTypes.length > 3 && (
          <Badge variant="outline" className="text-xs">
            +{organization.examTypes.length - 3} more
          </Badge>
        )}
      </div>
    </div>
  );
}