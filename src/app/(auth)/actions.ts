"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface AuthState {
  error?: string;
  message?: string;
}

// Turn Supabase's technical errors into friendly sentences.
function friendly(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login")) return "That email or password is not right. Please try again.";
  if (m.includes("already registered")) return "There is already an account with that email. Try logging in instead.";
  if (m.includes("email not confirmed")) return "Please confirm your email first. Check your inbox for our message.";
  if (m.includes("rate limit")) return "Too many tries. Please wait a minute and try again.";
  console.error("[auth]", message); // full detail in the terminal running `npm run dev`
  if (m.includes("password")) return "That password is not accepted. Please try a longer or stronger one.";
  if (m.includes("email") && m.includes("invalid")) return "That email address does not look right.";
  // While developing, show the real reason so problems are easy to fix.
  if (process.env.NODE_ENV === "development") return `Something went wrong: ${message}`;
  return "Something went wrong. Please try again.";
}

function readForm(formData: FormData) {
  return {
    email: String(formData.get("email") ?? "").trim(),
    password: String(formData.get("password") ?? ""),
  };
}

export async function login(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const { email, password } = readForm(formData);
  if (!email || !password) return { error: "Please enter your email and password." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: friendly(error.message) };
  redirect("/dashboard");
}

export async function signup(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const { email, password } = readForm(formData);
  if (!email) return { error: "Please enter your email." };
  if (password.length < 8) return { error: "Please choose a password with at least 8 characters." };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return { error: friendly(error.message) };

  // If email confirmation is switched on in Supabase, there is no session yet.
  if (!data.session) {
    return { message: "Almost there! We sent you an email. Click the link in it, then log in." };
  }
  redirect("/dashboard"); // Phase 3 will send new users to onboarding first.
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
