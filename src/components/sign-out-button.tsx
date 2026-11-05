"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function SignOutButton({ label = "Sign out" }: { label?: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function signOut() {
    setPending(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={signOut}
      disabled={pending}
      className="btn btn-ghost btn-sm inline-flex"
    >
      {pending ? "…" : label}
    </button>
  );
}
