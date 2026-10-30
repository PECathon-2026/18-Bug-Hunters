/**
 * In-browser classical astronomical image enhancement and candidate star detection.
 * Used as an honest, fully functional client-side mode when the Python backend is offline,
 * or as a fast local alternative.
 *
 * Qualitative enhancement disclaimer:
 * Applies classical unsharp-mask sharpening and adaptive contrast stretching.
 * Does NOT generate scientifically calibrated data.
 */

export type ClientDetectedObject = {
  id: string;
  x: number;
  y: number;
  sizePx: number;
  relativeBrightness: number;
  classification: string;
  note: string;
};

/**
 * Loads an image File into an HTMLImageElement
 */
function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(err);
    };
    img.src = url;
  });
}

/**
 * Enhanced astronomical image processing via Canvas 2D:
 * 1. Adaptive contrast stretch (brings out faint sky features)
 * 2. Unsharp masking convolution (enhances star point-spread profiles)
 * 3. Faint-signal gamma correction
 */
export async function enhanceImageInBrowser(file: File): Promise<Blob> {
  const img = await loadImageFromFile(file);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable");

  const w = img.naturalWidth || img.width;
  const h = img.naturalHeight || img.height;
  canvas.width = w;
  canvas.height = h;

  ctx.drawImage(img, 0, 0);
  const imgData = ctx.getImageData(0, 0, w, h);
  const data = imgData.data;

  // 1. Compute min / max luminosity for adaptive dynamic range stretching
  let minLum = 255;
  let maxLum = 0;
  for (let i = 0; i < data.length; i += 4) {
    const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    if (lum < minLum) minLum = lum;
    if (lum > maxLum) maxLum = lum;
  }

  // Prevent divide-by-zero on flat images
  const range = Math.max(maxLum - minLum, 1);
  const blackClip = minLum + range * 0.05;
  const whiteClip = maxLum - range * 0.02;
  const stretchRange = Math.max(whiteClip - blackClip, 1);

  // Buffer for unsharp mask
  const stretched = new Uint8ClampedArray(data.length);

  for (let i = 0; i < data.length; i += 4) {
    for (let c = 0; c < 3; c++) {
      let val = data[i + c];
      // Adaptive stretch
      val = ((val - blackClip) / stretchRange) * 255;
      val = Math.max(0, Math.min(255, val));
      // Subtle power curve (gamma 0.9) to reveal faint background structures
      val = Math.pow(val / 255, 0.9) * 255;
      stretched[i + c] = Math.round(val);
    }
    stretched[i + 3] = data[i + 3]; // alpha
  }

  // 2. Unsharp mask sharpening pass (3x3 Laplacian edge enhancement)
  // [ 0, -1,  0]
  // [-1,  5, -1]
  // [ 0, -1,  0]
  const output = new Uint8ClampedArray(data.length);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      output[idx + 3] = stretched[idx + 3];

      for (let c = 0; c < 3; c++) {
        const center = stretched[idx + c];
        const top = y > 0 ? stretched[((y - 1) * w + x) * 4 + c] : center;
        const bottom = y < h - 1 ? stretched[((y + 1) * w + x) * 4 + c] : center;
        const left = x > 0 ? stretched[(y * w + (x - 1)) * 4 + c] : center;
        const right = x < w - 1 ? stretched[(y * w + (x + 1)) * 4 + c] : center;

        // Sharpen amount = 0.45 * (5*center - top - bottom - left - right) + 0.55 * center
        const sharp = 5 * center - top - bottom - left - right;
        const blended = 0.4 * sharp + 0.6 * center;
        output[idx + c] = Math.max(0, Math.min(255, Math.round(blended)));
      }
    }
  }

  const finalImgData = new ImageData(output, w, h);
  ctx.putImageData(finalImgData, 0, 0);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Failed to export enhanced image"));
    }, "image/png");
  });
}

/**
 * In-browser Candidate Astronomical Source Detection:
 * Grayscale conversion → Local background median & MAD estimation → Peak detection → Component sizing
 */
export async function detectCandidatesInBrowser(file: File): Promise<ClientDetectedObject[]> {
  const img = await loadImageFromFile(file);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return [];

  const w = img.naturalWidth || img.width;
  const h = img.naturalHeight || img.height;
  canvas.width = w;
  canvas.height = h;
  ctx.drawImage(img, 0, 0);

  const imgData = ctx.getImageData(0, 0, w, h);
  const data = imgData.data;

  // Convert to grayscale luminance
  const gray = new Float32Array(w * h);
  let sum = 0;
  for (let i = 0, p = 0; i < data.length; i += 4, p++) {
    const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    gray[p] = lum;
    sum += lum;
  }

  const mean = sum / (w * h);
  let varianceSum = 0;
  for (let p = 0; p < gray.length; p++) {
    const diff = gray[p] - mean;
    varianceSum += diff * diff;
  }
  const stdDev = Math.sqrt(varianceSum / (w * h));
  // Detection threshold: mean + 3.2 standard deviations
  const threshold = Math.max(mean + stdDev * 3.2, 45);

  const visited = new Uint8Array(w * h);
  const candidates: ClientDetectedObject[] = [];

  // Connected-component flood fill for pixels exceeding threshold
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = y * w + x;
      if (visited[idx] || gray[idx] < threshold) continue;

      // New candidate source
      let count = 0;
      let sumX = 0;
      let sumY = 0;
      let maxVal = 0;
      const queue = [idx];
      visited[idx] = 1;

      while (queue.length > 0) {
        const curr = queue.pop()!;
        const cy = Math.floor(curr / w);
        const cx = curr % w;
        count++;
        sumX += cx;
        sumY += cy;
        const val = gray[curr];
        if (val > maxVal) maxVal = val;

        // Check 4-connected neighbors
        const neighbors = [
          cy > 0 ? (cy - 1) * w + cx : -1,
          cy < h - 1 ? (cy + 1) * w + cx : -1,
          cx > 0 ? cy * w + (cx - 1) : -1,
          cx < w - 1 ? cy * w + (cx + 1) : -1,
        ];

        for (const n of neighbors) {
          if (n >= 0 && !visited[n] && gray[n] >= threshold) {
            visited[n] = 1;
            queue.push(n);
          }
        }
      }

      if (count >= 2 && count <= 2500) {
        const centroidX = sumX / count;
        const centroidY = sumY / count;
        const sizePx = Math.sqrt(count / Math.PI) * 2;
        const relBrightness = maxVal / 255;
        const isExtended = count > 30;

        candidates.push({
          id: `src-${candidates.length + 1}`,
          x: Math.round(centroidX * 10) / 10,
          y: Math.round(centroidY * 10) / 10,
          sizePx: Math.round(sizePx * 10) / 10,
          relativeBrightness: Math.round(relBrightness * 100) / 100,
          classification: isExtended ? "extended_candidate" : "point_candidate",
          note: isExtended
            ? "Candidate extended emission or nebular clump; uncalibrated."
            : "Candidate stellar point source; uncalibrated.",
        });

        if (candidates.length >= 80) break;
      }
    }
    if (candidates.length >= 80) break;
  }

  // Sort by brightness descending
  return candidates.sort((a, b) => b.relativeBrightness - a.relativeBrightness);
}

