import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { WorkItemsTable } from './work-item/WorkItemsTable';


interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  department?: string;
  date?: string;
  idNumber?: string;
  studentOrStaffNumber?: string;
  emergencyContactName?: string;
  province?: string;
  city?: string;
  medicalAid?: boolean;
  medicalAidName?: string;
}

// Helper component to fetch and filter work items by createdBy
function FilteredWorkItemsTableForUser({ userEmail, onClose, displayName }: { userEmail: string; onClose: () => void; displayName: string }) {
  const [workItems, setWorkItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetch = async () => {
      const querySnapshot = await getDocs(collection(db, 'workItems'));
      const items: any[] = [];
      querySnapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() });
      });
      setWorkItems(items.filter(item => item.createdBy === userEmail));
      setLoading(false);
    };
    fetch();
  }, [userEmail]);
  if (loading) return <div>Loading work items...</div>;
  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold mb-2">Work Items for {displayName}</h3>
      <WorkItemsTable workItems={workItems} onWorkItemClick={() => {}} />
      <button className="mt-2 text-sm text-blue-600 underline" onClick={onClose}>
        Close
      </button>
    </div>
  );
}

const MembersTable = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      const querySnapshot = await getDocs(collection(db, 'profiles'));
      const usersData: UserProfile[] = [];
      querySnapshot.forEach((doc) => {
        usersData.push({ uid: doc.id, ...doc.data() } as UserProfile);
      });
      setUsers(usersData);
      setLoading(false);
    };
    fetchUsers();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white text-black rounded shadow">
        <thead>
          <tr>
            <th className="px-4 py-2">Display Name</th>
            <th className="px-4 py-2">Email</th>
            <th className="px-4 py-2">Department</th>
            <th className="px-4 py-2">City</th>
            <th className="px-4 py-2">Medical Aid</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.uid}>
              <td className="border px-4 py-2">{user.displayName || '-'}</td>
              <td className="border px-4 py-2">{user.email}</td>
              <td className="border px-4 py-2">{user.department || '-'}</td>
              <td className="border px-4 py-2">{user.city || '-'}</td>
              <td className="border px-4 py-2">{user.medicalAid ? 'Yes' : 'No'}</td>
              <td className="border px-4 py-2">
                <button
                  className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                  onClick={() => setSelectedUser(user)}
                >
                  View Work Items
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {selectedUser && (
        <FilteredWorkItemsTableForUser userEmail={selectedUser.email} onClose={() => setSelectedUser(null)} displayName={selectedUser.displayName || selectedUser.uid} />
      )}
    </div>
  );
};

export default MembersTable;