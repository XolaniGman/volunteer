import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { WorkItemIcon } from '@/components/work-item/WorkItemIcon';
import { StatusBadge } from '@/components/work-item/StatusBadge';
import { WorkItem } from '@/types/workItem';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface WorkItemCardProps {
  workItem: WorkItem;
  onClick: (workItem: WorkItem) => void;
  className?: string;
}

export const WorkItemCard = ({ workItem, onClick, className }: WorkItemCardProps) => {
  return (
    <Card 
      className={cn(
        "bg-gradient-to-r from-cyan-900 to-blue-300 to-black shadow-card text-white space-y-6 shadow-md hover:shadow-elevated transition-all cursor-pointer",
        className
      )}
      onClick={() => onClick(workItem)}
    >
      <CardHeader className="pb-3 text-white">
        <div className="flex items-start text-white justify-between">
          <div className="flex items-center text-white gap-2">
            <WorkItemIcon type={workItem.type} />
            <span className="text-sm font-medium text-white">
              #{workItem.id}
            </span>
          </div>
          <StatusBadge state={workItem.state} />
        </div>
      </CardHeader>
      <CardContent className="pt-0 text-white space-y-3">
        <div>
          <h3 className="font-medium text-white mb-1 line-clamp-2">
            {workItem.title || 'Untitled Work Item'}
          </h3>
          {workItem.description && (
            <p className="text-md text-white line-clamp-2">
              {workItem.description}
            </p>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {workItem.assignedTo && (
              <Avatar className="w-6 h-6">
                <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                  {workItem.assignedTo.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
            )}
            <div className="flex items-center gap-1">
              <Badge variant="outline" className="text-xs px-1 py-0">
                P{workItem.priority}
              </Badge>
            </div>
          </div>
          <div className="text-xs text-dark">
            {formatDistanceToNow(new Date(workItem.activityDate), { addSuffix: true })}
          </div>
        </div>
        
        {workItem.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {workItem.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {workItem.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{workItem.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const WorkItemCardList = ({ onCardClick }: { onCardClick: (workItem: WorkItem) => void }) => {
  const [workItems, setWorkItems] = useState<WorkItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkItems = async () => {
      const querySnapshot = await getDocs(collection(db, 'workItems'));
      const items: WorkItem[] = [];
      querySnapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...docSnap.data() } as WorkItem);
      });
      setWorkItems(items);
      setLoading(false);
    };
    fetchWorkItems();
  }, []);

  if (loading) return <div className="text-white">Loading...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {workItems.map((item) => (
        <WorkItemCard key={item.id} workItem={item} onClick={onCardClick} />
      ))}
    </div>
  );
};