import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { WorkItem } from '@/types/workItem';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { collection, getCountFromServer } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface TeamCardProps {
  teamName: string;
  workItems: WorkItem[];
  className?: string;
}

export const TeamCard = ({ teamName, workItems, className }: TeamCardProps) => {
  const [workItemCount, setWorkItemCount] = useState<number>(0);
  const [userCount, setUserCount] = useState<number>(0);

  useEffect(() => {
    const fetchStats = async () => {
      // Count work items
      const workItemsSnap = await getCountFromServer(collection(db, 'workItems'));
      setWorkItemCount(workItemsSnap.data().count);

      // Count users (assuming 'profiles' collection)
      const usersSnap = await getCountFromServer(collection(db, 'profiles'));
      setUserCount(usersSnap.data().count);
    };
    fetchStats();
  }, []);

  // Get unique assignees
  const assignees = [...new Set(workItems.map(item => item.assignedTo).filter(Boolean))];
  const memberCount = assignees.length;
  const additionalMembers = Math.max(0, memberCount - 3);

  return (
    <Card className={cn("bg-gradient-to-r from-cyan-300 to-blue-500 to-white space-y-6 shadow-md shadow-card border", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-foreground">
          {teamName}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center gap-2 mb-4">
          {assignees.slice(0, 3).map((assignee, index) => (
            <Avatar key={index} className="w-8 h-8">
              <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                {assignee?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
          ))}
          {additionalMembers > 0 && (
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs text-muted-foreground">
              +{additionalMembers}
            </div>
          )}
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-foreground">
            {workItems.length}
          </div>
          <div className="text-xs text-muted-foreground">
            Work Items
          </div>
        </div>
      </CardContent>
    </Card>
  );
};