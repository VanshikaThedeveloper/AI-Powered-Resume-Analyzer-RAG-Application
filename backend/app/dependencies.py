from fastapi import Header, Query, HTTPException, status
import os
from app.config.settings import settings
from app.services.analysis_service import AnalysisService
from app.services.embedding_service import EmbeddingService
from app.services.llm_service import LLMService
from app.services.prompt_service import PromptService
from app.services.response_parser_service import ResponseParserService
from app.services.session_manager import session_manager
from app.vectorstore.chroma_service import ChromaService

# Embedding Service
embedding_service = EmbeddingService()

# ChromaDB Service
chroma_service = ChromaService(
    embedding_service=embedding_service
)

# Prompt Service
prompt_service = PromptService()

# LLM Service
llm_service = LLMService()

# Response Parser Service
response_parser_service = ResponseParserService()

# Analysis Service
analysis_service = AnalysisService(
    chroma_service=chroma_service,
    prompt_service=prompt_service,
    llm_service=llm_service,
    response_parser_service=response_parser_service,
)

async def get_or_create_session_id(
    x_session_id: str | None = Header(None, alias="X-Session-ID"),
    session_id_query: str | None = Query(None, alias="session_id")
) -> str:
    """
    Get the session ID from the request header or query parameters.
    If no session ID is provided, create a new one.
    If an invalid/expired session ID is provided, raise an HTTP 410 Gone exception.
    """
    session_id = x_session_id or session_id_query

    if not session_id:
        new_id = session_manager.create_session()
        return new_id

    if not session_manager.session_exists(session_id):
        raise HTTPException(
            status_code=status.HTTP_410_GONE,
            detail="Your session has expired. Please upload the PDF again."
        )

    # Session is active; update its activity timestamp
    session_manager.update_activity(session_id)
    return session_id

def get_session_analysis_service(session_id: str) -> AnalysisService:
    """
    Return a session-isolated AnalysisService containing a session-isolated ChromaService.
    """
    import uuid
    request_id = str(uuid.uuid4())
    temp_chroma_path = os.path.join(settings.CHROMA_DB_PATH, session_id, f"temp_{request_id}")
    session_chroma = ChromaService(
        embedding_service=embedding_service,
        persist_directory=temp_chroma_path
    )
    return AnalysisService(
        chroma_service=session_chroma,
        prompt_service=prompt_service,
        llm_service=llm_service,
        response_parser_service=response_parser_service
    )