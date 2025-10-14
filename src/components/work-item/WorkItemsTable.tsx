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
import { Calendar, CheckCircle } from 'lucide-react';
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
  const [currentUserName, setCurrentUserName] = useState<string | null>(null);

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

  // Fetch signed-in user name (for approvals)
  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (user) {
          const profileRef = doc(db, 'profiles', user.uid);
          const profileSnap = await getDoc(profileRef);
          if (profileSnap.exists()) {
            setCurrentUserName(profileSnap.data().displayName || user.email);
          } else {
            setCurrentUserName(user.email);
          }
        }
      } catch {
        setCurrentUserName(null);
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
    if (!id) return;

    let approvedComment = null;
    let approvedAt = undefined;

    setWorkItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          if (item.state === 'done') {
            approvedComment = {
              id: Date.now().toString(),
              author: currentUserName || 'system',
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
    "cursor-pointer transition-all duration-200 ease-in-out transform hover:scale-[1.01] hover:shadow-sm",
    selectedId === item.id
      ? "bg-gradient-to-r from-indigo-50 via-purple-50 to-white border-l-4 border-indigo-600"
      : "hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50"
  )}
>
  <TableCell>
    <WorkItemIcon type={item.type} />
  </TableCell>

  <TableCell className="max-w-64 truncate font-semibold text-gray-800">
    {item.title}
  </TableCell>

  <TableCell>
    {item.assignedTo ? (
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md">
          {item.assignedTo.charAt(0).toUpperCase()}
        </div>
        <span className="text-sm text-gray-700">{item.assignedTo}</span>
      </div>
    ) : (
      <span className="text-gray-400 italic">{item.createdBy || "-"}</span>
    )}
  </TableCell>

  <TableCell>
    <StatusBadge state={item.state} />
  </TableCell>

  <TableCell className="text-sm text-gray-600 flex items-center gap-1">
    <Calendar className="w-4 h-4 text-indigo-500" />
    {item.activityDate
      ? new Date(item.activityDate).toLocaleDateString()
      : "-"}
  </TableCell>

  <TableCell>
    {["done", "doing", "todo"].includes(item.state) && (
      <button
        className={cn(
          "px-3 py-1 rounded-lg text-xs font-medium transition-colors duration-200",
          item.state === "done"
            ? item.approved
              ? "bg-green-600 text-white cursor-not-allowed"
              : "bg-green-500 text-white hover:bg-green-600"
            : "bg-yellow-400 text-white hover:bg-yellow-500"
        )}
        disabled={item.state === "done" && item.approved}
        onClick={(e) => {
          if (item.state === "done" && !item.approved) {
            handleApprove(e, item.id);
          }
        }}
      >
        {item.state === "done" && item.approved ? "Approved ✅" : "Pending ⏳"}
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
