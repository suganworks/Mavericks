import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// MOCK AUTHENTICATION LOGIC
const getMockUserProfile = async () => {
await new Promise(resolve => setTimeout(resolve, 250));
const mockProfile = {
id: 'admin-user-id',
username: 'admin',
email: 'admin@mavericks.com',
is_admin: true // Set to 'true' to test the admin view
};
return mockProfile;
};
const AdminRoute = ({ children }) => {
const navigate = useNavigate();
const [isAuthorized, setIsAuthorized] = useState(false);
const [loading, setLoading] = useState(true);
useEffect(() => {
const checkAdminStatus = async () => {
const userProfile = await getMockUserProfile();
if (userProfile && userProfile.is_admin === true) {
    setIsAuthorized(true);
  } else {
    console.log("Mock access denied. User is not an admin. Redirecting...");
    navigate('/'); 
  }
  setLoading(false);
};

checkAdminStatus();
}, [navigate]);
if (loading) {
return <div className="min-h-screen bg-[#0d1117] flex items-center justify-center text-white">Verifying access...</div>;
}
return isAuthorized ? children : null;
};
export default AdminRoute;