import { API_URL } from "../constants/constants";

export async function getFromBackend(relURL: string) {
  /*
    Returns
    -------
    response.json()
        in case of success, the requested data[object]
        otherwise an object {code[int]: error code, message[str]: details}
        
    */
  let url = new URL(relURL, API_URL).toString();
  const response: Response = await fetch(url, {
    method: "GET",
    credentials: "include",
  }).catch(handleError);

  const data = await response.json();
  if (!response.ok) {
    return {
      code: response.status,
      message:
        typeof data.detail === "string" ? data.detail : "Invalid request",
    };
  }

  return (data || {});
}

export async function postToBackend(
  relURL: string = "",
  body: any = {}
) {
  let url = new URL(relURL, API_URL).toString();
  const response = await fetch(url, {
    method: "POST",
    mode: "cors",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  }).catch(handleError);

  const data = (await response.json());

  if (!response.ok) {
    return {
      code: response.status,
      message:
        typeof data.detail === "string" ? data.detail : "Invalid request",
    };
  }
  return data || {};
}

export function handleError(error: any): Response {
  console.warn(error);
  let response = new Response(
    JSON.stringify({
      code: 400,
      message: "Network error",
    })
  );
  return response;
}
