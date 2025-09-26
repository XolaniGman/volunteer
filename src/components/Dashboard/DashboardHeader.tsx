import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, MoreHorizontal, Table, LayoutGrid, User } from 'lucide-react';
import { WorkItemFilter, WorkItemType, WorkItemState } from '@/types/workItem';
import { useNavigate, useLocation } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';
import { useEffect, useState } from 'react';

interface DashboardHeaderProps {
  filter: WorkItemFilter;
  onFilterChange: (filter: WorkItemFilter) => void;
  onNewWorkItem: () => void;
}

export const DashboardHeader = ({ filter, onFilterChange, onNewWorkItem }: DashboardHeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isTableView = location.pathname === '/table';

  // Get current user
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

  // Profile navigation
  const handleProfile = () => {
    navigate('/profile');
  };

  return (
    <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-purple-700 text-white p-6 shadow-elevated">
      <div className="container mx-auto space-y-4">
        {/* Title */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">📋 Welcome to Voluntee application system!</h1>
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-white/10 rounded-lg p-1">
              <Button 
                variant={!isTableView ? "secondary" : "ghost"}
                size="sm" 
                onClick={() => navigate('/')}
                className={`${!isTableView ? 'bg-white text-primary' : 'text-white hover:bg-white/20'}`}
              >
                <LayoutGrid className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
              <Button 
                variant={isTableView ? "secondary" : "ghost"}
                size="sm" 
                onClick={() => navigate('/table')}
                className={`${isTableView ? 'bg-white text-primary' : 'text-white hover:bg-white/20'}`}
              >
                <Table className="w-4 h-4 mr-2" />
                Table
              </Button>
            </div>
            <div className="flex items-center gap-2">
              {/* Profile Button */}
              <Button
                variant="secondary"
                size="sm"
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                onClick={handleProfile}
              >
                <User className="w-4 h-4 mr-2" />
                Profile
              </Button>
              {/* User Name */}
              {userName && (
                <span className="px-3 py-2 bg-white/20 rounded text-white font-semibold">{userName}</span>
              )}
              {/* Sign Out */}
              <Button
                variant="secondary"
                size="sm"
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                onClick={handleSignOut}
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {isTableView && (
              <Button 
                onClick={onNewWorkItem}
                variant="secondary"
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                <Plus className="w-4 h-4 mr-2" />
                CREATE WORK ITEM
              </Button>
            )}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70" />
                <Input
                  placeholder="Search"
                  value={filter.search}
                  onChange={(e) => onFilterChange({ ...filter, search: e.target.value })}
                  className="pl-10 bg-white/10 border-white/30 text-white placeholder:text-white/70 focus:bg-white/20"
                />
              </div>
              
              <Select
                value={filter.types.length === 0 ? 'all' : filter.types.join(',')}
                onValueChange={(value) => {
                  const types = value === 'all' ? [] : value.split(',') as WorkItemType[];
                  onFilterChange({ ...filter, types });
                }}
              >
                <SelectTrigger className="w-32 bg-white/10 border-white/30 text-white">
                  <SelectValue placeholder="Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="epic">Epic</SelectItem>
                  <SelectItem value="issue">Issue</SelectItem>
                  <SelectItem value="task">Task</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filter.states.length === 0 ? 'all' : filter.states.join(',')}
                onValueChange={(value) => {
                  const states = value === 'all' ? [] : value.split(',') as WorkItemState[];
                  onFilterChange({ ...filter, states });
                }}
              >
                <SelectTrigger className="w-32 bg-white/10 border-white/30 text-white">
                  <SelectValue placeholder="States" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All States</SelectItem>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="doing">Doing</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {filter.search && (
              <Badge variant="secondary" className="bg-white/20 text-white">
                Search: {filter.search}
              </Badge>
            )}
            {filter.types.length > 0 && (
              <Badge variant="secondary" className="bg-white/20 text-white">
                {filter.types.length} type{filter.types.length > 1 ? 's' : ''}
              </Badge>
            )}
            {filter.states.length > 0 && (
              <Badge variant="secondary" className="bg-white/20 text-white">
                {filter.states.length} state{filter.states.length > 1 ? 's' : ''}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};