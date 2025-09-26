'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, DocumentData } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { WorkItem, WorkItemFilter, WorkItemType, WorkItemState } from '@/types/workItem';
import { DashboardHeader } from '@/components/Dashboard/DashboardHeader';
import { WorkItemDetail } from '@/components/work-item/WorkItemDetail';
// Removed incorrect import for WorkItemCard
import { WorkItemsTable } from '@/components/work-item/WorkItemsTable';
import { Button } from '@/components/ui/button';
import { Plus, LayoutGrid, Table } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

export const DashboardPage = () => {
  const [workItems, setWorkItems] = useState<WorkItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<WorkItem[]>([]);
  const [filter, setFilter] = useState<WorkItemFilter>({
    search: '',
    types: [],
    states: [],
    assignedTo: [],
  });
  const [selectedItem, setSelectedItem] = useState<WorkItem | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();
  const isTableView = location.pathname === '/table';

  // Fetch work items from Firestore in real-time
  useEffect(() => {
    setLoading(true);
    
    const workItemsQuery = query(
      collection(db, 'workItems'),
      orderBy('activityDate', 'desc')
    );

    const unsubscribe = onSnapshot(workItemsQuery, 
      (snapshot) => {
        const items: WorkItem[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          items.push({
            id: doc.id,
            title: data.title || '',
            description: data.description || '',
            type: data.type || 'task',
            state: data.state || 'todo',
            priority: data.priority || 3,
            areaPath: data.areaPath || '',
            createdDate: data.createdDate || new Date().toISOString(),
            activityDate: data.activityDate || new Date().toISOString(),
            comments: data.comments || [],
            tags: data.tags || [],
            assignedTo: data.assignedTo || '',
            approved: data.approved ?? false,
            createdBy: data.createdBy || '',
            url: data.url || '',
            ...data
          });
        });
        setWorkItems(items);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching work items:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Apply filters
  useEffect(() => {
    let result = workItems;

    // Apply search filter
    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      result = result.filter(item =>
        item.title.toLowerCase().includes(searchLower) ||
        item.description?.toLowerCase().includes(searchLower) ||
        item.areaPath?.toLowerCase().includes(searchLower) ||
        item.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Apply type filter
    if (filter.types.length > 0) {
      result = result.filter(item => filter.types.includes(item.type));
    }

    // Apply state filter
    if (filter.states.length > 0) {
      result = result.filter(item => filter.states.includes(item.state));
    }

    setFilteredItems(result);
  }, [workItems, filter]);

  const handleFilterChange = (newFilter: WorkItemFilter) => {
    setFilter(newFilter);
  };

  const handleNewWorkItem = () => {
    const newItem: WorkItem = {
      id: 'new',
      title: 'New Volunteer Activity',
      description: '',
      type: 'task',
      state: 'todo',
      priority: 3,
      areaPath: '',
      createdDate: new Date().toISOString(),
      activityDate: new Date().toISOString(),
      comments: [],
      tags: [],
      assignedTo: '',
      approved: false,
      createdBy: '',
      url: '',
    };
    setSelectedItem(newItem);
    setIsCreatingNew(true);
  };

  const handleCardClick = (workItem: WorkItem) => {
    setSelectedItem(workItem);
    setIsCreatingNew(false);
  };

  const handleSaveWorkItem = async (workItem: WorkItem) => {
    try {
      // Here you would implement the save to Firestore
      // For now, we'll just update the local state
      if (isCreatingNew) {
        // Add new item to the beginning of the list
        const newItemWithId = {
          ...workItem,
          id: Date.now().toString(), // Generate a temporary ID
        };
        setWorkItems(prev => [newItemWithId, ...prev]);
        setIsCreatingNew(false);
      } else {
        // Update existing item
        setWorkItems(prev => prev.map(item => 
          item.id === workItem.id ? workItem : item
        ));
      }
      setSelectedItem(null);
    } catch (error) {
      console.error('Error saving work item:', error);
    }
  };

  const handleDeleteWorkItem = async (id: string) => {
    try {
      // Here you would implement the delete from Firestore
      // For now, we'll just update the local state
      setWorkItems(prev => prev.filter(item => item.id !== id));
      setSelectedItem(null);
    } catch (error) {
      console.error('Error deleting work item:', error);
    }
  };

  const handleBackToList = () => {
    setSelectedItem(null);
    setIsCreatingNew(false);
  };

  // Group items by state for dashboard view
  const groupedItems = {
    todo: filteredItems.filter(item => item.state === 'todo'),
    doing: filteredItems.filter(item => item.state === 'doing'),
    done: filteredItems.filter(item => item.state === 'done'),
  };

  if (selectedItem) {
    return (
      <WorkItemDetail
        workItem={selectedItem}
        onBack={handleBackToList}
        onSave={handleSaveWorkItem}
        onDelete={isCreatingNew ? undefined : handleDeleteWorkItem}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <DashboardHeader
        filter={filter}
        onFilterChange={handleFilterChange}
        onNewWorkItem={handleNewWorkItem}
      />
      
      <div className="container mx-auto p-6">
        {/* View Toggle Buttons */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Button 
              variant={!isTableView ? "default" : "outline"}
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <LayoutGrid className="w-4 h-4" />
              Card View
            </Button>
            <Button 
              variant={isTableView ? "default" : "outline"}
              onClick={() => navigate('/table')}
              className="flex items-center gap-2"
            >
              <Table className="w-4 h-4" />
              Table View
            </Button>
          </div>
          
          <Button onClick={handleNewWorkItem} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            New Volunteer Activity
          </Button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">To Do</h3>
            <p className="text-3xl font-bold text-blue-600">{groupedItems.todo.length}</p>
            <p className="text-sm text-gray-600">Activities waiting to start</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">In Progress</h3>
            <p className="text-3xl font-bold text-yellow-600">{groupedItems.doing.length}</p>
            <p className="text-sm text-gray-600">Active volunteer activities</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Completed</h3>
            <p className="text-3xl font-bold text-green-600">{groupedItems.done.length}</p>
            <p className="text-sm text-gray-600">Finished activities</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-lg text-gray-600">Loading volunteer activities...</div>
          </div>
        ) : isTableView ? (
          // Table View
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <WorkItemsTable workItems={filteredItems} onWorkItemClick={handleCardClick} />
          </div>
        ) : (
          // Card View with columns
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* To Do Column */}
            <div className="space-y-4">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h2 className="text-xl font-semibold text-blue-900 flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  To Do ({groupedItems.todo.length})
                </h2>
                <p className="text-sm text-blue-700 mt-1">Activities waiting to start</p>
              </div>
              <div className="space-y-4">
                {groupedItems.todo.map(item => (
                  <WorkItemCard
                    key={item.id}
                    workItem={item}
                    onClick={handleCardClick}
                  />
                ))}
                {groupedItems.todo.length === 0 && (
                  <div className="text-center text-gray-500 py-8 bg-white rounded-lg border-2 border-dashed border-gray-300">
                    No activities to do
                  </div>
                )}
              </div>
            </div>

            {/* Doing Column */}
            <div className="space-y-4">
              <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                <h2 className="text-xl font-semibold text-yellow-900 flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  In Progress ({groupedItems.doing.length})
                </h2>
                <p className="text-sm text-yellow-700 mt-1">Active volunteer activities</p>
              </div>
              <div className="space-y-4">
                {groupedItems.doing.map(item => (
                  <WorkItemCard
                    key={item.id}
                    workItem={item}
                    onClick={handleCardClick}
                  />
                ))}
                {groupedItems.doing.length === 0 && (
                  <div className="text-center text-gray-500 py-8 bg-white rounded-lg border-2 border-dashed border-gray-300">
                    No activities in progress
                  </div>
                )}
              </div>
            </div>

            {/* Done Column */}
            <div className="space-y-4">
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <h2 className="text-xl font-semibold text-green-900 flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  Done ({groupedItems.done.length})
                </h2>
                <p className="text-sm text-green-700 mt-1">Completed activities</p>
              </div>
              <div className="space-y-4">
                {groupedItems.done.map(item => (
                  <WorkItemCard
                    key={item.id}
                    workItem={item}
                    onClick={handleCardClick}
                  />
                ))}
                {groupedItems.done.length === 0 && (
                  <div className="text-center text-gray-500 py-8 bg-white rounded-lg border-2 border-dashed border-gray-300">
                    No completed activities
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Floating Action Button for Mobile */}
        <div className="fixed bottom-6 right-6 md:hidden">
          <Button
            onClick={handleNewWorkItem}
            size="lg"
            className="rounded-full w-14 h-14 shadow-lg bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-6 h-6" />
          </Button>
        </div>
      </div>
    </div>
  );
};

// Simple WorkItemCard component for dashboard columns
export const WorkItemCard = ({ workItem, onClick }: { workItem: WorkItem, onClick: (item: WorkItem) => void }) => (
  <div className="bg-white rounded-lg shadow p-4 border cursor-pointer hover:bg-blue-50" onClick={() => onClick(workItem)}>
    <div className="flex items-center gap-2 mb-2">
      <span className="font-semibold text-lg">{workItem.title}</span>
      <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600">{workItem.state}</span>
    </div>
    <div className="text-sm text-gray-700 mb-1">{workItem.description}</div>
    {workItem.url && (
      <a href={workItem.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-xs">Proof Link</a>
    )}
  </div>
);