import unittest
from unittest.mock import MagicMock, patch
import os
from pathlib import Path
from fastapi.testclient import TestClient
from fastapi import status

# Set dummy environment variables to prevent initialization failures
os.environ["HUGGINGFACE_API_KEY"] = "dummy_key"
os.environ["MONGODB_URI"] = "mongodb://localhost:27017/"
os.environ["DATABASE_NAME"] = "test_db"

from app.main import app
from app.services.session_manager import session_manager
from app.services.cleanup_service import clean_session_files, is_valid_uuid
from app.config.settings import settings

class TestSessionManagement(unittest.TestCase):
    def setUp(self):
        # Clean session registry before each test
        session_manager._sessions.clear()

    def test_session_creation_and_expiration(self):
        # 1. Create a session
        session_id = session_manager.create_session()
        self.assertTrue(is_valid_uuid(session_id))
        self.assertTrue(session_manager.session_exists(session_id))

        # 2. Update session activity
        meta = session_manager.get_session(session_id)
        first_activity = meta["last_activity"]

        session_manager.update_activity(session_id)
        meta2 = session_manager.get_session(session_id)
        self.assertGreaterEqual(meta2["last_activity"], first_activity)

        # 3. Check expiration detection (not expired yet)
        expired = session_manager.get_expired_sessions(max_age_minutes=30)
        self.assertNotIn(session_id, expired)

        # Force expiration detection by querying with negative age
        expired_instantly = session_manager.get_expired_sessions(max_age_minutes=-1)
        self.assertIn(session_id, expired_instantly)

        # 4. Delete session
        session_manager.delete_session(session_id)
        self.assertFalse(session_manager.session_exists(session_id))

    @patch("shutil.rmtree")
    def test_safe_directory_cleanup(self, mock_rmtree):
        # Test UUID validation
        self.assertFalse(is_valid_uuid("not-a-uuid"))
        self.assertTrue(is_valid_uuid("e10915a1-77fe-49ab-ad07-a37ebecdc5c5"))

        session_id = "e10915a1-77fe-49ab-ad07-a37ebecdc5c5"
        upload_root = Path(settings.UPLOAD_DIRECTORY).resolve()
        chroma_root = Path(settings.CHROMA_DB_PATH).resolve()

        session_upload_dir = upload_root / session_id
        session_chroma_dir = chroma_root / session_id

        # Simulate that directories exist
        with patch.object(Path, "exists", return_value=True), \
             patch.object(Path, "is_dir", return_value=True):
            clean_session_files(session_id)

            # verify shutil.rmtree was called for both
            self.assertEqual(mock_rmtree.call_count, 2)
            mock_rmtree.assert_any_call(session_upload_dir.resolve())
            mock_rmtree.assert_any_call(session_chroma_dir.resolve())

        # Test safety check prevents deleting out-of-bounds directories
        mock_rmtree.reset_mock()
        clean_session_files("../escaped-session")
        mock_rmtree.assert_not_called()

    @patch("app.api.routes.upload.save_uploaded_file")
    def test_api_upload_session(self, mock_save):
        client = TestClient(app)

        # Mock the save_uploaded_file return
        mock_save.return_value = {
            "message": "File uploaded successfully.",
            "original_filename": "resume.pdf",
            "stored_filename": "dummy.pdf",
            "file_size_mb": 0.5,
            "session_id": "e10915a1-77fe-49ab-ad07-a37ebecdc5c5"
        }

        # 1. First upload (no session header, should create and return one)
        response = client.post(
            "/upload",
            files={"file": ("resume.pdf", b"PDF content", "application/pdf")}
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        data = response.json()
        self.assertIn("session_id", data)

        # 2. Upload with invalid/expired session
        response2 = client.post(
            "/upload",
            headers={"X-Session-ID": "00000000-0000-0000-0000-000000000000"},
            files={"file": ("resume.pdf", b"PDF content", "application/pdf")}
        )
        self.assertEqual(response2.status_code, status.HTTP_410_GONE)
        self.assertIn("expired", response2.json()["detail"])

if __name__ == "__main__":
    unittest.main()
