from transformers import AutoModelForCausalLM, AutoTokenizer
import torch
from flask import Flask, request, jsonify
from flask_cors import CORS
import logging
import os

app = Flask(__name__)
CORS(app)

logging.basicConfig(level=logging.INFO)
model_dir = "gpt2-model"

try:
    tokenizer = AutoTokenizer.from_pretrained(model_dir)
    model = AutoModelForCausalLM.from_pretrained(model_dir)
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token
        tokenizer.pad_token_id = tokenizer.eos_token_id
    logging.info("Model and tokenizer loaded successfully from local directory.")
except Exception as e:
    logging.error(f"Error loading model and tokenizer: {e}")
    raise

@app.route("/api/ai-query", methods=["POST", "OPTIONS"])
def ai_query():
    if request.method == "OPTIONS":
        return "", 200

    try:
        data = request.json
        query = data.get("query", "")
        page_data = data.get("pageData", "")

        # Combine query and page data for context
        input_text = f"Page Data: {page_data}\nQuery: {query}"
        inputs = tokenizer(input_text, return_tensors="pt", padding=True, truncation=True)
        
        outputs = model.generate(
            inputs["input_ids"],
            attention_mask=inputs["attention_mask"],
            max_length=100,
            do_sample=True,
            top_k=50,
            top_p=0.95,
            pad_token_id=tokenizer.pad_token_id,
            eos_token_id=tokenizer.eos_token_id
        )
        raw_response = tokenizer.decode(outputs[0], skip_special_tokens=True)
        
        # Clean the response: Remove the input text prefix
        response_start = raw_response.find("Query:") + len(f"Query: {query}")
        cleaned_response = raw_response[response_start:].strip() if response_start > -1 else raw_response

        inferred_query = f"Understood as: '{query}'"

        return jsonify({
            "inferredQuery": inferred_query,
            "response": cleaned_response
        })
    except Exception as e:
        logging.error(f"Error processing request: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)