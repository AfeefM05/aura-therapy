import os
import librosa
from transformers import pipeline

classifier = pipeline("audio-classification", model="superb/hubert-large-superb-er")

def predict():
    file_path = "public/uploads/1742969184797-audio.wav"
    predictions = classifier(file_path)
    return predictions

print(predict())