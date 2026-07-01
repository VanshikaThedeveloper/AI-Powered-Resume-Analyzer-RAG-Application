from fastapi import APIRouter, File, UploadFile, Depends, status

from app.schemas.upload_schema import UploadResponse
from app.services.upload_service import save_uploaded_file
from app.dependencies import get_or_create_session_id

router = APIRouter(
    prefix="/upload",
    tags=["Upload"],
)


@router.post(
    "",
    response_model=UploadResponse,
    status_code=status.HTTP_201_CREATED,
)
async def upload_resume(
    file: UploadFile = File(...),
    session_id: str = Depends(get_or_create_session_id),
):
    """
    Upload a resume PDF.
    """
    return await save_uploaded_file(file, session_id)