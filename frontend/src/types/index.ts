export interface InterviewQuestions {
  hr: string[];
  behavioral: string[];
  technical: string[];
}

export interface AnalysisResponse {
  match_percentage: number;
  matching_skills: string[];
  missing_skills: string[];
  resume_suggestions: string[];
  interview_questions: InterviewQuestions;
  session_id?: string;
}

export interface UploadResponse {
  message: string;
  original_filename: string;
  stored_filename: string;
  file_size_mb: number;
  session_id?: string;
}

export interface ParserTestResponse {
  filename: string;
  characters: number;
  text: string;
}
