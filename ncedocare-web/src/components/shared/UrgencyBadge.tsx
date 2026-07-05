import { Badge } from '@/components/ui/badge';
import { PriorityLevel } from '@/types/ncedocare';
import { cn } from '@/lib/utils';

const config: Record<PriorityLevel, { label: string; className: string }> = {
  CRITICAL: { label: 'Critical', className: 'bg-red-600 text-white animate-pulse' },
  HIGH:     { label: 'High',     className: 'bg-orange-500 text-white' },
  MEDIUM:   { label: 'Medium',   className: 'bg-yellow-400 text-black' },
  LOW:      { label: 'Low',      className: 'bg-green-500 text-white' },
};

export const UrgencyBadge = ({
  priority,
  className,
}: {
  priority: PriorityLevel;
  className?: string;
}) => {
  const { label, className: colorClass } = config[priority];
  return (
    <Badge className={cn(colorClass, 'text-xs font-semibold px-2 py-1', className)}>
      {label}
    </Badge>
  );
};
