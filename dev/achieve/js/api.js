const API = (() => {
  const defaultOrigin =
    window.location.port === "3000" ? window.location.origin : "http://localhost:3000";

  const getOrigin = () => {
    if (typeof window.API_ORIGIN === "string" && window.API_ORIGIN.length > 0) {
      return window.API_ORIGIN;
    }
    return defaultOrigin;
  };

  const getAccessToken = () => sessionStorage.getItem("accessToken");
  const getRefreshToken = () => sessionStorage.getItem("refreshToken");

  const setTokens = ({ accessToken, refreshToken }) => {
    if (accessToken) sessionStorage.setItem("accessToken", accessToken);
    if (refreshToken) sessionStorage.setItem("refreshToken", refreshToken);
  };

  const clearTokens = () => {
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("refreshToken");
    sessionStorage.removeItem("user");
  };

  const parseJsonSafe = async (response) => {
    const text = await response.text();
    if (!text) return null;
    try {
      return JSON.parse(text);
    } catch {
      return null;
    }
  };

  const refresh = async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return null;

    const response = await fetch(`${getOrigin()}/api/v1/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) return null;

    const payload = await response.json();
    const tokens = payload?.data;
    if (!tokens?.accessToken) return null;
    setTokens(tokens);
    return tokens.accessToken;
  };

  const request = async (path, options = {}) => {
    const {
      method = "GET",
      headers = {},
      body,
      auth = false,
      retryOnAuthFailure = true,
    } = options;

    const url = `${getOrigin()}/api/v1${path.startsWith("/") ? "" : "/"}${path}`;
    const finalHeaders = { ...headers };

    if (body !== undefined && !(body instanceof FormData)) {
      finalHeaders["Content-Type"] = "application/json";
    }

    if (auth) {
      const token = getAccessToken();
      if (token) finalHeaders.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method,
      headers: finalHeaders,
      body: body === undefined ? undefined : body instanceof FormData ? body : JSON.stringify(body),
    });

    if (response.status === 401 && auth && retryOnAuthFailure) {
      const newToken = await refresh();
      if (newToken) {
        return request(path, { ...options, retryOnAuthFailure: false });
      }
    }

    if (!response.ok) {
      const data = await parseJsonSafe(response);
      const message =
        data?.error?.message || data?.message || `Request failed (${response.status})`;
      const error = new Error(message);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    const json = await parseJsonSafe(response);
    return json;
  };

  const download = async (path, filename) => {
    const url = `${getOrigin()}/api/v1${path.startsWith("/") ? "" : "/"}${path}`;
    const headers = {};
    const token = getAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;

    const response = await fetch(url, { method: 'GET', headers });
    if (!response.ok) throw new Error(`Download failed (${response.status})`);

    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = filename || 'download';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(blobUrl);
    a.remove();
  };

  return { request, download, setTokens, clearTokens, getAccessToken, getRefreshToken };
})();

