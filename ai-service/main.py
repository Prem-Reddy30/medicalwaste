import os
import logging
from io import BytesIO
from typing import List, Dict, Any
import uvicorn
from fastapi import FastAPI, File, UploadFile, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from PIL import Image
import numpy as np
import cv2
from ultralytics import YOLO
import torch
from python_jose import jwt
import aiofiles
from datetime import datetime
import json

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/ai_service.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Medical Waste Detection API",
    description="AI-powered medical waste detection using YOLOv8",
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

# Global variables
model = None
waste_classes = ['bottle', 'cup', 'spoon', 'fork', 'knife']
medical_waste_mapping = {
    'bottle': 'Medicine bottle',
    'cup': 'Medicine container',
    'spoon': 'Medical utensil',
    'fork': 'Medical utensil',
    'knife': 'Medical instrument'
}

# Load environment variables
MODEL_PATH = os.getenv('MODEL_PATH', 'models/yolov8n.pt')
MODEL_CONFIDENCE = float(os.getenv('MODEL_CONFIDENCE', '0.5'))
MODEL_IOU_THRESHOLD = float(os.getenv('MODEL_IOU_THRESHOLD', '0.45'))
PORT = int(os.getenv('PORT', 8000))
DEBUG = os.getenv('DEBUG', 'false').lower() == 'true'

def load_model():
    """Load the YOLOv8 model"""
    global model
    try:
        logger.info(f"Loading YOLOv8 model from {MODEL_PATH}")
        
        # Check if model file exists, if not download it
        if not os.path.exists(MODEL_PATH):
            logger.info("Model file not found, downloading YOLOv8n model...")
            os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
            model = YOLO('yolov8n.pt')  # This will download the model
            model.save(MODEL_PATH)
        else:
            model = YOLO(MODEL_PATH)
        
        logger.info("Model loaded successfully")
        return True
    except Exception as e:
        logger.error(f"Failed to load model: {str(e)}")
        return False

def preprocess_image(image: Image.Image) -> np.ndarray:
    """Preprocess image for YOLOv8 inference"""
    # Convert PIL Image to numpy array
    image_array = np.array(image)
    
    # Convert RGB to BGR (OpenCV format)
    if len(image_array.shape) == 3 and image_array.shape[2] == 3:
        image_array = cv2.cvtColor(image_array, cv2.COLOR_RGB2BGR)
    
    return image_array

def detect_waste(image_array: np.ndarray) -> List[Dict[str, Any]]:
    """Perform waste detection on image"""
    try:
        # Run YOLOv8 inference
        results = model(
            image_array,
            conf=MODEL_CONFIDENCE,
            iou=MODEL_IOU_THRESHOLD,
            verbose=False
        )
        
        detections = []
        
        for result in results:
            boxes = result.boxes
            if boxes is not None:
                for box in boxes:
                    # Get class name and confidence
                    cls = int(box.cls[0])
                    conf = float(box.conf[0])
                    class_name = model.names[cls]
                    
                    # Check if this class is considered medical waste
                    if class_name in waste_classes:
                        detection = {
                            'class': class_name,
                            'medical_type': medical_waste_mapping[class_name],
                            'confidence': conf,
                            'bbox': box.xyxy[0].tolist(),  # [x1, y1, x2, y2]
                            'center': box.xywh[0][:2].tolist()  # [x_center, y_center]
                        }
                        detections.append(detection)
        
        return detections
    
    except Exception as e:
        logger.error(f"Detection failed: {str(e)}")
        return []

