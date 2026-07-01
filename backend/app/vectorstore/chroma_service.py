from langchain_chroma import Chroma
from langchain_core.documents import Document
from uuid import uuid4

from app.core.logger import logger
from app.config.settings import settings
from app.services.embedding_service import EmbeddingService


class ChromaService:
    def __init__(self, embedding_service: EmbeddingService, persist_directory: str = None):
        self.embedding_service = embedding_service
        self.persist_directory = persist_directory

        logger.info(f"Creating temporary vector store at path: {persist_directory or settings.CHROMA_DB_PATH}")
        self.vector_store = Chroma(
            collection_name=settings.COLLECTION_NAME,
            embedding_function=embedding_service.client,
            persist_directory=persist_directory or settings.CHROMA_DB_PATH,
        )
        logger.info("Temporary vector store successfully created.")
        
    def delete_vector_store(self) -> None:
        """
        Delete the vector store collection and release persistent storage.
        """
        try:
            logger.info("Starting cleanup of temporary vector store.")
            if self.vector_store is not None:
                logger.info(f"Deleting ChromaDB collection: {settings.COLLECTION_NAME}")
                self.vector_store.delete_collection()
                
                # Check for stop method on vector store client to close DB connections
                if hasattr(self.vector_store, "_client"):
                    logger.info("Stopping ChromaDB client connection.")
                    self.vector_store._client.stop()
            
            import gc
            import shutil
            import os
            
            self.vector_store = None
            gc.collect()
            
            if self.persist_directory and os.path.exists(self.persist_directory):
                # Ensure we only delete if it's a temporary directory
                if "temp_" in os.path.basename(self.persist_directory):
                    shutil.rmtree(self.persist_directory, ignore_errors=True)
                    logger.info(f"Successfully deleted temporary vector store directory: {self.persist_directory}")
                else:
                    logger.warning(f"Did not delete persistent directory as safety check failed: {self.persist_directory}")
        except Exception as e:
            logger.exception(f"Error during vector store deletion: {e}")
        
    
    def add_documents(self,documents: list[Document],) -> None:
        """
        Store documents inside ChromaDB.
        """

        try:
          logger.info(f"Adding {len(documents)} documents to ChromaDB.")

          ids = [str(uuid4()) for _ in documents]

          self.vector_store.add_documents(
              documents=documents,
              ids=ids,
          )

          logger.info("Documents successfully stored in ChromaDB.")

        except Exception as e:
            logger.exception(f"Failed to store documents: {e}")
            raise
            
            
            
            
    def similarity_search(self,query: str,k: int | None = None,) -> list[Document]:
        """
        Perform semantic similarity search.
        """

        logger.info("Performing similarity search.")

        results = self.vector_store.similarity_search(
            query=query,
            k=k or settings.TOP_K_RESULTS,
        )

        logger.info(f"Retrieved {len(results)} matching chunks.")

        return results
   

