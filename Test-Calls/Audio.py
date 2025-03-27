import os
import librosa
from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import pipeline

# Initialize the audio classification model
classifier = pipeline("audio-classification", model="superb/hubert-large-superb-er")

app = Flask(__name__)
CORS(app)

def predict(audio_path):
    try:
        predictions = classifier(audio_path)
        return {
            "success": True,
            "message": "Audio processed successfully",
            "results": predictions,
            "error": None
        }
    except Exception as e:
        return {
            "success": False,
            "message": "Error processing audio",
            "error": str(e)
        }

@app.route('/', methods=['POST'])
def handle_audio_request():
    try:
        # Get request data
        data = request.get_json()
        if not data or 'path' not in data:
            return jsonify({
                "success": False,
                "message": "Missing required fields",
                "error": "Request must include 'path'"
            }), 400

        audio_path = data['path']
        print(f"Received audio path: {audio_path}")

        # Process the audio using our predict function
        result = predict(audio_path)
        
        # Return results
        return jsonify(result)

    except Exception as e:
        return jsonify({
            "success": False,
            "message": "Error processing request",
            "error": str(e)
        }), 500

if __name__ == '__main__':
    # Run Flask server on port 4002
    app.run(host='0.0.0.0', port=4002)
