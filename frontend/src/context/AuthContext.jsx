// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [isAuthInitializing, setIsAuthInitializing] = useState(true);

  useEffect(() => {
    let isMounted = true;

    // Initial Session Load
    async function loadInitialSession() {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (isMounted) setSession(currentSession);
      } catch (error) {
        console.error("Error loading session:", error);
      } finally {
        if (isMounted) setIsAuthInitializing(false);
      }
    }

    loadInitialSession();

    // Listen to Supabase Auth State Changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, currentSession) => {
        if (isMounted) {
          setSession(currentSession);
          setIsAuthInitializing(false);
        }
      }
    );

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  // seperating the auth context(session, isAuthenticated, isAuthInitializing) 
  // from teh user context (user, isUserLoading, userError) 
  const value = {
    session,
    isAuthenticated: !!session,
    isAuthInitializing,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }
  return context;
}