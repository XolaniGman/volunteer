import { useState, useMemo, useEffect } from 'react';
import { DashboardHeader } from '@/components/Dashboard/DashboardHeader';
import { StatsCard } from '@/components/Dashboard/StatsCard';
import { TeamCard } from '@/components/Dashboard/TeamCard';
import { WorkItemCard } from '@/components/Dashboard/WorkItemCard';
import { WorkItem, WorkItemFilter } from '@/types/workItem';
import { useToast } from '@/hooks/use-toast';
import { WorkItemDetail } from '@/components/work-item/WorkItemDetail';
import { getAuth } from 'firebase/auth';
import { fetchAllWorkItems } from '@/services/workItems';
import  StatCard  from '@/components/Dashboard/StatCard';


export const WorkItems = () => {
  const auth = getAuth();
  const user = auth.currentUser;
  const [workItems, setWorkItems] = useState<WorkItem[]>([]);
  const [selectedWorkItem, setSelectedWorkItem] = useState<WorkItem | null>(null);
  const [filter, setFilter] = useState<WorkItemFilter>({
    types: [],
    states: [],
    assignedTo: [],
    search: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user?.uid) {
          const items = await fetchAllWorkItems(user.uid);
          setWorkItems(items);
        }
      } catch (err) {
        toast({ title: 'Error', description: 'Failed to fetch work items', variant: 'destructive' });
      }
    };
    fetchData();
  }, [toast, user]);

  const filteredWorkItems = useMemo(() => {
    return workItems.filter((item) => {
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
  }, [workItems, filter]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalCompleted = workItems.filter(item => item.state === 'done').length;
    const successRate = workItems.length > 0 ? Math.round((totalCompleted / workItems.length) * 100) : 0;
    
    return {
      totalTasks: workItems.length,
      completedTasks: totalCompleted,
      successRate,
      inProgress: workItems.filter(item => item.state === 'doing').length,
    };
  }, [workItems]);

  // Group work items by area path (teams)
  const teamGroups = useMemo(() => {
    const groups = workItems.reduce((acc, item) => {
      const team = item.areaPath || 'Unassigned';
      if (!acc[team]) {
        acc[team] = [];
      }
      acc[team].push(item);
      return acc;
    }, {} as Record<string, WorkItem[]>);
    
    return Object.entries(groups).map(([teamName, items]) => ({
      teamName,
      workItems: items,
    }));
  }, [workItems]);

  const handleWorkItemClick = (workItem: WorkItem) => {
    setSelectedWorkItem(workItem);
  };

  const handleBackToList = () => {
    setSelectedWorkItem(null);
  };

  const handleSaveWorkItem = (updatedWorkItem: WorkItem) => {
    setWorkItems(prev => 
      prev.map(item => 
        item.id === updatedWorkItem.id 
          ? { ...updatedWorkItem, activityDate: new Date().toISOString() }
          : item
      )
    );
    
    toast({
      title: "Work item saved",
      description: `"${updatedWorkItem.title}" has been updated successfully.`,
    });
  };

  const handleNewWorkItem = () => {
    // Generate a unique string id (e.g., using timestamp and random)
    const newId = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const newWorkItem: WorkItem = {
      id: newId,
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
      createdBy: user?.email || '',
      approved: false,
    };
    setWorkItems(prev => [newWorkItem, ...prev]);
    setSelectedWorkItem(newWorkItem);
  };

  if (selectedWorkItem) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-6">
          <WorkItemDetail
            workItem={selectedWorkItem}
            onBack={handleBackToList}
            onSave={handleSaveWorkItem}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-200 bg-dark">
      <DashboardHeader
        filter={filter}
        onFilterChange={setFilter}
        onNewWorkItem={handleNewWorkItem}
      />
      
    </div>
  );
};