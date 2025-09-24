import { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { WorkItemIcon } from './WorkItemIcon';
import { StatusBadge } from './StatusBadge';
import { MessageSquare, Calendar, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface WorkItem {
  id: string;
  title: string;
  type?: string;
  state?: string;
  assignedTo?: string | null;
  areaPath?: string;
  priority?: number;
  description?: string;
  createdDate?: string;
  tags?: string[];
  comments?: string[];
  activityDate?: string;
}

interface WorkItemsTableProps {
  onWorkItemClick: (workItem: WorkItem) => void;
  workItems?: WorkItem[];
  onViewUserWorkItems?: (userEmail: string) => void; // Optional callback
}

export const WorkItemsTable = ({
  onWorkItemClick,
  workItems: propWorkItems,
  onViewUserWorkItems,
}: WorkItemsTableProps) => {
  const [workItems, setWorkItems] = useState<WorkItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'workItems'));
        const data: WorkItem[] = [];
        querySnapshot.forEach((docSnap) => {
          data.push({ id: docSnap.id, ...docSnap.data() } as WorkItem);
        });
        setWorkItems(data);
      } catch (err) {
        setError('Failed to fetch work items.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this work item?')) return;
    try {
      await deleteDoc(doc(db, 'workItems', id));
      setWorkItems((prev) => prev.filter((item) => item.id !== id));
      setError(null);
    } catch (err) {
      setError('❌ Failed to delete work item.');
      console.error('Failed to delete work item from Firestore:', err);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500 mb-2">{error}</div>;

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
            <TableHead>Created</TableHead>
            <TableHead className="w-12">Delete</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {workItems.map((item) => (
            <TableRow
              key={item.id}
              onClick={() => setSelectedId(item.id)}
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
                      {item.assignedTo.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm">{item.assignedTo}</span>
                    {onViewUserWorkItems && (
                      <button
                        className="ml-2 px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewUserWorkItems(item.assignedTo!);
                        }}
                        disabled={!item.assignedTo}
                      >
                        View All
                      </button>
                    )}
                  </div>
                ) : (
                  <span className="text-muted-foreground">Unassigned</span>
                )}
              </TableCell>
              <TableCell>
                <StatusBadge state={item.state} />
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {item.areaPath || '-'}
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
                  {item.tags && item.tags.length > 2 && (
                    <span className="text-xs text-muted-foreground">
                      +{item.tags.length - 2}
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {item.comments?.length ? (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <MessageSquare className="w-4 h-4" />
                    <span className="text-sm">{item.comments.length}</span>
                  </div>
                ) : (
                  <span className="text-muted-foreground">0</span>
                )}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {item.createdDate
                    ? new Date(item.createdDate).toLocaleDateString()
                    : '-'}
                </div>
              </TableCell>
              <TableCell>
                <button
                  className="text-red-500 hover:text-red-700"
                  title="Delete"
                  onClick={(e) => handleDelete(e, item.id)}
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default WorkItemsTable;