from pathlib import Path
import pdfplumber
from fastapi import HTTPException, status

from app.core.logger import logger


async def extract_text_from_pdf(file_path: Path) -> str:
    try:
        logger.info(f"Starting text extraction from: {file_path.name}")

        extracted_pages: list[str] = []

        with pdfplumber.open(file_path) as pdf:

            logger.info(f"Total pages found: {len(pdf.pages)}")

            for page_number, page in enumerate(pdf.pages, start=1):

                page_text = page.extract_text()

                if page_text:
                    extracted_pages.append(page_text)
                    logger.info(
                        f"Successfully extracted text from page {page_number}"
                    )
                else:
                    logger.warning(
                        f"No readable text found on page {page_number}"
                    )

        extracted_text = "\n\n".join(extracted_pages).strip()

        if not extracted_text:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No readable text found in the uploaded PDF.",
            )

        logger.info("PDF text extraction completed successfully.")

        return extracted_text

    except HTTPException:
        raise

    except Exception as e:
        logger.exception(f"PDF extraction failed: {e}")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to extract text from PDF.",
        )