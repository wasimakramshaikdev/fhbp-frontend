import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

export function isValidTokenString(val) {
  if (!val || typeof val !== 'string') return false;
  const clean = val.trim();
  if (
    !clean ||
    clean === 'undefined' ||
    clean === 'null' ||
    clean === 'none' ||
    clean === '[object Object]'
  ) {
    return false;
  }
  return true;
}

function parseCookieAuthPayload(rawVal) {
  if (!rawVal || typeof rawVal !== 'string') return null;
  const clean = rawVal.trim().replace(/^["']|["']$/g, '');

  // 1. Check if raw value is a JWT (3 segments)
  if (clean.startsWith('eyJ') && clean.split('.').length === 3) {
    return { access_token: clean };
  }

  const candidates = [clean];
  try {
    const unquoted = decodeURIComponent(clean);
    if (unquoted !== clean) candidates.push(unquoted);
  } catch (e) {}

  for (const cand of candidates) {
    const trimmed = cand.trim().replace(/^["']|["']$/g, '');
    if (trimmed.startsWith('eyJ') && trimmed.split('.').length === 3) {
      return { access_token: trimmed };
    }

    // Try parsing as JSON
    try {
      const parsed = JSON.parse(trimmed);
      if (parsed && typeof parsed === 'object') return parsed;
    } catch (e) {}

    // Try Base64 decoding (window.atob)
    try {
      if (typeof window !== 'undefined' && window.atob) {
        const decoded = window.atob(trimmed);
        const decodedTrim = decoded.trim().replace(/^["']|["']$/g, '');
        if (decodedTrim.startsWith('eyJ') && decodedTrim.split('.').length === 3) {
          return { access_token: decodedTrim };
        }
        const parsed = JSON.parse(decodedTrim);
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch (e) {}
  }

  return null;
}

export function getStoredAccessToken() {
  const token = localStorage.getItem('access_token');
  if (isValidTokenString(token)) return token.trim();

  // Fallback: check document.cookie for arena session cookies
  if (typeof document !== 'undefined' && document.cookie) {
    const cookies = document.cookie.split(';');
    for (let c of cookies) {
      const [name, ...rest] = c.trim().split('=');
      const val = rest.join('=');
      if (
        name === 'arena-auth-prod-v1.0' ||
        name === 'arena-auth-prod-v1.1' ||
        name === 'access_token' ||
        name === 'token'
      ) {
        const parsed = parseCookieAuthPayload(val);
        if (parsed) {
          const extractedToken =
            parsed.access_token ||
            parsed.token ||
            (parsed.tokens && parsed.tokens.access_token);
          if (isValidTokenString(extractedToken)) {
            localStorage.setItem('access_token', extractedToken);
            if (parsed.user) {
              localStorage.setItem('user', JSON.stringify(parsed.user));
            }
            const extractedRefresh =
              parsed.refresh_token ||
              (parsed.tokens && parsed.tokens.refresh_token);
            if (isValidTokenString(extractedRefresh)) {
              localStorage.setItem('refresh_token', extractedRefresh);
            }
            return extractedToken;
          }
        }
      }
    }
  }
  return null;
}

export function getStoredRefreshToken() {
  const refresh = localStorage.getItem('refresh_token');
  if (isValidTokenString(refresh)) return refresh.trim();

  if (typeof document !== 'undefined' && document.cookie) {
    const cookies = document.cookie.split(';');
    for (let c of cookies) {
      const [name, ...rest] = c.trim().split('=');
      const val = rest.join('=');
      if (
        name === 'refresh_token' ||
        name === 'arena-auth-prod-v1.0' ||
        name === 'arena-auth-prod-v1.1'
      ) {
        const parsed = parseCookieAuthPayload(val);
        if (parsed) {
          const extractedRefresh =
            parsed.refresh_token ||
            (parsed.tokens && parsed.tokens.refresh_token);
          if (isValidTokenString(extractedRefresh)) {
            localStorage.setItem('refresh_token', extractedRefresh);
            return extractedRefresh;
          }
        }
      }
    }
  }
  return null;
}

// Request Interceptor: Attach JWT Bearer Token if present
api.interceptors.request.use(
  (config) => {
    const token = getStoredAccessToken();
    const hasToken = Boolean(token);
    const tokenLen = token ? token.length : 0;

    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
      delete config.headers['content-type'];
    }

    if (token) {
      config.headers = config.headers || {};
      if (typeof config.headers.set === 'function') {
        config.headers.set('Authorization', `Bearer ${token}`);
      } else {
        config.headers['Authorization'] = `Bearer ${token}`;
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    const hasAuth = Boolean(
      (typeof config.headers?.get === 'function'
        ? config.headers.get('Authorization')
        : null) ||
        config.headers?.Authorization ||
        config.headers?.['Authorization']
    );

    console.log(
      `[AUTH DEBUG] request method=${config.method?.toUpperCase()} url=${config.url} access token exists: ${hasToken} token length: ${tokenLen} Authorization header attached: ${hasAuth}`
    );
    return config;
  },
  (error) => {
    console.error(`[AUTH DEBUG] request error:`, error);
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle 401 Unauthorized with automatic Token Refresh & Loop Prevention
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => {
    console.log(
      `[AUTH DEBUG] response method=${response.config.method?.toUpperCase()} url=${response.config.url} status: ${
        response.status
      }`
    );
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    console.warn(
      `[AUTH DEBUG] error method=${originalRequest?.method?.toUpperCase()} url=${originalRequest?.url} response status: ${status}`,
      error.response?.data
    );

    if (status === 401 && originalRequest) {
      // If the 401 is from the login or register endpoint, do not refresh or clear session
      if (
        originalRequest.url?.includes('/auth/login/') ||
        originalRequest.url?.includes('/auth/register/')
      ) {
        return Promise.reject(error.response?.data || error);
      }

      // If the 401 is from the refresh endpoint itself: refresh token is genuinely invalid or expired
      if (originalRequest.url?.includes('/auth/refresh/')) {
        console.warn(
          `[AUTH DEBUG] Refresh token rejected with 401. Clearing authentication session.`
        );
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        return Promise.reject(error.response?.data || error);
      }

      // Prevent infinite refresh loop: if this specific request was already retried once after refresh, reject immediately
      if (originalRequest._retry) {
        console.warn(
          `[AUTH DEBUG] Retry loop prevented: Request to ${originalRequest.url} failed with 401 after token refresh.`
        );
        return Promise.reject(error.response?.data || error.message);
      }

      // If a refresh is already in progress, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token) => {
              originalRequest._retry = true;
              originalRequest.headers = originalRequest.headers || {};
              if (typeof originalRequest.headers.set === 'function') {
                originalRequest.headers.set('Authorization', `Bearer ${token}`);
              } else {
                originalRequest.headers['Authorization'] = `Bearer ${token}`;
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              resolve(api(originalRequest));
            },
            reject: (err) => reject(err),
          });
        });
      }

      // Check if we have a refresh token available
      const storedRefreshToken = getStoredRefreshToken();
      if (!storedRefreshToken) {
        console.warn(
          `[AUTH DEBUG] No refresh token available to recover 401 on ${originalRequest.url}.`
        );
        return Promise.reject(error.response?.data || error.message);
      }

      // Mark original request as retried and begin refresh
      originalRequest._retry = true;
      isRefreshing = true;

      console.log(
        `[AUTH DEBUG] Attempting ONE token refresh with stored refresh token...`
      );

      try {
        const refreshResponse = await axios.post(
          '/api/v1/auth/refresh/',
          { refresh_token: storedRefreshToken },
          { withCredentials: true }
        );

        console.log(
          `[AUTH DEBUG] /auth/refresh/ status: ${refreshResponse.status} success: ${Boolean(
            refreshResponse.data?.success
          )} newAccessTokenReceived: ${Boolean(
            refreshResponse.data?.data?.access_token
          )}`
        );

        if (
          refreshResponse.data?.success &&
          refreshResponse.data?.data?.access_token
        ) {
          const newToken = refreshResponse.data.data.access_token;
          localStorage.setItem('access_token', newToken);
          if (refreshResponse.data.data.refresh_token) {
            localStorage.setItem(
              'refresh_token',
              refreshResponse.data.data.refresh_token
            );
          }

          originalRequest.headers = originalRequest.headers || {};
          if (typeof originalRequest.headers.set === 'function') {
            originalRequest.headers.set('Authorization', `Bearer ${newToken}`);
          } else {
            originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }

          processQueue(null, newToken);
          isRefreshing = false;
          return api(originalRequest);
        } else {
          throw new Error('Refresh response missing access token');
        }
      } catch (refreshErr) {
        console.error(`[AUTH DEBUG] Refresh attempt failed:`, refreshErr);
        processQueue(refreshErr, null);
        isRefreshing = false;
        if (
          refreshErr.response?.status === 401 ||
          refreshErr.response?.status === 400
        ) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
        }
        return Promise.reject(error.response?.data || error.message);
      }
    }

    return Promise.reject(error.response?.data || error.message);
  }
);

export default api;
