from transformers import pipeline
import spacy
import subprocess
import sys
import os
import logging

# --- Configuration ---

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# spaCy model configuration
SPACY_MODEL = "en_core_web_sm"

# Hugging Face models configuration
HF_MODELS = {
    "NER": {"task": "ner", "model_id": "dslim/bert-base-NER"},
    "Text Generation": {"task": "text2text-generation", "model_id": "google/flan-t5-small"},
}

def _setup_environment():
    """Sets up environment variables for stable downloads."""
    logging.info("--- Disabling Xet Hub download optimizations to improve stability ---")
    os.environ["HF_HUB_DISABLE_XET_OPTIMIZATIONS"] = "1"

    logging.info("--- Increasing download timeout for Hugging Face models ---")
    os.environ["HF_HUB_DOWNLOAD_TIMEOUT"] = "900"

def _download_spacy_model(model_name: str):
    """Checks for and downloads the specified spaCy model if not present."""
    logging.info(f"--- Checking for spaCy model ({model_name}) ---")
    try:
        spacy.load(model_name)
        logging.info(f"✅ spaCy model '{model_name}' already installed.")
    except OSError:
        logging.info(f"spaCy model not found. Downloading '{model_name}'...")
        try:
            # Use pip with a long timeout to prevent network errors
            subprocess.check_call([
                sys.executable, "-m", "pip", "install", model_name, "--timeout", "600"
            ])
            logging.info("✅ spaCy model downloaded successfully.")
        except subprocess.CalledProcessError as e:
            logging.error(f"❌ Failed to download spaCy model using pip: {e}")
        except Exception as e:
            logging.error(f"❌ An unexpected error occurred during spaCy model download: {e}")

def _download_hf_models(models_to_download: dict):
    """Downloads and caches Hugging Face models using the pipeline function."""
    for name, model_info in models_to_download.items():
        task = model_info["task"]
        model_id = model_info["model_id"]
        logging.info(f"--- Downloading {name} model ({model_id}) ---")
        try:
            # The pipeline function will download the model if it's not cached
            pipeline(task=task, model=model_id)
            logging.info(f"✅ {name} model downloaded successfully.")
        except OSError as e:
            # This can happen if the cache is corrupted
            logging.warning(f"⚠️  Could not load {name} model, it might be cached but corrupted. Error: {e}")
        except Exception as e:
            logging.error(f"❌ Failed to download {name} model: {e}")

def download_all_models():
    """
    Downloads and caches all the models required for the application.
    Checks if models are already installed before downloading.
    """
    _setup_environment()
    _download_spacy_model(SPACY_MODEL)
    _download_hf_models(HF_MODELS)
    logging.info("--- Model download process finished. ---")

if __name__ == "__main__":
    download_all_models()