"use client";

import React, { useState, useRef, useCallback } from "react";
import { Sparkles } from "lucide-react";

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
  title?: string;
}

export default function BeforeAfterSlider({
  beforeImage,
  afterImage,
  beforeLabel = "Öncesi (Before)",
  afterLabel = "Sonrası (After)",
  title,
}: BeforeAfterSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const pos = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(pos);
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches[0]) handleMove(e.touches[0].clientX);
    },
    [handleMove]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isDragging.current) handleMove(e.clientX);
    },
    [handleMove]
  );

  return (
    <div className="space-y-2">
      {title && (
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-white flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> {title}
          </span>
          <span className="text-slate-500 font-mono text-[11px]">
            %{Math.round(sliderPosition)} Görünüm
          </span>
        </div>
      )}

      <div
        ref={containerRef}
        className="relative w-full aspect-video sm:aspect-[16/10] rounded-2xl overflow-hidden select-none border border-slate-800 shadow-2xl cursor-ew-resize bg-slate-950"
        onMouseDown={() => (isDragging.current = true)}
        onMouseUp={() => (isDragging.current = false)}
        onMouseLeave={() => (isDragging.current = false)}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
      >
        {/* After Image (Background full) */}
        <img
          src={afterImage}
          alt={afterLabel}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />
        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-indigo-600/80 backdrop-blur-md text-[10px] font-black text-white uppercase tracking-wider shadow-lg">
          {afterLabel}
        </div>

        {/* Before Image (Clipped overlay) */}
        <div
          className="absolute inset-y-0 left-0 overflow-hidden pointer-events-none"
          style={{ width: `${sliderPosition}%` }}
        >
          <img
            src={beforeImage}
            alt={beforeLabel}
            className="absolute inset-y-0 left-0 w-full h-full object-cover max-w-none"
            style={{ width: containerRef.current ? `${containerRef.current.clientWidth}px` : "100%" }}
          />
          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-slate-900/80 backdrop-blur-md text-[10px] font-black text-slate-200 uppercase tracking-wider shadow-lg border border-white/10">
            {beforeLabel}
          </div>
        </div>

        {/* Vertical Divider Handle */}
        <div
          className="absolute inset-y-0 w-1 bg-white shadow-[0_0_12px_rgba(255,255,255,0.8)] pointer-events-none z-10 -translate-x-1/2"
          style={{ left: `${sliderPosition}%` }}
        >
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white text-slate-900 flex items-center justify-center shadow-2xl border-2 border-indigo-600 font-bold text-xs">
            ⇄
          </div>
        </div>
      </div>
    </div>
  );
}
