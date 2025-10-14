import { NavLink } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus, Users, CalendarDays, ListChecks, LayoutGrid } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

export const Dashboard = () => {
  const [isOpen, setIsOpen] = useState(true);

  const navLinks = [
    { to: '/dashboard/statics', label: 'Dashboard', icon: LayoutGrid },
    { to: '/dashboard/members', label: 'Members', icon: Users },
    { to: '/dashboard/tasks', label: 'All Tasks', icon: ListChecks },
    { to: '/dashboard/admin-groups', label: 'Group', icon: CalendarDays },

  ];

  return (
    <motion.aside
      initial={{ x: -80, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`${
        isOpen ? 'w-64' : 'w-20'
      } shrink-0 h-screen sticky top-0 bg-[#1b0f29] text-white flex flex-col backdrop-blur-md border-r border-white/10 transition-all duration-300`}
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-white/10">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-2"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-lg font-bold shadow-lg">
            D
          </div>
          {isOpen && <span className="font-semibold text-white/90">Dashboard</span>}
        </motion.div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-white/60 hover:text-white transition"
        >
          {isOpen ? '«' : '»'}
        </button>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-1 text-sm">
        {navLinks.map(({ to, label, icon: Icon }, index) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-300 relative group ${
                isActive
                  ? 'bg-white/10 border-l-4 border-indigo-500'
                  : 'hover:bg-white/10'
              }`
            }
          >
            <motion.div
              whileHover={{ scale: 1.2, rotate: 5 }}
              transition={{ duration: 0.2 }}
              className="text-indigo-400 group-hover:text-indigo-300"
            >
              <Icon size={18} />
            </motion.div>
            {isOpen && <span className="group-hover:translate-x-1 transition-transform">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Bottom actions */}
      <div className="mt-auto p-4 space-y-3">
      

        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
          <Button
            variant="outline"
            className="w-full border-white/20 text-black hover:bg-white/10 hover:border-indigo-400 transition-all"
            onClick={() => {
              localStorage.clear();
              window.location.href = '/login';
            }}
          >
            {isOpen ? 'Logout' : '⎋'}
          </Button>
        </motion.div>
      </div>
    </motion.aside>
  );
};

export default Dashboard;
