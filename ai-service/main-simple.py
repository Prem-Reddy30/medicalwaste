import os
import logging
from io import BytesIO
from typing import List, Dict, Any
import uvicorn
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import numpy as np
import cv2

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

# Mock waste detection (since YOLOv8 has compatibility issues)
def mock_waste_detection(image: Image.Image) -> Dict[str, Any]:
    """Mock waste detection for demo purposes"""
    import random
    
    waste_types = [
        {'label': 'Syringe', 'confidence': 0.85 + random.random() * 0.1},
        {'label': 'Mask', 'confidence': 0.78 + random.random() * 0.15},
        {'label': 'Gloves', 'confidence': 0.82 + random.random() * 0.12},
        {'label': 'Medicine bottle', 'confidence': 0.90 + random.random() * 0.08}
    ]
    
    # Select random waste type
    detection = random.choice(waste_types)
    
    return {
        "label": detection['label'],
        "confidence": round(detection['confidence'], 3),
        "detections": [detection],
        "image_info": {
            "width": image.width,
            "height": image.height,
            "channels": len(image.getbands())
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
        "timestamp": "2024-01-15T10:30:00Z"
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
        
        # Read and process image
        image_data = await file.read()
        image = Image.open(BytesIO(image_data))
        
        # Convert to RGB if necessary
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Perform mock detection
        result = mock_waste_detection(image)
        
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
        "main-simple:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
