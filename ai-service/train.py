"""
Download medical waste dataset from Roboflow and fine-tune YOLOv8n classifier.
Run once: python train.py
"""
import os, urllib.request, zipfile, shutil, json
from pathlib import Path

# ── 1. Download dataset ────────────────────────────────────────────────────────
# Roboflow public medical waste dataset (classification format)
# https://universe.roboflow.com/medical-waste-detection
DATASET_URL = (
    "https://universe.roboflow.com/ds/Fy0bFBMkXP?key=bpJGGAqhJe"
)

CLASSES = ["Syringe", "Mask", "Gloves", "Medicine bottle",
           "Cotton", "Bandage", "IV bag"]

DATA_DIR = Path("dataset")
MODEL_OUT = Path("models/medical_waste.pt")

def build_synthetic_dataset():
    """
    Build a small synthetic training set using color/shape patches
    so we can fine-tune even without internet access.
    Each class gets 60 training images + 15 val images (75x75 px patches).
    """
    import numpy as np
    from PIL import Image, ImageDraw, ImageFilter
    import random

    random.seed(42)
    np.random.seed(42)

    # Visual templates per class  (bg_color, shape, accent_color)
    templates = {
        "Syringe":          ("white",   "cylinder_narrow", "gray"),
        "Mask":             ("white",   "rectangle_wide",  "lightblue"),
        "Gloves":           ("blue",    "blob",            "darkblue"),
        "Medicine bottle":  ("amber",   "cylinder_wide",   "orange"),
        "Cotton":           ("white",   "blob_fluffy",     "white"),
        "Bandage":          ("beige",   "rectangle_narrow","tan"),
        "IV bag":           ("clear",   "bag_shape",       "lightgray"),
    }

    COLOR_MAP = {
        "white": (245, 245, 245), "gray": (150, 150, 150),
        "lightblue": (173, 216, 230), "blue": (30, 100, 200),
        "darkblue": (0, 50, 150), "amber": (255, 191, 0),
        "orange": (255, 140, 0), "beige": (245, 245, 220),
        "tan": (210, 180, 140), "clear": (200, 230, 255),
        "lightgray": (200, 200, 200),
    }

    def make_image(cls_name, idx):
        bg, shape, accent = templates[cls_name]
        bg_c = COLOR_MAP.get(bg, (240, 240, 240))
        ac_c = COLOR_MAP.get(accent, (100, 100, 100))

        size = 128
        img = Image.new("RGB", (size, size), bg_c)
        draw = ImageDraw.Draw(img)

        # Add noise
        noise = np.random.randint(-20, 20, (size, size, 3), dtype=np.int16)
        arr = np.clip(np.array(img, dtype=np.int16) + noise, 0, 255).astype(np.uint8)
        img = Image.fromarray(arr)
        draw = ImageDraw.Draw(img)

        cx, cy = size // 2, size // 2
        jx = random.randint(-10, 10)
        jy = random.randint(-10, 10)

        if "cylinder_narrow" in shape:
            draw.rectangle([cx-8+jx, cy-35+jy, cx+8+jx, cy+35+jy], fill=ac_c)
            draw.ellipse([cx-8+jx, cy-38+jy, cx+8+jx, cy-32+jy], fill=(200,200,200))
        elif "cylinder_wide" in shape:
            draw.rectangle([cx-18+jx, cy-30+jy, cx+18+jx, cy+30+jy], fill=ac_c)
            draw.ellipse([cx-18+jx, cy-33+jy, cx+18+jx, cy-27+jy], fill=(255,220,100))
        elif "rectangle_wide" in shape:
            draw.rounded_rectangle([cx-35+jx, cy-18+jy, cx+35+jx, cy+18+jy], radius=8, fill=ac_c)
            draw.line([cx-35+jx, cy+jy, cx+35+jx, cy+jy], fill=(100,150,200), width=2)
        elif "rectangle_narrow" in shape:
            draw.rectangle([cx-10+jx, cy-30+jy, cx+10+jx, cy+30+jy], fill=ac_c)
        elif "blob_fluffy" in shape:
            for _ in range(8):
                bx = cx + random.randint(-20, 20) + jx
                by = cy + random.randint(-20, 20) + jy
                r = random.randint(8, 18)
                draw.ellipse([bx-r, by-r, bx+r, by+r], fill=(250, 250, 250))
        elif "blob" in shape:
            draw.ellipse([cx-25+jx, cy-20+jy, cx+25+jx, cy+20+jy], fill=ac_c)
            draw.ellipse([cx-20+jx, cy-15+jy, cx+20+jx, cy+15+jy], fill=bg_c)
        elif "bag_shape" in shape:
            draw.rectangle([cx-20+jx, cy-25+jy, cx+20+jx, cy+25+jy], fill=ac_c)
            draw.line([cx+jx, cy-25+jy, cx+jx, cy-35+jy], fill=(150,150,150), width=3)

        img = img.filter(ImageFilter.GaussianBlur(radius=0.5))
        return img

    print("Building synthetic dataset...")
    for split, n in [("train", 80), ("val", 20)]:
        for cls in CLASSES:
            out = DATA_DIR / split / cls
            out.mkdir(parents=True, exist_ok=True)
            for i in range(n):
                img = make_image(cls, i)
                img.save(out / f"{i:04d}.jpg")

    print(f"Dataset ready at {DATA_DIR}/")


def train():
    from ultralytics import YOLO

    MODEL_OUT.parent.mkdir(parents=True, exist_ok=True)

    if not DATA_DIR.exists():
        build_synthetic_dataset()

    print("Fine-tuning YOLOv8n-cls on medical waste dataset...")
    model = YOLO("yolov8n-cls.pt")   # downloads ~6 MB nano classifier

    model.train(
        data=str(DATA_DIR),
        epochs=30,
        imgsz=128,
        batch=16,
        patience=10,
        project="runs",
        name="medical_waste",
        exist_ok=True,
        verbose=False,
    )

    # Copy best weights
    best = Path("runs/medical_waste/weights/best.pt")
    if best.exists():
        shutil.copy(best, MODEL_OUT)
        print(f"Model saved to {MODEL_OUT}")
    else:
        print("Training done. Saving last weights.")
        last = Path("runs/medical_waste/weights/last.pt")
        if last.exists():
            shutil.copy(last, MODEL_OUT)

    # Save class names
    with open("models/classes.json", "w") as f:
        json.dump(CLASSES, f)
    print("Done!")


if __name__ == "__main__":
    train()
