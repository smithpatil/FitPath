"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/** Switch between kg and lb (weights stay stored in kg). */
export async function saveUnits(formData: FormData) {
  const units = String(formData.get("units"));
  if (units !== "kg" && units !== "lb") return;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("profiles").update({ units }).eq("id", user.id);
  revalidatePath("/settings");
  revalidatePath("/progress");
}

export interface DeleteState {
  error?: string;
}

/** Permanently delete the account and all its data. The user must type DELETE first. */
export async function deleteAccount(_prev: DeleteState, formData: FormData): Promise<DeleteState> {
  if (String(formData.get("confirm") ?? "").trim() !== "DELETE") {
    return { error: "To delete your account, type the word DELETE in capital letters." };
  }
  const supabase = await createClient();
  // delete_my_account() is defined in supabase/schema.sql; it removes the user and (by cascade) all their rows.
  const { error } = await supabase.rpc("delete_my_account");
  if (error) {
    console.error("[delete account]", error.message);
    return { error: "We could not delete your account. Please try again." };
  }
  await supabase.auth.signOut({ scope: "local" }).catch(() => {});
  redirect("/");
}
