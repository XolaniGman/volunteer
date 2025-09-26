import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import { DashboardHeader } from "@/components/Dashboard/DashboardHeader";
import { WorkItemFilter } from "@/types/workItem";
import Proof from "@/pages/Proof";
import VolunteerWorkOrder from "@/pages/VolunteerWorkOrder";

interface ProfileData {
  uid: string;
  email: string;
  displayName: string;
  department?: string;
  date?: string;
  idNumber?: string;
  studentOrStaffNumber?: string;
  emergencyContactName?: string;
  physicalAddressLine1?: string;
  physicalAddressLine2?: string;
  province?: string;
  city?: string;
  medicalAid?: boolean;
  medicalAidName?: string;
}

const Profile = () => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<Partial<ProfileData>>({});
  const [error, setError] = useState<string | null>(null);

  const auth = getAuth();
  const user = auth.currentUser;

  // Dummy filter state so DashboardHeader works
  const [filter, setFilter] = useState<WorkItemFilter>({
    types: [],
    states: [],
    assignedTo: [],
    search: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      try {
        const docRef = doc(db, "profiles", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile(docSnap.data() as ProfileData);
          setForm(docSnap.data() as ProfileData);
        } else {
          setProfile({
            uid: user.uid,
            email: user.email || "",
            displayName: user.displayName || "",
          });
          setForm({
            uid: user.uid,
            email: user.email || "",
            displayName: user.displayName || "",
          });
        }
      } catch (err) {
        setError("Failed to fetch profile.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = async () => {
    if (!user) return;
    try {
      const docRef = doc(db, "profiles", user.uid);
      await setDoc(docRef, { ...form, uid: user.uid }, { merge: true });
      setProfile({ ...(profile || {}), ...form, uid: user.uid } as ProfileData);
      setEditMode(false);
      setError(null);
    } catch {
      setError("Failed to save profile.");
    }
  };

  const handleDelete = async () => {
    if (!user) return;
    if (!window.confirm("Are you sure you want to delete your profile?")) return;
    try {
      const docRef = doc(db, "profiles", user.uid);
      await deleteDoc(docRef);
      setProfile(null);
      setForm({});
      setError(null);
    } catch {
      setError("Failed to delete profile.");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Please log in to view your profile.</div>;

  return (
    <div className="min-h-screen  bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
      {/* Shared Dashboard Header */}
      <DashboardHeader
        filter={filter}
        onFilterChange={setFilter}
        onNewWorkItem={() => {}}
      />

      {/* Profile Content */}
      <div className="container  mx-auto p-6">
        <div className="max-w-10xl mx-auto bg-white shadow-2xl rounded-xl overflow-hidden flex">
          {/* Left Sidebar */}
          <div className="w-1/3 bg-gradient-to-b from-blue-600 to-purple-700 text-white p-6 flex flex-col items-center">
            <div className="h-28 w-28 rounded-full bg-white text-blue-600 flex items-center justify-center text-3xl font-bold shadow-md">
              {profile?.displayName?.charAt(0) || "?"}
            </div>
            <h2 className="mt-4 text-xl font-semibold">{profile?.displayName}</h2>
            <p className="text-sm text-blue-100">{profile?.email}</p>

            <div className="mt-6 space-y-2 text-sm">
              <p><span className="font-medium">Department:</span> {profile?.department || "-"}</p>
              <p><span className="font-medium">ID Number:</span> {profile?.idNumber || "-"}</p>
              <p><span className="font-medium">Staff/Student No:</span> {profile?.studentOrStaffNumber || "-"}</p>
              <p><span className="font-medium">Emergency:</span> {profile?.emergencyContactName || "-"}</p>
            </div>
          </div>

          {/* Right Content */}
          <div className="w-2/3 p-8 space-y-6">
            {error && <div className="text-red-500">{error}</div>}

            {!editMode ? (
              <>
                {/* Personal Info */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-3">
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="font-medium">Date:</span> {profile?.date || "-"}</div>
                    <div><span className="font-medium">Medical Aid:</span> {profile?.medicalAid ? "Yes" : "No"}</div>
                    <div><span className="font-medium">Medical Aid Name:</span> {profile?.medicalAidName || "-"}</div>
                  </div>
                </div>

                {/* Address */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-3">
                    Address
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="font-medium">Line 1:</span> {profile?.physicalAddressLine1 || "-"}</div>
                    <div><span className="font-medium">Line 2:</span> {profile?.physicalAddressLine2 || "-"}</div>
                    <div><span className="font-medium">Province:</span> {profile?.province || "-"}</div>
                    <div><span className="font-medium">City:</span> {profile?.city || "-"}</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setEditMode(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow"
                  >
                    Edit Profile
                  </button>
                  <button
                    onClick={handleDelete}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow"
                  >
                    Delete Profile
                  </button>
                </div>
              </>
            ) : (
              // Edit Form
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSave();
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium">Name</label>
                  <input
                    className="border rounded px-3 py-2 w-full"
                    name="displayName"
                    value={form.displayName || ""}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Department</label>
                  <input
                    className="border rounded px-3 py-2 w-full"
                    name="department"
                    value={form.department || ""}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">City</label>
                  <input
                    className="border rounded px-3 py-2 w-full"
                    name="city"
                    value={form.city || ""}
                    onChange={handleChange}
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg shadow"
                    onClick={() => setEditMode(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
          
         
        </div> <div className="max-w-9xl gap-4 text-sm">
             <VolunteerWorkOrder/>
           </div>
      </div>
    </div>
  );
};

export default Profile;
