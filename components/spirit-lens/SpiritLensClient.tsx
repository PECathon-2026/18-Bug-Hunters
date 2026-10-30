"use client";

import { useEffect, useState } from "react";
import { ComparisonSlider } from "@/components/spirit-lens/ComparisonSlider";
import { SpiritLensDemoSection } from "@/components/spirit-lens/SpiritLensDemoSection";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { Toast } from "@/components/ui/Toast";
import { SPIRIT_LENS_SERVICE_URL } from "@/lib/constants";
import { validateImageFile } from "@/lib/spirit-lens/validate";
import {
  enhanceImageInBrowser,
  detectCandidatesInBrowser,
  type ClientDetectedObject,
} from "@/lib/spirit-lens/in-browser-engine";

export function SpiritLensClient() {
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [restoredUrl, setRestoredUrl] = useState<string | null>(null);
  const [activeFile, setActiveFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [loadingSample, setLoadingSample] = useState(false);
  const [serviceUp, setServiceUp] = useState<boolean | null>(null);
  const [objects, setObjects] = useState<ClientDetectedObject[]>([]);
  const [showOverlay, setShowOverlay] = useState(true);
  const [selectedObj, setSelectedObj] = useState<ClientDetectedObject | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [engineMode, setEngineMode] = useState<"browser" | "python">("browser");
  const [imageSize, setImageSize] = useState<{ w: number; h: number } | null>(null);

  async function checkHealth() {
    try {
      const res = await fetch(`${SPIRIT_LENS_SERVICE_URL}/health`, {
        signal: AbortSignal.timeout(3000),
      });
      setServiceUp(res.ok);
      if (res.ok) setEngineMode("python");
    } catch {
      setServiceUp(false);
      setEngineMode("browser");
    }
  }

  useEffect(() => {
    let cancelled = false;
    async function initCheck() {
      try {
        const res = await fetch(`${SPIRIT_LENS_SERVICE_URL}/health`, {
          signal: AbortSignal.timeout(3000),
        });
        if (!cancelled) {
          setServiceUp(res.ok);
          if (res.ok) setEngineMode("python");
        }
      } catch {
        if (!cancelled) {
          setServiceUp(false);
          setEngineMode("browser");
        }
      }
    }
    void initCheck();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (originalUrl && !originalUrl.startsWith("/images/")) {
        URL.revokeObjectURL(originalUrl);
      }
      if (restoredUrl && !restoredUrl.startsWith("/images/")) {
        URL.revokeObjectURL(restoredUrl);
      }
    };
  }, [originalUrl, restoredUrl]);

  function handleFiles(fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file) return;
    const validation = validateImageFile(file);
    if (!validation.ok) {
      setError(validation.error);
      return;
    }
    setError(null);
    setRestoredUrl(null);
    setObjects([]);
    setSelectedObj(null);
    setActiveFile(file);
    setFileName(file.name);
    if (originalUrl && !originalUrl.startsWith("/images/")) {
      URL.revokeObjectURL(originalUrl);
    }
    const url = URL.createObjectURL(file);
    setOriginalUrl(url);
    const img = new Image();
    img.onload = () => setImageSize({ w: img.width, h: img.height });
    img.src = url;
    setStatus("Image loaded. Choose In-Browser Classical Enhancement or Neural Service.");
  }

  // Handle loading demo sample image with 1-click
    async function handleLoadDemoSample(targetKey = "orion") {
      setLoadingSample(true);
      setError(null);
      try {
        const beforeUrl =
          targetKey === "orion"
            ? "/images/spirit-lens-realistic-before.jpg"
            : "/images/spirit-lens-before.jpg";
        const afterUrl =
          targetKey === "orion"
            ? "/images/spirit-lens-realistic-after.jpg"
            : "/images/spirit-lens-after.jpg";
        const sampleFileName =
          targetKey === "orion"
            ? "orion-m42-raw-telescope.jpg"
            : "lagoon-ngc6523-raw-sensor.jpg";

        const res = await fetch(beforeUrl);
        const blob = await res.blob();
        const file = new File([blob], sampleFileName, { type: "image/jpeg" });
        setActiveFile(file);
        setFileName(`${sampleFileName} (Sample)`);
        setOriginalUrl(beforeUrl);
        setRestoredUrl(afterUrl);
        setImageSize({ w: 1024, h: 1024 });

        // Run star detection on the sample
        const detected = await detectCandidatesInBrowser(file);
        setObjects(detected);
        setStatus(
          `Loaded authentic ${sampleFileName}. Restored frame and candidate star markers displayed below.`,
        );
        setToast("Loaded real astrophotography sample into Spirit Lens.");

        // Scroll to workbench
        document.getElementById("lens-workbench")?.scrollIntoView({ behavior: "smooth" });
      } catch {
        setError("Failed to load demo sample.");
      } finally {
        setLoadingSample(false);
      }
    }

    async function runRestore(file: File) {
      setBusy(true);
      setError(null);

      if (engineMode === "python" && serviceUp) {
        setStatus("Running neural ONNX restoration (Real-ESRGAN backend)…");
        try {
          const form = new FormData();
          form.append("file", file);
          const res = await fetch(`${SPIRIT_LENS_SERVICE_URL}/restore`, {
            method: "POST",
            body: form,
            signal: AbortSignal.timeout(180000),
          });
          if (!res.ok) {
            const text = await res.text();
            throw new Error(text || `Restore failed (${res.status})`);
          }
          const blob = await res.blob();
          if (restoredUrl && !restoredUrl.startsWith("/images/")) {
            URL.revokeObjectURL(restoredUrl);
          }
          setRestoredUrl(URL.createObjectURL(blob));
          setStatus(
            "Neural restoration complete. Output is qualitative enhancement — not scientifically validated detail.",
          );
          setToast("Restored image ready (Neural ONNX)");
        } catch (err) {
          setError(
            err instanceof Error
              ? err.message
              : "Python backend failed. Switch to In-Browser mode to restore.",
          );
        } finally {
          setBusy(false);
        }
      } else {
        setStatus("Running In-Browser Classical Astro Enhancement (Adaptive Contrast & Star Sharpening)…");
        try {
          const blob = await enhanceImageInBrowser(file);
          if (restoredUrl && !restoredUrl.startsWith("/images/")) {
            URL.revokeObjectURL(restoredUrl);
          }
          setRestoredUrl(URL.createObjectURL(blob));
          setStatus(
            "In-browser enhancement complete: Unsharp-mask star sharpening + adaptive dynamic range stretch.",
          );
          setToast("Enhanced image ready (In-Browser Classical Engine)");
        } catch (err) {
          setError(err instanceof Error ? err.message : "In-browser enhancement failed");
        } finally {
          setBusy(false);
        }
      }
    }

    async function runDetect(file: File) {
      setBusy(true);
      setError(null);

      if (engineMode === "python" && serviceUp) {
        setStatus("Detecting candidates via Python backend (OpenCV connected components)…");
        try {
          const form = new FormData();
          form.append("file", file);
          const res = await fetch(`${SPIRIT_LENS_SERVICE_URL}/detect`, {
            method: "POST",
            body: form,
            signal: AbortSignal.timeout(60000),
          });
          if (!res.ok) {
            const text = await res.text();
            throw new Error(text || `Detection failed (${res.status})`);
          }
          const data = await res.json();
          setObjects(data.objects ?? []);
          setStatus(
            `Detected ${(data.objects ?? []).length} candidate object(s). (Candidates only — not catalog IDs).`,
          );
        } catch (err) {
          setError(
            err instanceof Error
              ? err.message
              : "Python detection failed. Switching to In-Browser detector.",
          );
        } finally {
          setBusy(false);
        }
      } else {
        setStatus("Detecting candidates via In-Browser Luminance Threshold & Component Analysis…");
        try {
          const detected = await detectCandidatesInBrowser(file);
          setObjects(detected);
          setStatus(
            `Detected ${detected.length} candidate astronomical source(s) via In-Browser engine.`,
          );
        } catch (err) {
          setError(err instanceof Error ? err.message : "In-browser detection failed");
        } finally {
          setBusy(false);
        }
      }
    }

    async function withCurrentFile(action: (file: File) => Promise<void>) {
      if (activeFile) {
        await action(activeFile);
        return;
      }
      const input = document.getElementById(
        "spirit-file-input",
      ) as HTMLInputElement | null;
      const file = input?.files?.[0];
      if (!file) {
        setError("Upload an image first or click 'Try This Sample in Lens'.");
        return;
      }
      await action(file);
    }

    return (
      <div className="space-y-8 animate-fade-up">
        {/* 1. INTERACTIVE BEFORE VS AFTER TOOL DEMONSTRATION */}
        <SpiritLensDemoSection
          onLoadSample={handleLoadDemoSample}
          isLoadingSample={loadingSample}
        />

        {/* 2. ENGINE STATUS & HEALTH BAR */}
        <div className="ink-panel space-y-3 rounded-md p-4 text-sm text-[var(--mist)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span
                className={`h-2.5 w-2.5 rounded-full ${serviceUp
                    ? "bg-[var(--success)] shadow-[0_0_8px_#3d7a5f]"
                    : "bg-[var(--gold)]"
                  }`}
              />
              <span className="text-[var(--moonlight)] font-medium">
                Python Backend: {serviceUp === null ? "probing…" : serviceUp ? "Reachable (:8000)" : "Offline (In-Browser Fallback Active)"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--mist)]">Engine:</span>
              <select
                value={engineMode}
                onChange={(e) => setEngineMode(e.target.value as "browser" | "python")}
                className="rounded-sm border border-[var(--border)] bg-[rgba(5,7,13,0.8)] px-2 py-1 text-xs text-[var(--gold-soft)] outline-none"
              >
                <option value="browser">In-Browser Classical Engine (Always Ready)</option>
                <option value="python" disabled={!serviceUp}>
                  Neural Real-ESRGAN Python ({serviceUp ? "Ready" : "Offline"})
                </option>
              </select>
              <button
                type="button"
                onClick={() => void checkHealth()}
                className="rounded-sm border border-[var(--border)] px-2 py-1 text-xs text-[var(--mist)] hover:text-[var(--moonlight)]"
              >
                Check :8000
              </button>
            </div>
          </div>

          <p className="text-xs leading-relaxed text-[var(--mist)]">
            <strong>Scientific Integrity:</strong> Qualitative enhancement sharpens visual structures for inspection but does not invent scientifically validated astrophysical measurements. Original raw pixels are preserved client-side.
          </p>
        </div>

        {/* 3. UPLOAD DROPZONE & SAMPLE LAUNCHER */}
        <div
          id="lens-workbench"
          className="scroll-mt-20 ink-panel rounded-md border-dashed border-[var(--border-strong)] p-6 text-center space-y-3"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handleFiles(e.dataTransfer.files);
          }}
        >
          <p className="font-[family-name:var(--font-display)] text-xl text-[var(--gold-soft)]">
            Upload Your Own Sky Image
          </p>
          <p className="text-xs text-[var(--mist)]">
            JPEG, PNG, or WebP · max 8 MB · drag and drop or choose a file
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <input
              id="spirit-file-input"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="text-xs text-[var(--mist)] file:mr-3 file:rounded-sm file:border file:border-[var(--border)] file:bg-[rgba(196,163,90,0.12)] file:px-3 file:py-1.5 file:text-xs file:text-[var(--gold-soft)] hover:file:bg-[rgba(196,163,90,0.22)]"
              onChange={(e) => handleFiles(e.target.files)}
            />

            <button
              type="button"
              onClick={() => void handleLoadDemoSample("orion")}
              disabled={loadingSample}
              className="rounded-sm border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--gold-soft)] hover:bg-[rgba(196,163,90,0.1)] transition"
            >
              {loadingSample ? "Loading…" : "Load Orion Nebula Demo Sample"}
            </button>
          </div>

          {fileName ? (
            <p className="mt-2 text-xs font-mono text-[var(--moonlight)]">
              Active file: <span className="text-[var(--gold)]">{fileName}</span>
            </p>
          ) : null}
        </div>

        {error ? <ErrorState message={error} onRetry={() => setError(null)} /> : null}
        {busy ? <LoadingState label={status ?? "Processing…"} /> : null}
        {status && !busy ? (
          <p className="text-xs font-mono text-[var(--gold-soft)] bg-[rgba(196,163,90,0.08)] p-2.5 rounded-sm border border-[var(--border)]">
            {status}
          </p>
        ) : null}

        {/* 4. ACTIVE WORKBENCH WITH COMPARISON SLIDER & OBJECT DETECTOR */}
        {!originalUrl ? (
          <EmptyState
            title="No image loaded yet"
            message="Upload an astronomical photo above or click 'Try This Sample in Lens' in the demonstration showcase."
          />
        ) : (
          <>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={() => void withCurrentFile(runRestore)}
                className="rounded-sm bg-[var(--crimson)] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[var(--moonlight)] transition hover:bg-[var(--crimson-bright)] disabled:opacity-40 shadow-[0_0_10px_rgba(196,69,77,0.4)]"
              >
                Run restoration ({engineMode === "python" ? "Neural" : "In-Browser"})
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => void withCurrentFile(runDetect)}
                className="rounded-sm border border-[var(--border-strong)] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[var(--gold-soft)] transition hover:bg-[rgba(196,163,90,0.12)] disabled:opacity-40"
              >
                Detect candidate stars ({engineMode === "python" ? "Python" : "In-Browser"})
              </button>
              {restoredUrl ? (
                <a
                  href={restoredUrl}
                  download="tsukuyomi-restored.png"
                  className="rounded-sm border border-[var(--border)] px-4 py-2 text-xs text-[var(--moonlight)] hover:border-[var(--gold)]"
                >
                  Download enhanced image ⤓
                </a>
              ) : null}
            </div>

            <ComparisonSlider
              originalUrl={originalUrl}
              restoredUrl={restoredUrl}
              labelRestored={engineMode === "python" ? "Neural Restored" : "Astro Enhanced"}
            />

            <section className="ink-panel rounded-md p-4">
              <div className="mb-3 flex items-center justify-between gap-3 border-b border-[var(--border)] pb-2.5">
                <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--gold-soft)]">
                  Candidate Astronomical Objects ({objects.length})
                </h2>
                <label className="text-xs text-[var(--mist)] cursor-pointer flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={showOverlay}
                    onChange={(e) => setShowOverlay(e.target.checked)}
                    className="rounded accent-[var(--gold)]"
                  />
                  Show overlay markers
                </label>
              </div>

              <div className="relative overflow-hidden rounded-md border border-[var(--border)] bg-black">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={originalUrl}
                  alt="Detection base"
                  className="max-h-[380px] w-full object-contain"
                />
                {showOverlay && imageSize
                  ? objects.map((obj) => (
                    <button
                      key={obj.id}
                      type="button"
                      title={`${obj.id}: ${obj.classification}`}
                      onClick={() => setSelectedObj(obj)}
                      className={`absolute h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border transition ${selectedObj?.id === obj.id
                          ? "border-[var(--gold)] bg-[var(--gold)] shadow-[0_0_12px_#c4a35a]"
                          : "border-[var(--gold)] bg-[rgba(196,163,90,0.4)] hover:scale-125"
                        }`}
                      style={{
                        left: `${(obj.x / imageSize.w) * 100}%`,
                        top: `${(obj.y / imageSize.h) * 100}%`,
                      }}
                    />
                  ))
                  : null}
              </div>

              {objects.length === 0 ? (
                <p className="mt-3 text-xs text-[var(--mist)]">
                  No detections yet. Click &quot;Detect candidate stars&quot; above to find point and extended sources.
                </p>
              ) : (
                <ul className="mt-3 max-h-52 space-y-2 overflow-auto text-xs">
                  {objects.map((obj) => (
                    <li key={obj.id}>
                      <button
                        type="button"
                        className={`text-left transition ${selectedObj?.id === obj.id
                            ? "text-[var(--gold-soft)] font-medium"
                            : "text-[var(--mist)] hover:text-[var(--moonlight)]"
                          }`}
                        onClick={() => setSelectedObj(obj)}
                      >
                        <span className="text-[var(--gold)] font-mono">{obj.id}</span>: pixel ({obj.x.toFixed(0)}, {obj.y.toFixed(0)}) · size{" "}
                        {obj.sizePx.toFixed(1)} px · rel. brightness{" "}
                        {obj.relativeBrightness.toFixed(2)} · <span className="text-[var(--moonlight)] font-medium">{obj.classification}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {selectedObj ? (
                <div className="mt-3 border-t border-[var(--border)] pt-3 text-xs text-[var(--mist)] space-y-1">
                  <p>
                    Selected candidate: <span className="text-[var(--gold-soft)] font-semibold">{selectedObj.id}</span> ({selectedObj.classification})
                  </p>
                  <p>{selectedObj.note}</p>
                  <p className="text-[10px] text-[var(--mist)]/70">
                    Coordinates and sizes are in detector pixel units; brightness is normalized relative detector peak. Not an officially cataloged astronomical body.
                  </p>
                </div>
              ) : null}
            </section>
          </>
        )}

        <Toast message={toast} onClose={() => setToast(null)} tone="success" />
      </div>
    );
  }
