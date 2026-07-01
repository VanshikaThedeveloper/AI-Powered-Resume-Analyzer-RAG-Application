from pathlib import Path

from app.core.logger import logger
from app.schemas.analysis_response import AnalysisResponse
from app.services.chunk_service import create_chunks
from app.services.llm_service import LLMService
from app.services.pdf_parser_service import extract_text_from_pdf
from app.services.prompt_service import PromptService
from app.services.response_parser_service import ResponseParserService
from app.vectorstore.chroma_service import ChromaService


class AnalysisService:
    """
    Service responsible for executing the complete
    RAG pipeline.
    """

    def __init__(
        self,
        chroma_service: ChromaService,
        prompt_service: PromptService,
        llm_service: LLMService,
        response_parser_service: ResponseParserService,
    ):
        self.chroma_service = chroma_service
        self.prompt_service = prompt_service
        self.llm_service = llm_service
        self.response_parser_service = response_parser_service

    async def analyze_resume(
        self,
        file_path: Path,
        job_description: str,
    ) -> AnalysisResponse:
        """
        Execute the complete resume analysis pipeline.
        """

        try:
            logger.info(f"Starting resume analysis. Resume filename: {file_path.name}")

            # Step 1: Extract text from PDF
            extracted_text = await extract_text_from_pdf(file_path)
            logger.info(f"Extracted resume text (first 300 characters):\n{extracted_text[:300]}")

            # Step 2: Create chunks
            chunks = create_chunks(
                text=extracted_text,
                source=file_path.name,
            )
            logger.info(f"Number of chunks created: {len(chunks)}")

            # Step 3: Store chunks in ChromaDB
            self.chroma_service.add_documents(chunks)

            # Step 4: Retrieve relevant chunks
            retrieved_chunks = self.chroma_service.similarity_search(
                query=job_description
            )
            
            logger.info("Retrieved chunks before the LLM call:")
            for i, chunk in enumerate(retrieved_chunks):
                logger.info(f"Chunk {i+1} Metadata: {chunk.metadata} | Content: {chunk.page_content[:200]}...")

            # Step 5: Build prompt
            prompt = self.prompt_service.build_prompt(
                documents=retrieved_chunks,
                job_description=job_description,
            )

            # Step 6: Generate LLM response
            llm_response = await self.llm_service.generate_response(
                prompt=prompt
            )

            # Step 7: Parse and validate response
            analysis = self.response_parser_service.parse_response(
                response=llm_response
            )

            logger.info("Resume analysis completed successfully.")

            return analysis

        except Exception as e:
            logger.exception(f"Resume analysis failed: {e}")
            raise
        finally:
            logger.info("Initiating vector store deletion and clearing temporary memory.")
            self.chroma_service.delete_vector_store()
            logger.info("Vector store deletion completed.")