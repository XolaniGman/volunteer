import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { WorkItem } from '@/types/workItem';
import { WorkItemIcon } from './WorkItemIcon';
import { StatusBadge } from './StatusBadge';
import { MessageSquare, Calendar, Trash2, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  collection,
  getDocs,
  doc,
  getDoc,
  deleteDoc,
  updateDoc,
  arrayUnion,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getAuth } from 'firebase/auth';

interface WorkItemsTableProps {
  onWorkItemClick: (workItem: WorkItem) => void;
  workItems?: WorkItem[];
}

export const WorkItemsTable = ({
  onWorkItemClick,
  workItems: propWorkItems,
}: WorkItemsTableProps) => {
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
        querySnapshot.forEach((docSnap) => {
          items.push({ id: docSnap.id, ...docSnap.data() } as WorkItem);
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

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!id) return;
    if (!window.confirm('Are you sure you want to delete this work item?')) return;

    try {
      await deleteDoc(doc(db, 'workItems', id));
      // Re-fetch the workItems collection to sync UI
      const querySnapshot = await getDocs(collection(db, 'workItems'));
      const items: WorkItem[] = [];
      querySnapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...docSnap.data() } as WorkItem);
      });
      setWorkItems(items);
      setError(null);
    } catch (err) {
      setError('❌ Failed to delete work item.');
      console.error('Failed to delete work item from Firestore:', err);
    }
  };

  const handleApprove = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!id) {
      console.error('❌ Invalid work item ID:', id);
      return;
    }

    let approvedComment = null;
    let approvedAt = undefined;

    setWorkItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          if (item.state === 'done') {
            approvedComment = {
              id: Date.now().toString(),
              author: 'system',
              content: '✅',
              createdAt: new Date().toISOString(),
            };
            approvedAt = new Date().toISOString();
            return {
              ...item,
              comments: [...(item.comments || []), approvedComment],
              approved: true,
              approvedAt,
            };
          } else {
            return { ...item, approved: true };
          }
        }
        return item;
      })
    );

    try {
      const itemRef = doc(db, 'workItems', id);
      if (approvedComment) {
        await updateDoc(itemRef, {
          comments: arrayUnion(approvedComment),
          approved: true,
          approvedAt,
        });
      } else {
        await updateDoc(itemRef, { approved: true });
      }
    } catch (err) {
      console.error('Failed to approve work item:', err);
    }
  };

  if (loading) return <div>Loading work items...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="bg-card rounded-lg shadow-card border">
      
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
     
            <TableHead className="w-12"></TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Assigned To</TableHead>
            <TableHead>State</TableHead>
          
            <TableHead>URL</TableHead>
            <TableHead className="w-16">Comments</TableHead>
            <TableHead>Activity Date</TableHead>
            <TableHead className="w-20">Approval</TableHead>

          </TableRow>
        </TableHeader>
        <TableBody>
          {workItems.map((item, index) => (
            <TableRow
              key={item.id || `workItem-${index}`}
              onClick={() => handleRowClick(item)}
              className={cn(
                'cursor-pointer hover:bg-muted/30 transition-colors',
                selectedId === item.id && 'bg-azure-light'
              )}
            >
           
              <TableCell>
                <WorkItemIcon type={item.type} />
              </TableCell>
              <TableCell className="max-w-64 truncate font-medium">{item.title}</TableCell>
              <TableCell>
                {item.assignedTo ? (
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-azure rounded-full flex items-center justify-center text-white text-xs">
                      {userName
                        ? userName.charAt(0).toUpperCase()
                        : item.assignedTo.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm">{userName || item.assignedTo}</span>
                  </div>
                ) : (
                  <span className="text-muted-foreground">{item.createdBy || '-'}</span>
                )}
              </TableCell>
              <TableCell>
                <StatusBadge state={item.state} />
              </TableCell>
              
              <TableCell>
                {'url' in item && item.url ? (
                  <button
                    className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(item.url as string, '_blank', 'noopener,noreferrer');
                    }}
                  >
                    Open Link
                  </button>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell>
                {item.comments?.length ? (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <MessageSquare className="w-4 h-4" />
                    {item.comments.some((c) => c.content === '✅') && (
                      <span title="Approved" className="text-green-600 flex items-center">
                        <CheckCircle className="w-4 h-4 mr-1" />
                      </span>
                    )}
                    <span className="text-sm">
                      {item.comments.filter((c) => c.content !== '✅').length > 0
                        ? item.comments
                            .filter((c) => c.content !== '✅')
                            .map((c) => c.content)
                            .join(', ')
                        : item.comments.some((c) => c.content === '✅')
                        ? ''
                        : '0'}
                    </span>
                  </div>
                ) : (
                  <span className="text-muted-foreground">0</span>
                )}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {item.activityDate
                    ? new Date(item.activityDate).toLocaleDateString()
                    : '-'}
                </div>
              </TableCell>
              <TableCell>
                {['done', 'doing', 'todo'].includes(item.state) && (
                  <button
                    className={
                      item.state === 'done'
                        ? item.approved
                          ? 'px-2 py-1 bg-green-600 text-white rounded text-xs cursor-not-allowed'
                          : 'px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600'
                        : 'px-2 py-1 bg-yellow-500 text-white rounded text-xs hover:bg-yellow-600'
                    }
                    disabled={item.state === 'done' && item.approved}
                    onClick={(e) => {
                      if (item.state === 'done' && !item.approved) {
                        handleApprove(e, item.id);
                      }
                    }}
                  >
                    {item.state === 'done' && item.approved ? 'Approved' : 'Pending'}
                  </button>
                )}
              </TableCell>
           
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
