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
  const [isInitializing, setIsInitializing] = useState(true); 

  useEffect(() => {
    let isMounted = true;

    async function loadInitialSession() {
      try {
        const {
          data: { session: currentSession },
        } = await supabase.auth.getSession();

        if (isMounted) {
          setSession(currentSession);
        }
      } catch (error) {
        console.error("Error loading initial session:", error);
      } finally {
        if (isMounted) {
          setIsInitializing(false);
        }
      }
    }

    loadInitialSession();

    // Single subscription for all auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        // Update session for ALL events
        if (isMounted) {
          setSession(currentSession);
          setIsInitializing(false);
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
        const response = await apiClient.get("/auth/me");
        
        if (response.data) {
          try {
            const user = User.fromApiResponse(response.data);
            setCurrentUser(user);
            setIsAuthenticated(true);
          } catch (parseError) {
            console.error("Error parsing user data:", parseError);
            setCurrentUser(null);
            setIsAuthenticated(false);
          }
        } else {
          console.warn("No user data in response");
          setCurrentUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Error fetching current user:", error.message);
        setCurrentUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    }

    if (isInitializing) {
      setIsLoading(true);
      return;
    }

    if (session) {
      fetchCurrentUser();
    } else {
      setIsLoading(false);
      setIsAuthenticated(false);
      setCurrentUser(null);
    }
  }, [session, isInitializing]); 

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
