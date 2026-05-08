"use client";

import { useEffect, useRef, useState } from "react";
import { Boletin } from "@/components/boletin/Boletin";
import type { Boletin as BoletinModel } from "@/lib/schema";

/**
 * Preview en vivo del boletín. El artículo mide 980 px de ancho fijo;
 * para que entre en el panel disponible (que es típicamente menor)
 * usamos transform: scale dinámico. transform-origin: top center
 * mantiene el boletín centrado horizontalmente en el panel.
 */
export function EditorPreview({ boletin }: { boletin: BoletinModel }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    const ro = new ResizeObserver(() => {
      const w = el.clientWidth;
      // 980 (boletín) + 32 padding lateral target ≈ 1012.
      // Si el panel es más chico, escalamos. Si es más grande, no escalamos.
      const ideal = 1012;
      const next = Math.min(1, w / ideal);
      setScale(next);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={wrapperRef}
      className="h-full w-full overflow-y-auto overflow-x-hidden bg-[#eef0f4]"
    >
      <div
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "top center",
          width: "100%",
          padding: "16px 0",
        }}
      >
        <div className="uatta-page">
          <Boletin boletin={boletin} />
        </div>
      </div>
    </div>
  );
}
