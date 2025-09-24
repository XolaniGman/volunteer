import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Filter, MoreHorizontal, Settings } from 'lucide-react';
import { WorkItemFilter, WorkItemType, WorkItemState } from '@/types/workItem';

interface HeaderProps {
  filter: WorkItemFilter;
  onFilterChange: (filter: WorkItemFilter) => void;
  onNewWorkItem: () => void;
}

export const Header = ({ filter, onFilterChange, onNewWorkItem }: HeaderProps) => {
  return (
    <div className="bg-dut.primary text-white p-6 shadow-elevated">
    <div className="container mx-auto space-y-4">
      {/* Title */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Work Items</h1>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" className="bg-dut.accent text-dut.primary hover:bg-dut.secondary">
            <Settings className="w-4 h-4 mr-2" />
            Column Options
          </Button>
          <Button variant="secondary" size="sm" className="bg-dut.accent text-dut.primary hover:bg-dut.secondary">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </div>
  
      {/* Actions Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            onClick={onNewWorkItem}
            variant="secondary"
            className="bg-dut.accent hover:bg-dut.secondary text-dut.primary border-dut.border"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Work Item
          </Button>
  
          <div className="flex items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-dut.muted" />
              <Input
                placeholder="Filter by keyword"
                value={filter.search}
                onChange={(e) => onFilterChange({ ...filter, search: e.target.value })}
                className="pl-10 bg-dut.surface border-dut.border text-dut.primary placeholder:text-dut.muted focus:bg-dut.background"
              />
            </div>
  
            {/* Type Select */}
            <Select
              value={filter.types.length === 0 ? 'all' : filter.types.join(',')}
              onValueChange={(value) => {
                const types = value === 'all' ? [] : value.split(',') as WorkItemType[];
                onFilterChange({ ...filter, types });
              }}
            >
              <SelectTrigger className="w-32 bg-dut.surface border-dut.border text-dut.primary">
                <SelectValue placeholder="Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="epic">Epic</SelectItem>
                <SelectItem value="issue">Issue</SelectItem>
                <SelectItem value="task">Task</SelectItem>
              </SelectContent>
            </Select>
  
            {/* State Select */}
            <Select
              value={filter.states.length === 0 ? 'all' : filter.states.join(',')}
              onValueChange={(value) => {
                const states = value === 'all' ? [] : value.split(',') as WorkItemState[];
                onFilterChange({ ...filter, states });
              }}
            >
              <SelectTrigger className="w-32 bg-dut.surface border-dut.border text-dut.primary">
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
  
        {/* Filters Display */}
        <div className="flex items-center gap-2">
          {filter.search && (
            <Badge variant="secondary" className="bg-dut.surface text-dut.primary border border-dut.border">
              Search: {filter.search}
            </Badge>
          )}
          {filter.types.length > 0 && (
            <Badge variant="secondary" className="bg-dut.surface text-dut.primary border border-dut.border">
              {filter.types.length} type{filter.types.length > 1 ? 's' : ''}
            </Badge>
          )}
          {filter.states.length > 0 && (
            <Badge variant="secondary" className="bg-dut.surface text-dut.primary border border-dut.border">
              {filter.states.length} state{filter.states.length > 1 ? 's' : ''}
            </Badge>
          )}
        </div>
      </div>
    </div>
  </div>
  
  );
};