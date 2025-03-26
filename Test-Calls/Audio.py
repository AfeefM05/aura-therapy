import os
import librosa
from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import pipeline
from pyngrok import ngrok

classifier = pipeline("audio-classification", model="superb/hubert-large-superb-er")

app = Flask(__name__)
CORS(app)

@app.route('/predict', methods=['POST'])
def predict():
    file_path = "/content/Kill_You.wav"

    predictions = classifier(file_path)

    return jsonify(predictions)

if __name__ == '__main__':
    public_url = ngrok.connect(5000).public_url
    print(f"Server running publicly at: {public_url}")
    app.run(host='0.0.0.0', port=4002)
