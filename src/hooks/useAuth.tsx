import { useState, useEffect } from "react";
import { auth } from "../firebase-config";
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
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const loginWithEmailPassword = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const registerWithEmailPassword = async (
    email: string,
    password: string,
    username: string
  ) => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);

      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: username });
      }

      console.log("User registered with displayName:", username);
    } catch (error) {
      console.error("Error registering user:", error);
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const registerWithGoogle = async () => {
    await loginWithGoogle();
  };

  const logout = async () => {
    await signOut(auth);
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
