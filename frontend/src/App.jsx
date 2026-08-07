import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/auth/LoginPage";
import AuthCallbackPage from "./pages/auth/AuthCallbackPage";
import DashboardPage from "./pages/dashboard/DashboardPage";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Redirect root to dashboard */}
          <Route
            path="/"
            element={<Navigate to="/dashboard" replace />}
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
  );
}

export default App;
