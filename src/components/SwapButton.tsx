"use client";

import { useActionState } from "react";
import { swapExercise, type SwapState } from "@/app/(app)/actions";

// "Swap exercise" button. Shows a friendly message if no swap is possible.
export default function SwapButton({ itemId, disabled }: { itemId: string; disabled?: boolean }) {
  const [state, action, pending] = useActionState<SwapState, FormData>(swapExercise, {});
  return (
    <form action={action} className="inline">
      <input type="hidden" name="itemId" value={itemId} />
      <button
        type="submit"
        disabled={pending || disabled}
        className="rounded-full border-2 border-accent px-5 py-3 text-base font-semibold text-accent hover:bg-accent-soft disabled:opacity-50"
      >
        {pending ? "Swapping…" : "Swap exercise"}
      </button>
      {state.error && (
        <p role="alert" className="mt-2 max-w-md rounded-xl bg-amber-50 px-3 py-2 text-base text-amber-900">
          {state.error}
        </p>
      )}
    </form>
  );
}
