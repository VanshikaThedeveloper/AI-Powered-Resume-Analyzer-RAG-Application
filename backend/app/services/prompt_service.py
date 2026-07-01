from langchain_core.documents import Document

from app.prompts.analysis_prompt import ANALYSIS_PROMPT


class PromptService:
    """
    Service responsible for building prompts
    for the language model.
    """

    def build_prompt(self,documents: list[Document],job_description: str,) -> str:
        """
        Build the final prompt.
        """

        contexts = []

        for document in documents:
            contexts.append(document.page_content)

        resume_context = "\n\n".join(contexts)

        return ANALYSIS_PROMPT.format(
            resume_context=resume_context,
            job_description=job_description,
        )