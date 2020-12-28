import { API_URL } from "../constants/constants";
import { handleError } from "./fetch_backend";

export async function userLogin(username: string, password: string) {
  const body = new URLSearchParams({
    grant_type: "password",
    username: username,
    password: password,
  });

  let url = new URL("token", API_URL).toString();
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    credentials: "include", // ONLY FOR DEBUG PURPOSES
    body: body,
  }).catch(handleError);

  const data = await response.json();

  if (!response.ok) {
    return {
      code: response.status,
      // fastapi returns Objects if some required fields are not present in the request
      message:
        typeof data.detail === "string" ? data.detail : "Invalid request",
    };
  }

  return data;
}
