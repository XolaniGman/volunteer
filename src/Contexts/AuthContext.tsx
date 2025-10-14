import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import type { User } from "firebase/auth";

type AuthContextValue = {
  user: User | null;
  role: string | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        // Fetch user profile from Firestore
        const docRef = doc(db, "profiles", firebaseUser.uid);
        const docSnap = await getDoc(docRef);
        let userRole = "user";
        if (docSnap.exists()) {
          userRole = docSnap.data().role || "user";
        }
        // If email is @dut.ca.za, treat as admin
        if (firebaseUser.email && firebaseUser.email.endsWith("@dut.ca.za")) {
          userRole = "admin";
        }
        setRole(userRole);
      } else {
        setRole(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};


