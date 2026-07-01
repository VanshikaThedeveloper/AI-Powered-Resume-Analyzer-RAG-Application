from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter

from app.config.settings import settings
from app.core.logger import logger


def create_chunks(text: str,source: str = "resume") -> list[Document]:
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=settings.CHUNK_SIZE,
        chunk_overlap=settings.CHUNK_OVERLAP,
        separators=[
            "\n\n",
            "\n",
            " ",
            ""
        ],
    )

    chunks = splitter.create_documents(
        texts=[text],
        metadatas=[
            {
                "source": source
            }
        ],
    )


    return chunks