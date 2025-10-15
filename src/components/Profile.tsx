import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

import { Mail, Phone, MapPin, Calendar, User } from "lucide-react";
import { DashboardHeader } from "./Dashboard/DashboardHeader";
import { WorkItemFilter } from "@/types/workItem";
import VolunteerWorkOrder from "../pages/VolunteerWorkOrder";
import { NavLink } from "react-router-dom";

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
  photoURL?: string;
}

const defaultFilter: WorkItemFilter = {
  types: [],
  states: [],
  assignedTo: [],
  search: "",
};

const Profile = () => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<WorkItemFilter>(defaultFilter);
  const [uploading, setUploading] = useState(false);

  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      try {
        const docRef = doc(db, "profiles", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile(docSnap.data() as ProfileData);
        } else {
          setProfile({
            uid: user.uid,
            email: user.email || "",
            displayName: user.displayName || "",
          });
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  useEffect(() => {
    if (profile?.uid) {
      const localImg = localStorage.getItem(`profileImage_${profile.uid}`);
      if (localImg) {
        setProfile((prev) => prev ? { ...prev, photoURL: localImg } : prev);
      }
    }
  }, [profile?.uid]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!profile) return;
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    setError(null);
    try {
      const docRef = doc(db, "profiles", profile.uid);
      await setDoc(docRef, profile, { merge: true });
      setEditMode(false);
    } catch (err) {
      setError("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!profile) return;
    setSaving(true);
    setError(null);
    try {
      const docRef = doc(db, "profiles", profile.uid);
      await deleteDoc(docRef);
      setProfile(null);
    } catch (err) {
      setError("Failed to delete profile");
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      // Save to localStorage
      localStorage.setItem(`profileImage_${profile?.uid}`, base64);
      // Update profile state
      setProfile((prev) => prev ? { ...prev, photoURL: base64 } : prev);
    };
    reader.readAsDataURL(file);
  };

  if (loading) return <div>Loading...</div>;
  if (!user || !profile) return <div>Please log in to view your profile.</div>;

  return (
    <>
      
      <div className="min-h-screen bg-gray-100">
        {/* Dashboard Header */}
        <DashboardHeader
          filter={filter}
          onFilterChange={setFilter}
          onNewWorkItem={() => { }}
        />

        <div className="min-h-screen bg-blue-100 flex  justify-center py-10">
          <div className="w-full max-w-7xl bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="flex">
              {/* Left Sidebar */}
              <div className="w-1/3 border-r p-6 bg-gray-50">
                {/* Avatar */}
                <div className="h-36 w-36 rounded-lg overflow-hidden mx-auto shadow-md relative group">
                  <img
                    src={profile.photoURL || "https://via.placeholder.com/150"}
                    alt={profile.displayName}
                    className="h-full w-full object-cover"
                  />
                  {editMode && (
                    <label className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <span className="text-white text-xs mb-1">{uploading ? "Uploading..." : "Change"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                        disabled={uploading}
                      />
                    </label>
                  )}
                </div>

                {/* Work Section */}
                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
                   Academic Information
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="space-y-2 p-2 border-b font-medium">

                      {profile.department || <span className="text-gray-400 ">-</span>}

                      <span className="ml-2 text-xs text-white bg-blue-500 rounded px-2 py-0.5">
                        Deparment
                      </span>
                      <p className="text-xs text-blue-900">
                        faculty of Accounting and Informatics
                      </p>
                    </li>
                    <li className="space-y-2 p-2 border-b font-medium">
                      {profile.studentOrStaffNumber || <span className="text-gray-400">-</span>}
                      <span className="ml-2 text-xs text-white bg-indigo-500 rounded px-2 py-0.5">
                        Student / Staff Number
                      </span>
                      <p className="text-xs text-blue-900">
                        Durban University Of Technology
                      </p>
                    </li>
                    <li className="space-y-2 p-2 border-b font-medium">
                      {profile.idNumber || <span className="text-gray-400">-</span>}
                      <span className="ml-2 text-xs text-white bg-indigo-500 rounded px-2 py-0.5">
                        ID Number
                      </span>
                      <p className="text-xs text-blue-900">
                        South Africa
                      </p>
                    </li>
                  </ul>
                </div>

                {/* Skills Section */}
                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
                    ADDRESS
                  </h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">City:</span> {profile.city || <span className="text-gray-400">-</span>}
                    </li>
                    <li className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">Province:</span> {profile.province || <span className="text-gray-400">-</span>}
                    </li>
                    <li className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">Physical Address 1:</span> {profile.physicalAddressLine1 || <span className="text-gray-400">-</span>}
                    </li>
                    <li className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">Physical Address 2:</span> {profile.physicalAddressLine2 || <span className="text-gray-400">-</span>}
                    </li>
                  </ul>
                </div>
              </div>

              {/* Right Content */}
              <div className="w-2/3 p-8">
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {editMode ? (
                        <input
                          className="border rounded px-2 py-1 text-lg"
                          name="displayName"
                          value={profile.displayName}
                          onChange={handleChange}
                        />
                      ) : (
                        profile.displayName
                      )}
                    </h2>
                    <p className="text-blue-600 text-sm">
                      {editMode ? (
                        <input
                          className="border rounded px-2 py-1"
                          name="department"
                          value={profile.department || ""}
                          onChange={handleChange}
                        />
                      ) : (
                        profile.department || "Product Designer"
                      )}
                    </p>
                    <p className="text-gray-500 text-sm">
                      {editMode ? (
                        <input
                          className="border rounded px-2 py-1"
                          name="city"
                          value={profile.city || ""}
                          onChange={handleChange}
                        />
                      ) : (
                        profile.city || "New York, NY"
                      )}
                    </p>
                    {editMode && (
                      <>
                        <input
                          className="border rounded px-2 py-1 mt-1"
                          name="idNumber"
                          placeholder="ID Number"
                          value={profile.idNumber || ""}
                          onChange={handleChange}
                        />
                        <input
                          className="border rounded px-2 py-1 mt-1"
                          name="studentOrStaffNumber"
                          placeholder="Student/Staff Number"
                          value={profile.studentOrStaffNumber || ""}
                          onChange={handleChange}
                        />
                        <input
                          className="border rounded px-2 py-1 mt-1"
                          name="emergencyContactName"
                          placeholder="Emergency Contact Name"
                          value={profile.emergencyContactName || ""}
                          onChange={handleChange}
                        />
                        <input
                          className="border rounded px-2 py-1 mt-1"
                          name="physicalAddressLine1"
                          placeholder="Physical Address Line 1"
                          value={profile.physicalAddressLine1 || ""}
                          onChange={handleChange}
                        />
                        <input
                          className="border rounded px-2 py-1 mt-1"
                          name="physicalAddressLine2"
                          placeholder="Physical Address Line 2"
                          value={profile.physicalAddressLine2 || ""}
                          onChange={handleChange}
                        />
                        <input
                          className="border rounded px-2 py-1 mt-1"
                          name="province"
                          placeholder="Province"
                          value={profile.province || ""}
                          onChange={handleChange}
                        />
                        <input
                          className="border rounded px-2 py-1 mt-1"
                          name="medicalAidName"
                          placeholder="Medical Aid Name"
                          value={profile.medicalAidName || ""}
                          onChange={handleChange}
                        />
                        <label className="flex items-center gap-2 mt-1 text-sm">
                          <input
                            type="checkbox"
                            name="medicalAid"
                            checked={!!profile.medicalAid}
                            onChange={e => setProfile({ ...profile, medicalAid: e.target.checked })}
                          />
                          Medical Aid
                        </label>
                      </>
                    )}
                  </div>
                  
                </div>

                {/* Action Buttons */}
                <div className="mt-4 flex items-center gap-3">
                  {editMode ? (
                    <>
                      <button
                        className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700"
                        onClick={handleSave}
                        disabled={saving}
                      >
                        {saving ? "Saving..." : "Save"}
                      </button>
                      <button
                        className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md text-sm font-medium hover:bg-gray-200"
                        onClick={() => setEditMode(false)}
                        disabled={saving}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                        onClick={() => setEditMode(true)}
                      >
                        Edit Profile
                      </button>
                      
                         <NavLink
                    to="/proof"
                    className="px-4 py-2 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700 inline-block"
                  >
                    View Contract
                  </NavLink>
          <NavLink
                    to="/faculty-report"
                    className="px-4 py-2 bg-purple-900 text-white rounded-md text-sm font-medium hover:bg-purple-700 inline-block"
                  >
                    Faculty Report
                  </NavLink>
                 
                    </>
                  )}
                </div>
                {error && <div className="text-red-500 mt-2">{error}</div>}

                {/* Tabs */}
                <div className="mt-6 border-b flex gap-6 text-sm text-gray-600">
                  <button className="pb-2 border-b-2 border-blue-600 font-medium text-blue-600">
                    About
                  </button>
                  <button className="pb-2 hover:text-blue-600">Timeline</button>
                </div>

                {/* Contact Info */}
                <div className="mt-6">
                  <h3 className="text-base font-semibold text-gray-800 mb-3">
                    Contact Information
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-500" /> +27 000 000 0000
                    </li>
                    <li className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-500" />{' '}
                      {editMode ? (
                        <input
                          className="border rounded px-2 py-1"
                          name="physicalAddressLine1"
                          value={profile.physicalAddressLine1 || ""}
                          onChange={handleChange}
                        />
                      ) : (
                        profile.physicalAddressLine1 || "525 E 68th Street, NY"
                      )}
                    </li>
                    <li className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-500" /> {profile.email}
                    </li>
                    <li className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-500" /> {profile.displayName}
                    </li>
                    {editMode && (
                      <>
                        <li className="flex items-center gap-2">
                          <span className="font-medium">ID Number:</span>
                          <input
                            className="border rounded px-2 py-1"
                            name="idNumber"
                            value={profile.idNumber || ""}
                            onChange={handleChange}
                          />
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="font-medium">Student/Staff Number:</span>
                          <input
                            className="border rounded px-2 py-1"
                            name="studentOrStaffNumber"
                            value={profile.studentOrStaffNumber || ""}
                            onChange={handleChange}
                          />
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="font-medium">Emergency Contact Name:</span>
                          <input
                            className="border rounded px-2 py-1"
                            name="emergencyContactName"
                            value={profile.emergencyContactName || ""}
                            onChange={handleChange}
                          />
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="font-medium">Physical Address Line 2:</span>
                          <input
                            className="border rounded px-2 py-1"
                            name="physicalAddressLine2"
                            value={profile.physicalAddressLine2 || ""}
                            onChange={handleChange}
                          />
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="font-medium">Province:</span>
                          <input
                            className="border rounded px-2 py-1"
                            name="province"
                            value={profile.province || ""}
                            onChange={handleChange}
                          />
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="font-medium">Medical Aid Name:</span>
                          <input
                            className="border rounded px-2 py-1"
                            name="medicalAidName"
                            value={profile.medicalAidName || ""}
                            onChange={handleChange}
                          />
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="font-medium">Medical Aid:</span>
                          <input
                            type="checkbox"
                            name="medicalAid"
                            checked={!!profile.medicalAid}
                            onChange={e => setProfile({ ...profile, medicalAid: e.target.checked })}
                          />
                        </li>
                      </>
                    )}
                  </ul>
                </div>
                {/* Basic Info */}
                <div className="mt-6">
                  <h3 className="text-base font-semibold text-gray-800 mb-3">
                    Basic Information
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>
                      <span className="font-medium">Volunteer Starting date:</span>{' '}
                      {editMode ? (
                        <input
                          className="border rounded px-2 py-1"
                          name="date"
                          type="date"
                          value={profile.date ? profile.date.slice(0, 10) : ""}
                          onChange={handleChange}
                        />
                      ) : (
                        profile.date ? profile.date.slice(0, 10) : <span className="text-gray-400">-</span>
                      )}
                    </li>
                    <li>
                      <span className="font-medium">Gender:</span> Male
                    </li>
                  </ul>
                </div>

                {/* Profile Details Section - styled like Contact Info section */}
                <div className="mt-8">
                  <h3 className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-500" /> Medical Information
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-700">

                    <li className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">Medical Aid:</span> {profile.medicalAid ? 'Yes' : 'No'}
                    </li>
                    <li className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">Medical Aid Name:</span> {profile.medicalAidName || <span className="text-gray-400">-</span>}
                    </li>
                  </ul>
                </div>
              </div>
            </div>

          </div>
          
        </div>
      </div>
    </>
  );
};

export default Profile;
