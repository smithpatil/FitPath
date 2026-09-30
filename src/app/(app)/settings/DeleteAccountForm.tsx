"use client";

import { useActionState } from "react";
import { deleteAccount, type DeleteState } from "./actions";

// No pop-up: the user confirms by typing DELETE.
export default function DeleteAccountForm() {
  const [state, action, pending] = useActionState<DeleteState, FormData>(deleteAccount, {});
  return (
    <form action={action} className="mt-4 space-y-4">
      <div>
        <label htmlFor="confirm" className="block font-medium">
          Type DELETE to confirm
        </label>
        <input
          id="confirm"
          name="confirm"
          type="text"
          autoComplete="off"
          className="mt-1 w-full max-w-xs rounded-xl border-2 border-gray-500 px-4 py-3"
        />
      </div>
      {state.error && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-red-800">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-red-700 px-8 py-3 text-lg font-semibold text-white hover:bg-red-800 disabled:opacity-60"
      >
        {pending ? "Deleting…" : "Delete my account"}
      </button>
    </form>
  );
}
