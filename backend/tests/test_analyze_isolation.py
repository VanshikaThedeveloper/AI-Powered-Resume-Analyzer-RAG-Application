import unittest
from unittest.mock import MagicMock, patch
import os
from pathlib import Path
from app.dependencies import get_session_analysis_service
from app.services.analysis_service import AnalysisService

# Set dummy environment variables to prevent initialization failures
os.environ["HUGGINGFACE_API_KEY"] = "dummy_key"
os.environ["MONGODB_URI"] = "mongodb://localhost:27017/"
os.environ["DATABASE_NAME"] = "test_db"

class TestAnalyzeIsolation(unittest.TestCase):
    @patch("app.services.analysis_service.extract_text_from_pdf")
    @patch("app.services.analysis_service.create_chunks")
    @patch("app.services.llm_service.LLMService.generate_response")
    @patch("app.vectorstore.chroma_service.Chroma")
    def test_isolation_and_cleanup(self, mock_chroma, mock_generate_response, mock_create_chunks, mock_extract):
        # Setup mocks
        mock_extract.return_value = "This is a dummy resume text."
        mock_create_chunks.return_value = [MagicMock()]
        mock_generate_response.return_value = """
        {
            "match_percentage": 85,
            "matching_skills": ["Python", "FastAPI"],
            "missing_skills": ["Docker"],
            "resume_suggestions": ["Add Docker experience."],
            "interview_questions": {
                "hr": ["Why do you want to join?"],
                "behavioral": ["Tell me about a time when..."],
                "technical": ["Explain FastAPI dependency injection."]
            }
        }
        """
        
        # We will track the temp paths used for Chroma initialization
        paths_used = []
        mock_stores = []
        
        def chroma_side_effect(*args, **kwargs):
            persist_dir = kwargs.get("persist_directory")
            paths_used.append(persist_dir)
            
            mock_store = MagicMock()
            mock_store._client = MagicMock()
            mock_stores.append(mock_store)
            return mock_store
            
        mock_chroma.side_effect = chroma_side_effect
        
        session_id = "e10915a1-77fe-49ab-ad07-a37ebecdc5c5"
        
        # Get the service twice (simulating two requests in same session)
        service1 = get_session_analysis_service(session_id)
        service2 = get_session_analysis_service(session_id)
        
        # Verify they use different paths
        self.assertNotEqual(service1.chroma_service.persist_directory, service2.chroma_service.persist_directory)
        self.assertIn("temp_", service1.chroma_service.persist_directory)
        self.assertIn("temp_", service2.chroma_service.persist_directory)

        # Let's call analyze_resume
        with patch("os.path.exists", return_value=True) as mock_exists, \
             patch("shutil.rmtree") as mock_rmtree:
             
            import asyncio
            
            # Run first analysis
            # Run with a runner/loop wrapper to handle async
            loop = asyncio.get_event_loop()
            result = loop.run_until_complete(service1.analyze_resume(Path("dummy.pdf"), "job description"))
            
            # Verify delete_collection was called
            mock_stores[0].delete_collection.assert_called_once()
            
            # Verify shutil.rmtree was called for the temp directory
            mock_rmtree.assert_any_call(service1.chroma_service.persist_directory, ignore_errors=True)
            
            # Run second analysis
            result2 = loop.run_until_complete(service2.analyze_resume(Path("dummy2.pdf"), "job description"))
            
            # Verify delete_collection was called for service2
            mock_stores[1].delete_collection.assert_called_once()
            mock_rmtree.assert_any_call(service2.chroma_service.persist_directory, ignore_errors=True)

if __name__ == "__main__":
    unittest.main()
