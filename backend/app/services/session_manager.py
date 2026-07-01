from datetime import datetime, timezone
from uuid import uuid4
import threading
from app.core.logger import logger

class SessionManager:
    def __init__(self):
        # Maps session_id -> {"created_at": datetime, "last_activity": datetime}
        self._sessions = {}
        self._lock = threading.Lock()

    def create_session(self) -> str:
        """
        Generate a new unique session ID and register it.
        """
        session_id = str(uuid4())
        now = datetime.now(timezone.utc)
        with self._lock:
            self._sessions[session_id] = {
                "created_at": now,
                "last_activity": now
            }
        logger.info(f"Session created: {session_id}")
        return session_id

    def get_session(self, session_id: str) -> dict | None:
        """
        Retrieve session metadata if it exists.
        """
        with self._lock:
            return self._sessions.get(session_id)

    def update_activity(self, session_id: str) -> bool:
        """
        Update the last activity timestamp for a session.
        """
        with self._lock:
            if session_id in self._sessions:
                self._sessions[session_id]["last_activity"] = datetime.now(timezone.utc)
                return True
        return False

    def session_exists(self, session_id: str) -> bool:
        """
        Check if a session ID is valid and active.
        """
        with self._lock:
            return session_id in self._sessions

    def delete_session(self, session_id: str) -> bool:
        """
        Remove a session from the manager (e.g. during expiration).
        """
        with self._lock:
            if session_id in self._sessions:
                del self._sessions[session_id]
                logger.info(f"Session expired/removed from manager: {session_id}")
                return True
        return False

    def get_expired_sessions(self, max_age_minutes: int = 30) -> list[str]:
        """
        Get all sessions that haven't had activity in the specified number of minutes.
        """
        expired_ids = []
        now = datetime.now(timezone.utc)
        with self._lock:
            for session_id, meta in self._sessions.items():
                delta = now - meta["last_activity"]
                if delta.total_seconds() > max_age_minutes * 60:
                    expired_ids.append(session_id)
        return expired_ids

# Global session manager instance
session_manager = SessionManager()
