// src/components/ProtectedRoute.jsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute() {
  const { session, isAuthInitializing } = useAuth();

  //  MUST wait until Supabase finishes reading localStorage
  if (isAuthInitializing) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20%' }}>
        <p>Checking authentication...</p>
      </div>
    );
  }

  // 2. Only redirect to login if initialization is DONE and there is no session
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}