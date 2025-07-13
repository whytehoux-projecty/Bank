"use client";

import React, {
  useState,
  createContext,
  useContext,
  useMemo,
  useCallback,
  useEffect,
} from "react";
import { AuthRole, User, AccountApplication } from "../types";
import { MOCK_APPLICATIONS } from "../constants";

interface AuthContextType {
  currentUser: User | null;
  role: AuthRole;
  login: (user: User) => void;
  logout: () => void;
  applications: AccountApplication[];
  addApplication: (
    app: Omit<AccountApplication, "id" | "status" | "dateSubmitted">
  ) => void;
  updateApplicationStatus: (
    appId: string,
    status: "approved" | "rejected"
  ) => void;
  getToken: () => string | null;
  setToken: (token: string | null) => void;
  refreshToken: string | null;
  tokenExpiry: string | null;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [role, setRole] = useState<AuthRole>(AuthRole.Guest);
  const [applications, setApplications] =
    useState<AccountApplication[]>(MOCK_APPLICATIONS);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [tokenExpiry, setTokenExpiry] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("authToken");
      const storedRefreshToken = localStorage.getItem("refreshToken");
      const storedExpiry = localStorage.getItem("tokenExpiry");

      if (storedToken && storedExpiry) {
        const expiryDate = new Date(storedExpiry);
        if (expiryDate > new Date()) {
          setAuthToken(storedToken || null);
          setRefreshToken(storedRefreshToken || null);
          setTokenExpiry(storedExpiry || null);
        } else {
          // Token expired, clear storage
          localStorage.removeItem("authToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("tokenExpiry");
        }
      }
    }
  }, []);

  const login = useCallback((user: User) => {
    setCurrentUser(user);
    setRole(user.role);
    // Store tokens and expiry
    if (user.token) setAuthToken(user.token);
    if (user.refreshToken) setRefreshToken(user.refreshToken);
    if (user.tokenExpiry) setTokenExpiry(user.tokenExpiry);

    // Persist tokens in localStorage
    if (typeof window !== "undefined") {
      if (user.token) {
        localStorage.setItem("authToken", user.token);
      }
      if (user.refreshToken) {
        localStorage.setItem("refreshToken", user.refreshToken);
      }
      if (user.tokenExpiry) {
        localStorage.setItem("tokenExpiry", user.tokenExpiry);
      }
    }
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
    setRole(AuthRole.Guest);
    setAuthToken(null);
    setRefreshToken(null);
    setTokenExpiry(null);

    // Clear tokens from localStorage
    if (typeof window !== "undefined") {
      localStorage.removeItem("authToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("tokenExpiry");
    }
  }, []);

  const addApplication = useCallback(
    (appData: Omit<AccountApplication, "id" | "status" | "dateSubmitted">) => {
      const newApplication: AccountApplication = {
        ...appData,
        id: `app${Date.now()}`,
        status: "pending",
        dateSubmitted: new Date().toISOString().split("T")[0],
      };
      setApplications((prev) => [...prev, newApplication]);
    },
    []
  );

  const updateApplicationStatus = useCallback(
    (appId: string, status: "approved" | "rejected") => {
      setApplications((prev) =>
        prev.map((app) => (app.id === appId ? { ...app, status } : app))
      );
      if (status === "approved") {
        const app = applications.find((a) => a.id === appId);
        if (app) {
          console.log(
            `Account for ${app.applicantName} approved. A new user should be created.`
          );
        }
      }
    },
    [applications]
  );

  const authContextValue = useMemo(
    () => ({
      currentUser,
      role,
      login,
      logout,
      applications,
      addApplication,
      updateApplicationStatus,
      getToken: () => {
        // Check if token is expired
        if (tokenExpiry && new Date(tokenExpiry) < new Date()) {
          // Token expired, try to refresh
          if (refreshToken) {
            // TODO: Implement token refresh logic
            console.log("Token expired, need to refresh...");
          }
          return null;
        }
        return authToken;
      },
      setToken: setAuthToken,
      refreshToken,
      tokenExpiry,
    }),
    [
      currentUser,
      role,
      applications,
      authToken,
      refreshToken,
      tokenExpiry,
      login,
      logout,
      addApplication,
      updateApplicationStatus,
      setAuthToken,
    ]
  );

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};
