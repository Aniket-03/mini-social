import { useState, useEffect } from "react";
import { auth } from "../firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
  updateProfile,
} from "firebase/auth";

export const useAuth = () => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser || null);
    });

    return () => unsubscribeAuth();
  }, []);

  const loginWithEmailPassword = async (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const registerWithEmailPassword = async (
    email: string,
    password: string,
    username: string
  ) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    if (userCredential.user) {
      await updateProfile(userCredential.user, { displayName: username });
    }
  };

  const loginWithGoogle = async () => {
    const googleProvider = new GoogleAuthProvider();
    return signInWithPopup(auth, googleProvider);
  };

  const registerWithGoogle = async () => {
    await loginWithGoogle();
  };

  const logout = async () => {
    return signOut(auth);
  };

  return {
    user,
    loginWithEmailPassword,
    registerWithEmailPassword,
    loginWithGoogle,
    registerWithGoogle,
    logout,
  };
};
