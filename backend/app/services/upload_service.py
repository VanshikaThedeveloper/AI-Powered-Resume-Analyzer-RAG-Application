import os
from pathlib import Path
from uuid import uuid4

from fastapi import HTTPException, UploadFile, status

from app.config.settings import settings
from app.schemas.upload_schema import UploadResponse
from app.core.logger import logger


ALLOWED_EXTENSIONS = {".pdf"}


def validate_file_extension(filename: str) -> None:
    """
    Validate that the uploaded file has an allowed extension.
    """
    extension = Path(filename).suffix.lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF files are allowed.",
        )


def validate_file_size(file_size: int) -> None:
    """
    Validate uploaded file size.
    """
    max_size_bytes = settings.MAX_FILE_SIZE_MB * 1024 * 1024

    if file_size > max_size_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File size exceeds {settings.MAX_FILE_SIZE_MB} MB.",
        )


def generate_unique_filename(original_filename: str) -> str:
    """
    Generate a unique filename while preserving the original extension.
    """
    extension = Path(original_filename).suffix.lower()
    return f"{uuid4()}{extension}"


async def save_uploaded_file(file: UploadFile, session_id: str) -> UploadResponse:
    """
    Validate and save an uploaded PDF file for a session.
    """
    validate_file_extension(file.filename)

    file_bytes = await file.read()
    file_size = len(file_bytes)

    validate_file_size(file_size)

    # Use session specific directory
    upload_dir = Path(settings.UPLOAD_DIRECTORY) / session_id
    upload_dir.mkdir(parents=True, exist_ok=True)

    stored_filename = generate_unique_filename(file.filename)

    file_path = upload_dir / stored_filename
    
    logger.info(f"Uploading file for session {session_id}: {file.filename}")

    with open(file_path, "wb") as buffer:
        buffer.write(file_bytes)

    return UploadResponse(
        message="File uploaded successfully.",
        original_filename=file.filename,
        stored_filename=stored_filename,
        file_size_mb=round(file_size / (1024 * 1024), 2),
        session_id=session_id,
    )