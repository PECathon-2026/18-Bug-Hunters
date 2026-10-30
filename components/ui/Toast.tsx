"use client";

import { useEffect } from "react";

type ToastProps = {
  message: string | null;
  onClose: () => void;
  tone?: "info" | "error" | "success";
};

export function Toast({ message, onClose, tone = "info" }: ToastProps) {
  useEffect(() => {
    if (!message) return;
    const id = window.setTimeout(onClose, 4000);
    return () => window.clearTimeout(id);
  }, [message, onClose]);

  if (!message) return null;

  const border =
    tone === "error"
      ? "border-[rgba(163,59,59,0.5)]"
      : tone === "success"
        ? "border-[rgba(61,122,95,0.5)]"
        : "border-[var(--border-strong)]";

  return (
    <div
      role="status"
      className={`fixed bottom-4 right-4 z-50 max-w-sm rounded-md border ${border} bg-[rgba(11,18,32,0.95)] px-4 py-3 text-sm text-[var(--moonlight)] shadow-lg`}
    >
      {message}
    </div>
  );
}
