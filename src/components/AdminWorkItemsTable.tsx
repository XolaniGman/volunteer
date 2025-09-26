import { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { MessageSquare, Calendar, Trash2, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { collection, getDocs, doc, deleteDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import StatusBadge from './StatusBadge';
import type { WorkItem } from '@/types/workItem';


const AdminWorkItemsTable = () => {
  const [workItems, setWorkItems] = useState<WorkItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [justApprovedId, setJustApprovedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

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



  const handleApprove = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setJustApprovedId(id); // Set immediately for instant feedback
    try {
      const itemRef = doc(db, 'workItems', id);

      // Only update state to 'done', do not update comments
      await updateDoc(itemRef, {
        state: 'done',
      });

      setWorkItems((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
              ...item,
              state: 'done',
            }
            : item
        )
      );
    } catch (err) {
      console.error('Failed to approve work item:', err);
      setJustApprovedId(null); // Reset if error
    }
  };

  const filteredItems = workItems.filter(
    (item) =>
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      (item.assignedTo && item.assignedTo.toLowerCase().includes(search.toLowerCase())) ||
      item.state.toLowerCase().includes(search.toLowerCase())
  );



  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500 mb-2">{error}</div>;

  return (
    <div className="bg-card rounded-lg shadow-card border">
     <div className="mb-6 p-6 flex justify-end">
  <div className="relative w-72">
    <input
      type="text"
      placeholder="Search by title, assigned to, or state..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="w-full pl-10 pr-4 py-2 text-sm rounded-full border border-gray-300 shadow-sm 
                 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 
                 placeholder-gray-400 text-gray-700 outline-none transition"
    />
    {/* 🔍 Search icon */}
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5 text-gray-400 absolute left-3 top-2.5 pointer-events-none"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z"
      />
    </svg>
  </div>
</div>

      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="max-w-64">Title</TableHead>
            <TableHead>Assigned To</TableHead>
            <TableHead>State</TableHead>
            <TableHead>Area Path</TableHead>
            <TableHead>URL</TableHead>
            <TableHead className="w-16">Comments</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-20">Approval</TableHead>
            <TableHead className="w-12">Delete</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredItems.map((item) => (
            <TableRow
              key={item.id}
              onClick={() => setSelectedId(item.id)}
              className={cn(
                'cursor-pointer hover:bg-muted/30 transition-colors',
                selectedId === item.id && 'bg-azure-light'
              )}
            >
              <TableCell className="max-w-64 truncate font-medium">{item.title}</TableCell>
              <TableCell>
                {item.assignedTo ? (
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-azure rounded-full flex items-center justify-center text-white text-xs">
                      {item.assignedTo.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm">{item.assignedTo}</span>
                  </div>
                ) : (
                  <span className="text-muted-foreground">{item.createdBy || '-'}</span>
                )}
              </TableCell>
              <TableCell>
                <StatusBadge state={item.state} />
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">{item.areaPath || '-'}</TableCell>
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
                    <span className="text-sm">
                      {item.comments.length > 0
                        ? item.comments.map((c) => c.content).join(', ')
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
                  {item.createdDate ? new Date(item.createdDate).toLocaleDateString() : '-'}
                </div>
              </TableCell>

              <TableCell>
                {['done', 'doing', 'todo'].includes(item.state) && (
                  <button
                    className={
                      (item.state === 'done' || justApprovedId === item.id)
                        ? 'px-2 py-1 bg-green-600 text-white rounded text-xs cursor-not-allowed'
                        : 'px-2 py-1 bg-yellow-500 text-white rounded text-xs hover:bg-yellow-600'
                    }
                    disabled={item.state === 'done' || justApprovedId === item.id}
                    onClick={(e) => {
                      if (item.state !== 'done' && justApprovedId !== item.id) {
                        handleApprove(e, item.id);
                      }
                    }}
                  >
                    {(item.state === 'done' || justApprovedId === item.id)
                      ? 'Approved'
                      : 'Approve'}
                  </button>
                )}
              </TableCell>



              <TableCell>
                <button
                  onClick={(e) => handleDelete(e, item.id)}
                  className="p-1 text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default AdminWorkItemsTable;
