import Dashboard from '@/components/Dashboard';
import MembersTable from '@/components/MembersTable';

const Members = () => (
  <div className="flex min-h-screen">
    <Dashboard />
    <main className="flex-1 p-8 bg-gray-50">
      <h1 className="text-2xl font-bold mb-6">Members</h1>
      <MembersTable />
    </main>
  </div>
);

export default Members;