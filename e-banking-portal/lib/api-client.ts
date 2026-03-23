/**
 * API Client for E-Banking Portal
 * Handles authenticated communication with the Core API backend
 * Includes automatic token refresh and session management
 */

import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";

// Create axios instance with default config
const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
  timeout: 15000,
});

// Token management
const getAccessToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("accessToken");
  }
  return null;
};

const getRefreshToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("refreshToken");
  }
  return null;
};

const setAccessToken = (token: string): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem("accessToken", token);
  }
};

const setRefreshToken = (token: string): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem("refreshToken", token);
  }
};

const clearTokens = (): void => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  }
};

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Skip the unavailable check for local Next.js API routes (baseURL: "")
    if (apiUnavailable && config.baseURL !== "") {
      return Promise.reject(
        new AxiosError("Service temporarily unavailable. Please wait a moment and try again.", "ERR_NETWORK", config),
      );
    }
    const token = getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor - Handle token refresh
let isRefreshing = false;

interface QueueEntry {
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}
let failedQueue: QueueEntry[] = [];
let apiUnavailable = false;

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token as string);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest: any = error.config;

    // Handle 401 errors (token expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue the request while token is being refreshed
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getRefreshToken();

      if (!refreshToken) {
        // No refresh token, redirect to login
        clearTokens();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return Promise.reject(error);
      }

      try {
        // Attempt to refresh the token
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh`,
          { refreshToken },
          { withCredentials: true },
        );

        const { accessToken, refreshToken: newRefreshToken } = response.data;

        setAccessToken(accessToken);
        if (newRefreshToken) {
          setRefreshToken(newRefreshToken);
        }

        // Update the original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }

        processQueue(null, accessToken);
        isRefreshing = false;

        // Retry the original request
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;

        // Refresh failed, redirect to login
        clearTokens();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }

        return Promise.reject(refreshError);
      }
    }

    // Network error — set unavailable flag with auto-reset after 30s
    // Only block backend requests (not local Next.js API routes which use baseURL: "")
    const isLocalRoute = !originalRequest?.baseURL && originalRequest?.baseURL !== undefined
      ? false
      : originalRequest?.baseURL === "";
    if (!error.response && error.request && !isLocalRoute) {
      apiUnavailable = true;
      setTimeout(() => {
        apiUnavailable = false;
      }, 30_000);
    }

    const suppressError =
      (originalRequest as any)?.headers?.["x-silent-error"] === "1";
    if (suppressError || error.code === "ERR_NETWORK") {
      return Promise.reject(error);
    }

    // Handle other errors
    if (error.response) {
      switch (error.response.status) {
        case 403:
          console.error("Forbidden access");
          break;
        case 404:
          console.error("Resource not found");
          break;
        case 500:
          console.error("Server error");
          break;
        default:
          console.error("API error:", error.response.status);
      }
    } else if (error.request) {
      console.error("Network error - no response received");
    } else {
      console.error("Error setting up request:", error.message);
    }

    return Promise.reject(error);
  },
);

// API Methods
export const api = {
  // Authentication
  auth: {
    login: async (credentials: {
      accountNumber?: string;
      email?: string;
      password: string;
    }) => {
      const response = await apiClient.post("/api/auth/login", credentials);
      const { accessToken, refreshToken } = response.data;
      setAccessToken(accessToken);
      setRefreshToken(refreshToken);
      return response.data;
    },

    logout: async () => {
      try {
        await apiClient.post("/api/auth/logout");
      } finally {
        clearTokens();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }
    },

    refreshToken: async () => {
      const refreshToken = getRefreshToken();
      const response = await apiClient.post("/api/auth/refresh", {
        refreshToken,
      });
      const { accessToken } = response.data;
      setAccessToken(accessToken);
      return response.data;
    },

    getPortalStatus: async () => {
      const response = await apiClient.get("/api/portal/health");
      return response.data;
    },
  },

  // Two-Factor Authentication
  twoFactor: {
    getStatus: async () => {
      const response = await apiClient.get("/api/two-factor/status");
      return response.data;
    },

    setup: async () => {
      const response = await apiClient.post("/api/two-factor/setup");
      return response.data;
    },

    enable: async (payload: { code: string }) => {
      const response = await apiClient.post("/api/two-factor/enable", payload);
      return response.data;
    },

    disable: async (payload: { code: string }) => {
      const response = await apiClient.post("/api/two-factor/disable", payload);
      return response.data;
    },

    verify: async (payload: { code: string }) => {
      const response = await apiClient.post("/api/two-factor/verify", payload);
      return response.data;
    },

    regenerateBackupCodes: async () => {
      const response = await apiClient.post(
        "/api/two-factor/backup-codes/regenerate",
      );
      return response.data;
    },
  },

  // Contact / Support
  contact: {
    send: async (data: {
      subject: string;
      category: string;
      message: string;
    }) => {
      // Public endpoint — use a fresh axios call without the auth interceptor
      const baseURL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const response = await axios.post(`${baseURL}/api/contact`, data, {
        headers: { "Content-Type": "application/json" },
        timeout: 15000,
      });
      return response.data;
    },
  },

  // Accounts
  accounts: {
    getAll: async () => {
      const response = await apiClient.get("/api/accounts");
      return response.data;
    },

    getById: async (id: string) => {
      const response = await apiClient.get(`/api/accounts/${id}`);
      return response.data;
    },

    getBalance: async (id: string) => {
      const response = await apiClient.get(`/api/accounts/${id}/balance`);
      return response.data;
    },
  },

  // Transactions
  transactions: {
    getAll: async (params?: any) => {
      const response = await apiClient.get("/api/transactions", { params });

      // Map backend data to frontend structure
      const transactions = response.data.transactions || response.data;
      const mappedTransactions = Array.isArray(transactions)
        ? transactions.map((tx: any) => ({
            ...tx,
            date: tx.date || tx.createdAt,
            type:
              tx.type === "DEPOSIT" ||
              tx.type === "TRANSFER_IN" ||
              (tx.type === "TRANSFER" && Number(tx.amount) > 0)
                ? "credit"
                : "debit",
            category: tx.category || "General",
            originalType: tx.type,
          }))
        : transactions;

      return Array.isArray(transactions)
        ? { ...response.data, transactions: mappedTransactions }
        : mappedTransactions;
    },

    getById: async (id: string) => {
      const response = await apiClient.get(`/api/transactions/${id}`);
      return response.data;
    },

    updateCategory: async (id: string, category: string) => {
      const response = await apiClient.patch(
        `/api/transactions/${id}/category`,
        { category },
      );
      return response.data;
    },

    getStats: async (period: "week" | "month" | "year" = "month") => {
      const response = await apiClient.get("/api/transactions/stats", {
        params: { period },
      });
      return response.data;
    },

    addNote: async (id: string, note: string) => {
      const response = await apiClient.post(`/api/transactions/${id}/notes`, {
        note,
      });
      return response.data;
    },

    dispute: async (
      id: string,
      payload?: { reason?: string; hasAttachments?: boolean },
    ) => {
      const response = await apiClient.post(
        `/api/transactions/${id}/dispute`,
        payload || {},
      );
      return response.data;
    },

    exportReceipt: async (id: string, format: "pdf" | "csv" = "pdf") => {
      const response = await apiClient.post(
        "/api/transactions/export",
        { format, ids: [id] },
        { responseType: "blob" },
      );
      return response.data as Blob;
    },
  },

  // Transfers
  transfers: {
    create: async (transferData: any) => {
      const response = await apiClient.post("/api/transfers", transferData);
      return response.data;
    },

    createWire: async (wireData: any) => {
      const response = await apiClient.post("/api/wire-transfers", wireData);
      return response.data;
    },

    getHistory: async (params?: any) => {
      const response = await apiClient.get("/api/transfers", { params });
      return response.data;
    },

    getRecentRecipients: async (method: string, limit: number = 5) => {
      const response = await apiClient.get("/api/transfers/recent-recipients", {
        params: { method, limit },
      });
      return response.data;
    },
  },

  // Cards
  cards: {
    getAll: async () => {
      const response = await apiClient.get("/api/cards");
      return response.data;
    },

    issue: async (accountId: string, cardType: "DEBIT" | "CREDIT") => {
      const response = await apiClient.post("/api/cards", {
        accountId,
        cardType,
      });
      return response.data;
    },

    freeze: async (cardId: string) => {
      const response = await apiClient.post(`/api/cards/${cardId}/freeze`);
      return response.data;
    },

    unfreeze: async (cardId: string) => {
      const response = await apiClient.post(`/api/cards/${cardId}/unfreeze`);
      return response.data;
    },

    updateLimits: async (
      cardId: string,
      limits: { dailyLimit?: number; monthlyLimit?: number },
    ) => {
      const response = await apiClient.put(
        `/api/cards/${cardId}/limits`,
        limits,
      );
      return response.data;
    },
  },

  // Bills
  bills: {
    getAll: async () => {
      const response = await apiClient.get("/api/bills");
      return response.data;
    },

    getProviders: async () => {
      // Uses local Next.js API route
      const response = await apiClient.get("/api/bills/providers", {
        baseURL: "",
      });
      return response.data;
    },

    getPayees: async () => {
      const response = await apiClient.get("/api/bills/payees");
      return response.data;
    },

    addPayee: async (data: {
      name: string;
      accountNumber: string;
      category: string;
    }) => {
      const response = await apiClient.post("/api/bills/payees", data);
      return response.data;
    },

    pay: async (data: {
      payeeId: string;
      amount: number;
      accountId: string;
      paymentDate?: string;
    }) => {
      const response = await apiClient.post("/api/bills/pay", data);
      return response.data;
    },

    uploadInvoice: async (formData: FormData) => {
      const response = await apiClient.post(
        "/api/bills/upload-invoice",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          baseURL: "",
        },
      );
      return response.data;
    },

    getConfig: async () => {
      const response = await apiClient.get("/api/bills/config/verification");
      return response.data;
    },

    payVerified: async (formData: FormData) => {
      const response = await apiClient.post(
        "/api/bills/pay-verified",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      return response.data;
    },
  },

  // Savings Goals (local Next.js Edge route — persisted in-memory per instance)
  savingsGoals: {
    get: async () => {
      const response = await apiClient.get("/api/savings-goals", {
        baseURL: "",
      });
      return response.data;
    },
    update: async (data: any) => {
      const response = await apiClient.post("/api/savings-goals", data, {
        baseURL: "",
      });
      return response.data;
    },
  },

  // Beneficiaries
  beneficiaries: {
    getAll: async () => {
      const response = await apiClient.get("/api/beneficiaries");
      return response.data;
    },

    getAllByMethod: async (method: string) => {
      const response = await apiClient.get("/api/beneficiaries", {
        params: { method },
      });
      return response.data;
    },

    create: async (beneficiaryData: any) => {
      const response = await apiClient.post(
        "/api/beneficiaries",
        beneficiaryData,
      );
      return response.data;
    },

    delete: async (id: string) => {
      const response = await apiClient.delete(`/api/beneficiaries/${id}`);
      return response.data;
    },
  },

  exchangeRates: {
    getRate: async (from: string, to: string) => {
      const response = await apiClient.get("/api/exchange-rates", {
        params: { from, to },
      });
      return response.data;
    },
  },

  // Statements
  statements: {
    getAll: async (params?: any) => {
      const response = await apiClient.get("/api/statements", { params });
      return response.data;
    },

    download: async (id: string) => {
      const response = await apiClient.get(`/api/statements/${id}/download`, {
        responseType: "blob",
      });
      return response.data;
    },

    generate: async (accountId: string, period: string) => {
      const response = await apiClient.post("/api/statements/generate", {
        accountId,
        period,
      });
      return response.data;
    },
  },

  // User Profile
  profile: {
    get: async () => {
      const response = await apiClient.get("/api/auth/profile");
      return response.data;
    },

    update: async (profileData: any) => {
      const response = await apiClient.put("/api/auth/profile", profileData);
      return response.data;
    },

    changePassword: async (passwordData: any) => {
      const response = await apiClient.post(
        "/api/auth/change-password",
        passwordData,
      );
      return response.data;
    },
  },

  // Notifications
  notifications: {
    getAll: async () => {
      const response = await apiClient.get("/api/notifications", {
        headers: { "x-silent-error": "1" },
      });
      return response.data;
    },
  },
};

export {
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
  clearTokens,
};
export default apiClient;
