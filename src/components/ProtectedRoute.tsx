import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getAuth } from "firebase/auth";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const auth = getAuth();
  const user = auth.currentUser;
  const location = useLocation();

  if (!user) {
    // Redirect to login, preserving the current location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Redirect to /dashboard if email ends with @dut.ac.za and not already on dashboard
  if (user.email && user.email.endsWith("@dut.ac.za") && !location.pathname.startsWith("/dashboard")) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;