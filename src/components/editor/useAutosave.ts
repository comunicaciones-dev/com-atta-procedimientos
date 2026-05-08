"use client";

import { useEffect, useRef, useState } from "react";
import type { Boletin } from "@/lib/schema";

export type SaveState =
  | { status: "idle" }
  | { status: "guardando" }
  | { status: "guardado"; at: number }
  | { status: "error"; message: string };

/**
 * Autoguardado: PUT a /api/boletines/[id] con debounce de 800 ms desde el
 * último cambio. La firma del boletín se compara con JSON.stringify; si
 * no cambió respecto a lo último guardado, no se vuelve a llamar a la API.
 *
 * Devuelve el estado actual de guardado para mostrar indicador en UI.
 */
export function useAutosave(boletin: Boletin, debounceMs = 800): SaveState {
  const [state, setState] = useState<SaveState>({ status: "idle" });
  const lastSaved = useRef<string>(JSON.stringify(boletin));
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const aborter = useRef<AbortController | null>(null);

  useEffect(() => {
    const next = JSON.stringify(boletin);
    if (next === lastSaved.current) return;
    if (boletin.status === "published") return;

    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      if (aborter.current) aborter.current.abort();
      const ac = new AbortController();
      aborter.current = ac;
      setState({ status: "guardando" });
      try {
        const res = await fetch(`/api/boletines/${boletin.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: next,
          signal: ac.signal,
        });
        if (!res.ok) {
          const body = await res.text().catch(() => "");
          throw new Error(`HTTP ${res.status} · ${body.slice(0, 100)}`);
        }
        lastSaved.current = next;
        setState({ status: "guardado", at: Date.now() });
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setState({
          status: "error",
          message: (err as Error).message ?? "Error desconocido",
        });
      }
    }, debounceMs);

    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [boletin, debounceMs]);

  return state;
}
