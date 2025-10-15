import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Table, LayoutGrid, User } from 'lucide-react';
import { WorkItemFilter, WorkItemType, WorkItemState } from '@/types/workItem';
import { useNavigate, useLocation } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface DashboardHeaderProps {
  filter: WorkItemFilter;
  onFilterChange: (filter: WorkItemFilter) => void;
  onNewWorkItem: () => void;
}

export const DashboardHeader = ({
  filter,
  onFilterChange,
  onNewWorkItem,
}: DashboardHeaderProps) => {
  const navigate = useNavigate();
  const isTableView = true;
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const auth = getAuth();
    setUserName(auth.currentUser?.displayName || auth.currentUser?.email || null);
  }, []);

  const handleSignOut = async () => {
    const auth = getAuth();
    await signOut(auth);
    navigate('/login');
  };

  const handleProfile = () => navigate('/profile');

  // Ensure Select components receive a single valid value
  const typeSelectValue = filter.types.length === 0 ? 'all' : (filter.types[0] as WorkItemType);
  const stateSelectValue = filter.states.length === 0 ? 'all' : (filter.states[0] as WorkItemState);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="relative bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-700 text-white p-6 shadow-2xl rounded-b-3xl overflow-hidden"
    >
      {/* Glass overlay glow */}
      <div className="absolute inset-0 bg-white/10 backdrop-blur-sm pointer-events-none rounded-b-3xl" />

      <div className="relative container mx-auto space-y-6 z-10">
        {/* Top Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <motion.h1
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="text-2xl font-extrabold tracking-tight flex gap-3 items-center drop-shadow-sm"
          >
            <Table className="w-7 h-7 animate-pulse text-yellow-300" />
            Volunteer Application System : {userName}
          </motion.h1>

          <div className="flex items-center gap-3">
            {/* Removed Dashboard/Table toggle; always in Table view */}

            
          </div>
        </div>

        {/* Actions & Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          {/* Left side actions */}
          <div className="flex items-center gap-4 flex-wrap">
            {isTableView && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={onNewWorkItem}
                className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 px-5 py-2 rounded-xl text-white font-bold shadow hover:opacity-90 transition-all"
              >
                <Plus className="w-4 h-4" />
                Create Work Item
              </motion.button>
            )}

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60 w-5 h-5 pointer-events-none" />
              <Input
                placeholder="Search"
                value={filter.search}
                onChange={(e) => onFilterChange({ ...filter, search: e.target.value })}
                className="pl-10 pr-4 py-2 min-w-[180px] text-white placeholder:text-white/60 border border-white/30 bg-white/10 rounded-lg focus:border-white focus:ring-2 focus:ring-blue-200 transition-all backdrop-blur-md"
              />
            </div>

            {/* Filter Selects */}
            {[{
              value: typeSelectValue,
              items: [['all', 'All Types'], ['epic', 'Epic'], ['issue', 'Issue'], ['task', 'Task']],
              onChange: (val: string) => onFilterChange({ ...filter, types: val === 'all' ? [] : [val as WorkItemType] }),
            }, {
              value: stateSelectValue,
              items: [['all', 'All States'], ['todo', 'To Do'], ['doing', 'Doing'], ['done', 'Done']],
              onChange: (val: string) => onFilterChange({ ...filter, states: val === 'all' ? [] : [val as WorkItemState] }),
            }].map((sel, idx) => (
              <Select key={idx} value={sel.value} onValueChange={sel.onChange}>
                <SelectTrigger className="w-32 bg-white/10 border border-white/20 hover:border-blue-300 text-white rounded-lg focus:ring-2 focus:ring-blue-200 transition-all">
                  <SelectValue placeholder={idx === 0 ? 'Types' : 'States'} />
                </SelectTrigger>
                <SelectContent>
                  {sel.items.map(([val, text]) => (
                    <SelectItem key={val} value={val}>{text}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ))}
          </div>

          {/* Active Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            {filter.search && (
              <Badge className="bg-gradient-to-r from-sky-500 to-indigo-500 text-white flex items-center gap-1">
                <Search className="w-4 h-4" /> {filter.search}
              </Badge>
            )}
            {filter.types.length > 0 && (
              <Badge className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white flex items-center gap-1">
                <Table className="w-4 h-4" /> {filter.types.length} type(s)
              </Badge>
            )}
            {filter.states.length > 0 && (
              <Badge className="bg-gradient-to-r from-green-400 to-emerald-500 text-white flex items-center gap-1">
                <LayoutGrid className="w-4 h-4" /> {filter.states.length} state(s)
              </Badge>
            )}
          </div>{/* Profile + User */}
            <motion.div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05, backgroundColor: '#fff3' }}
                onClick={handleProfile}
                className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-xl border border-white/30 hover:border-white/50 transition-all font-semibold"
              >
                <User className="w-4 h-4" />
                Profile
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05, backgroundColor: '#f87171' }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSignOut}
                className="bg-gradient-to-r from-purple-500 to-indigo-500 px-5 py-2 rounded-xl  font-semibold shadow border text-white flex items-center gap-1"
              >
                Sign Out
              </motion.button>
            </motion.div>
        </motion.div>
        
      </div>
    </motion.div>
  );
};
