import React, {
  useState,
  createContext,
  useContext,
  useMemo,
  useCallback,
  useEffect,
} from "react";
import {
  Routes,
  Route,
  Navigate,
  useLocation,
  HashRouter,
} from "react-router-dom";
import MobileNavbar from "./components/MobileNavbar";
import Footer from "./components/Footer";
import AIAssistant from "./components/AIAssistant";
import HomePage from "./pages/HomePage";
import InfoPage from "./pages/InfoPage";
import ContactPage from "./pages/ContactPage";
import AuthPage from "./pages/AuthPage";
import TermsPage from "./pages/TermsPage";
import PrivacyPage from "./pages/PrivacyPage";
import UserDashboardPage from "./pages/UserDashboardPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import CreditCardPage from "./pages/CreditCardPage";
import LoansPage from "./pages/LoansPage";
import InvestmentsPage from "./pages/InvestmentsPage";
import { AuthRole, User, AccountApplication } from "./types";
import { MOCK_APPLICATIONS } from "./constants"; // MOCK_USERS removed as it's not directly used here for login state

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
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

const AppContent: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [role, setRole] = useState<AuthRole>(AuthRole.Guest);
  const [applications, setApplications] =
    useState<AccountApplication[]>(MOCK_APPLICATIONS);
  const location = useLocation();

  const login = useCallback((user: User) => {
    setCurrentUser(user);
    setRole(user.role);
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
    setRole(AuthRole.Guest);
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
        // In a real app, create a user account. Here, we just log it.
        const app = applications.find((a) => a.id === appId);
        if (app) {
          console.log(
            `Account for ${app.applicantName} approved. A new user should be created.`
          );
          // Potentially add to a mock users list if we were to extend MOCK_USERS
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
    }),
    [
      currentUser,
      role,
      login,
      logout,
      applications,
      addApplication,
      updateApplicationStatus,
    ]
  );

  const isAuthPage = location.pathname === "/auth";

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <AuthContext.Provider value={authContextValue}>
      <div className="flex flex-col min-h-screen bg-white text-gray-700">
        {" "}
        {/* Changed bg-gray-100 to bg-white, text-gray-800 to text-gray-700 */}
        {!isAuthPage && <MobileNavbar />}
        {/* Apply a key to the main content wrapper to trigger re-animation on route change if desired, 
            or apply animations directly within page components for content entrance.
            For simplicity, page components will handle their entrance animations.
        */}
        <main className="flex-grow container mx-auto px-4 py-8 pt-24 md:pt-28">
          {" "}
          {/* Increased padding top for taller navbar on mobile */}
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/info" element={<InfoPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/credit-cards" element={<CreditCardPage />} />
            <Route path="/loans" element={<LoansPage />} />
            <Route path="/investments" element={<InvestmentsPage />} />

            <Route
              path="/dashboard/user"
              element={
                role === AuthRole.User ? (
                  <UserDashboardPage />
                ) : (
                  <Navigate to="/auth" replace />
                )
              }
            />
            <Route
              path="/dashboard/admin"
              element={
                role === AuthRole.Admin ? (
                  <AdminDashboardPage />
                ) : (
                  <Navigate to="/auth" replace />
                )
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        {!isAuthPage && <Footer />}
        {role !== AuthRole.Guest && <AIAssistant />}
      </div>
    </AuthContext.Provider>
  );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
};

export default App;
