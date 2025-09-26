
import Dashboard from '@/components/Dashboard';
import { WorkItemsTable } from '@/components/AdminWorkItemsTable';

const WorkItems = () => (
  <div className="flex min-h-screen">
    <Dashboard />
    <main className="flex-1 p-8 bg-gray-50">
      <h1 className="text-2xl font-bold mb-6">All Tasks</h1>
  <WorkItemsTable onWorkItemClick={() => {}} />
    </main>
  </div>
);

export default WorkItems;