from langchain_core.documents import Document

from app.core.logger import logger
from app.vectorstore.chroma_service import ChromaService


class RetrievalService:
    """
    Service responsible for retrieving relevant
    resume chunks from the vector database.
    """

    def __init__(self, chroma_service: ChromaService):
        self.chroma_service = chroma_service

    def retrieve_relevant_chunks(self,job_description: str,k: int | None = None,) -> list[Document]:
        """
        Retrieve the most relevant resume chunks.
        """

        logger.info("Starting semantic retrieval.")

        documents = self.chroma_service.similarity_search(
            query=job_description,
            k=k,
        )

        logger.info(
            f"Retrieved {len(documents)} relevant chunks."
        )

        return documents