import { supabase } from "../lib/supabaseClient";

class AuthService {
  static async signInWithMicrosoft() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "azure",
      options: {
        scopes: "email",
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  static async getSession() {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      throw new Error(error.message);
    }

    return session;
  }

  static async getCurrentUser() {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      throw new Error(error.message);
    }

    return user;
  }

  static async signOut() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw new Error(error.message);
    }
  }
}

export default AuthService;
