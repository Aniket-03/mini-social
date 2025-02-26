import React, { useEffect, useState } from 'react';
import {   
  BrowserRouter as Router,   
  Route,   
  Routes,   
  Navigate, 
  useLocation 
} from "react-router-dom"; 
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from "./firebase-config";

import Home from "./pages/Home"; 
import LoginPage from "./pages/Login"; 
import RegisterPage from "./pages/Register"; 
import SavedPosts from "./components/SavedPosts"; 
import MyPosts from "./components/MyPosts"; 
import { ToastContainer } from "react-toastify";
import Navbar from "./components/Navbar";

const UnprotectedRoute = ({ children }: { children: React.ReactNode }) => {   
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>; 
  }

  if (isAuthenticated) {     
    return <Navigate to="/" replace />;   
  }    

  return <>{children}</>;
};  

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {   
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>; 
  }

  if (!isAuthenticated) {     
    return <Navigate to="/login" state={{ from: location }} replace />;   
  }    

  return <>{children}</>;
};  

const App = () => {
  return (     
    <Router>       
      <ToastContainer />       
      <Navbar />         
      <Routes>           
        <Route path="/" element={<Home />} />            
        <Route 
          path="/saved-post"             
          element={               
            <ProtectedRoute>                 
              <SavedPosts />               
            </ProtectedRoute>             
          }           
        />           
        <Route 
          path="/my-post"             
          element={               
            <ProtectedRoute>                 
              <MyPosts />               
            </ProtectedRoute>             
          }           
        />            
        <Route 
          path="/login"             
          element={               
            <UnprotectedRoute>                 
              <LoginPage />               
            </UnprotectedRoute>             
          }           
        />           
        <Route 
          path="/register"             
          element={               
            <UnprotectedRoute>                 
              <RegisterPage />               
            </UnprotectedRoute>             
          }           
        />               
      </Routes>     
    </Router>   
  ); 
};  

export default App;