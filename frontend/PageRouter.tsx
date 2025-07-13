// Simple router to direct to correct pages based on path
import { useRouter } from "next/router";
import { useEffect } from "react";

// Corporate Pages
import HomePage from "./pages/corporate_pages/HomePage";
import AboutPage from "./pages/corporate_pages/InfoPage";
import ContactPage from "./pages/corporate_pages/ContactPage";
import PrivacyPage from "./pages/corporate_pages/PrivacyPage";
import TermsPage from "./pages/corporate_pages/TermsPage";

// E-Banking Pages
import AuthPage from "./pages/e-banking/AuthPage";
import UserDashboardPage from "./pages/e-banking/UserDashboardPage";
import AdminDashboardPage from "./pages/e-banking/AdminDashboardPage";
import BillPayPage from "./pages/e-banking/BillPayPage";
import CreditCardPage from "./pages/e-banking/CreditCardPage";
import InvestmentsPage from "./pages/e-banking/InvestmentsPage";
import LoansPage from "./pages/e-banking/LoansPageComplete";
import SettingsPage from "./pages/e-banking/SettingsPage";

// Route mapping
const routes = {
  // Corporate Website
  "/": HomePage,
  "/corporate/about": AboutPage,
  "/corporate/contact": ContactPage,
  "/corporate/privacy": PrivacyPage,
  "/corporate/terms": TermsPage,

  // E-Banking Portal
  "/e-banking/auth": AuthPage,
  "/e-banking/dashboard": UserDashboardPage,
  "/e-banking/admin": AdminDashboardPage,
  "/e-banking/bill-pay": BillPayPage,
  "/e-banking/credit-cards": CreditCardPage,
  "/e-banking/investments": InvestmentsPage,
  "/e-banking/loans": LoansPage,
  "/e-banking/settings": SettingsPage,
};

export const PageRouter = () => {
  const router = useRouter();
  const { pathname } = router;

  const PageComponent = routes[pathname as keyof typeof routes] || HomePage;

  return <PageComponent />;
};

export default PageRouter;
