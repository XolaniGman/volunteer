import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchAllWorkItems } from '@/services/workItems';
import { WorkItem } from '@/types/workItem';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const UserWorkItems = () => {
  const { userId } = useParams<{ userId: string }>();
  const [workItems, setWorkItems] = useState<WorkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;
      setLoading(true);
      try {
        const items = await fetchAllWorkItems(userId);
        setWorkItems(items);
      } catch {
        setWorkItems([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  return (
    <div className="min-h-screen bg-background p-6">
      <Button onClick={() => navigate(-1)} className="mb-4">Back</Button>
      <h2 className="text-2xl font-bold mb-4">Work Items for User</h2>
      {loading ? (
        <div>Loading...</div>
      ) : workItems.length === 0 ? (
        <div>No work items found for this user.</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>State</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead>Area Path</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {workItems.map(item => (
              <TableRow key={item.id}>
                <TableCell>{item.id}</TableCell>
                <TableCell>{item.title}</TableCell>
                <TableCell>{item.type}</TableCell>
                <TableCell>{item.state}</TableCell>
                <TableCell>{item.assignedTo}</TableCell>
                <TableCell>{item.areaPath}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default UserWorkItems;
