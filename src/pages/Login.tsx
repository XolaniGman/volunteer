import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/');
    } catch (e: any) {
      toast({
        title: 'Login failed',
        description: e.message ?? 'Please try again.',
        variant: 'destructive' as any,
      });
    } finally {
      setLoading(false);
    }
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
        <Card className="w-full max-w-md bg-white shadow-xl rounded-2xl border border-gray-200">
          <CardHeader>
            <CardTitle className="text-center text-2xl font-bold text-gray-800">
              Welcome Back 👋
            </CardTitle>
            <p className="text-center text-sm text-gray-500 mt-1">
              Sign in to continue to your account
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              {/* Submit */}
              <Button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg py-2 font-medium transition-all duration-200"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>

            {/* Divider */}
            <div className="flex items-center my-6">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="mx-2 text-sm text-gray-400">or</span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>

            {/* Register link */}
            <p className="text-sm text-gray-600 text-center">
              Don&apos;t have an account?{' '}
              <Link to="/register" className="font-semibold text-indigo-600 hover:underline">
                Register
              </Link>
            </p>
          </CardContent>
        </Card>

      </div>

      {/* Right side - image */}
      <div className="flex-1 hidden md:flex items-center justify-center p-8">
        <img
          src="/asserts/DUTENVLOGO1.jpg" // Replace with your image
          alt="Login Illustration"
          className="rounded-2xl shadow-lg max-h-[500px] object-cover"
        />
      </div>
    </div>
  );
};

export default Login;
