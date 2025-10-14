export type WorkItemType = 'epic' | 'issue' | 'task';
export type WorkItemState = 'todo' | 'doing' | 'done';
export type WorkItemPriority = 1 | 2 | 3 | 4;

export interface WorkItem {
  approved: boolean;
  id: string;
  title: string;
  type: WorkItemType;
  state: WorkItemState;
  assignedTo: string | null;
  createdBy: string; // email of the user who assigned/created the work item
  areaPath: string;
  tags: string[];
  priority: WorkItemPriority;
  description: string;
  comments: Comment[];
  activityDate: string;
  createdDate: string;
  approvedAt?: string;
  url?: string;
}

export interface Comment {
  id: string;
  author: string;
  content: string;
  createdAt: string;
}

export interface WorkItemFilter {
  types: WorkItemType[];
  states: WorkItemState[];
  assignedTo: string[];
  search: string;
}
