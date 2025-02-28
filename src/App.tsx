import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase-config";

import Home from "./pages/Home";
import LoginPage from "./pages/Signin";
import RegisterPage from "./pages/Signup";
import SavedPosts from "./components/SavedPosts";
import MyPosts from "./components/MyPosts";
import { ToastContainer } from "react-toastify";
import Navbar from "./components/Navbar";

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const [userAuthenticated, setUserAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setUserAuthenticated(!!user);
      setLoading(false);
    });

    return () => unsubscribeAuth();
  }, []);

  if (loading) return <div>Loading...</div>;

  return userAuthenticated ? <Navigate to="/" replace /> : <>{children}</>;
};

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const [userAuthenticated, setUserAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const location = useLocation();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setUserAuthenticated(!!user);
      setLoading(false);
    });

    return () => unsubscribeAuth();
  }, []);

  if (loading) return <div>Loading...</div>;

  return userAuthenticated ? <>{children}</> : <Navigate to="/login" state={{ from: location }} replace />;
};

const App = () => {
  return (
    <Router>
      <ToastContainer />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/savePost" element={<PrivateRoute><SavedPosts /></PrivateRoute>} />
        <Route path="/myPost" element={<PrivateRoute><MyPosts /></PrivateRoute>} />
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
      </Routes>
    </Router>
  );
};

export default App;
