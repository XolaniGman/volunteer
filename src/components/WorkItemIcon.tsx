import { Bug, CheckSquare, Star } from 'lucide-react';

interface WorkItemIconProps {
  type?: string;
}

export const WorkItemIcon = ({ type }: WorkItemIconProps) => {
  switch (type?.toLowerCase()) {
    case 'bug':
      return <Bug className="w-5 h-5 text-red-500" />;
    case 'task':
      return <CheckSquare className="w-5 h-5 text-blue-500" />;
    case 'feature':
      return <Star className="w-5 h-5 text-green-500" />;
    default:
      return <CheckSquare className="w-5 h-5 text-gray-400" />;
  }
};
export default WorkItemIcon;