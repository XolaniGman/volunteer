import { useEffect, useState } from "react"; 
import { getAuth } from "firebase/auth";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import { DashboardHeader } from "@/components/Dashboard/DashboardHeader";
import { WorkItemFilter } from "@/types/workItem";

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
    <div className="min-h-screen bg-background">
      {/* Shared Dashboard Header */}
      <DashboardHeader
        filter={filter}
        onFilterChange={setFilter}
        onNewWorkItem={() => {}}
      />

      {/* Profile Content */}
      <div className="container mx-auto p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Profile Header */}
          <div className="bg-white rounded-lg shadow p-6 flex items-center gap-4">
            <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-bold">
              {profile?.displayName?.charAt(0) || "?"}
            </div>
            <div>
              <h2 className="text-xl font-semibold">{profile?.displayName}</h2>
              <p className="text-gray-600">{profile?.email}</p>
            </div>
          </div>

          {error && <div className="text-red-500">{error}</div>}

          {!editMode ? (
            <>
              {/* Personal Info */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Personal Information</h3>
                  <button
                    onClick={() => setEditMode(true)}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Edit
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="font-medium">Department:</span> {profile?.department || "-"}</div>
                  <div><span className="font-medium">Date:</span> {profile?.date || "-"}</div>
                  <div><span className="font-medium">ID Number:</span> {profile?.idNumber || "-"}</div>
                  <div><span className="font-medium">Staff/Student Number:</span> {profile?.studentOrStaffNumber || "-"}</div>
                  <div><span className="font-medium">Emergency Contact:</span> {profile?.emergencyContactName || "-"}</div>
                  <div><span className="font-medium">Medical Aid:</span> {profile?.medicalAid ? "Yes" : "No"}</div>
                  <div><span className="font-medium">Medical Aid Name:</span> {profile?.medicalAidName || "-"}</div>
                </div>
              </div>

              {/* Address */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Address</h3>
                  <button
                    onClick={() => setEditMode(true)}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Edit
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="font-medium">Address Line 1:</span> {profile?.physicalAddressLine1 || "-"}</div>
                  <div><span className="font-medium">Address Line 2:</span> {profile?.physicalAddressLine2 || "-"}</div>
                  <div><span className="font-medium">Province:</span> {profile?.province || "-"}</div>
                  <div><span className="font-medium">City:</span> {profile?.city || "-"}</div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setEditMode(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Edit Profile
                </button>
                <button
                  onClick={handleDelete}
                  className="bg-red-600 text-white px-4 py-2 rounded"
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
              className="bg-white rounded-lg shadow p-6 space-y-4"
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
                  className="bg-green-600 text-white px-4 py-2 rounded"
                >
                  Save
                </button>
                <button
                  type="button"
                  className="bg-gray-400 text-white px-4 py-2 rounded"
                  onClick={() => setEditMode(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
