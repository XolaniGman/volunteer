import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card"; // optional shadcn-style components if available
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, Calendar, User, FileText, CheckCircle } from "lucide-react";

// If you don't have shadcn components, the imports above are optional and the markup still uses Tailwind classes.

type VolunteerFormState = {
  volunteerActivity: string;
  volunteerDates: string;
  volunteerName: string;
  parentGuardianName: string;
  idNumber: string;
  studentStaffNumber: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  email: string;
  address: string;
  medicalProvider: string;
  signatureName: string;
  signatureDate: string;
  approvedByName: string;
  approvedByDepartment: string;
};

export default function VolunteerForm() {
  const [form, setForm] = useState<VolunteerFormState>({
    volunteerActivity: "Global Digital Forum - Russia",
    volunteerDates: "03 June 2025 to 08 June 2025",
    volunteerName: "",
    parentGuardianName: "",
    idNumber: "",
    studentStaffNumber: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    email: "",
    address: "",
    medicalProvider: "",
    signatureName: "",
    signatureDate: "",
    approvedByName: "Ugeshni Moodley",
    approvedByDepartment: "Faculty of Accounting and Informatics",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function update<K extends keyof VolunteerFormState>(key: K, value: VolunteerFormState[K]) {
    setForm((s) => ({ ...s, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  }

  function validate() {
    const next: Record<string, string> = {};
    if (!form.volunteerName.trim()) next.volunteerName = "Volunteer name is required";
    if (!form.email.trim()) next.email = "Email is required";
    if (!form.emergencyContactPhone.trim()) next.emergencyContactPhone = "Emergency phone is required";
    if (!form.idNumber.trim()) next.idNumber = "ID / Passport number required";
    // add any other validations you want
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function onCreateClick(e?: React.MouseEvent) {
    e?.preventDefault();
    if (!validate()) return;
    // show terms modal before final submit
    setIsModalOpen(true);
  }

  function onConfirmTerms() {
    if (!acceptedTerms) return;
    setIsModalOpen(false);
    // simulate submit
    setTimeout(() => {
      setSubmitted(true);
    }, 250);
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex items-start justify-center">
      <div className="w-full max-w-4xl">
        {/* Header / branded logo area */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 rounded-lg bg-white flex items-center justify-center shadow-sm" style={{ boxShadow: '0 6px 18px rgba(15,23,42,0.06)' }}>
            {/* replace with actual img if available */}
            <img src="/logo192.png" alt="logo" className="w-12 h-12 object-contain" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Volunteer Participation Form</h1>
            <p className="text-sm text-muted-foreground">Durban University of Technology — Volunteer Notice of Risk and Waiver</p>
          </div>
        </div>

        <Card className="overflow-visible">
          <CardHeader>
            <CardTitle className="text-lg">Volunteer details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => { e.preventDefault(); onCreateClick(); }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left column */}
                <div className="space-y-4">
                  <label className="block">
                    <span className="flex items-center text-sm font-medium text-gray-700"><FileText className="mr-2" />Volunteer Activity</span>
                    <Input value={form.volunteerActivity} onChange={(e) => update('volunteerActivity', e.target.value)} />
                  </label>

                  <label className="block">
                    <span className="flex items-center text-sm font-medium text-gray-700"><Calendar className="mr-2" />Volunteer Dates</span>
                    <Input value={form.volunteerDates} onChange={(e) => update('volunteerDates', e.target.value)} />
                  </label>

                  <label className="block">
                    <span className="flex items-center text-sm font-medium text-gray-700"><User className="mr-2" />Volunteer Name</span>
                    <Input value={form.volunteerName} onChange={(e) => update('volunteerName', e.target.value)} placeholder="Full name" />
                    {errors.volunteerName && <p className="text-xs text-red-600 mt-1">{errors.volunteerName}</p>}
                  </label>

                  <label className="block">
                    <span className="flex items-center text-sm font-medium text-gray-700">Parent / Guardian Name (if minor)</span>
                    <Input value={form.parentGuardianName} onChange={(e) => update('parentGuardianName', e.target.value)} placeholder="Parent or guardian" />
                  </label>

                  <label className="block">
                    <span className="flex items-center text-sm font-medium text-gray-700">ID / Passport Number</span>
                    <Input value={form.idNumber} onChange={(e) => update('idNumber', e.target.value)} placeholder="ID or passport" />
                    {errors.idNumber && <p className="text-xs text-red-600 mt-1">{errors.idNumber}</p>}
                  </label>

                  <label className="block">
                    <span className="flex items-center text-sm font-medium text-gray-700">Student / Staff Number</span>
                    <Input value={form.studentStaffNumber} onChange={(e) => update('studentStaffNumber', e.target.value)} placeholder="If applicable" />
                  </label>
                </div>

                {/* Right column */}
                <div className="space-y-4">
                  <label className="block">
                    <span className="flex items-center text-sm font-medium text-gray-700"><Phone className="mr-2" />Emergency contact name</span>
                    <Input value={form.emergencyContactName} onChange={(e) => update('emergencyContactName', e.target.value)} />
                  </label>

                  <label className="block">
                    <span className="flex items-center text-sm font-medium text-gray-700"><Phone className="mr-2" />Emergency contact phone</span>
                    <Input value={form.emergencyContactPhone} onChange={(e) => update('emergencyContactPhone', e.target.value)} placeholder="+27 83 000 0000" />
                    {errors.emergencyContactPhone && <p className="text-xs text-red-600 mt-1">{errors.emergencyContactPhone}</p>}
                  </label>

                  <label className="block">
                    <span className="flex items-center text-sm font-medium text-gray-700"><Mail className="mr-2" />Email address</span>
                    <Input value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="name@example.com" />
                    {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
                  </label>

                  <label className="block">
                    <span className="flex items-center text-sm font-medium text-gray-700"><MapPin className="mr-2" />Address</span>
                    <Textarea value={form.address} onChange={(e) => update('address', e.target.value)} rows={3} />
                  </label>

                  <label className="block">
                    <span className="flex items-center text-sm font-medium text-gray-700">Volunteer’s medical provider / travel insurance provider</span>
                    <Input value={form.medicalProvider} onChange={(e) => update('medicalProvider', e.target.value)} />
                  </label>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-sm font-medium text-gray-700">Authorized Volunteer Signature</span>
                  <Input value={form.signatureName} onChange={(e) => update('signatureName', e.target.value)} placeholder="Type your full name to sign" />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-gray-700">Date</span>
                  <Input value={form.signatureDate} onChange={(e) => update('signatureDate', e.target.value)} placeholder="DD MMM YYYY" />
                </label>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <div className="text-xs text-gray-600">
                  <p>Approved by: <span className="font-medium">{form.approvedByName}</span></p>
                  <p className="mt-1">Department: <span className="font-medium">{form.approvedByDepartment}</span></p>
                </div>

                <div className="flex items-center gap-3">
                  <Button type="button" onClick={() => {
                    // reset form
                    setForm((s) => ({ ...s, volunteerName: '', email: '', emergencyContactPhone: '', signatureName: '', signatureDate: '' }));
                    setErrors({});
                    setSubmitted(false);
                  }} className="bg-white border">Clear</Button>

                  <Button onClick={onCreateClick} className="flex items-center gap-2">
                    <CheckCircle size={16} /> Create
                  </Button>
                </div>
              </div>
            </form>

            {submitted && (
              <div className="mt-6 p-4 rounded-lg bg-green-50 border border-green-100 text-green-800">
                <strong>Submitted —</strong> Volunteer form has been recorded. (This example does not actually send data anywhere.)
              </div>
            )}
          </CardContent>
        </Card>

        {/* Terms & Conditions Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/40" onClick={() => setIsModalOpen(false)} />
            <div className="relative max-w-2xl w-full bg-white rounded-2xl p-6 shadow-2xl">
              <h3 className="text-lg font-semibold">Volunteer Notice of Risk and Waiver</h3>
              <p className="mt-3 text-sm text-gray-700">Please read and accept the following before continuing. You must accept these terms to proceed.</p>

              <div className="mt-4 space-y-3 max-h-64 overflow-auto text-sm text-gray-700 leading-relaxed">
                <p><strong>Important:</strong> The Durban University of Technology (DUT) welcomes you as an authorized faculty volunteer in this activity. By agreeing you acknowledge you are not an employee of DUT for workers' compensation purposes and you understand the following:</p>
                <ul className="list-disc pl-5">
                  <li>Volunteers are not entitled to workers' compensation benefits or other employment benefits from DUT.</li>
                  <li>In the event of injury requiring medical care, you or your medical/travel insurance will be responsible for payment of all medical care.</li>
                  <li>Use of privately-owned vehicles is not covered by DUT liability or physical damage insurance — the vehicle owner must provide their own cover.</li>
                  <li>In an emergency, you grant DUT permission to authorize emergency medical care for the duration of your participation.</li>
                </ul>

                <p className="mt-2"><strong>Risks include (but are not limited to):</strong> infectious diseases, poor sanitation, mental health strain, crime, political instability, natural disaster, travel accidents, weather delays, and poor local transport systems.</p>

                <p className="mt-2">You agree to assume all risk of personal injury, death, loss or damage to property arising out of participation and to release and hold harmless DUT from claims related to your participation.</p>

                <p className="mt-2"><em>No volunteers under 18 years are allowed to volunteer at DUT without parent/guardian consent.</em></p>

                <p className="mt-2 text-xs text-gray-500">Approved by the RIE EXCO on 06 December 2021. Annexure A — Global Digital Forum - Russia. Dates: 03 June 2025 to 08 June 2025.</p>
              </div>

              <div className="mt-4 flex items-center gap-4">
                <label className="inline-flex items-center gap-2">
                  <input type="checkbox" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)} className="h-4 w-4 rounded border-gray-300" />
                  <span className="text-sm">I have read and accept the Terms and Conditions.</span>
                </label>

                <div className="ml-auto flex items-center gap-2">
                  <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                  <Button onClick={onConfirmTerms} disabled={!acceptedTerms}>
                    Confirm & Submit
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
