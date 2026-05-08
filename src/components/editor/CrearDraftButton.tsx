"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function CrearDraftButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function crear() {
    setBusy(true);
    try {
      const res = await fetch("/api/boletines", { method: "POST" });
      if (!res.ok) throw new Error("create failed");
      const draft = await res.json();
      router.push(`/edit/${draft.id}`);
    } catch (err) {
      console.error(err);
      alert("No se pudo crear el draft. Revisar consola.");
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      disabled={busy}
      onClick={crear}
      className="rounded-md bg-u-red px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#c52a2f] disabled:opacity-60"
    >
      {busy ? "Creando…" : "Nuevo draft"}
    </button>
  );
}
