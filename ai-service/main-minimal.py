import os
import logging
from io import BytesIO
from typing import Dict, Any
import uvicorn
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import random
import json
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Medical Waste Detection API",
    description="AI-powered medical waste detection (Demo Mode)",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mock waste detection
def mock_waste_detection() -> Dict[str, Any]:
    """Mock waste detection for demo purposes"""
    waste_types = [
        {'label': 'Syringe', 'confidence': 0.85 + random.random() * 0.1},
        {'label': 'Mask', 'confidence': 0.78 + random.random() * 0.15},
        {'label': 'Gloves', 'confidence': 0.82 + random.random() * 0.12},
        {'label': 'Medicine bottle', 'confidence': 0.90 + random.random() * 0.08}
    ]
    
    detection = random.choice(waste_types)
    
    return {
        "label": detection['label'],
        "confidence": round(detection['confidence'], 3),
        "detections": [detection],
        "image_info": {
            "width": 640,
            "height": 480,
            "channels": 3
        }
    }

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Medical Waste Detection API (Demo Mode)",
        "version": "1.0.0",
        "status": "running",
        "mode": "demo"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "mode": "demo",
        "timestamp": datetime.now().isoformat()
    }

@app.post("/predict")
async def predict_waste(file: UploadFile = File(...)):
    """Predict medical waste from uploaded image (Demo Mode)"""
    try:
        # Validate file type
        if not file.content_type.startswith('image/'):
            raise HTTPException(
                status_code=400, 
                detail="Invalid file type. Please upload an image."
            )
        
        # Read image data (just to validate)
        image_data = await file.read()
        
        # Validate it's a valid image
        try:
            image = Image.open(BytesIO(image_data))
            if image.mode != 'RGB':
                image = image.convert('RGB')
        except Exception as e:
            raise HTTPException(status_code=400, detail="Invalid image file")
        
        # Perform mock detection
        result = mock_waste_detection()
        
        logger.info(f"Detection successful: {result['label']} ({result['confidence']:.3f})")
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {str(e)}"
        )

@app.get("/model/info")
async def model_info():
    """Get information about the model"""
    return {
        "model_type": "Demo Mode",
        "mode": "mock_detection",
        "supported_waste_types": ["Syringe", "Mask", "Gloves", "Medicine bottle"],
        "note": "This is running in demo mode with mock AI detection"
    }

@app.get("/classes")
async def get_supported_classes():
    """Get supported waste classes"""
    return {
        "waste_classes": ["Syringe", "Mask", "Gloves", "Medicine bottle"],
        "total_classes": 4,
        "mode": "demo"
    }

if __name__ == "__main__":
    logger.info("Starting Medical Waste Detection API (Demo Mode)...")
    uvicorn.run(
        "main-minimal:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
