'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { WorkItem, WorkItemState, WorkItemPriority } from '@/types/workItem';
import { WorkItemIcon } from './WorkItemIcon';
import {
  ArrowLeft,
  Save,
  Trash2,
  Calendar as CalendarIcon,
  Link,
  Star,
  FileText,
  AlignLeft,
  Map,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/Contexts/AuthContext';

interface WorkItemDetailProps {
  workItem: WorkItem;
  onBack: () => void;
  onSave: (workItem: WorkItem) => void;
  onDelete?: (id: string) => void;
}

export const WorkItemDetail: React.FC<WorkItemDetailProps> = ({
  workItem,
  onBack,
  onSave,
  onDelete,
}) => {
  const [editedItem, setEditedItem] = useState<WorkItem>(workItem);
  const { user } = useAuth();
  const [requestedDate, setRequestedDate] = useState<Date | undefined>(
    workItem.activityDate ? new Date(workItem.activityDate) : undefined
  );
  const [dateCompleted, setDateCompleted] = useState<Date | undefined>(
    workItem.createdDate ? new Date(workItem.createdDate) : undefined
  );
  const [url, setUrl] = useState('');

  const handleSave = () => onSave(editedItem);
  const handleDelete = () => {
    if (!onDelete) return;
    if (window.confirm('Are you sure you want to delete this work item?')) {
      onDelete(editedItem.id);
    }
  };

  const renderStarRating = (priority: WorkItemPriority) => (
    <motion.div
      className="flex gap-1"
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            'w-6 h-6 cursor-pointer transition-colors duration-200',
            star <= (6 - priority)
              ? 'fill-yellow-400 text-yellow-400'
              : 'text-gray-300 hover:text-yellow-400'
          )}
          onClick={() =>
            setEditedItem({ ...editedItem, priority: (6 - star) as WorkItemPriority })
          }
        />
      ))}
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-white">
      <motion.div
        className="max-w-5xl mx-auto p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Header */}
        <motion.div
          className="flex items-center gap-4 p-4 rounded-xl bg-white border border-gray-200 shadow-md mb-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Button
            variant="ghost"
            onClick={onBack}
            size="sm"
            className="text-gray-600 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="flex items-center gap-2 text-gray-600">
            <WorkItemIcon type={editedItem.type} className="w-5 h-5 text-indigo-600" />
            <span className="uppercase tracking-wide text-xs font-medium">
              {editedItem.type}
            </span>
          </div>

          <div className="ml-auto flex gap-2">
            <Button
              onClick={handleSave}
              className="bg-indigo-600 hover:bg-indigo-700 transition-all text-white"
            >
              <Save className="w-4 h-4 mr-2" /> Save
            </Button>
            {onDelete && (
              <Button
                variant="destructive"
                onClick={handleDelete}
                className="hover:bg-red-700 transition-all"
              >
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </Button>
            )}
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          className="bg-white rounded-2xl border border-gray-200 p-8 space-y-6 shadow-lg hover:shadow-xl"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-3xl font-bold text-indigo-700 flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-600" /> Volunteer Activity Details
          </h1>

          {/* Title */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-gray-700">
              <FileText className="w-4 h-4 text-indigo-500" /> Activity Title
            </Label>
            <Input
              value={editedItem.title}
              onChange={(e) => setEditedItem({ ...editedItem, title: e.target.value })}
              placeholder="Enter work item title"
              className="transition-all focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-gray-700">
              <AlignLeft className="w-4 h-4 text-indigo-500" /> Description
            </Label>
            <Textarea
              value={editedItem.description}
              onChange={(e) =>
                setEditedItem({ ...editedItem, description: e.target.value })
              }
              placeholder="Enter description"
              className="min-h-24 transition-all focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-gray-700">
              <Map className="w-4 h-4 text-indigo-500" /> Category Path
            </Label>
            <Input
              value={editedItem.areaPath || ''}
              onChange={(e) => setEditedItem({ ...editedItem, areaPath: e.target.value })}
              placeholder="Enter category path"
              className="transition-all focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          {/* Requested Date */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-gray-700">
              <CalendarIcon className="w-4 h-4 text-indigo-500" /> Start Date
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal hover:border-indigo-400"
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-indigo-500" />
                  {requestedDate
                    ? format(requestedDate, 'MM-dd-yyyy')
                    : 'Select a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={requestedDate}
                  onSelect={setRequestedDate}
                  initialFocus
                  className="p-3"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Priority</Label>
            {renderStarRating(editedItem.priority)}
          </div>

          {/* Status */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">Status</Label>
            <RadioGroup
              value={editedItem.state}
              onValueChange={(value: WorkItemState) =>
                setEditedItem({ ...editedItem, state: value })
              }
              className="space-y-2"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center space-x-2"
              >
                <RadioGroupItem value="todo" id="todo" />
                <Label htmlFor="todo">Not Started</Label>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center space-x-2"
              >
                <RadioGroupItem value="doing" id="doing" />
                <Label htmlFor="doing">In Progress</Label>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center space-x-2"
              >
                <RadioGroupItem value="done" id="done" />
                <Label htmlFor="done">Done</Label>
              </motion.div>
            </RadioGroup>
          </div>

          {/* Link */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-gray-700">
              <Link className="w-4 h-4 text-indigo-500" /> External Link
            </Label>
            <Input
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="transition-all focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          {/* Date Completed */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-gray-700">
              <CalendarIcon className="w-4 h-4 text-indigo-500" /> Date Completed
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal hover:border-indigo-400"
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-indigo-500" />
                  {dateCompleted
                    ? format(dateCompleted, 'MM-dd-yyyy')
                    : 'Select a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateCompleted}
                  onSelect={setDateCompleted}
                  initialFocus
                  className="p-3"
                />
              </PopoverContent>
            </Popover>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};
