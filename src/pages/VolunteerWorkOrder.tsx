import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// Declare html2pdf on window for TypeScript
declare global {
  interface Window {
    html2pdf?: any;
  }
}
import { doc, getDoc } from "firebase/firestore";
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
  volunteerSignature?: string;
  dateCreated?: string;
}

const VolunteerWaiver: React.FC = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      if (!auth.currentUser) return;
      try {
        const ref = doc(db, "profiles", auth.currentUser.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setProfile(snap.data() as Profile);
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!profile) return <div>No profile found.</div>;

  // PDF download logic
  const handleDownloadPDF = () => {
    if (!window.html2pdf) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
      script.onload = () => downloadPDF();
      document.body.appendChild(script);
    } else {
      downloadPDF();
    }
    function downloadPDF() {
      const element = document.getElementById('volunteer-workorder-pdf');
      if (element && window.html2pdf) {
        window.html2pdf().set({ margin: 0.5, filename: 'VolunteerWorkOrder.pdf', html2canvas: { scale: 2 } }).from(element).save();
      }
    }
  };

  return (
    <div className="min-h-screen max-w-7xl mx-auto border-2 border-gray-300 rounded-lg bg-white-100 p-8 font-sans space-y-12">
      <div className="mb-4 flex items-center gap-3">
        <button
          onClick={() => navigate('/profile')}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded shadow hover:bg-gray-300"
        >
          ← Back to Profile
        </button>
        <button
          onClick={handleDownloadPDF}
          className="px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700"
        >
          Download PDF
        </button>
      </div>
      <div id="volunteer-workorder-pdf">
        {/* ---------------- Page 1 ---------------- */}
        <div className="bg-white w-full max-w-5xl mx-auto shadow-lg border">
          <div className="relative max-w-5xl bg-purple-200 p-6 flex justify-center items-center">
              <img
                src="/asserts/DUTENVLOGO1.png"
                alt="DUT Logo"
                width="220"
                height="220"
                className="mx-auto"
              />
          </div>
          <div className="p-6 text-sm leading-relaxed space-y-4">
            <h1 className="text-sm font-bold text-gray-800">
                Volunteer Notice of Risk and Waiver
              </h1>
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
            <p>
              The Durban University of Technology (DUT) welcomes you as an authorized Faculty volunteer
              in this activity. Please read through the following important information.
            </p>
            <p>
              The Compensation for Occupational Injuries and Diseases Act (COIDA) provides that a person
              has to be paid in cash or in-kind; and payment in kind means the provision of something
              that has an objectively ascertainable value to be considered an employee. Therefore, as a
              volunteer, you are <strong>not</strong> an employee or agent of DUT for workers’
              compensation purposes. You are not entitled to receive workers’ compensation benefits or
              any other benefits of employment from DUT, including, but not limited to, health care,
              vacation, or sick time. In the event of an injury requiring medical care, you or your
              medical healthcare insurance will be responsible for payment of all medical care.
            </p>
            <p>
              Use of a privately owned vehicle, including the operation or as a passenger, may be an
              option while participating in the volunteer activity. DUT does not provide liability or
              physical damage insurance coverage on privately owned vehicles. The vehicle owner must
              provide liability and physical damage insurance coverage for the privately owned vehicle.
            </p>
            <p>
              In the event of an emergency, I grant DUT permission to authorize emergency medical care
              and treatment for the Volunteer for the duration of his/her participation in this
              designated activity.
            </p>
            
          </div>
        </div>
        {/* PAGE BREAK */}
        <div className="page-break p-2"></div>
        {/* ---------------- Page 2 ---------------- */}
        <div className="bg-white w-full p-6 max-w-5xl mx-auto shadow-lg border">
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
                Durban University of Technology (DUT)
              </h2>
              <p className="text-xs text-gray-600">Steve Biko Campus</p>
              <p className="text-xs text-gray-600">115 Steve Biko Road, Berea</p>
              <p className="text-xs text-gray-600">Durban, 4001, South Africa</p>
              <p className="text-xs text-gray-600">info@dut.ac.za</p>
              <p className="text-xs text-gray-600">+27 31 373 2000</p>
            </div>
          </div>
          {/* Title */}
          <div className="text-center py-4 border-b">
            <h1 className="text-lg font-bold text-gray-800">
              Volunteer Waiver & Risks
            </h1>
          </div>
          {/* Content */}
          <div className="p-6 text-sm leading-relaxed space-y-4">
            <p>
              I exercise my own free choice to participate in the designated
              activity. I understand and assume all associated risks. These risks
              include, but are not limited to:
            </p>
            <ul className="list-disc border-l-6  border border-red-500 space-y-1">
                 <p >
                <span className="font-semibold">Health Risks:</span> Infectious 
                diseases, Poor sanitation and hygiene, mental health strain, etc
              </p>
                 <p>
                <span className="font-semibold">Safety & Security Risks:</span> Crime, 
                Political instability, natural disaster, etc.
              </p>
                 <p>
                <span className="font-semibold">Travel & Transportation:</span> Accidents, 
                Weather Delays, poor roads and transport system
              </p>
              <p>
                <span className="font-semibold">Privacy Risks:</span> Image,
                Voice, Video, Name will be publicly accessible...
              </p>
              <p>
                <span className="font-semibold">
                  Lack of Compensation / Benefits:
                </span>{" "}
                You will not be entitled to any financial compensation...
              </p>
              <p>
                <span className="font-semibold">Time and Effort:</span> Once
                committed to a shoot, all care will be taken...
              </p>
            </ul>
            <p>
              I agree to assume all risk of personal injury or loss, bodily injury
              (including death), damage to or loss of, or destruction of personal
              property, resulting from or arising out of participation in the
              designated volunteer activity...
            </p>
            <p className="italic">
              No volunteers under 18 years of age are allowed to volunteer at DUT.
            </p>
            {/* Signature section */}
            <div className="grid grid-cols-2  gap-8 mt-6">
              <div>
                <p className="font-semibold">Volunteer Signature:</p>
                <div className="border-b  border-gray-400 h-12">
                  {profile.volunteerSignature && profile.volunteerSignature.startsWith('data:image') ? (
                    <img
                      src={profile.volunteerSignature}
                      alt="Volunteer Signature"
                      style={{ maxHeight: '64px', maxWidth: '100%', objectFit: 'contain', display: 'block' }}
                    />
                  ) : (
                    "-"
                  )}
                </div>
              </div>
              <div>
                <p className="font-semibold">Date:</p>
                <div className="border-b border-gray-400 h-12">{profile.dateCreated ? new Date(profile.dateCreated).toLocaleDateString() : "-"}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-8 mt-6">
              
            </div>
            <div className="mt-6">
              <p className="font-semibold">Approved by:</p>
              <p>Ugeshni Moodley</p>
              <p>Faculty of Accounting and Informatics</p>
              <p className="mt-2">Date: __________________</p>
            </div>
            <p className="mt-4 text-xs text-gray-500">
              Approved by the RIE EXCO on the 06 December 2021
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
       

export default VolunteerWaiver;
