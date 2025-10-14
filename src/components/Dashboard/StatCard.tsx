import React, { useEffect, useState } from "react";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { Pie } from "react-chartjs-2";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";

// Register required elements for Pie chart
Chart.register(ArcElement, Tooltip, Legend);
import { CheckCircle, Clock, ListChecks, Loader2 } from "lucide-react";

interface WorkItem {
  id: string;
  title: string;
  state: "approved" | "pending" | "in-progress" | "completed";
  assignedTo: string; // <-- should match Firestore field
}

const StatCard: React.FC = () => {
  const [workItems, setWorkItems] = useState<WorkItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkItems = async () => {
      if (!auth.currentUser) return;
      setLoading(true);
      try {
        // Only fetch work items assigned to the current user
        const q = query(
          collection(db, "workItems"),
          where("assignedTo", "==", auth.currentUser.uid)
        );
        const snap = await getDocs(q);
        const items: WorkItem[] = [];
        snap.forEach((doc) => {
          items.push({ id: doc.id, ...doc.data() } as WorkItem);
        });
        setWorkItems(items);
      } catch (err) {
        console.error("Error fetching work items:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchWorkItems();
  }, []);

  // Stats
  const total = workItems.length;
  const approved = workItems.filter((w) => w.state === "approved").length;
  const pending = workItems.filter((w) => w.state === "pending").length;
  const inProgress = workItems.filter((w) => w.state === "in-progress").length;
  const completed = workItems.filter((w) => w.state === "completed").length;
  const successRate = total ? Math.round((completed / total) * 100) : 0;

  // Pie chart data
  const pieData = {
    labels: ["Completed", "In Progress", "Approved", "Pending"],
    datasets: [
      {
        data: [completed, inProgress, approved, pending],
        backgroundColor: [
          "#22c55e", // green
          "#fbbf24", // yellow
          "#3b82f6", // blue
          "#ef4444", // red
        ],
      },
    ],
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded shadow p-4 flex flex-col items-center">
          <CheckCircle className="text-green-500 mb-2" size={32} />
          <div className="text-2xl font-bold">{completed}</div>
          <div className="text-sm text-gray-500">Completed</div>
        </div>
        <div className="bg-white rounded shadow p-4 flex flex-col items-center">
          <Loader2 className="text-yellow-500 mb-2" size={32} />
          <div className="text-2xl font-bold">{inProgress}</div>
          <div className="text-sm text-gray-500">In Progress</div>
        </div>
        <div className="bg-white rounded shadow p-4 flex flex-col items-center">
          <ListChecks className="text-blue-500 mb-2" size={32} />
          <div className="text-2xl font-bold">{approved}</div>
          <div className="text-sm text-gray-500">Approved</div>
        </div>
        <div className="bg-white rounded shadow p-4 flex flex-col items-center">
          <Clock className="text-red-500 mb-2" size={32} />
          <div className="text-2xl font-bold">{pending}</div>
          <div className="text-sm text-gray-500">Pending</div>
        </div>
      </div>

      <div className="bg-white rounded shadow p-4 mt-6">
        <h2 className="text-lg font-semibold mb-4">Your Work Items</h2>
        {loading ? (
          <div>Loading...</div>
        ) : workItems.length === 0 ? (
          <div>No work items found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr>
                  <th className="px-2 py-1 text-left">Title</th>
                  <th className="px-2 py-1 text-left">State</th>
                  <th className="px-2 py-1 text-left">ID</th>
                </tr>
              </thead>
              <tbody>
                {workItems.map((item) => (
                  <tr key={item.id}>
                    <td className="px-2 py-1">{item.title}</td>
                    <td className="px-2 py-1">{item.state}</td>
                    <td className="px-2 py-1">{item.id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-white rounded shadow p-4 mt-6 flex flex-col items-center">
        <h2 className="text-lg font-semibold mb-4">Work Items Progress</h2>
        <div className="w-64 h-64">
          <Pie data={pieData} />
        </div>
        <div className="mt-4 text-center">
          <div>Total Work Items: <span className="font-bold">{total}</span></div>
          <div>Total Completed: <span className="font-bold">{completed}</span></div>
          <div>Success Rate: <span className="font-bold">{successRate}%</span></div>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
