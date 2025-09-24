'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';


import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { WorkItem, WorkItemState, WorkItemPriority } from '@/types/workItem';
import { WorkItemIcon } from './WorkItemIcon';
import { ArrowLeft, Save, MessageSquare,  Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/Contexts/AuthContext';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon, Link, Star } from 'lucide-react';

interface WorkItemDetail {
  workItem: WorkItem;
  onBack: () => void;
  onSave: (workItem: WorkItem) => void;
  onDelete?: (id: string) => void;
  onNext?: () => void; // if you want to use Next button
}

export const WorkItemDetail: React.FC<WorkItemDetail> = ({ workItem, onBack, onSave, onDelete, onNext }) => {
  const [editedItem, setEditedItem] = useState<WorkItem>(workItem);
  const [newComment, setNewComment] = useState('');
  const { user } = useAuth();
  const [skills, setSkills] = useState<string[]>([]);
  const [experience, setExperience] = useState('');
  const [summary, setSummary] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [requestedDate, setRequestedDate] = useState<Date | undefined>(
    workItem.activityDate ? new Date(workItem.activityDate) : undefined
  );
  const [dateCompleted, setDateCompleted] = useState<Date | undefined>(
    (workItem as any).completedDate ? new Date((workItem as any).completedDate) : undefined
  );
  const [url, setUrl] = useState((workItem as any).url || '');

  // Restrict access: only assigned user can see details
  const currentUserEmail = user?.email;
  if (workItem.assignedTo && workItem.assignedTo !== currentUserEmail) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded shadow text-center">
          <h2 className="text-xl font-bold mb-4">Access Denied</h2>
          <p className="text-muted-foreground">You are not authorized to view this work item.</p>
          <Button variant="outline" onClick={onBack} className="mt-4">Back</Button>
        </div>
      </div>
    );
  }

  useEffect(() => {
    setEditedItem((prev) => ({
      ...prev,
      activityDate: requestedDate ? requestedDate.toISOString() : '',
      completedDate: dateCompleted ? dateCompleted.toISOString() : '',
      url,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestedDate, dateCompleted, url]);



  const handleSave = () => onSave(editedItem);

  const handleDelete = async () => {
    if (!onDelete) return;
    if (!editedItem.id) return;
    if (window.confirm('Are you sure you want to delete this work item?')) {
      onDelete(editedItem.id);
    }
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const comment = {
      id: Date.now().toString(),
      author: user?.displayName || user?.email || 'Anonymous',
      content: newComment,
      createdAt: new Date().toISOString(),
    };

    setEditedItem({
      ...editedItem,
      comments: [...editedItem.comments, comment],
    });
    setNewComment('');
  };

  const renderStarRating = (priority: WorkItemPriority) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              "w-6 h-6 cursor-pointer transition-colors",
              star <= (6 - priority) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
            )}
            onClick={() => setEditedItem({ ...editedItem, priority: (6 - star) as WorkItemPriority })}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-cyan-500 to-blue-500">
      <div className="max-w-2xl bg-gradient-to-r from-cyan-500 to-blue-500 mx-auto p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={onBack} size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button variant="destructive" onClick={handleDelete} size="sm" className="ml-auto">
            Delete
          </Button>
          {onNext && (
            <Button variant="secondary" onClick={onNext} size="sm" className="ml-2">
              Next
            </Button>
          )}
        </div>

        {/* Form */}
        <div className="bg-card rounded-lg border p-6 space-y-6">
          <h1 className="text-2xl font-semibold text-foreground mb-6">Volunteer Activity Details Form</h1>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">Volunteer Activity Title</Label>
            <Input
              id="title"
              value={editedItem.title}
              onChange={(e) => setEditedItem({ ...editedItem, title: e.target.value })}
              placeholder="Enter work item title"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">Volunteer Activity Description</Label>
            <Textarea
              id="description"
              value={editedItem.description}
              onChange={(e) => setEditedItem({ ...editedItem, description: e.target.value })}
              placeholder="Enter description"
              className="min-h-24"
            />
          </div>

          {/* Area Path */}
          <div className="space-y-2">
            <Label htmlFor="area" className="text-sm font-medium">Volunteer Category Path</Label>
            <Input
              id="area"
              value={editedItem.areaPath || ''}
              onChange={(e) => setEditedItem({ ...editedItem, areaPath: e.target.value })}
              placeholder="Enter area path"
            />
          </div>

          {/* Requested Date */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Volunteer Starting Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !requestedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {requestedDate ? format(requestedDate, "MM-dd-yyyy") : "MM-DD-YYYY"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={requestedDate}
                  onSelect={(date: Date | undefined) => setRequestedDate(date)}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            <p className="text-xs text-muted-foreground">Date</p>
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Priority</Label>
            {renderStarRating(editedItem.priority)}
          </div>

          {/* Status */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Status</Label>
            <RadioGroup
              value={editedItem.state}
              onValueChange={(value: WorkItemState) =>
                setEditedItem({ ...editedItem, state: value })
              }
              className="space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="todo" id="todo" />
                <Label htmlFor="todo" className="text-sm">Not Started</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="doing" id="doing" />
                <Label htmlFor="doing" className="text-sm">In Progress</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="done" id="done" />
                <Label htmlFor="done" className="text-sm">Done</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Link */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium mb-2 text-gray-700">
              <Link className="w-4 h-4" />
              Add a Link
            </label>
            <div className="flex gap-2">
              <Input
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1"
              />
            </div>
          </div>

          {/* Date Completed */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Date Completed Activity</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dateCompleted && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateCompleted ? format(dateCompleted, "MM-dd-yyyy") : "MM-DD-YYYY"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateCompleted}
                  onSelect={setDateCompleted}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            <p className="text-xs text-muted-foreground">Date</p>
          </div>

          {/* Submit Button */}
          <Button onClick={handleSave} className="w-32 bg-gray-800 hover:bg-gray-700 text-white">
            Submit
          </Button>
        </div>
      </div>
    </div>
  );
};
