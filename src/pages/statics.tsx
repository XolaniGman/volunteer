"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  CheckCircle,
  Clock,
  ListTodo,
  Activity,
  Landmark,
  IdCard,
  PieChart as PieIcon,
  BarChart2,
} from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [membersSnap, workItemsSnap] = await Promise.all([
          getDocs(collection(db, "profiles")),
          getDocs(collection(db, "workItems")),
        ]);

        const membersList: Member[] = membersSnap.docs.map((doc) => ({
          uid: doc.id,
          ...doc.data(),
        })) as Member[];

        const workItemsList: WorkItem[] = workItemsSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as WorkItem[];

        setMembers(membersList);
        setWorkItems(workItemsList);
      } catch (err) {
        setError("Failed to fetch data. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const stats = useMemo(() => {
    const filterCount = (state: string) =>
      workItems.filter((w) => w.state === state).length;
    return {
      total: workItems.length,
      approved: filterCount("approved"),
      pending: filterCount("pending"),
      doing: filterCount("doing"),
      done: filterCount("done"),
      todo: filterCount("todo"),
    };
  }, [workItems]);

  const memberActivityData = useMemo(
    () =>
      members.map((member) => ({
        name: member.displayName,
        completedTasks: workItems.filter(
          (w) => w.assignedTo === member.uid && w.state === "done"
        ).length,
      })),
    [members, workItems]
  );

  const pieData = [
    { name: "Approved", value: stats.approved, color: "#4F46E5" },
    { name: "Pending", value: stats.pending, color: "#F59E0B" },
    { name: "Doing", value: stats.doing, color: "#06B6D4" },
    { name: "Done", value: stats.done, color: "#22C55E" },
    { name: "Todo", value: stats.todo, color: "#9CA3AF" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 p-8 space-y-10">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl md:text-4xl font-extrabold text-indigo-800 text-center flex justify-center items-center gap-2"
      >
        <Activity className="w-7 h-7 text-indigo-600" />
        Student Volunteer Analytics
      </motion.h1>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-xl text-center">
          {error}
        </div>
      )}

      {loading && (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-indigo-500"></div>
        </div>
      )}

      {/* Stats Overview */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6"
      >
        <StatCard title="Members" count={members.length} icon={<User />} color="indigo" />
        <StatCard title="All Work Items" count={stats.total} icon={<ListTodo />} color="purple" />
        <StatCard title="Doing" count={stats.doing} icon={<Clock />} color="blue" />
        <StatCard title="Done" count={stats.done} icon={<CheckCircle />} color="green" />
        <StatCard title="Pending" count={stats.pending} icon={<Activity />} color="yellow" />
      </motion.div>

      {/* Charts Section */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Pie Chart */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-md"
        >
          <h3 className="text-lg font-bold text-indigo-700 mb-4 flex items-center gap-2">
            <PieIcon className="w-5 h-5" /> Work Item States
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Bar Chart */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-md"
        >
          <h3 className="text-lg font-bold text-indigo-700 mb-4 flex items-center gap-2">
            <BarChart2 className="w-5 h-5" /> Member Task Completion
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={memberActivityData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="completedTasks"
                fill="#6366F1"
                radius={[6, 6, 0, 0]}
                barSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Member Cards */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-8"
      >
        <AnimatePresence>
          {members.map((member) => (
            <motion.div
              key={member.uid}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <MemberCard member={member} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

/* ---- COMPONENTS ---- */

const StatCard = ({
  icon,
  title,
  count,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  count: number;
  color: string;
}) => (
  <div
    className={`bg-white/80 backdrop-blur-md rounded-2xl shadow-md p-5 flex items-center gap-4 hover:scale-[1.03] transition-transform`}
  >
    <div className={`p-3 rounded-xl bg-${color}-100 text-${color}-600`}>
      {icon}
    </div>
    <div>
      <div className="text-2xl font-extrabold">{count}</div>
      <div className="text-gray-600 text-sm font-medium">{title}</div>
    </div>
  </div>
);

const MemberCard = ({ member }: { member: Member }) => (
  <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-md p-6 hover:shadow-lg transition-transform hover:scale-[1.02]">
    <div className="flex items-center gap-3 mb-3">
      <User className="w-6 h-6 text-indigo-600" />
      <h4 className="text-lg font-semibold text-gray-800">
        {member.displayName || "Unnamed User"}
      </h4>
    </div>
    <p className="text-gray-600 text-sm mb-2">{member.email}</p>
    <div className="text-sm space-y-2">
      <div className="flex items-center gap-2">
        <Landmark className="w-4 h-4 text-indigo-500" />
        <span className="font-semibold">Department:</span>{" "}
        {member.department || <span className="text-gray-400">N/A</span>}
      </div>
      <div className="flex items-center gap-2">
        <IdCard className="w-4 h-4 text-green-600" />
        <span className="font-semibold">Student No:</span>{" "}
        {member.studentOrStaffNumber || <span className="text-gray-400">N/A</span>}
      </div>
    </div>
  </div>
);

export default Statics;
