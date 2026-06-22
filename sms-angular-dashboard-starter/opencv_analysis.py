import cv2
import numpy as np
import json
import sys

def analyze_ui(image_path):
    img = cv2.imread(image_path)
    if img is None:
        print(json.dumps({"error": "Could not read image"}))
        return

    # 1. Color Palette Analysis (K-Means)
    pixels = img.reshape((-1, 3))
    pixels = np.float32(pixels)
    
    # Subsample for speed
    np.random.shuffle(pixels)
    pixels = pixels[:10000]

    criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 10, 1.0)
    K = 5
    _, labels, centers = cv2.kmeans(pixels, K, None, criteria, 10, cv2.KMEANS_RANDOM_CENTERS)
    
    centers = np.uint8(centers)
    palette = [f"#{c[2]:02x}{c[1]:02x}{c[0]:02x}" for c in centers] # BGR to RGB hex

    # 2. Visual Clutter / Density Analysis
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    edges = cv2.Canny(gray, 50, 150)
    edge_density = np.sum(edges > 0) / (edges.shape[0] * edges.shape[1])
    
    # 3. Component Alignment (Hough Lines)
    lines = cv2.HoughLinesP(edges, 1, np.pi/180, threshold=100, minLineLength=100, maxLineGap=10)
    line_count = len(lines) if lines is not None else 0

    report = {
        "color_palette_hex": palette,
        "edge_density_percent": round(edge_density * 100, 2),
        "visual_clutter_rating": "High" if edge_density > 0.1 else "Low" if edge_density < 0.05 else "Medium",
        "alignment_lines_detected": line_count
    }
    
    print(json.dumps(report, indent=2))

if __name__ == '__main__':
    analyze_ui('teacher_portal_screenshot.png')
