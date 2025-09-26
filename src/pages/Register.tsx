import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

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
        <Card className="w-full max-w-2xl bg-white shadow-xl rounded-2xl border border-gray-200">
          <CardHeader>
            <CardTitle className="text-center text-2xl font-bold text-gray-800">
              Create Your Account ✨
            </CardTitle>
            <p className="text-center text-sm text-gray-500 mt-1">
              Fill in your details to get started
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Full Name</label>
                <Input
                  placeholder="John Doe"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Email Address</label>
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
                <label className="text-sm font-medium text-gray-700">Password</label>
                <Input
                  type="password"
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {/* Grid fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Department</label>
                  <Input
                    placeholder="Department"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Date</label>
                  <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">ID Number</label>
                  <Input
                    value={idNumber}
                    onChange={(e) => setIdNumber(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Student/Staff Number
                  </label>
                  <Input
                    value={studentOrStaffNumber}
                    onChange={(e) => setStudentOrStaffNumber(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Emergency Contact Name
                </label>
                <Input
                  value={emergencyContactName}
                  onChange={(e) => setEmergencyContactName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Physical Address Line 1
                </label>
                <Input
                  value={physicalAddressLine1}
                  onChange={(e) => setPhysicalAddressLine1(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Physical Address Line 2
                </label>
                <Input
                  value={physicalAddressLine2}
                  onChange={(e) => setPhysicalAddressLine2(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Province</label>
                  <select
                    className="h-10 rounded-md border border-gray-300 px-3 text-sm focus:border-indigo-500 focus:ring-indigo-500"
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
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">City</label>
                  <select
                    className="h-10 rounded-md border border-gray-300 px-3 text-sm focus:border-indigo-500 focus:ring-indigo-500"
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Medical Aid</label>
                  <select
                    className="h-10 rounded-md border border-gray-300 px-3 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                    value={medicalAid}
                    onChange={(e) => setMedicalAid(e.target.value as 'yes' | 'no')}
                  >
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                </div>

                {medicalAid === 'yes' && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Medical Aid Name
                    </label>
                    <Input
                      value={medicalAidName}
                      onChange={(e) => setMedicalAidName(e.target.value)}
                    />
                  </div>
                )}
              </div>

              {/* Submit */}
              <Button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg py-2 font-medium transition-all duration-200"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Account'}
              </Button>
            </form>

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
    </div>
  );
};

export default Register;
