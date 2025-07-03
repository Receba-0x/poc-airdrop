import axios from "axios";

const CSRF_TOKEN_HEADER = "x-csrf-token";

export async function getCsrfToken(): Promise<string> {
  const res = await axios.get("/api/csrf", { withCredentials: true });
  // O token pode vir no header ou no corpo:
  return res.headers[CSRF_TOKEN_HEADER] || res.data.csrfToken;
}

export { CSRF_TOKEN_HEADER }; 