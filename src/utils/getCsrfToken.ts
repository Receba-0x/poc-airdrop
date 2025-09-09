import axios from "axios";

const CSRF_TOKEN_HEADER = "x-csrf-token";

export async function getCsrfToken(): Promise<string> {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/csrf-token`;
  const res = await axios.get(url, {
    withCredentials: true,
  });
  return res.data.csrfToken;
}

export { CSRF_TOKEN_HEADER };
