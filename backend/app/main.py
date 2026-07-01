from contextlib import asynccontextmanager
from fastapi import FastAPI
from app.config.settings import settings
from app.core.logger import logger
from app.database.mongodb import (
    close_mongodb_connection,
    connect_to_mongodb,
)
from app.api.routes.upload import router as upload_router
from app.api.routes.parser_test import router as parser_test_router
from app.api.routes.analyze import router as analyze_router



import asyncio
from app.services.cleanup_service import cleanup_loop

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application startup and shutdown lifecycle.
    """
    logger.info("Starting application...")

    await connect_to_mongodb()

    # Start background cleanup task
    cleanup_task = asyncio.create_task(cleanup_loop())

    yield

    logger.info("Shutting down application...")

    # Cancel background task
    cleanup_task.cancel()
    try:
        await cleanup_task
    except asyncio.CancelledError:
        pass

    await close_mongodb_connection()
    
    
app = FastAPI(
    title="RAG Resume Analyzer API",
    description="Backend API for analyzing resumes against job descriptions using RAG.",
    version="1.0.0",
    lifespan=lifespan,
)

app.include_router(upload_router)
app.include_router(parser_test_router)
app.include_router(analyze_router)

logger.info("Application started successfully.")

@app.get("/")
async def root():
    logger.info("Root endpoint accessed.")
    return {
        "message": "Welcome to the RAG Resume Analyzer API ",
    }