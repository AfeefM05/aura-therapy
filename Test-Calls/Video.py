import cv2
import torch
import numpy as np
from PIL import Image
import torchvision.transforms as transforms
from ultralytics import YOLO
import time
import os
import json
from typing import Dict, List, Any
from flask import Flask, request, jsonify
import requests

app = Flask(__name__)

# Global variable to store the history of largest face detections
largest_face_detections = []

# EmotionCNN model definition
class EmotionCNN(torch.nn.Module):
    def __init__(self, num_classes=7):
        super(EmotionCNN, self).__init__()
        
        # First convolutional block
        self.conv1 = torch.nn.Sequential(
            torch.nn.Conv2d(1, 64, kernel_size=3, padding=1),
            torch.nn.BatchNorm2d(64),
            torch.nn.ReLU(),
            torch.nn.MaxPool2d(kernel_size=2, stride=2)
        )
        
        # Second convolutional block
        self.conv2 = torch.nn.Sequential(
            torch.nn.Conv2d(64, 128, kernel_size=3, padding=1),
            torch.nn.BatchNorm2d(128),
            torch.nn.ReLU(),
            torch.nn.MaxPool2d(kernel_size=2, stride=2)
        )
        
        # Third convolutional block
        self.conv3 = torch.nn.Sequential(
            torch.nn.Conv2d(128, 256, kernel_size=3, padding=1),
            torch.nn.BatchNorm2d(256),
            torch.nn.ReLU(),
            torch.nn.MaxPool2d(kernel_size=2, stride=2)
        )
        
        # Fourth convolutional block
        self.conv4 = torch.nn.Sequential(
            torch.nn.Conv2d(256, 512, kernel_size=3, padding=1),
            torch.nn.BatchNorm2d(512),
            torch.nn.ReLU(),
            torch.nn.MaxPool2d(kernel_size=2, stride=2)
        )
        
        # Fifth convolutional block with residual connection
        self.conv5 = torch.nn.Sequential(
            torch.nn.Conv2d(512, 512, kernel_size=3, padding=1),
            torch.nn.BatchNorm2d(512),
            torch.nn.ReLU()
        )
        
        # Attention mechanism
        self.attention = torch.nn.Sequential(
            torch.nn.Conv2d(512, 1, kernel_size=1),
            torch.nn.Sigmoid()
        )
        
        # Fully connected layers
        self.fc = torch.nn.Sequential(
            torch.nn.Dropout(0.5),
            torch.nn.Linear(512 * 3 * 3, 1024),
            torch.nn.ReLU(),
            torch.nn.Dropout(0.5),
            torch.nn.Linear(1024, 512),
            torch.nn.ReLU(),
            torch.nn.Dropout(0.3),
            torch.nn.Linear(512, num_classes)
        )
        
    def forward(self, x):
        x = self.conv1(x)
        x = self.conv2(x)
        x = self.conv3(x)
        x = self.conv4(x)
        
        # Fifth conv block with residual connection
        x_res = x
        x = self.conv5(x)
        x = x + x_res
        
        # Apply attention
        attn = self.attention(x)
        x = x * attn
        
        # Flatten
        x = x.view(x.size(0), -1)
        
        # Fully connected
        x = self.fc(x)
        return x

def load_emotion_model(model_path, device='cuda' if torch.cuda.is_available() else 'cpu'):
    """Load the emotion recognition model"""
    checkpoint = torch.load(model_path, map_location=device)
    
    model = EmotionCNN(num_classes=7)
    model.load_state_dict(checkpoint['model_state_dict'])
    model.to(device)
    model.eval()
    
    return model

def preprocess_face(face_img, size=(48, 48)):
    """Preprocess face image for emotion detection"""
    transform = transforms.Compose([
        transforms.Resize(size),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.5], std=[0.5])
    ])
    
    # Convert to PIL Image
    if isinstance(face_img, np.ndarray):
        face_img = Image.fromarray(cv2.cvtColor(face_img, cv2.COLOR_BGR2RGB))
    
    # Convert to grayscale
    face_img = face_img.convert('L')
    
    # Apply transformations
    face_tensor = transform(face_img).unsqueeze(0)
    return face_tensor

