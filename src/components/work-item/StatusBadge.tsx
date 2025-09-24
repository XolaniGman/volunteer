import { Badge } from '@/components/ui/badge';
import { WorkItemState } from '@/types/workItem';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  state: WorkItemState;
  className?: string;
}

export const StatusBadge = ({ state, className }: StatusBadgeProps) => {
  const stateConfig = {
    todo: {
      label: 'To Do',
      className: 'bg-status-todo text-foreground border-status-todo',
    },
    doing: {
      label: 'Doing',
      className: 'bg-status-doing text-white border-status-doing',
    },
    done: {
      label: 'Done',
      className: 'bg-status-done text-white border-status-done',
    },
  };

  const config = stateConfig[state];

  return (
    <Badge 
      variant="outline" 
      className={cn(config.className, className)}
    >
      {config.label}
    </Badge>
  );
};