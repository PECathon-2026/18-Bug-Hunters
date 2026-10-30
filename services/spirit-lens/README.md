# Spirit Lens service

Local FastAPI service for qualitative ONNX restoration and classical source detection.

```bash
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Endpoints:

- `GET /health`
- `POST /restore` (multipart file) → PNG
- `POST /detect` (multipart file) → JSON candidates

Disclaimer: restoration is not scientifically validated detail.
