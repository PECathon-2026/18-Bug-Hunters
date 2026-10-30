"""ONNX Real-ESRGAN restoration with tiled CPU inference."""

from __future__ import annotations

import os
from pathlib import Path

import cv2
import numpy as np
import onnxruntime as ort
from huggingface_hub import hf_hub_download

MODEL_DIR = Path(__file__).resolve().parent.parent / "models"
MODEL_PATH = MODEL_DIR / "realesr-general-x4v3.onnx"
# Public ONNX export of Real-ESRGAN general x4v3 (~5MB)
HF_REPO = "Heliosoph/realesrgan-onnx"
HF_FILE = "realesr-general-x4v3.onnx"

_session: ort.InferenceSession | None = None


def ensure_model() -> Path:
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    if MODEL_PATH.exists() and MODEL_PATH.stat().st_size > 1000:
        return MODEL_PATH
    # Allow offline path via env
    env_path = os.environ.get("SPIRIT_LENS_MODEL_PATH")
    if env_path and Path(env_path).exists():
        return Path(env_path)
    downloaded = hf_hub_download(repo_id=HF_REPO, filename=HF_FILE, local_dir=str(MODEL_DIR))
    return Path(downloaded)


def get_session() -> ort.InferenceSession:
    global _session
    if _session is None:
        model = ensure_model()
        _session = ort.InferenceSession(
            str(model),
            providers=["CPUExecutionProvider"],
        )
    return _session


def _infer_tile(session: ort.InferenceSession, tile_rgb: np.ndarray) -> np.ndarray:
    arr = tile_rgb.astype(np.float32) / 255.0
    arr = np.transpose(arr, (2, 0, 1))[None, ...]
    input_name = session.get_inputs()[0].name
    out = session.run(None, {input_name: arr})[0][0]
    out = np.transpose(out, (1, 2, 0))
    out = np.clip(out * 255.0, 0, 255).astype(np.uint8)
    return out


def restore_image_bgr(
    image_bgr: np.ndarray,
    tile: int = 128,
    overlap: int = 16,
    max_side: int = 768,
) -> np.ndarray:
    """
    Run Real-ESRGAN x4 then downscale back to original size so comparison
    keeps the same framing while still applying learned restoration.
    """
    if image_bgr is None or image_bgr.size == 0:
        raise ValueError("Empty image")

    h0, w0 = image_bgr.shape[:2]
    scale = 1.0
    if max(h0, w0) > max_side:
        scale = max_side / float(max(h0, w0))
        image_bgr = cv2.resize(
            image_bgr,
            (int(w0 * scale), int(h0 * scale)),
            interpolation=cv2.INTER_AREA,
        )

    rgb = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2RGB)
    h, w, _ = rgb.shape
    session = get_session()

    # Pad to tile grid
    pad_h = (tile - h % tile) % tile
    pad_w = (tile - w % tile) % tile
    padded = np.pad(rgb, ((0, pad_h), (0, pad_w), (0, 0)), mode="reflect")
    ph, pw, _ = padded.shape
    out_h, out_w = ph * 4, pw * 4
    output = np.zeros((out_h, out_w, 3), dtype=np.float32)
    weight = np.zeros((out_h, out_w, 1), dtype=np.float32)

    step = max(tile - overlap, 1)
    for y in range(0, ph, step):
        for x in range(0, pw, step):
            y1 = min(y + tile, ph)
            x1 = min(x + tile, pw)
            y0 = y1 - tile
            x0 = x1 - tile
            tile_img = padded[y0:y1, x0:x1]
            up = _infer_tile(session, tile_img).astype(np.float32)
            oy0, ox0 = y0 * 4, x0 * 4
            oy1, ox1 = y1 * 4, x1 * 4
            output[oy0:oy1, ox0:ox1] += up
            weight[oy0:oy1, ox0:ox1] += 1.0

    output = output / np.maximum(weight, 1e-6)
    output = output[: h * 4, : w * 4].astype(np.uint8)
    # Return to original (possibly downscaled) resolution for slider compare
    restored = cv2.resize(output, (w, h), interpolation=cv2.INTER_AREA)
    restored_bgr = cv2.cvtColor(restored, cv2.COLOR_RGB2BGR)

    if scale != 1.0:
        restored_bgr = cv2.resize(restored_bgr, (w0, h0), interpolation=cv2.INTER_CUBIC)
    return restored_bgr
