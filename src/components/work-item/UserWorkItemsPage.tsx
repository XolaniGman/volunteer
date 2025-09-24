'use client';

import { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { WorkItem } from '@/types/workItem';
import { WorkItemsTable } from './WorkItemsTable';
import { WorkItemDetail } from './WorkItemDetail';

interface UserWorkItemsPageProps {
  userEmail: string; // pass in the email of the user whose items you want to see
}

export const UserWorkItemsPage: React.FC<UserWorkItemsPageProps> = ({ userEmail }) => {
  const [workItems, setWorkItems] = useState<WorkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorkItem, setSelectedWorkItem] = useState<WorkItem | null>(null);

  // Fetch work items assigned to a specific user
  useEffect(() => {
    const fetchWorkItems = async () => {
      try {
        const q = query(
          collection(db, 'workItems'),
          where('assignedTo', '==', userEmail)
        );
        const snapshot = await getDocs(q);
        const items: WorkItem[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as WorkItem[];
        setWorkItems(items);
      } catch (error) {
        console.error('Error fetching work items:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userEmail) fetchWorkItems();
  }, [userEmail]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading work items...
      </div>
    );
  }

  return (
    <div>
      {selectedWorkItem ? (
        <WorkItemDetail
          workItem={selectedWorkItem}
          onBack={() => setSelectedWorkItem(null)}
          onSave={(updated) => {
            setWorkItems((prev) =>
              prev.map((wi) => (wi.id === updated.id ? updated : wi))
            );
            setSelectedWorkItem(updated);
          }}
          onDelete={(id) => {
            setWorkItems((prev) => prev.filter((wi) => wi.id !== id));
            setSelectedWorkItem(null);
          }}
        />
      ) : (
        <WorkItemsTable
          workItems={workItems}
          onWorkItemClick={(item) => setSelectedWorkItem(item)}
        />
      )}
    </div>
  );
};

export default UserWorkItemsPage;
