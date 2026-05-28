import os, logging, json
from io import BytesIO
from pathlib import Path
import uvicorn
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Medical Waste Detection API", version="3.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

model = None
CLASSES = ["Syringe", "Mask", "Gloves", "Medicine bottle", "Cotton", "Bandage", "IV bag"]
MODEL_PATH = Path("models/medical_waste.pt")

def load_model():
    global model
    try:
        from ultralytics import YOLO
        if MODEL_PATH.exists():
            model = YOLO(str(MODEL_PATH))
            logger.info(f"Loaded trained model from {MODEL_PATH}")
        else:
            logger.warning("Trained model not found, run train.py first")
        return True
    except Exception as e:
        logger.error(f"Model load error: {e}")
        return False

@app.on_event("startup")
async def startup():
    os.makedirs("logs", exist_ok=True)
    load_model()
    logger.info("API ready")

@app.get("/")
async def root():
    return {"status": "running", "model_loaded": model is not None, "classes": CLASSES}

@app.get("/health")
async def health():
    return {"status": "healthy", "model_loaded": model is not None}

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Please upload an image file")

    try:
        data = await file.read()
        image = Image.open(BytesIO(data)).convert("RGB")

        if model is not None:
            results = model(image, verbose=False)
            probs = results[0].probs
            top_idx = int(probs.top1)
            confidence = float(probs.top1conf)
            label = CLASSES[top_idx] if top_idx < len(CLASSES) else "Other"
        else:
            raise HTTPException(status_code=503, detail="Model not loaded. Run train.py first.")

        logger.info(f"Detected: {label} ({confidence:.2f})")
        return {
            "label": label,
            "confidence": round(confidence, 3),
            "waste_type": label,
            "message": f"Detected {label} with {round(confidence * 100)}% confidence"
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    os.makedirs("logs", exist_ok=True)
    load_model()
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)
