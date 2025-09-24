import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { WorkItem } from '@/types/workItem';
import { WorkItemIcon } from './WorkItemIcon';
import { StatusBadge } from './StatusBadge';
import { MessageSquare, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase'; // Adjust import path as needed
import { getAuth } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

interface WorkItemsTableProps {
  onWorkItemClick: (workItem: WorkItem) => void;
  workItems?: WorkItem[];
}

export const WorkItemsTable = ({ onWorkItemClick, workItems: propWorkItems }: WorkItemsTableProps) => {
  const [workItems, setWorkItems] = useState<WorkItem[]>(propWorkItems ?? []);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    if (propWorkItems) {
      setWorkItems(propWorkItems);
      setLoading(false);
      return;
    }
    const fetchWorkItems = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'workItems'));
        const items: WorkItem[] = [];
        querySnapshot.forEach((doc) => {
          items.push({ id: doc.id, ...doc.data() } as unknown as WorkItem);
        });
        setWorkItems(items);
      } catch (err) {
        setError('Failed to fetch work items');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchWorkItems();
  }, [propWorkItems]);

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (user) {
          const profileRef = doc(db, 'profiles', user.uid);
          const profileSnap = await getDoc(profileRef);
          if (profileSnap.exists()) {
            setUserName(profileSnap.data().displayName || user.email);
          } else {
            setUserName(user.email);
          }
        }
      } catch {
        setUserName(null);
      }
    };
    fetchUserName();
  }, []);

  const handleRowClick = (workItem: WorkItem) => {
    setSelectedId(workItem.id);
    onWorkItemClick(workItem);
  };

  if (loading) {
    return <div>Loading work items...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="bg-card rounded-lg shadow-card border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-12">ID</TableHead>
            <TableHead className="w-12"></TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Assigned To</TableHead>
            <TableHead>State</TableHead>
            <TableHead>Area Path</TableHead>
            <TableHead>Tags</TableHead>
            <TableHead className="w-16">Comments</TableHead>
            <TableHead>Activity Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {workItems.map((item) => (
            <TableRow
              key={item.id}
              onClick={() => handleRowClick(item)}
              className={cn(
                'cursor-pointer hover:bg-muted/30 transition-colors',
                selectedId === item.id && 'bg-azure-light'
              )}
            >
              <TableCell className="font-medium">{item.id}</TableCell>
              <TableCell>
                <WorkItemIcon type={item.type} />
              </TableCell>
              <TableCell className="max-w-64 truncate font-medium">
                {item.title}
              </TableCell>
              <TableCell>
                {item.assignedTo ? (
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-azure rounded-full flex items-center justify-center text-white text-xs">
                      {userName ? userName.charAt(0).toUpperCase() : (item.assignedTo.charAt(0).toUpperCase())}
                    </div>
                    <span className="text-sm">{userName || item.assignedTo}</span>
                  </div>
                ) : (
                  <span className="text-muted-foreground">
                    {item.createdBy || '-'}
                  </span>
                )}
              </TableCell>
              <TableCell>
                <StatusBadge state={item.state} />
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {item.areaPath}
              </TableCell>
              <TableCell>
                <div className="flex gap-1 flex-wrap">
                  {item.tags?.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-muted text-xs rounded text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                  {item.tags?.length > 2 && (
                    <span className="text-xs text-muted-foreground">
                      +{item.tags.length - 2}
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {item.comments?.length > 0 && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <MessageSquare className="w-4 h-4" />
                    <span className="text-sm">{item.comments.length}</span>
                  </div>
                )}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(item.activityDate).toLocaleDateString()}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};