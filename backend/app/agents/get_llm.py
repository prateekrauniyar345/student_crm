# backend/app/agents/get_llm.py

import os
from pathlib import Path
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI

env_path = Path(__file__).resolve().parent.parent.parent / ".env"
load_dotenv(dotenv_path=env_path)
load_dotenv()

def get_llm():
    """
    Initialize and return configured ChatOpenAI instance.
    Supports OPENAI_API_KEY from environment variables.
    Defaults model to 'gpt-4o-mini' or OPENAI_MODEL.
    """
    api_key = (
        os.getenv("OPENAI_API_KEY") or 
        os.getenv("MINDROUTER_API_KEY") or 
        os.getenv("AZURE_OPENAI_API_KEY") or
        "placeholder-key-for-init"
    )

    model = (
        os.getenv("OPENAI_MODEL") or 
        os.getenv("OPENAI_MODEL_NAME") or 
        "gpt-4o-mini"
    )
    
    # Strip any accidental wrapping quotes around model name from .env
    model = model.strip("\"'")

    return ChatOpenAI(
        model=model,
        api_key=api_key,
        temperature=0.0,
        max_tokens=2048,
    )

# Shared LLM instance
llm = get_llm()
