import { useEffect, useState } from "react";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";

interface Profile {
    uid: string;
    displayName: string | null;
    email: string;
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

const Proof: React.FC = () => {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [workItems, setWorkItems] = useState<{ id: string; title: string; description: string; state: string }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfileAndWorkItems = async () => {
            if (!auth.currentUser) return;
            try {
                // Fetch profile
                const ref = doc(db, "profiles", auth.currentUser.uid);
                const snap = await getDoc(ref);
                if (snap.exists()) {
                    setProfile(snap.data() as Profile);
                }

                // Fetch user-specific work items
                const q = query(
                    collection(db, "workItems"),
                    where("userId", "==", auth.currentUser.uid)
                );
                const querySnapshot = await getDocs(q);
                const items = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...(doc.data() as { title: string; description: string; state: string })
                }));
                setWorkItems(items);
            } catch (err) {
                console.error("Error fetching data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfileAndWorkItems();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (!profile) return <div>No profile found.</div>;

    return (
        <div className="min-h-screen bg-gray-100 p-8 font-sans space-y-12">
            {/* ---------------- Page 1 ---------------- */}
            <div className="bg-white w-full max-w-3xl mx-auto shadow-lg border">
                <div className="relative bg-purple-200 p-6">
                    <div className="absolute top-0 left-0 p-3">
                        <img
                            src="/asserts/DUTENVLOGO1.jpg"
                            alt="DUT Logo"
                            width="100"
                            height="100"
                        />
                    </div>
                    <div className="relative z-10 text-center">
                        <h1 className="text-lg font-bold text-gray-800">
                            Volunteer Notice of Risk and Waiver
                        </h1>
                    </div>
                </div>

                <div className="p-6 text-sm leading-relaxed space-y-4">
                    <div className="grid grid-cols-2 border mb-4">
                        <div className="p-2 font-semibold border">Volunteer Name</div>
                        <div className="p-2 border">{profile.displayName || "-"}</div>
                        <div className="p-2 font-semibold border">Volunteer Email</div>
                        <div className="p-2 border">{profile.email || "-"}</div>
                        <div className="p-2 font-semibold border">Volunteer Activity Department</div>
                        <div className="p-2 border">{profile.department || "-"}</div>
                        <div className="p-2 font-semibold border">Date</div>
                        <div className="p-2 border">{profile.date || "-"}</div>
                        <div className="p-2 font-semibold border">ID Number</div>
                        <div className="p-2 border">{profile.idNumber || "-"}</div>
                        <div className="p-2 font-semibold border">Student/Staff Number</div>
                        <div className="p-2 border">{profile.studentOrStaffNumber || "-"}</div>
                        <div className="p-2 font-semibold border">Emergency Contact Name</div>
                        <div className="p-2 border">{profile.emergencyContactName || "-"}</div>
                        <div className="p-2 font-semibold border">Physical Address Line 1</div>
                        <div className="p-2 border">{profile.physicalAddressLine1 || "-"}</div>
                        <div className="p-2 font-semibold border">Physical Address Line 2</div>
                        <div className="p-2 border">{profile.physicalAddressLine2 || "-"}</div>
                        <div className="p-2 font-semibold border">Volunteer Medical Aid</div>
                        <div className="p-2 border">{profile.medicalAid ? "Yes" : "No"}</div>
                        <div className="p-2 font-semibold border">Medical Aid Name</div>
                        <div className="p-2 border">{profile.medicalAidName || "-"}</div>
                    </div>

                    {/* Work Items Table */}
                    <h2 className="text-md font-bold text-gray-800 mt-6">Volunteer Work Items</h2>
                    {workItems.length > 0 ? (
                        <table className="w-full border mt-2 text-sm">
                            <thead>
                                <tr className="bg-gray-200">
                                    <th className="p-2 border">Title</th>
                                    <th className="p-2 border">Description</th>
                                    <th className="p-2 border">State</th>
                                </tr>
                            </thead>
                            <tbody>
                                {workItems.map((item) => (
                                    <tr key={item.id}>
                                        <td className="p-2 border">{item.title}</td>
                                        <td className="p-2 border">{item.description}</td>
                                        <td className="p-2 border">{item.state}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="text-gray-500">No work items found.</p>
                    )}

                    <div className="grid grid-cols-2 gap-8 mt-6">
                        <div>
                            <p className="font-semibold">Volunteer Signature:</p>
                            <div className="border-b border-gray-400 h-6"></div>
                        </div>
                        <div>
                            <p className="font-semibold">Date:</p>
                            <div className="border-b border-gray-400 h-6"></div>
                        </div>
                    </div>

                    <p className="mt-4 text-xs text-gray-500">
                        Approved by the RIE EXCO on the 06 December 2021
                    </p>
                </div>
            </div>
            {/* ---------------- Page 2 ---------------- */}
            <div className="bg-white w-full max-w-3xl mx-auto shadow-lg border">
                {/* Header with logo */}
                <div className="relative bg-purple-200 p-6">
                    <div className="absolute top-0 left-0 p-3">
                        <img
                            src="/asserts/DUTENVLOGO1.jpg"
                            alt="DUT Logo"
                            width="100"
                            height="100"
                        />
                    </div>
                    <div className="relative z-10 text-right">
                        <h2 className="text-xs font-semibold text-gray-700">
                            Ridgehill Foundation
                        </h2>
                        <p className="text-xs text-gray-600">Beaverton, OR 97006</p>
                        <p className="text-xs text-gray-600">info@ridgehillfoundation.org</p>
                        <p className="text-xs text-gray-600">222 555 7777</p>
                    </div>
                </div>

                {/* Title */}
                <div className="text-center py-4 border-b">
                    <h1 className="text-lg font-bold text-gray-800">
                        Volunteer Waiver & Risks
                    </h1>
                </div>

                {/* Content */}
               
            </div>
        </div>
    );
};

export default Proof;
