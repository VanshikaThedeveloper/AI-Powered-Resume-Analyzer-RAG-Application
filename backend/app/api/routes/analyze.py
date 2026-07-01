from pathlib import Path

from fastapi import APIRouter, File, Form, HTTPException, UploadFile, Depends, status

from app.dependencies import get_or_create_session_id, get_session_analysis_service
from app.schemas.analysis_response import AnalysisResponse
from app.services.upload_service import save_uploaded_file
from app.config.settings import settings

router = APIRouter(
    prefix="/analyze",
    tags=["Analysis"],
)


@router.post(
    "",
    response_model=AnalysisResponse,
)
async def analyze_resume(
    resume: UploadFile = File(...),
    job_description: str = Form(...),
    session_id: str = Depends(get_or_create_session_id),
):
    """
    Analyze a resume against a job description.
    """

    uploaded_file = await save_uploaded_file(resume, session_id)

    file_path = Path(settings.UPLOAD_DIRECTORY) / session_id / uploaded_file.stored_filename

    if not file_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Uploaded file not found.",
        )

    service = get_session_analysis_service(session_id)

    result = await service.analyze_resume(
        file_path=file_path,
        job_description=job_description,
    )

    result.session_id = session_id
    return result