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
  const [province, setProvince] = useState('');
  const [city, setCity] = useState('');
  const [medicalAid, setMedicalAid] = useState<'yes'|'no'>('no');
  const [medicalAidName, setMedicalAidName] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1. Create user in Firebase Auth
      const cred = await createUserWithEmailAndPassword(auth, email, password);

      // 2. Optionally set display name in Auth profile
      if (displayName) {
        await updateProfile(cred.user, { displayName });
      }

      // 3. Save user profile in Firestore
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

      // 4. Redirect to home page
      navigate('/');
    } catch (e: any) {
      toast({
        title: 'Registration failed',
        description: e.message ?? 'Please try again.',
        variant: 'destructive' as any
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-500 to-blue-500 to-white flex items-center justify-center p-6">
      <Card className="w-full bg-indigo-100 max-w-lg">
        <CardHeader>
          <CardTitle>Create account</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input placeholder="Name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
            <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input placeholder="Department" value={department} onChange={(e) => setDepartment(e.target.value)} />
              <Input type="date" placeholder="Date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input placeholder="ID number" value={idNumber} onChange={(e) => setIdNumber(e.target.value)} />
              <Input placeholder="Student/Staff Number" value={studentOrStaffNumber} onChange={(e) => setStudentOrStaffNumber(e.target.value)} />
            </div>
            <Input placeholder="Emergency Contact Name" value={emergencyContactName} onChange={(e) => setEmergencyContactName(e.target.value)} />
            <Input placeholder="Physical address line 1" value={physicalAddressLine1} onChange={(e) => setPhysicalAddressLine1(e.target.value)} />
            <Input placeholder="Physical address line 2" value={physicalAddressLine2} onChange={(e) => setPhysicalAddressLine2(e.target.value)} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input placeholder="Province" value={province} onChange={(e) => setProvince(e.target.value)} />
              <Input placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <select
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                value={medicalAid}
                onChange={(e) => setMedicalAid(e.target.value as 'yes'|'no')}
              >
                <option value="no">Medical aid: No</option>
                <option value="yes">Medical aid: Yes</option>
              </select>
              {medicalAid === 'yes' && (
                <Input placeholder="Medical Aid Name" value={medicalAidName} onChange={(e) => setMedicalAidName(e.target.value)} />
              )}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Creating...' : 'Create account'}</Button>
          </form>
          <p className="text-sm text-muted-foreground mt-4">Already have an account? <Link to="/login" className="underline">Sign in</Link></p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;


