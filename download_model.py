from transformers import AutoModelForCausalLM, AutoTokenizer
import os

# Define the local directory to save the model and tokenizer
model_dir = "gpt2-model"

if not os.path.exists(model_dir):
    os.makedirs(model_dir)
    # Download and save the model and tokenizer
    model_name = "gpt2"
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    model = AutoModelForCausalLM.from_pretrained(model_name)
    tokenizer.save_pretrained(model_dir)
    model.save_pretrained(model_dir)
    print("Model and tokenizer downloaded and saved locally.")
else:
    print("Model and tokenizer already exist locally.")