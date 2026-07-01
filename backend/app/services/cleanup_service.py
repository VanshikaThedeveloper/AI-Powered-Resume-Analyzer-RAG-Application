import asyncio
import os
import shutil
import uuid
from pathlib import Path
from app.core.logger import logger
from app.config.settings import settings
from app.services.session_manager import session_manager

def is_valid_uuid(val: str) -> bool:
    """
    Validate that a string is a valid UUID version 4.
    """
    try:
        uuid.UUID(str(val))
        return True
    except ValueError:
        return False

def clean_session_files(session_id: str) -> None:
    """
    Recursively and safely delete all uploads and Chroma directories for a given session.
    """
    if not is_valid_uuid(session_id):
        logger.warning(f"Invalid session ID format during cleanup: {session_id}. Deletion aborted.")
        return

    upload_root = Path(settings.UPLOAD_DIRECTORY).resolve()
    chroma_root = Path(settings.CHROMA_DB_PATH).resolve()

    session_upload_dir = (upload_root / session_id).resolve()
    session_chroma_dir = (chroma_root / session_id).resolve()

    # Safety checks: ensure the target directories are direct subdirectories of upload and chroma roots.
    # Check that parent folder is exactly the root folder.
    if session_upload_dir.parent == upload_root:
        if session_upload_dir.exists() and session_upload_dir.is_dir():
            try:
                shutil.rmtree(session_upload_dir)
                logger.info(f"Deleted folder: {session_upload_dir}")
            except Exception as e:
                logger.error(f"Failed to delete upload folder for session {session_id}: {e}")
    else:
        logger.warning(f"Safety check failed: {session_upload_dir} is not a direct child of {upload_root}")

    if session_chroma_dir.parent == chroma_root:
        if session_chroma_dir.exists() and session_chroma_dir.is_dir():
            try:
                shutil.rmtree(session_chroma_dir)
                logger.info(f"Deleted folder: {session_chroma_dir}")
            except Exception as e:
                logger.error(f"Failed to delete chroma folder for session {session_id}: {e}")
    else:
        logger.warning(f"Safety check failed: {session_chroma_dir} is not a direct child of {chroma_root}")

async def run_cleanup() -> None:
    """
    Find expired sessions and trigger their cleanup.
    """
    expired_ids = session_manager.get_expired_sessions(max_age_minutes=30)
    if not expired_ids:
        logger.info("Cleanup execution: No expired sessions found.")
        return

    logger.info(f"Cleanup execution: Found {len(expired_ids)} expired sessions.")
    for session_id in expired_ids:
        logger.info(f"Session expired: {session_id}")
        clean_session_files(session_id)
        session_manager.delete_session(session_id)

async def cleanup_loop() -> None:
    """
    Background worker loop that runs the cleanup service every 10 minutes.
    """
    logger.info("Starting background session cleanup service...")
    try:
        while True:
            await asyncio.sleep(600)  # 10 minutes
            logger.info("Executing periodic session cleanup...")
            await run_cleanup()
    except asyncio.CancelledError:
        logger.info("Session cleanup service stopped.")
    except Exception as e:
        logger.exception(f"Unexpected error in session cleanup service: {e}")
