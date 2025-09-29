import { useEffect, useState } from "react";
import { User, CheckCircle, Clock, List, Landmark, IdCard } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

interface Member {
  uid: string;
  displayName: string;
  email: string;
  department?: string;
  studentOrStaffNumber?: string;
}

interface WorkItem {
  id: string;
  title: string;
  state: string;
  assignedTo: string;
}

const Statics = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [workItems, setWorkItems] = useState<WorkItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      // Fetch members
      const membersSnap = await getDocs(collection(db, "profiles"));
      const membersList: Member[] = [];
      membersSnap.forEach(doc => {
        const data = doc.data();
        membersList.push({
          uid: data.uid,
          displayName: data.displayName || "-",
          email: data.email || "-",
          department: data.department || "",
          studentOrStaffNumber: data.studentOrStaffNumber || "",
        });
      });
      setMembers(membersList);

      // Fetch work items
      const workItemsSnap = await getDocs(collection(db, "workItems"));
      const workItemsList: WorkItem[] = [];
      workItemsSnap.forEach(doc => {
        const data = doc.data();
        workItemsList.push({
          id: doc.id,
          title: data.title || "Untitled",
          state: data.state || "pending",
          assignedTo: data.assignedTo || "",
        });
      });
      setWorkItems(workItemsList);
      setLoading(false);
    };
    fetchData();
  }, []);

  // Stat counts
  const approvedCount = workItems.filter(w => w.state === "approved").length;
  const pendingCount = workItems.filter(w => w.state === "pending").length;
  const doneCount = workItems.filter(w => w.state === "done").length;
  const doingCount = workItems.filter(w => w.state === "doing").length;
  const todoCount = workItems.filter(w => w.state === "todo").length;
  const allCount = workItems.length;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-8">welcome to Student Volunteer Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white rounded-xl shadow p-6 flex items-center gap-4">
          <User className="w-10 h-10 text-blue-500" />
          <div>
            <div className="text-2xl font-bold">{members.length}</div>
            <div className="text-gray-600">Members Registered</div>
          </div>
        </div>
         <div className="bg-white rounded-xl shadow p-6 flex items-center gap-4">
          <CheckCircle className="w-10 h-10 text-purple-500" />
          <div>
            <div className="text-2xl font-bold">{allCount}</div>
            <div className="text-gray-600">All Work Items</div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow p-6 flex items-center gap-4">
          <Clock className="w-10 h-10 text-yellow-500" />
          <div>
            <div className="text-2xl font-bold">{doingCount}</div>
            <div className="text-gray-600">Work Items Doing</div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow p-6 flex items-center gap-4">
          <CheckCircle className="w-10 h-10 text-green-500" />
          <div>
            <div className="text-2xl font-bold">{doneCount}</div>
            <div className="text-gray-600">Work Items Done</div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow p-6 flex items-center gap-4">
          <CheckCircle className="w-10 h-10 text-gray-400" />
          <div>
            <div className="text-2xl font-bold">{todoCount}</div>
            <div className="text-gray-600">Work Items Todo</div>
          </div>
        </div>
      
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {members.map(member => (
          <div key={member.uid} className="bg-white rounded-xl shadow p-6 mb-4">
            <div className="flex items-center gap-3 mb-2">
              <User className="w-6 h-6 text-blue-500" />
              <div className="font-semibold text-lg">{member.displayName}</div>
            </div>
            <div className="text-gray-600 mb-2">{member.email}</div>
            <div className="font-medium mb-1 flex items-center gap-2">
              <Landmark className="w-4 h-4 text-indigo-500" /> Student Department:
            </div>
            <div className="ml-6 text-sm text-gray-700 mb-2">
              {member.department || <span className="text-gray-400">No department</span>}
            </div>
            <div className="font-medium mb-1 flex items-center gap-2">
              <IdCard className="w-4 h-4 text-green-600" /> Student Number:
            </div>
            <div className="ml-6 text-sm text-gray-700 mb-2">
              {member.studentOrStaffNumber || <span className="text-gray-400">No student number</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Statics;
