from pathlib import Path

from fastapi import APIRouter, HTTPException, Query, status

from app.config.settings import settings
from app.services.pdf_parser_service import extract_text_from_pdf

router = APIRouter(
    prefix="/test",
    tags=["Parser Test"],
)


@router.get("/extract-text")
async def test_extract_text(
    filename: str = Query(..., description="Stored UUID filename")
):

    file_path = Path(settings.UPLOAD_DIRECTORY) / filename

    if not file_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found.",
        )

    extracted_text = await extract_text_from_pdf(file_path)

    return {
        "filename": filename,
        "characters": len(extracted_text),
        "text": extracted_text,
    }