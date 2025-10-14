import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Mail, User, GraduationCap, MapPin, FileText, Upload } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, addDoc, doc, getDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth"; // <-- Add this import
import { useNavigate } from "react-router-dom";

const faculties = [
    "Faculty of Accounting and Informatics",
    "Faculty of Applied Sciences",
    "Faculty of Arts and Design",
    "Faculty of Engineering and the Built Environment",
    "Faculty of Health Sciences",
    "Faculty of Management Sciences"
];

const departments = [
    "Information Technology",
    "Auditing and Taxation",
    "Biomedical and Clinical Technology",
    "Town and Regional Planning",
    "Drama and Production Studies",
    // ...add more DUT departments as needed
];

const qualifications = [
    "National Diploma in IT",
    "Bachelor of Technology",
    "Diploma in Accounting",
    "Bachelor of Health Sciences",
    // ...add more DUT qualifications as needed
];

const yearsOfStudy = ["1", "2", "3", "4", "Postgraduate"];

export default function FacultyReportForm() {
    const [form, setForm] = useState({
        studentName: "",
        studentNumber: "",
        email: "",
        faculty: "",
        department: "",
        qualification: "",
        yearOfStudy: "",
        placesVisited: "",
        academicExposure: "",
        purpose: "",
        outcomes: "",
        impact: "",
        plannedActivity: "",
        involvement: "",
        researchOpportunities: "",
        additionalInfo: "",
        invitationFile: null as File | null,
        supportingDocs: null as File | null,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const navigate = useNavigate();

    // Auto-fill email from authenticated user
    useEffect(() => {
        const auth = getAuth();
        const user = auth.currentUser;
        if (user && user.email) {
            setForm((prev) => ({ ...prev, email: user.email || "" }));
        }
    }, []);

    // Auto-fill profile details for Student Name, Number, Faculty, Department, Qualification
    useEffect(() => {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user?.uid) return;
        (async () => {
            try {
                const ref = doc(db, "profiles", user.uid);
                const snap = await getDoc(ref);
                if (snap.exists()) {
                    const p = snap.data() as any;
                    setForm(prev => ({
                        ...prev,
                        studentName: prev.studentName || p.displayName || "",
                        studentNumber: prev.studentNumber || p.studentOrStaffNumber || "",
                        faculty: prev.faculty || p.faculty || "",
                        department: prev.department || p.department || "",
                        qualification: prev.qualification || p.qualification || "",
                    }));
                }
            } catch (e) {
                console.error("Failed to load profile for FacultyReportForm:", e);
            }
        })();
    }, []);

    function updateField(field: string, value: string | File | null) {
        setForm({ ...form, [field]: value });
        setErrors((prev) => ({ ...prev, [field]: "" }));
    }

    function validate() {
        const newErrors: Record<string, string> = {};
        if (!form.studentName.trim()) newErrors.studentName = "Student Name is required";
        if (!form.studentNumber.trim()) newErrors.studentNumber = "Student Number is required";
        if (!form.email.trim()) newErrors.email = "Email is required";
        if (!form.faculty.trim()) newErrors.faculty = "Faculty is required";
        if (!form.placesVisited.trim()) newErrors.placesVisited = "Places visited is required";
        if (!form.purpose.trim()) newErrors.purpose = "Purpose of visit is required";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!validate()) return;

        try {
            // Save report to Firestore (no file uploads)
            const docRef = await addDoc(collection(db, "facultyReports"), {
                ...form,
                invitationFile: null,
                supportingDocs: null,
                createdAt: new Date(),
            });

            // Redirect to FacultyReportView with the new report ID
            navigate(`/faculty-report/view/${docRef.id}`);
        } catch (err) {
            alert("Failed to submit report. Please try again.");
            console.error(err);
        }
    }

    return (
        <><div className="min-h-screen flex items-start justify-center p-6 bg-gradient-to-br from-blue-50 via-indigo-100 to-purple-200">
            <Card className="w-full max-w-5xl shadow-2xl rounded-2xl bg-white/95 backdrop-blur">
                <CardHeader>
                    <CardTitle className="text-3xl font-bold text-center text-indigo-800">
                        Faculty Report – Student Engagement
                    </CardTitle>
                    <div className="mt-4 flex justify-start">
                        <button
                            onClick={() => navigate('/profile')}
                            className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 transition"
                        >
                            ← Back to Profile
                        </button>
                    </div>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-10">
                        {/* Personal Info */}
                        <div>
                            <h3 className="text-lg font-semibold mb-3">👤 Personal Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium flex items-center gap-2">
                                        <User size={16} /> Student Name
                                    </label>
                                    <Input
                                        value={form.studentName}
                                        onChange={(e) => updateField("studentName", e.target.value)}
                                        placeholder="Enter your full name"
                                    />
                                    {errors.studentName && <p className="text-xs text-red-600">{errors.studentName}</p>}
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Student Number</label>
                                    <Input
                                        value={form.studentNumber}
                                        onChange={(e) => updateField("studentNumber", e.target.value)}
                                        placeholder="Enter your student number"
                                    />
                                    {errors.studentNumber && <p className="text-xs text-red-600">{errors.studentNumber}</p>}
                                </div>
                                <div>
                                    <label className="text-sm font-medium flex items-center gap-2">
                                        <Mail size={16} /> Email Address
                                    </label>
                                    <Input
                                        value={form.email}
                                        onChange={(e) => updateField("email", e.target.value)}
                                        placeholder="you@example.com"
                                    />
                                    {errors.email && <p className="text-xs text-red-600">{errors.email}</p>}
                                </div>
                                <div>
                                    <label className="text-sm font-medium flex items-center gap-2">
                                        <GraduationCap size={16} /> Faculty
                                    </label>
                                    <select
                                        className="w-full border rounded px-3 py-2 mt-1"
                                        value={form.faculty}
                                        onChange={e => updateField("faculty", e.target.value)}
                                    >
                                        <option value="">Select Faculty</option>
                                        {faculties.map(fac => (
                                            <option key={fac} value={fac}>{fac}</option>
                                        ))}
                                    </select>
                                    {errors.faculty && <p className="text-xs text-red-600">{errors.faculty}</p>}
                                </div>
                                <div>
                                    <label className="text-sm font-medium flex items-center gap-2 mt-3">
                                        <FileText size={16} /> Department
                                    </label>
                                    <select
                                        className="w-full border rounded px-3 py-2 mt-1"
                                        value={form.department}
                                        onChange={e => updateField("department", e.target.value)}
                                    >
                                        <option value="">Select Department</option>
                                        {departments.map(dep => (
                                            <option key={dep} value={dep}>{dep}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium flex items-center gap-2 mt-3">
                                        <GraduationCap size={16} /> Qualification
                                    </label>
                                    <select
                                        className="w-full border rounded px-3 py-2 mt-1"
                                        value={form.qualification}
                                        onChange={e => updateField("qualification", e.target.value)}
                                    >
                                        <option value="">Select Qualification</option>
                                        {qualifications.map(q => (
                                            <option key={q} value={q}>{q}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium flex items-center gap-2 mt-3">
                                        <GraduationCap size={16} /> Year of Study
                                    </label>
                                    <select
                                        className="w-full border rounded px-3 py-2 mt-1"
                                        value={form.yearOfStudy}
                                        onChange={e => updateField("yearOfStudy", e.target.value)}
                                    >
                                        <option value="">Select Year</option>
                                        {yearsOfStudy.map(y => (
                                            <option key={y} value={y}>{y}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>


                        {/* Visit Details */}
                        <div>
                            <h3 className="text-lg font-semibold mb-3">🌍 Visit Details</h3>
                            <label className="text-sm font-medium flex items-center gap-2 mb-1">
                                <MapPin size={16} /> Places and Country visited (include dates travelled)
                            </label>
                            <Textarea
                                className="mb-4"
                                value={form.placesVisited}
                                onChange={(e) => updateField("placesVisited", e.target.value)}
                            />
                            {errors.placesVisited && <p className="text-xs text-red-600">{errors.placesVisited}</p>}

                            <label className="text-sm font-medium flex items-center gap-2 mb-1 mt-4">
                                <GraduationCap size={16} /> Any previous academic international exposure (Y/N) and Details
                            </label>
                            <Textarea
                                className="mb-4"
                                value={form.academicExposure}
                                onChange={(e) => updateField("academicExposure", e.target.value)}
                            />

                            <label className="text-sm font-medium flex items-center gap-2 mb-1 mt-4">
                                <FileText size={16} /> Purpose of this visit
                            </label>
                            <Textarea
                                className="mb-4"
                                value={form.purpose}
                                onChange={(e) => updateField("purpose", e.target.value)}
                            />
                            {errors.purpose && <p className="text-xs text-red-600">{errors.purpose}</p>}
                        </div>

                        {/* Outcomes & Reflections */}
                        <div>
                            <h3 className="text-lg font-semibold mb-3">📑 Outcomes & Reflections</h3>
                            <label className="text-sm font-medium flex items-center gap-2 mb-1">
                                <FileText size={16} /> State the different outcomes / key take-aways from this visit
                            </label>
                            <Textarea
                                className="mb-4"
                                value={form.outcomes}
                                onChange={(e) => updateField("outcomes", e.target.value)}
                            />

                            <label className="text-sm font-medium flex items-center gap-2 mb-1 mt-4">
                                <User size={16} /> Impact of this visit on engagement with peers
                            </label>
                            <Textarea
                                className="mb-4"
                                value={form.impact}
                                onChange={(e) => updateField("impact", e.target.value)}
                            />

                            <label className="text-sm font-medium flex items-center gap-2 mb-1 mt-4">
                                <FileText size={16} /> Planned activity (individual or team) for peers
                            </label>
                            <Textarea
                                className="mb-4"
                                value={form.plannedActivity}
                                onChange={(e) => updateField("plannedActivity", e.target.value)}
                            />

                            <label className="text-sm font-medium flex items-center gap-2 mb-1 mt-4">
                                <User size={16} /> Did the visit involve any other staff/students besides yourself
                            </label>
                            <Textarea
                                className="mb-4"
                                value={form.involvement}
                                onChange={(e) => updateField("involvement", e.target.value)}
                            />

                            <label className="text-sm font-medium flex items-center gap-2 mb-1 mt-4">
                                <GraduationCap size={16} /> Possible research opportunities (paper/thesis/external supervisor)
                            </label>
                            <Textarea
                                className="mb-4"
                                value={form.researchOpportunities}
                                onChange={(e) => updateField("researchOpportunities", e.target.value)}
                            />

                            <label className="text-sm font-medium flex items-center gap-2 mb-1 mt-4">
                                <FileText size={16} /> Any additional information or contacts to share
                            </label>
                            <Textarea
                                className="mb-4"
                                value={form.additionalInfo}
                                onChange={(e) => updateField("additionalInfo", e.target.value)}
                            />
                        </div>

                      

                        {/* Submit */}
                        <div className="flex justify-end">
                            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                                Submit Report
                            </Button>
                        </div>

                        <p className="text-xs text-gray-600 mt-4">
                            Kindly attach the following to your full report and share with the Faculty Engagement Officer within 5 days of returning:
                            Invitation letter for the engagement and Supporting documents.
                        </p>
                    </form>
                </CardContent>
            </Card>
        </div>
        </>
                
    );
}
