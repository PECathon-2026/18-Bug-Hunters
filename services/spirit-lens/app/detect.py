"""Classical candidate source detection (not ML classification)."""

from __future__ import annotations

import uuid
from typing import Any

import cv2
import numpy as np


def detect_candidates(image_bgr: np.ndarray, max_objects: int = 40) -> list[dict[str, Any]]:
    if image_bgr is None or image_bgr.size == 0:
        return []

    gray = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2GRAY)
    # Mild blur to reduce noise before thresholding
    blur = cv2.GaussianBlur(gray, (5, 5), 0)
    # Adaptive-ish threshold via median background
    med = float(np.median(blur))
    mad = float(np.median(np.abs(blur.astype(np.float32) - med))) + 1e-6
    thresh_val = med + 5.0 * mad
    _, mask = cv2.threshold(blur, thresh_val, 255, cv2.THRESH_BINARY)

    num_labels, labels, stats, centroids = cv2.connectedComponentsWithStats(mask, connectivity=8)
    objects: list[dict[str, Any]] = []
    h, w = gray.shape

    for i in range(1, num_labels):
        area = int(stats[i, cv2.CC_STAT_AREA])
        if area < 3 or area > (h * w) * 0.05:
            continue
        x = float(centroids[i, 0])
        y = float(centroids[i, 1])
        size_px = float(np.sqrt(area))
        # Relative brightness: mean pixel in component / global mean
        component = gray[labels == i]
        rel = float(component.mean() / (gray.mean() + 1e-6))
        classification = "extended_candidate" if area > 40 else "point_candidate"
        objects.append(
            {
                "id": f"obj-{uuid.uuid4().hex[:8]}",
                "x": x,
                "y": y,
                "sizePx": size_px,
                "relativeBrightness": rel,
                "classification": classification,
                "note": (
                    "Candidate from thresholded connected components. "
                    "Not a confirmed star/galaxy identification."
                ),
            }
        )

    objects.sort(key=lambda o: o["relativeBrightness"], reverse=True)
    return objects[:max_objects]