def get_best_detection(detections: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Get the best detection based on confidence"""
    if not detections:
        return None
    
    # Sort by confidence and return the best one
    best_detection = max(detections, key=lambda x: x['confidence'])
    return best_detection

# Startup event
@app.on_event("startup")
async def startup_event():
    """Initialize the model on startup"""
    logger.info("Starting Medical Waste Detection API...")
    
    # Create logs directory
    os.makedirs('logs', exist_ok=True)
    
    # Load model
    if not load_model():
        logger.error("Failed to load model. Exiting...")
        raise Exception("Model loading failed")
    
    logger.info("API startup completed successfully")

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Medical Waste Detection API",
        "version": "1.0.0",
        "status": "running",
        "model_loaded": model is not None
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "model_loaded": model is not None,
        "timestamp": datetime.now().isoformat()
    }

@app.post("/predict")
async def predict_waste(file: UploadFile = File(...)):
    """
    Predict medical waste from uploaded image
    
    Args:
        file: Image file to process
        
    Returns:
        JSON response with detection results
    """
    if not model:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
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
        
        # Preprocess image
        image_array = preprocess_image(image)
        
        # Perform detection
        detections = detect_waste(image_array)
        
        if not detections:
            # No waste detected, return default response
            return {
                "label": "No medical waste detected",
                "confidence": 0.0,
                "detections": [],
                "message": "No medical waste items were detected in the image. Please ensure the image contains clear medical waste items."
            }
        
        # Get best detection
        best_detection = get_best_detection(detections)
        
        # Prepare response
        response = {
            "label": best_detection['medical_type'],
            "confidence": round(best_detection['confidence'], 3),
            "detections": detections,
            "image_info": {
                "width": image.width,
                "height": image.height,
                "channels": len(image.getbands())
            }
        }
        
        logger.info(f"Detection successful: {best_detection['medical_type']} ({best_detection['confidence']:.3f})")
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {str(e)}"
        )

@app.post("/predict/batch")
async def predict_batch(files: List[UploadFile] = File(...)):
    """
    Predict medical waste from multiple images
    
    Args:
        files: List of image files to process
        
    Returns:
        JSON response with detection results for all images
    """
    if not model:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    if len(files) > 10:  # Limit batch size
        raise HTTPException(
            status_code=400,
            detail="Maximum 10 files allowed per batch"
        )
    
    results = []
    
    try:
        for i, file in enumerate(files):
            try:
                # Validate file type
                if not file.content_type.startswith('image/'):
                    results.append({
                        "file_index": i,
                        "filename": file.filename,
                        "error": "Invalid file type"
                    })
                    continue
                
                # Read and process image
                image_data = await file.read()
                image = Image.open(BytesIO(image_data))
                
                if image.mode != 'RGB':
                    image = image.convert('RGB')
                
                # Preprocess and detect
                image_array = preprocess_image(image)
                detections = detect_waste(image_array)
                
                if not detections:
                    results.append({
                        "file_index": i,
                        "filename": file.filename,
                        "label": "No medical waste detected",
                        "confidence": 0.0,
                        "detections": []
                    })
                else:
                    best_detection = get_best_detection(detections)
                    results.append({
                        "file_index": i,
                        "filename": file.filename,
                        "label": best_detection['medical_type'],
                        "confidence": round(best_detection['confidence'], 3),
                        "detections": detections
                    })
                
            except Exception as e:
                logger.error(f"Error processing file {file.filename}: {str(e)}")
                results.append({
                    "file_index": i,
                    "filename": file.filename,
                    "error": str(e)
                })
        
        return {
            "batch_results": results,
            "total_files": len(files),
            "successful_detections": len([r for r in results if 'error' not in r])
        }
        
    except Exception as e:
        logger.error(f"Batch prediction error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Batch prediction failed: {str(e)}"
        )

@app.get("/model/info")
async def model_info():
    """Get information about the loaded model"""
    if not model:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    return {
        "model_type": "YOLOv8",
        "model_path": MODEL_PATH,
        "confidence_threshold": MODEL_CONFIDENCE,
        "iou_threshold": MODEL_IOU_THRESHOLD,
        "waste_classes": waste_classes,
        "medical_waste_mapping": medical_waste_mapping,
        "device": str(model.device),
        "model_size": os.path.getsize(MODEL_PATH) if os.path.exists(MODEL_PATH) else 0
    }

@app.get("/classes")
async def get_supported_classes():
    """Get supported waste classes"""
    return {
        "waste_classes": waste_classes,
        "medical_waste_mapping": medical_waste_mapping,
        "total_classes": len(waste_classes)
    }

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Unhandled exception: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )

if __name__ == "__main__":
    logger.info("Starting Medical Waste Detection API...")
    
    # Create logs directory
    os.makedirs('logs', exist_ok=True)
    
    # Load model
    if not load_model():
        logger.error("Failed to load model. Exiting...")
        exit(1)
    
    # Start server
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=PORT,
        reload=DEBUG,
        log_level="info"
    )
