"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { createOrUpdateUser } from "@/lib/firestore";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined); // undefined = loading

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // IMPORTANT: setUser immediately so auth works even if Firestore fails
        setUser(firebaseUser);
        // Then try to sync to Firestore in background — errors won't break auth
        try {
          await createOrUpdateUser(firebaseUser);
        } catch (err) {
          console.error("Firestore sync failed (auth still works):", err);
        }
      } else {
        setUser(null);
      }
    });
    return unsub;
  }, []);

  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
