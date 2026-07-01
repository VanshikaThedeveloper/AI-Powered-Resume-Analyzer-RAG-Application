from typing import Optional

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from app.config.settings import settings
from app.core.logger import logger

# Global variables
client: Optional[AsyncIOMotorClient] = None
database: Optional[AsyncIOMotorDatabase] = None


async def connect_to_mongodb():
    """
    Create a MongoDB connection.
    """
    global client, database

    try:
        client = AsyncIOMotorClient(settings.MONGODB_URI)
        database = client[settings.DATABASE_NAME]

        logger.info("Connected to MongoDB")

    except Exception as e:
        logger.exception(f"MongoDB connection failed: {e}")
        raise


async def close_mongodb_connection():
    """
    Close MongoDB connection.
    """
    global client

    if client:
        client.close()
        logger.info("MongoDB connection closed")


def get_database() -> AsyncIOMotorDatabase:
    """
    Return the database instance.
    """
    if database is None:
        raise RuntimeError("Database is not initialized.")

    return database