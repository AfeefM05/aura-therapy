from transformers import pipeline, RobertaForSequenceClassification, RobertaTokenizer
from flask import Flask, request, jsonify
from flask_cors import CORS
import json

app = Flask(__name__)
CORS(app)

# Initialize the emotion analysis model
model_name = "cardiffnlp/twitter-roberta-base-emotion"
model = RobertaForSequenceClassification.from_pretrained(model_name)
tokenizer = RobertaTokenizer.from_pretrained(model_name)
emotion_analysis = pipeline("text-classification",
                          model=model, tokenizer=tokenizer, 
                          return_all_scores=True)

def analyze_text(text):
    try:
        # Perform emotion analysis
        result = emotion_analysis(text)
        
        # Format the results
        emotions = [{'label': emotion['label'], 'score': float(emotion['score'])} 
                   for emotion in sorted(result[0], key=lambda x: x['score'], reverse=True)]
        
        return {
            "success": True,
            "message": "Text analyzed successfully",
            "results": emotions,
            "error": None
        }
    except Exception as e:
        return {
            "success": False,
            "message": "Error analyzing text",
            "error": str(e)
        }

@app.route('/', methods=['POST'])
def handle_text_request():
    try:
        # Get request data
        data = request.get_json()
        if not data or 'path' not in data:
            return jsonify({
                "success": False,
                "message": "Missing required fields",
                "error": "Request must include 'path'"
            }), 400

        json_path = data['path']
        print(f"Received JSON path: {json_path}")

        # Read the JSON file
        with open(json_path, 'r') as file:
            json_data = json.load(file)
            
        # Get the description from the JSON data
        description = json_data.get('description', '')
        
        if not description:
            return jsonify({
                "success": False,
                "message": "No description found in JSON file",
                "error": "Description field is empty"
            }), 400

        # Process the text using our analyze_text function
        result = analyze_text(description)
        
        # Return results
        return jsonify(result)

    except Exception as e:
        return jsonify({
            "success": False,
            "message": "Error processing request",
            "error": str(e)
        }), 500

if __name__ == '__main__':
    # Run Flask server on port 4001
    app.run(host='0.0.0.0', port=4001)

