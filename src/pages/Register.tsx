import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Mail, Lock, User, Building2, Calendar, IdCard, Contact, MapPin, Home, Landmark, Phone, HeartPulse } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import SignaturePad from "@/components/SignaturePad";


const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [department, setDepartment] = useState('');
  const [date, setDate] = useState<string>('');
  const [idNumber, setIdNumber] = useState('');
  const [studentOrStaffNumber, setStudentOrStaffNumber] = useState('');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [physicalAddressLine1, setPhysicalAddressLine1] = useState('');
  const [physicalAddressLine2, setPhysicalAddressLine2] = useState('');
  const [province, setProvince] = useState("");
  const [city, setCity] = useState("");
  const [medicalAid, setMedicalAid] = useState<'yes' | 'no'>('no');
  const [medicalAidName, setMedicalAidName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [volunteerSignature, setVolunteerSignature] = useState('');
  const [dateCreated, setDateCreated] = useState('');
  const [showSignaturePad, setShowSignaturePad] = useState(false);

  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);

      if (displayName) {
        await updateProfile(cred.user, { displayName });
      }

      await setDoc(doc(db, 'profiles', cred.user.uid), {
        uid: cred.user.uid,
        email,
        displayName: displayName || null,
        department,
        date: date ? new Date(date).toISOString() : null,
        idNumber,
        studentOrStaffNumber,
        emergencyContactName,
        physicalAddressLine1,
        physicalAddressLine2,
        province,
        city,
        medicalAid: medicalAid === 'yes',
        medicalAidName: medicalAid === 'yes' ? medicalAidName : '',
        volunteerSignature,
        dateCreated: dateCreated || new Date().toISOString(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      navigate('/');
    } catch (e: any) {
      toast({
        title: 'Registration failed',
        description: e.message ?? 'Please try again.',
        variant: 'destructive' as any,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleShowTerms = (e: React.FormEvent) => {
    e.preventDefault();
    setShowTerms(true);
  };


  const handleAcceptTerms = async () => {
    setShowTerms(false);
    setTermsAccepted(false);
    setShowSignaturePad(true);
  };

  // South African provinces and cities
  const provinces = [
    "Eastern Cape", "Free State", "Gauteng", "KwaZulu-Natal", "Limpopo", "Mpumalanga", "Northern Cape", "North West", "Western Cape"
  ];
  const citiesByProvince: { [key: string]: string[] } = {
    "Eastern Cape": ["East London", "Port Elizabeth", "Mthatha", "Queenstown"],
    "Free State": ["Bloemfontein", "Welkom", "Bethlehem"],
    "Gauteng": ["Johannesburg", "Pretoria", "Soweto", "Benoni"],
    "KwaZulu-Natal": ["Durban", "Pietermaritzburg", "Richards Bay", "Newcastle"],
    "Limpopo": ["Polokwane", "Thohoyandou", "Tzaneen"],
    "Mpumalanga": ["Nelspruit", "Witbank", "Secunda"],
    "Northern Cape": ["Kimberley", "Upington", "Springbok"],
    "North West": ["Rustenburg", "Mahikeng", "Klerksdorp"],
    "Western Cape": ["Cape Town", "Stellenbosch", "George", "Paarl"]
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row items-center justify-center bg-gradient-to-r from-indigo-100 via-white to-purple-100">
      {/* Left side - form */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 md:px-16">
        {/* Logo */}
        <div className="mb-6 text-center">
          <h1 className="text-5xl font-bold text-gray-800">
            Welcome To Our Platform
          </h1>
        </div>


        {/* Card */}

        <Card className="w-full max-w-5xl bg-white shadow-2xl rounded-2xl border border-gray-200">
          <CardHeader>
            <CardTitle className="text-center text-3xl font-extrabold text-indigo-700">
              Create Your Account ✨
            </CardTitle>
            <p className="text-center text-sm text-gray-500 mt-2">
              Fill in your details to get started
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleShowTerms} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <User size={16} /> Full Name
                </label>
                <Input
                  placeholder="John Doe"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Mail size={16} /> Email Address
                </label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Lock size={16} /> Password
                </label>
                <Input
                  type="password"
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {/* Department */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Building2 size={16} /> Department
                </label>
                <Input
                  placeholder="Department"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                />
              </div>

              {/* Date */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Calendar size={16} /> Date
                </label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>

              {/* ID Number */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <IdCard size={16} /> ID Number
                </label>
                <Input
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value)}
                />
              </div>

              {/* Student/Staff Number */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Landmark size={16} /> Student/Staff Number
                </label>
                <Input
                  value={studentOrStaffNumber}
                  onChange={(e) => setStudentOrStaffNumber(e.target.value)}
                />
              </div>

              {/* Emergency Contact */}
              <div className="space-y-2 col-span-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Contact size={16} /> Emergency Contact Name
                </label>
                <Input
                  value={emergencyContactName}
                  onChange={(e) => setEmergencyContactName(e.target.value)}
                />
              </div>

              {/* Address Line 1 */}
              <div className="space-y-2 col-span-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Home size={16} /> Physical Address Line 1
                </label>
                <Input
                  value={physicalAddressLine1}
                  onChange={(e) => setPhysicalAddressLine1(e.target.value)}
                />
              </div>

              {/* Address Line 2 */}
              <div className="space-y-2 col-span-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Home size={16} /> Physical Address Line 2
                </label>
                <Input
                  value={physicalAddressLine2}
                  onChange={(e) => setPhysicalAddressLine2(e.target.value)}
                />
              </div>

              {/* Province */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <MapPin size={16} /> Province
                </label>
                <select
                  className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                  value={province}
                  onChange={e => {
                    setProvince(e.target.value);
                    setCity(""); // Reset city when province changes
                  }}
                  required
                >
                  <option value="">Select Province</option>
                  {provinces.map((prov) => (
                    <option key={prov} value={prov}>{prov}</option>
                  ))}
                </select>
              </div>

              {/* City */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Building2 size={16} /> City
                </label>
                <select
                  className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  required
                  disabled={!province}
                >
                  <option value="">Select City</option>
                  {province && citiesByProvince[province]?.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Medical Aid */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <HeartPulse size={16} /> Medical Aid
                </label>
                <select
                  className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                  value={medicalAid}
                  onChange={(e) => setMedicalAid(e.target.value as 'yes' | 'no')}
                >
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </div>

              {/* Medical Aid Name (only if yes) */}
              {medicalAid === 'yes' && (
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <HeartPulse size={16} /> Medical Aid Name
                  </label>
                  <Input
                    value={medicalAidName}
                    onChange={(e) => setMedicalAidName(e.target.value)}
                  />
                </div>
              )}

           

              {/* Submit */}
              <div className="col-span-2">
                <Button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg py-3 font-semibold shadow-md transition-all duration-200"
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Account'}
                </Button>
              </div>
            </form>

            {/* Signature Pad Dialog */}
            <Dialog open={showSignaturePad} onOpenChange={setShowSignaturePad}>
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
                    onChange={e => setVolunteerSignature(e.target.value)}
                  />
                </div>
                <DialogFooter>
                  <Button
                    onClick={async () => {
                      setShowSignaturePad(false);
                      // Create a fake event to pass to handleSubmit
                      const fakeEvent = { preventDefault: () => { } } as React.FormEvent;
                      await handleSubmit(fakeEvent);
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

            {/* Divider */}
            <div className="flex items-center my-6">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="mx-2 text-sm text-gray-400">or</span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>

            {/* Login link */}
            <p className="text-sm text-gray-600 text-center">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-semibold text-indigo-600 hover:underline"
              >
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>

      </div>

      {/* Right side - image */}
      <div className="flex-1 hidden md:flex items-center justify-center p-8">
        <img
          src="/asserts/DUTENVLOGO1.jpg"
          alt="Register Illustration"
          className="rounded-2xl shadow-lg max-h-[500px] object-cover"
        />
      </div>

      {/* Terms and Conditions Dialog */}
      <Dialog open={showTerms} onOpenChange={setShowTerms}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Durban University of Technology (DUT) — Terms & Conditions 📜</DialogTitle>
            <DialogDescription>
              Please read carefully before continuing.
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-80 overflow-y-auto text-sm text-gray-700 space-y-5 leading-relaxed">
            <p>
              The Durban University of Technology (DUT) welcomes you as an authorized Faculty volunteer in this activity.
              Please read through the following important information.
            </p>

            <h4 className="font-semibold">1. Compensation & Employment Status</h4>
            <p>
              The Compensation for Occupational Injuries and Diseases Act (COIDA) provides that a person has to be paid in cash
              or in-kind; and payment in kind means the provision of something that has an objectively ascertainable value
              to be considered an employee. Therefore, as a volunteer, you are <b>not an employee or agent of DUT</b> for workers’
              compensation purposes. You are not entitled to receive workers’ compensation benefits or any other benefits of
              employment from DUT, including, but not limited to, health care, vacation, or sick time.
            </p>
            <p>
              In the event of an injury requiring medical care, you or your medical healthcare insurance will be responsible
              for payment of all medical care.
            </p>

            <h4 className="font-semibold">2. Use of Private Vehicles</h4>
            <p>
              Use of a privately owned vehicle, including the operation or as a passenger, may be an option while participating
              in the volunteer activity. DUT does not provide liability or physical damage insurance coverage on privately
              owned vehicles. The vehicle owner must provide liability and physical damage insurance coverage for the privately
              owned vehicle.
            </p>

            <h4 className="font-semibold">3. Assumption of Risks</h4>
            <p>I exercise my own free choice to participate in the designated activity. I understand and assume all associated risks. These risks include, but are not limited to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><b>Privacy Risks:</b> Image, Voice, Video, and Name will be publicly accessible.</li>
              <li><b>Lack of Compensation / Benefits:</b> You will not be entitled to any financial compensation.</li>
              <li><b>Time and Effort:</b> Once committed to a shoot, all care will be taken to meet your responsibilities.</li>
              <li>
                <b>Personal Injury or Loss:</b> You agree to assume all risk of personal injury or loss, bodily injury
                (including death), damage to or loss of, or destruction of personal property, resulting from or arising
                out of participation in the designated volunteer activity.
              </li>
            </ul>

            <h4 className="font-semibold">4. Age Requirement</h4>
            <p>No volunteers under 18 years of age are allowed to volunteer at DUT.</p>

            <h4 className="font-semibold">5. Emergency Medical Authorization</h4>
            <p>
              In the event of an emergency, I grant DUT permission to authorize emergency medical care and treatment for
              the Volunteer for the duration of his/her participation in this designated activity.
            </p>

            <p className="font-semibold text-indigo-700">
              ✅ By clicking "Accept & Continue", you acknowledge that you have read, understood,
              and agree to these Terms & Conditions.
            </p>
          </div>
          <div className="flex items-center mb-4">
            <Checkbox id="accept-terms" checked={termsAccepted} onCheckedChange={val => setTermsAccepted(val === true)} />
            <label htmlFor="accept-terms" className="ml-2 text-sm text-gray-700">I accept the terms and conditions</label>
          </div>
          <DialogFooter>
            <Button onClick={handleAcceptTerms} disabled={!termsAccepted}>
              Accept & Continue
            </Button>
            <Button variant="outline" onClick={() => setShowTerms(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Register;
