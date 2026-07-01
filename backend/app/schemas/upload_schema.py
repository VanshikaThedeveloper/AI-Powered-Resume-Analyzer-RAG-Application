from pydantic import BaseModel


class UploadResponse(BaseModel):
    message: str
    original_filename: str
    stored_filename: str
    file_size_mb: float
    session_id: str | None = None