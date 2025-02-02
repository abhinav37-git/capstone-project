from transformers import AutoModelForCausalLM, AutoTokenizer
import torch
from flask import Flask, request, jsonify
from flask_cors import CORS
import logging
import os

app = Flask(__name__)
CORS(app)  # Enable CORS

# Configure logging
logging.basicConfig(level=logging.DEBUG)

# Define the local directory to load the model and tokenizer
model_dir = "gpt2-model"

try:
    # Load the model and tokenizer from the local directory
    tokenizer = AutoTokenizer.from_pretrained(model_dir)
    model = AutoModelForCausalLM.from_pretrained(model_dir)
    logging.info("Model and tokenizer loaded from local directory.")
except Exception as e:
    logging.error(f"Error loading model and tokenizer: {e}")

@app.route("/api/ai-query", methods=["POST"])
def ai_query():
    try:
        data = request.json
        query = data["query"]
        page_data = data["pageData"]

        # Combine query and page data
        input_text = f"Page Data: {page_data}\nQuery: {query}"
        inputs = tokenizer(input_text, return_tensors="pt")
        outputs = model.generate(inputs["input_ids"], max_length=100)
        response = tokenizer.decode(outputs[0], skip_special_tokens=True)

        return jsonify({"answer": response})
    except Exception as e:
        logging.error(f"Error processing request: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001)