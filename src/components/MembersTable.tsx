import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import SignaturePad from '@/components/SignaturePad';
import { collection, getDocs, doc, getDoc, query, where, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { WorkItemsTable } from './work-item/WorkItemsTable';
import { getAuth } from 'firebase/auth';
import { Trash2 } from 'lucide-react';

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
  physicalAddressLine1?: string;
  physicalAddressLine2?: string;
}


// Remove the above hooks from the top level. Move them inside MembersTable:

// (Removed duplicate MembersTable definition. The correct one is below, starting at line 172.)
function FilteredWorkItemsTableForUser({
  userEmail,
  onClose,
  displayName,
}: {
  userEmail: string;
  onClose: () => void;
  displayName: string;
}) {
  const [workItems, setWorkItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const querySnapshot = await getDocs(collection(db, 'workItems'));
      const items: any[] = [];
      querySnapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() });
      });
      setWorkItems(items.filter((item) => item.createdBy === userEmail));
      setLoading(false);
    };
    fetch();
  }, [userEmail]);

  if (loading) return <div>Loading work items...</div>;

  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold mb-2">Work Items for {displayName}</h3>
      <WorkItemsTable workItems={workItems} onWorkItemClick={() => { }} />
      <button className="mt-2 text-sm text-blue-600 underline" onClick={onClose}>
        Close
      </button>
    </div>
  );
}

