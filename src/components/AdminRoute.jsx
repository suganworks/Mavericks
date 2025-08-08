import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { checkIfAdmin } from '../auth';
const AdminRoute = ({ children }) => {
const navigate = useNavigate();
const [isAuthorized, setIsAuthorized] = useState(false);
const [loading, setLoading] = useState(true);
useEffect(() => {
const checkAdminStatus = async () => {
  try {
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log("No user logged in. Redirecting to login...");
      navigate('/login');
      return;
    }
    
    // Check if the user is an admin
    const isAdmin = await checkIfAdmin(user.id);
    
    if (isAdmin) {
      setIsAuthorized(true);
    } else {
      console.log("Access denied. User is not an admin. Redirecting...");
      navigate('/dashboard');
    }
  } catch (error) {
    console.error("Error checking admin status:", error);
    navigate('/login');
  } finally {
    setLoading(false);
  }
};

checkAdminStatus();
}, [navigate]);
if (loading) {
return <div className="min-h-screen bg-[#0d1117] flex items-center justify-center text-white">Verifying access...</div>;
}
return isAuthorized ? children : null;
};
export default AdminRoute;