def process_video(video_path: str) -> Dict[str, Any]:
    """
    Process a video file and return emotion detection results.
    
    Args:
        video_path (str): Path to the video file
        
    Returns:
        Dict containing:
        - success (bool): Whether processing was successful
        - message (str): Status message
        - results (List[Dict]): List of emotion detection results
        - error (str): Error message if any
    """
    global largest_face_detections
    largest_face_detections = []  # Reset detections for new video
    
    # Paths
    yolo_model_path = "yolov8n-face.pt"
    emotion_model_path = "best_emotion_model.pth"
    
    # Check if models exist
    if not os.path.exists(yolo_model_path):
        return {
            "success": False,
            "message": "YOLOv8Face model not found",
            "results": [],
            "error": f"Error: YOLOv8Face model not found at {yolo_model_path}"
        }
        
    if not os.path.exists(emotion_model_path):
        return {
            "success": False,
            "message": "Emotion model not found",
            "results": [],
            "error": f"Error: Emotion model not found at {emotion_model_path}"
        }
    
    # Set device
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    
    # Load models
    try:
        yolo_model = YOLO(yolo_model_path)
        emotion_model = load_emotion_model(emotion_model_path, device)
    except Exception as e:
        return {
            "success": False,
            "message": "Error loading models",
            "results": [],
            "error": str(e)
        }
        
    # Emotion labels
    emotions = ['Angry', 'Disgust', 'Fear', 'Happy', 'Sad', 'Surprise', 'Neutral']
    
    # Open video
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        return {
            "success": False,
            "message": "Could not open video file",
            "results": [],
            "error": f"Error: Could not open video file at {video_path}"
        }
    
    frame_count = 0
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    
    while True:
        ret, frame = cap.read()
        if not ret:
            break
            
        frame_count += 1
        
        # Variables to track largest face
        largest_face_area = 0
        current_detection = None
        
        # Detect faces with YOLOv8Face
        results = yolo_model(frame, stream=True)
        
        # Process each result
        for result in results:
            boxes = result.boxes
            
            if len(boxes) == 0:
                continue
                
            # Process each detected face
            for box in boxes:
                # Get face coordinates
                x1, y1, x2, y2 = box.xyxy[0].cpu().numpy().astype(int)
                
                # Calculate face area
                face_area = (x2 - x1) * (y2 - y1)
                
                # Extract face region with margin
                margin = 20
                x1 = max(0, x1 - margin)
                y1 = max(0, y1 - margin)
                x2 = min(frame.shape[1], x2 + margin)
                y2 = min(frame.shape[0], y2 + margin)
                
                face_img = frame[y1:y2, x1:x2]
                
                # Skip if face is too small
                if face_img.size == 0 or face_img.shape[0] < 20 or face_img.shape[1] < 20:
                    continue
                
                # Convert face to PIL Image and preprocess
                face_tensor = preprocess_face(face_img)
                
                # Predict emotion
                with torch.no_grad():
                    face_tensor = face_tensor.to(device)
                    output = emotion_model(face_tensor)
                    probabilities = torch.nn.functional.softmax(output, dim=1)
                    emotion_idx = torch.argmax(output, dim=1).item()
                    confidence = probabilities[0][emotion_idx].item()
                  
                # Get emotion label
                emotion = emotions[emotion_idx]
                
                # Update largest face if current face is larger
                if face_area > largest_face_area:
                    largest_face_area = face_area
                    current_detection = {
                        'emotion': emotion,
                        'confidence': confidence,
                        'timestamp': time.time(),
                        'frame_number': frame_count
                    }
        
        # Add current detection to history if a face was detected
        if current_detection:
            largest_face_detections.append(current_detection)
    
    # Release resources
    cap.release()
    
    # Process results
    if not largest_face_detections:
        return {
            "success": True,
            "message": "No faces detected in video",
            "results": [],
            "error": None
        }
    
    # Calculate summary statistics
    emotions_count = {}
    for detection in largest_face_detections:
        emotion = detection['emotion']
        emotions_count[emotion] = emotions_count.get(emotion, 0) + 1
    
    # Get dominant emotion
    dominant_emotion = max(emotions_count.items(), key=lambda x: x[1])[0]
    
    return {
        "success": True,
        "message": "Video processed successfully",
        "results": {
            "detections": largest_face_detections,
            "summary": {
                "total_frames": total_frames,
                "total_detections": len(largest_face_detections),
                "emotions_count": emotions_count,
                "dominant_emotion": dominant_emotion
            }
        },
        "error": None
    }

@app.route('/', methods=['POST'])
def handle_video_request():
    try:
        # Get request data
        data = request.get_json()
        if not data or 'path' not in data:
            return jsonify({
                "success": False,
                "message": "Missing required fields",
                "error": "Request must include 'path'"
            }), 400

        video_path = data['path']
        print(f"Received video path: {video_path}")

        # Process the video
        results = process_video(video_path)

        # Return results directly to the frontend
        return jsonify(results)

    except Exception as e:
        return jsonify({
            "success": False,
            "message": "Error processing request",
            "error": str(e)
        }), 500

if __name__ == "__main__":
    # Run Flask server on port 4000
    app.run(host='0.0.0.0', port=4000) 