"""Spirit Lens FastAPI service — restore + detect."""

from __future__ import annotations

import io
from typing import Any

import cv2
import numpy as np
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from PIL import Image

from app.detect import detect_candidates
from app.restore import ensure_model, restore_image_bgr

MAX_BYTES = 8 * 1024 * 1024
ALLOWED = {"image/jpeg", "image/png", "image/webp", "application/octet-stream"}

app = FastAPI(
    title="Tsukuyomi Spirit Lens",
    description="Qualitative astronomical image restoration and candidate detection.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _read_image(upload: UploadFile, data: bytes) -> np.ndarray:
    if len(data) > MAX_BYTES:
        raise HTTPException(status_code=400, detail="File exceeds 8 MB limit")
    if upload.content_type and upload.content_type not in ALLOWED:
        # Still try sniffing via Pillow
        pass
    try:
        img = Image.open(io.BytesIO(data))
        img = img.convert("RGB")
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=400, detail=f"Invalid image: {exc}") from exc
    arr = np.array(img)
    return cv2.cvtColor(arr, cv2.COLOR_RGB2BGR)


@app.get("/health")
def health() -> dict[str, Any]:
    model_ready = False
    try:
        path = ensure_model()
        model_ready = path.exists()
    except Exception as exc:  # noqa: BLE001
        return {
            "status": "degraded",
            "modelReady": False,
            "error": str(exc),
        }
    return {"status": "ok", "modelReady": model_ready}


@app.post("/restore")
async def restore(file: UploadFile = File(...)) -> Response:
    data = await file.read()
    if not data:
        raise HTTPException(status_code=400, detail="Empty upload")
    image = _read_image(file, data)
    try:
        restored = restore_image_bgr(image)
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=500, detail=f"Inference failed: {exc}") from exc
    ok, encoded = cv2.imencode(".png", restored)
    if not ok:
        raise HTTPException(status_code=500, detail="Failed to encode restored image")
    return Response(
        content=encoded.tobytes(),
        media_type="image/png",
        headers={
            "X-Tsukuyomi-Disclaimer": "Qualitative enhancement only; not scientific validation",
        },
    )


@app.post("/detect")
async def detect(file: UploadFile = File(...)) -> dict[str, Any]:
    data = await file.read()
    if not data:
        raise HTTPException(status_code=400, detail="Empty upload")
    image = _read_image(file, data)
    objects = detect_candidates(image)
    return {
        "objects": objects,
        "method": "median-threshold connected components",
        "disclaimer": "Candidates only — not confirmed astronomical classifications.",
    }
