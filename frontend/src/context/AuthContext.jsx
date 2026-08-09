import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import User from "../models/user";
import { supabase } from "../lib/supabaseClient";
import apiClient from "../lib/apiClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadInitialSession() {
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();

      if (isMounted) {
        setSession(currentSession);
        // Don't set isLoading to false here - wait for API call
      }
    }

    loadInitialSession();

    // Single subscription for all auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        // Handle token refresh
        if (event === "TOKEN_REFRESHED") {
          console.log("Token refreshed automatically");
        }

        // Update session for ALL events
        if (isMounted) {
          setSession(currentSession);
          // Don't set isLoading to false here - wait for API call
        }
      }
    );

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []);




  useEffect(() => {
    async function fetchCurrentUser() {
      try {
        console.log("Fetching current user from /auth/me...");
        
        const response = await apiClient.get("/auth/me");
        
        if (response.data) {
          console.log("User fetched successfully:", response.data);
          setCurrentUser(User.fromApiResponse(response.data));
          setIsAuthenticated(true);
        } else {
          console.warn("No user data in response");
          setCurrentUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Error fetching current user:", error.response?.status, error.message);
        setCurrentUser(null);
        setIsAuthenticated(false);
      } finally {
        // Set loading to false AFTER API call completes
        setIsLoading(false);
      }
    }

    if (session) {
      fetchCurrentUser();
    } else {
      // If no session, stop loading immediately
      setIsLoading(false);
      setIsAuthenticated(false);
      setCurrentUser(null);
    }
  }, [session]); 

  const value = {
    session,
    user: currentUser,
    isAuthenticated: isAuthenticated,
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider."
    );
  }

  return context;
}
