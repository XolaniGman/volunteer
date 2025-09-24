import { Crown, AlertCircle, CheckSquare } from 'lucide-react';
import { WorkItemType } from '@/types/workItem';
import { cn } from '@/lib/utils';

interface WorkItemIconProps {
  type: WorkItemType;
  className?: string;
}

export const WorkItemIcon = ({ type, className }: WorkItemIconProps) => {
  const iconMap = {
    epic: Crown,
    issue: AlertCircle,
    task: CheckSquare,
  };

  const colorMap = {
    epic: 'text-workitem-epic',
    issue: 'text-workitem-issue', 
    task: 'text-workitem-task',
  };

  const Icon = iconMap[type];

  return (
    <Icon 
      className={cn(
        'w-4 h-4',
        colorMap[type],
        className
      )} 
    />
  );
};