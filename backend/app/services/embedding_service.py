from langchain_huggingface import HuggingFaceEndpointEmbeddings

from app.config.settings import settings
from app.core.logger import logger


class EmbeddingService:
    def __init__(self):
        self.client = HuggingFaceEndpointEmbeddings(
            model=settings.EMBEDDING_MODEL,
            huggingfacehub_api_token=settings.HUGGINGFACE_API_KEY,
            task="feature-extraction",
        )

    def embed_documents(self, texts: list[str]) -> list[list[float]]:
        return self.client.embed_documents(texts)

    def embed_query(self, text: str) -> list[float]:
        return self.client.embed_query(text)