"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * /edit/new — Crea un draft nuevo y redirige a /edit/[id].
 *
 * Implementación cliente para evitar side effects en un Server Component
 * GET. Una vez creado, useRouter().replace() reemplaza la entrada del
 * historial para que el botón Atrás del navegador no vuelva acá.
 */
export default function NewDraftPage() {
  const router = useRouter();
  const yaDisparado = useRef(false);

  useEffect(() => {
    if (yaDisparado.current) return;
    yaDisparado.current = true;

    fetch("/api/boletines", { method: "POST" })
      .then((res) => {
        if (!res.ok) throw new Error("create failed");
        return res.json();
      })
      .then((draft) => {
        router.replace(`/edit/${draft.id}`);
      })
      .catch((err) => {
        console.error(err);
        router.replace("/");
      });
  }, [router]);

  return (
    <main className="flex min-h-[60vh] items-center justify-center font-sans text-slate-500">
      Creando draft…
    </main>
  );
}
