import { NavLink } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus, Users, CalendarDays, ListChecks, LayoutGrid } from 'lucide-react';

export const Dashboard = () => {
  return (
    <aside className="w-64 shrink-0 h-screen sticky top-0 bg-[#1b0f29] text-white flex flex-col">
      {/* Header */}
      <div className="h-16 flex items-center px-6 border-b border-white/10">
        <div className="w-8 h-8 rounded bg-white/20 mr-2" />
        <span className="font-semibold">Dashboard</span>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-1 text-sm">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded ${isActive ? "bg-white/10" : "hover:bg-white/10"
            }`
          }
        >
          <LayoutGrid className="w-4 h-4" />
          Dashboard
        </NavLink>
        <NavLink to="/dashboard/members"
          className="flex items-center gap-3 px-3 py-2 rounded hover:bg-white/10"
        >
          <Users className="w-4 h-4" />
          Members
        </NavLink>
        <NavLink
          to="/dashboard/tasks"
          className="flex items-center gap-3 px-3 py-2 rounded hover:bg-white/10"
        >
          <ListChecks className="w-4 h-4" />
          All Tasks
        </NavLink>
        <NavLink to="/dashboard/volunteer"
          className="flex items-center gap-3 px-3 py-2 rounded hover:bg-white/10"
        >
          <CalendarDays className="w-4 h-4" />
         Contract
        </NavLink>
         <NavLink to="/dashboard/proof"
          className="flex items-center gap-3 px-3 py-2 rounded hover:bg-white/10"
        >
          <CalendarDays className="w-4 h-4" />
         Work Items Proof
        </NavLink>
      </nav>
      

      {/* Bottom actions */}
      <div className="mt-auto p-4 space-y-2">
        <Button className="w-full bg-white text-[#1b0f29] hover:bg-white/90">
          <Plus className="w-4 h-4 mr-2" />
          Create Task
        </Button>
        <Button
          variant="outline"
          className="w-full border-white/30 text-white hover:bg-white/10"
        >
          Invite Member
        </Button>
      </div>
    </aside>
  );
};

export default Dashboard;






