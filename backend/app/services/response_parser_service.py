import json

from pydantic import ValidationError

from app.core.logger import logger
from app.schemas.analysis_response import AnalysisResponse


class ResponseParserService:
    """
    Parse and validate LLM responses.
    """

    def parse_response(self,response: str,) -> AnalysisResponse:

        try:

            cleaned = (
                response
                .replace("```json", "")
                .replace("```", "")
                .strip()
            )

            data = json.loads(cleaned)

            parsed = AnalysisResponse.model_validate(data)

            logger.info("LLM response validated successfully.")

            return parsed

        except ValidationError as e:

            logger.exception(e)

            raise

        except json.JSONDecodeError as e:

            logger.exception(e)

            raise