import { useState, useMemo, useEffect } from 'react';
import { DashboardHeader } from '@/components/Dashboard/DashboardHeader';
import { WorkItemsTable } from '@/components/work-item/WorkItemsTable';
import { WorkItemDetail } from '@/components/work-item/WorkItemDetail';
import { WorkItem, WorkItemFilter } from '@/types/workItem';
import { useToast } from '@/hooks/use-toast';
import { collection, getDocs, setDoc, doc, updateDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '@/lib/firebase';

export const TableView = () => {
  const [workItems, setWorkItems] = useState<WorkItem[]>([]);
  const [selectedWorkItem, setSelectedWorkItem] = useState<WorkItem | null>(null);
  const [filter, setFilter] = useState<WorkItemFilter>({
    types: [],
    states: [],
    assignedTo: [],
    search: '',
  });
  const { toast } = useToast();

  // Fetch work items from Firestore
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'workItems'));
        const items: WorkItem[] = [];
        querySnapshot.forEach((docSnap) => {
          items.push({ id: docSnap.id, ...docSnap.data() } as WorkItem);
        });
        setWorkItems(items);
      } catch (err) {
        toast({ title: 'Error', description: 'Failed to fetch work items', variant: 'destructive' });
      }
    };
    fetchItems();
  }, [toast]);

  // Show all work items assigned BY the current user (createdBy)
  const auth = getAuth();
  const currentUserEmail = auth.currentUser?.email;
  const filteredWorkItems = useMemo(() => {
    return workItems.filter((item) => {
      if (currentUserEmail && item.createdBy !== currentUserEmail) {
        return false;
      }
      // Search filter
      if (filter.search && !item.title.toLowerCase().includes(filter.search.toLowerCase())) {
        return false;
      }
      // Type filter
      if (filter.types.length > 0 && !filter.types.includes(item.type)) {
        return false;
      }
      // State filter
      if (filter.states.length > 0 && !filter.states.includes(item.state)) {
        return false;
      }
      return true;
    });
  }, [workItems, filter, currentUserEmail]);

  const handleWorkItemClick = (workItem: WorkItem) => {
    setSelectedWorkItem(workItem);
  };

  const handleBackToList = () => {
    setSelectedWorkItem(null);
  };

  // Save to Firestore
  const handleSaveWorkItem = async (item: WorkItem) => {
    try {
      if (item.id) {
        // Update existing
        await updateDoc(doc(db, 'workItems', item.id), { ...item });
        setWorkItems((prev) =>
          prev.map((w) => (w.id === item.id ? { ...item } : w))
        );
      } else {
        // Create new
        const newDocRef = doc(collection(db, 'workItems'));
        await setDoc(newDocRef, { ...item });
        console.log("Saving work item:", { ...item, id: newDocRef.id });
        setWorkItems((prev) => [{ ...item, id: newDocRef.id }, ...prev]);
      }
      setSelectedWorkItem(null);
      toast({ title: 'Success', description: 'Work item saved!' });
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to save work item', variant: 'destructive' });
    }
  };

  const handleNewWorkItem = () => {
    // Generate a unique string id (temporary, will be replaced by Firestore id)
    const newWorkItem: WorkItem = {
      id: '', // Will be set after Firestore save
      title: '',
      type: 'task',
      state: 'todo',
      assignedTo: null,
      areaPath: 'LIVE RESUME',
      tags: [],
      priority: 3,
      description: '',
      comments: [],
      activityDate: new Date().toISOString(),
      createdDate: new Date().toISOString(),
      createdBy: currentUserEmail || '',
      approved: false,
    };
    setSelectedWorkItem(newWorkItem);
  };

  if (selectedWorkItem) {
    return (
      <WorkItemDetail
        workItem={selectedWorkItem}
        onBack={handleBackToList}
        onSave={handleSaveWorkItem}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader
        filter={filter}
        onFilterChange={setFilter}
        onNewWorkItem={handleNewWorkItem}
      />
      <div className="container mx-auto p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">Work Items Table</h2>
            <p className="text-muted-foreground">
              Showing {filteredWorkItems.length} of {workItems.length} work items
            </p>
          </div>
          <WorkItemsTable
            workItems={filteredWorkItems}
            onWorkItemClick={handleWorkItemClick}
          />
        </div>
      </div>
    </div>
  );
};