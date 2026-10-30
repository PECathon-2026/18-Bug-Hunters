"use client";

import { useRef, useState, useCallback } from "react";

type ComparisonSliderProps = {
  originalUrl: string;
  restoredUrl: string | null;
  labelRestored?: string;
};

export function ComparisonSlider({
  originalUrl,
  restoredUrl,
  labelRestored = "Restored",
}: ComparisonSliderProps) {
  const [pos, setPos] = useState(50);
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  const right = restoredUrl ?? originalUrl;
  const showingSame = !restoredUrl;

  const updatePosition = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percent = Math.min(100, Math.max(0, (x / rect.width) * 100));
    setPos(Math.round(percent * 10) / 10);
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    updatePosition(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDraggingRef.current) {
      updatePosition(e.clientX);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDraggingRef.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-3">
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className={`relative cursor-ew-resize select-none overflow-hidden rounded-md border border-[var(--border)] bg-black transition-all ${
          isFullscreen
            ? "fixed inset-4 z-50 flex items-center justify-center bg-black/95 shadow-2xl"
            : "h-[380px] w-full"
        }`}
      >
        <div
          className="relative h-full w-full"
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: "center center",
          }}
        >
          {/* Restored / Target layer */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={right}
            alt={labelRestored}
            className="absolute inset-0 h-full w-full object-contain"
            draggable={false}
          />

          {/* Original layer clipped to slider position */}
          <div
            className="absolute inset-y-0 left-0 overflow-hidden"
            style={{ width: `${pos}%` }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={originalUrl}
              alt="Original"
              className="absolute left-0 top-0 h-full max-w-none object-contain"
              style={{ width: `${100 / (pos / 100 || 0.001)}%` }}
              draggable={false}
            />
          </div>

          {/* Vertical divider line & Japanese-styled brass handle */}
          <div
            className="pointer-events-none absolute inset-y-0 w-0.5 bg-[var(--gold)] shadow-[0_0_8px_rgba(196,163,90,0.8)]"
            style={{ left: `${pos}%` }}
          >
            <div className="absolute top-1/2 -left-3.5 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full border-2 border-[var(--void)] bg-[var(--gold)] text-[10px] font-bold text-[var(--void)] shadow-[0_0_10px_rgba(196,163,90,0.9)]">
              ‹›
            </div>
          </div>
        </div>

        {/* Labels */}
        <span className="pointer-events-none absolute left-3 top-3 rounded-sm bg-black/75 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider text-[var(--moonlight)] border border-[rgba(255,255,255,0.1)]">
          Original Raw
        </span>
        <span className="pointer-events-none absolute right-3 top-3 rounded-sm bg-black/75 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider text-[var(--gold-soft)] border border-[rgba(196,163,90,0.3)]">
          {showingSame ? "Awaiting enhancement" : labelRestored}
        </span>

        {/* Fullscreen toggle button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsFullscreen((prev) => !prev);
          }}
          className="absolute right-3 bottom-3 rounded-sm bg-[rgba(11,18,32,0.8)] px-2.5 py-1 text-xs text-[var(--mist)] border border-[var(--border)] hover:text-[var(--moonlight)]"
        >
          {isFullscreen ? "Exit Fullscreen" : "Fullscreen View"}
        </button>
      </div>

      {/* Interactive Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
        <div className="flex items-center gap-3">
          <label className="text-xs text-[var(--mist)] flex items-center gap-2">
            Zoom
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="accent-[var(--gold)]"
            />
            <span className="text-[var(--moonlight)] font-mono text-xs">
              {zoom.toFixed(1)}x
            </span>
          </label>

          <button
            type="button"
            className="rounded-sm border border-[var(--border)] px-2 py-1 text-xs text-[var(--gold)] hover:bg-[rgba(196,163,90,0.1)]"
            onClick={() => {
              setZoom(1);
              setPos(50);
            }}
          >
            Reset to fit
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-[var(--mist)]">
          <span>Split: {pos.toFixed(0)}%</span>
          <input
            type="range"
            min={0}
            max={100}
            value={pos}
            onChange={(e) => setPos(Number(e.target.value))}
            className="w-24 accent-[var(--gold)]"
            aria-label="Split position"
          />
        </div>
      </div>
    </div>
  );
}