// Helper component to fetch and display proof for a user
function UserProof({ userEmail, onClose }: { userEmail: string; onClose: () => void }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [workItems, setWorkItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProof = async () => {
      const profilesSnapshot = await getDocs(query(collection(db, 'profiles'), where('email', '==', userEmail)));
      if (!profilesSnapshot.empty) {
        setProfile({ uid: profilesSnapshot.docs[0].id, ...profilesSnapshot.docs[0].data() } as UserProfile);
      }
      const workItemsSnapshot = await getDocs(query(collection(db, 'workItems'), where('createdBy', '==', userEmail)));
      const items: any[] = [];
      workItemsSnapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() });
      });
      setWorkItems(items.filter(item => item.state === 'done'));
      setLoading(false);
    };
    fetchProof();
  }, [userEmail]);

  if (loading) return <div>Loading proof...</div>;
  if (!profile) return <div>No profile found for this user.</div>;

  return (
    <div className="mt-8 max-w-6xl mx-auto">
      <div className="rounded-xl shadow-2xl border bg-gradient-to-br from-purple-100 to-white">
        <div className="flex items-center gap-4 p-6 border-b bg-gradient-to-r from-purple-300 to-purple-100 rounded-t-xl">
          <img src="/asserts/DUTENVLOGO1.jpg" alt="DUT Logo" width={80} height={80} className="rounded" />
          <div className="flex-1 text-center">
            <h1 className="text-2xl font-bold text-gray-800 tracking-wide">Volunteer Approved PoE</h1>
          </div>
        </div>
        <div className="p-6 text-base leading-relaxed space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border rounded-lg bg-white shadow p-4">
            <div className="flex items-center gap-2"><span className="font-semibold">Volunteer Name:</span> <span>{profile.displayName || '-'}</span></div>
            <div className="flex items-center gap-2"><span className="font-semibold">Volunteer Email:</span> <span>{profile.email}</span></div>
            <div className="flex items-center gap-2"><span className="font-semibold">Department:</span> <span>{profile.department || '-'}</span></div>
            <div className="flex items-center gap-2"><span className="font-semibold">Date:</span> <span>{profile.date || '-'}</span></div>
            <div className="flex items-center gap-2"><span className="font-semibold">ID Number:</span> <span>{profile.idNumber || '-'}</span></div>
            <div className="flex items-center gap-2"><span className="font-semibold">Student/Staff Number:</span> <span>{profile.studentOrStaffNumber || '-'}</span></div>
            <div className="flex items-center gap-2"><span className="font-semibold">Emergency Contact:</span> <span>{profile.emergencyContactName || '-'}</span></div>
            <div className="flex items-center gap-2"><span className="font-semibold">Address Line 1:</span> <span>{profile.physicalAddressLine1 || '-'}</span></div>
            <div className="flex items-center gap-2"><span className="font-semibold">Address Line 2:</span> <span>{profile.physicalAddressLine2 || '-'}</span></div>
            <div className="flex items-center gap-2"><span className="font-semibold">Medical Aid:</span> <span className={`px-2 py-1 rounded text-white ${profile.medicalAid ? 'bg-green-500' : 'bg-red-500'}`}>{profile.medicalAid ? 'Yes' : 'No'}</span></div>
            <div className="flex items-center gap-2"><span className="font-semibold">Medical Aid Name:</span> <span>{profile.medicalAidName || '-'}</span></div>
          </div>

          <h2 className="text-lg font-bold text-gray-800 mt-8 mb-2">Volunteer Work Items</h2>
          {workItems.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border text-sm rounded-lg shadow">
                <thead>
                  <tr className="bg-purple-200">
                    <th className="p-2 border">Title</th>
                    <th className="p-2 border">Description</th>
                    <th className="p-2 border">State</th>
                  </tr>
                </thead>
                <tbody className="">
                  {workItems.map((item) => (
                    <tr key={item.id} className="hover:bg-purple-50  transition">
                      <td className="p-6 border">{item.title}</td>
                      <td className="p-6 border">{item.description}</td>
                      <td className="p-6 border">{item.state}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">No work items found.</p>
          )}

          <div className="grid grid-cols-2 gap-8 mt-8">
            <div>
              <p className="font-semibold">Volunteer Signature:</p>
              <div className="border-b border-gray-400 h-6"></div>
            </div>
            <div>
              <p className="font-semibold">Date:</p>
              <div className="border-b border-gray-400 h-6"></div>
            </div>
          </div>
          <p className="mt-4 text-xs text-gray-500 text-center">
            Approved by the RIE EXCO on the 06 December 2021
          </p>
          <button className="mt-6 px-4 py-2 bg-purple-600 text-white rounded shadow hover:bg-purple-700 transition" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}


const MembersTable = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [proofUser, setProofUser] = useState<UserProfile | null>(null);
  const [search, setSearch] = useState("");
  // Signature dialog state (must be inside the component)
  const [signUser, setSignUser] = useState<UserProfile | null>(null);
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [volunteerSignature, setVolunteerSignature] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      const auth = getAuth();
      const adminEmail = auth.currentUser?.email; // current admin logged in

      if (!adminEmail) {
        setLoading(false);
        return;
      }

      // First fetch groups created by this admin
      const groupsSnapshot = await getDocs(
        query(collection(db, 'groups'), where('createdBy', '==', adminEmail))
      );

      if (groupsSnapshot.empty) {
        setUsers([]);
        setLoading(false);
        return;
      }

      const adminGroups: string[] = groupsSnapshot.docs.map(doc => doc.data().groupName);

      // Now fetch users whose groupName is in those groups
      const profilesSnapshot = await getDocs(
        query(collection(db, 'profiles'), where('groupName', 'in', adminGroups))
      );

      const usersData: UserProfile[] = [];
      profilesSnapshot.forEach((doc) => {
        usersData.push({ uid: doc.id, ...doc.data() } as UserProfile);
      });

      setUsers(usersData);
      setLoading(false);
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter(
    (user) =>
      user.displayName?.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div>Loading...</div>;

  // Utility function to join class names conditionally
  function cn(...classes: (string | false | null | undefined)[]): string {
    return classes.filter(Boolean).join(' ');
  }

  async function handleDelete(e: React.MouseEvent<HTMLButtonElement>, uid: string): Promise<void> {
      e.preventDefault();
      if (!window.confirm('Are you sure you want to delete this user?')) return;
      try {
        await deleteDoc(doc(db, 'profiles', uid));
        setUsers((prev) => prev.filter((user) => user.uid !== uid));
      } catch (error) {
        alert('Failed to delete user.');
        // Optionally log error
        // console.error(error);
      }
    }

  return (
    <div className="overflow-x-auto">
  {/* Search Input */}
  <div className="mb-4 flex justify-end">
    <input
      type="text"
      placeholder="Search by name or email..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="border rounded px-3 py-2 w-64"
    />
  </div>

  {/* Table */}
  <table className="min-w-full bg-white text-sm text-left text-gray-700 rounded-lg shadow-lg overflow-hidden">
    <thead className="bg-gradient-to-r from-purple-500 to-purple-700 text-white">
      <tr>
        <th className="px-4 py-3 font-semibold">Display Name</th>
        <th className="px-4 py-3 font-semibold">Email</th>
        <th className="px-4 py-3 font-semibold">Department</th>
        <th className="px-4 py-3 font-semibold">Student Number</th>
        <th className="px-4 py-3 font-semibold">ID Number</th>
        <th className="px-4 py-3 font-semibold text-center">Actions</th>
      </tr>
    </thead>
    <tbody>
      {filteredUsers.map((user, index) => (
        <tr
          key={user.uid || `user-${index}`}
          className={cn(
            `${index % 2 === 0 ? "bg-gray-50" : "bg-white"} 
            hover:bg-purple-50 transition-all duration-300 ease-in-out transform hover:scale-[1.01] hover:shadow-sm`
          )}
        >
          {/* Display Name */}
          <td className="border-b px-4 py-3 max-w-64 truncate font-medium">{user.displayName || "-"}</td>
          
          {/* Email */}
          <td className="border-b px-4 py-3">{user.email}</td>

          {/* Department */}
          <td className="border-b px-4 py-3">{user.department || "-"}</td>

          {/* Student Number */}
          <td className="border-b px-4 py-3">{user.studentOrStaffNumber || "-"}</td>

          {/* ID Number */}
          <td className="border-b px-4 py-3">{user.idNumber || "-"}</td>

          {/* Actions */}
          <td className="border-b px-4 py-3 flex gap-2 justify-center">
            {/* View Work Items */}
            <button
              className="px-3 py-1 bg-blue-500 text-white rounded-full text-xs font-medium hover:bg-blue-600 transition"
              onClick={() => setSelectedUser(user)}
            >
              View Work Items
            </button>

            {/* View Proof */}
            <button
              className="px-3 py-1 bg-green-500 text-white rounded-full text-xs font-medium hover:bg-green-600 transition"
              onClick={() => setProofUser(user)}
            >
              View Proof
            </button>

            {/* Sign */}
            <button
              className="px-3 py-1 bg-purple-500 text-white rounded-full text-xs font-medium hover:bg-purple-600 transition"
              onClick={() => {
                setSignUser(user);
                setShowSignaturePad(true);
                setVolunteerSignature("");
              }}
            >
              Sign
            </button>
            
            {/* Delete */}
            <button
              onClick={(e) => handleDelete(e, user.uid)}
              className="p-1 text-red-500 hover:text-red-700 transition"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>

  {/* Display Work Items Table for Selected User */}
  {selectedUser && (
    <FilteredWorkItemsTableForUser
      userEmail={selectedUser.email}
      onClose={() => setSelectedUser(null)}
      displayName={selectedUser.displayName || selectedUser.uid}
    />
  )}

  {/* Display User Proof */}
  {proofUser && (
    <UserProof
      userEmail={proofUser.email}
      onClose={() => setProofUser(null)}
    />
  )}

  {/* Signature Pad Dialog for Sign button */}
  <Dialog open={!!showSignaturePad} onOpenChange={setShowSignaturePad}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Volunteer Signature (Draw below or type)</DialogTitle>
      </DialogHeader>
      <div className="space-y-2">
        <SignaturePad value={volunteerSignature} onChange={setVolunteerSignature} />
        <Input
          className="mt-2"
          placeholder="Type your full name as signature (optional)"
          value={volunteerSignature}
          onChange={(e) => setVolunteerSignature(e.target.value)}
        />
      </div>
      <DialogFooter>
        <Button
          onClick={async () => {
            setShowSignaturePad(false);
            // TODO: Save signature for signUser here
          }}
          disabled={!volunteerSignature}
        >
          Continue
        </Button>
        <Button variant="outline" onClick={() => setShowSignaturePad(false)}>
          Cancel
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</div>

  );
};

export default MembersTable;
