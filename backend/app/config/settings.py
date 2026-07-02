import os
from pathlib import Path
from dotenv import load_dotenv
# pyrefly: ignore [missing-import]
from pydantic_settings import BaseSettings, SettingsConfigDict

# Determine the absolute path to backend/.env
config_dir = Path(__file__).resolve().parent
backend_dir = config_dir.parent.parent
env_file_path = backend_dir / ".env"

# Load environment variables into os.environ
load_dotenv(dotenv_path=env_file_path)


class Settings(BaseSettings):
    # ==========================
    # Hugging Face
    # ==========================
    HUGGINGFACE_API_KEY: str
    LLM_MODEL: str
    EMBEDDING_MODEL: str

    # ==========================
    # MongoDB
    # ==========================
    MONGODB_URI: str
    DATABASE_NAME: str

    # ==========================
    # ChromaDB
    # ==========================
    CHROMA_DB_PATH: str
    COLLECTION_NAME: str

    # ==========================
    # FastAPI
    # ==========================

    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # ==========================
    # Application
    # ==========================
    MAX_FILE_SIZE_MB: int
    TOP_K_RESULTS: int
    UPLOAD_DIRECTORY: str

    CHUNK_SIZE: int
    CHUNK_OVERLAP: int
    model_config = SettingsConfigDict(
        env_file=str(env_file_path),
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()

# Ensure standard Hugging Face environment variables are set in the process
if settings.HUGGINGFACE_API_KEY:
    os.environ["HF_TOKEN"] = settings.HUGGINGFACE_API_KEY
    os.environ["HUGGINGFACEHUB_API_TOKEN"] = settings.HUGGINGFACE_API_KEY
