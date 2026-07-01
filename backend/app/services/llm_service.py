import os
from fastapi import HTTPException, status
# pyrefly: ignore [missing-import]
from langchain_core.messages import HumanMessage
# pyrefly: ignore [missing-import]
from langchain_huggingface import ChatHuggingFace, HuggingFaceEndpoint

from app.config.settings import settings
from app.core.logger import logger


class LLMService:
    """
    Service responsible for interacting with the
    Hugging Face hosted language model.
    """

    def __init__(self):
        logger.info("Initializing Hugging Face LLM...")

        # Log details about configuration
        token_exists = bool(settings.HUGGINGFACE_API_KEY)
        masked_token = (
            f"{settings.HUGGINGFACE_API_KEY[:6]}...{settings.HUGGINGFACE_API_KEY[-4:]}"
            if token_exists and len(settings.HUGGINGFACE_API_KEY) > 10
            else "None"
        )
        env_token_exists = "HF_TOKEN" in os.environ

        logger.info(f"LLM Config Model: {settings.LLM_MODEL}")
        logger.info(f"Hugging Face Token Loaded from Settings: {token_exists} (Masked: {masked_token})")
        logger.info(f"HF_TOKEN present in environment: {env_token_exists}")

        self.llm = HuggingFaceEndpoint(
            repo_id=settings.LLM_MODEL,
            huggingfacehub_api_token=settings.HUGGINGFACE_API_KEY,
            task="text-generation",
            max_new_tokens=2048,
            temperature=0.2,
            do_sample=False,
        )

        # Log the provider being used
        provider = getattr(self.llm, "provider", None)
        logger.info(f"LLM Provider: {provider or 'Default (HF Inference Router)'}")

        self.chat_model = ChatHuggingFace(
            llm=self.llm,
        )

        logger.info("LLM initialized successfully.")

    async def generate_response(self, prompt: str) -> str:
        """
        Generate a response from the language model.
        """

        try:
            logger.info("Sending prompt to Hugging Face model.")

            response = await self.chat_model.ainvoke(
                [
                    HumanMessage(content=prompt)
                ]
            )

            logger.info("Received response from Hugging Face.")

            return response.content

        except Exception as e:
            error_class = e.__class__.__name__
            error_msg = str(e)
            logger.error(f"LLM generation failed. Exact error class: {error_class}. Details: {error_msg}")
            
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Hugging Face LLM Generation failed: {error_msg}"
            )
