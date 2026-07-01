from pydantic import BaseModel, Field


class InterviewQuestions(BaseModel):
    hr: list[str] = Field(
        description="HR interview questions."
    )

    behavioral: list[str] = Field(
        description="Behavioral interview questions."
    )

    technical: list[str] = Field(
        description="Technical interview questions."
    )


class AnalysisResponse(BaseModel):
    match_percentage: int = Field(
        ge=0,
        le=100,
        description="Overall resume match percentage."
    )

    matching_skills: list[str]

    missing_skills: list[str]

    resume_suggestions: list[str]

    interview_questions: InterviewQuestions
    session_id: str | None = None