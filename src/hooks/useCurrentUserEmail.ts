import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';

export function useCurrentUserEmail() {
  const [user] = useAuthState(auth);
  return user?.email || null;
}
