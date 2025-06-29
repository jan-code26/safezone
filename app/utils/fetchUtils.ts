export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retries: number = 3,
  backoffMs: number = 1000
): Promise<Response> {
  let lastError: any;

  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        // Only retry on network errors or server-side issues (5xx)
        // Client-side errors (4xx) usually won't be solved by a retry
        if (response.status >= 500 || response.status === 0) { // status 0 for network errors
          throw new Error(`API request failed with status ${response.status}`);
        }
        // For 4xx errors, don't retry, just return the response
        return response;
      }
      return response;
    } catch (error) {
      lastError = error;
      if (i < retries - 1) {
        const delay = backoffMs * Math.pow(2, i);
        console.warn(`Fetch failed for ${url}. Retrying in ${delay}ms... (Attempt ${i + 1}/${retries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  console.error(`Fetch failed for ${url} after ${retries} retries. Last error:`, lastError);
  throw lastError; // Re-throw the last error if all retries fail
}
