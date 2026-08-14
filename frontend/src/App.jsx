import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import LandingPage from "./pages/landing/LandingPage";
import LoginPage from "./pages/auth/LoginPage";
import AuthCallbackPage from "./pages/auth/AuthCallbackPage";
import DashboardPage from "./pages/dashboard/DashboardPage";

// import the toast context provider
import { ToastProvider } from "./context/ToastContext";


function App() {
  return (
    <ToastProvider>


        <BrowserRouter>
          <AuthProvider>
          <Routes>
            {/* Public Landing Page - Default Route */}
            <Route
              path="/"
              element={<LandingPage />}
            />

            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/auth/callback"
              element={<AuthCallbackPage />}
            />

            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route
                path="/dashboard"
                element={<DashboardPage />}
              />
            </Route>

            {/* Catch all - redirect to dashboard */}
            <Route
              path="*"
              element={<Navigate to="/dashboard" replace />}
            />
          </Routes>
        </AuthProvider>
      </BrowserRouter>

      
    </ToastProvider>
  );
}

export default App;
