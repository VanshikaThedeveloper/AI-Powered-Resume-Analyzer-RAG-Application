import axios from "axios";

// Since we use Next.js rewrites in next.config.ts to avoid CORS,
// we can use a relative URL "/api/v1" for client-side queries.
// If running on the server, we use the absolute environment variable.
const isServer = typeof window === "undefined";
const baseURL = isServer 
  ? (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000") 
  : "/api/v1";

export const apiClient = axios.create({
  baseURL,
  timeout: 120000, // 2 minutes (RAG pipeline + LLM processing might take some time)
  headers: {
    "Content-Type": "application/json",
  },
});

// Response Interceptor for cleaner error parsing
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    let errorMessage = "An unexpected error occurred.";
    
    if (error.response) {
      // Backend returned an error response status (4xx, 5xx)
      errorMessage = error.response.data?.detail || error.response.data?.message || errorMessage;
    } else if (error.request) {
      // Request was made but no response was received
      errorMessage = "The server did not respond. Please make sure the backend is running.";
    } else {
      // Something went wrong setting up the request
      errorMessage = error.message;
    }
    
    return Promise.reject(new Error(errorMessage));
  }
);
export default apiClient;
