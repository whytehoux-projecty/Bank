import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../App";
import { AuthRole } from "../types";
import { MOCK_USERS } from "../constants"; // For mock login
import {
  SparklesIcon,
  ShieldCheckIcon,
  CreditCardIcon,
  BuildingLibraryIcon,
  CheckCircleIcon,
} from "../constants";

type AuthAction = "login" | "register" | "adminLogin";

const AuthPage: React.FC = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialAction = (queryParams.get("action") as AuthAction) || "login";

  const [action, setAction] = useState<AuthAction>(initialAction);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState(""); // For registration
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // For registration
  const [accountType, setAccountType] = useState("Nova Everyday"); // For registration
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { login, addApplication } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const queryAction = queryParams.get("action") as AuthAction;
    if (
      queryAction &&
      ["login", "register", "adminLogin"].includes(queryAction)
    ) {
      setAction(queryAction);
    }
    setError("");
    setSuccessMessage("");
  }, [location.search, queryParams]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setIsLoading(true);

    // Simulate network delay
    setTimeout(() => {
      if (action === "register") {
        if (password !== confirmPassword) {
          setError("Passwords do not match.");
          setIsLoading(false);
          return;
        }
        // Mock registration: add to applications list
        addApplication({
          applicantName: username,
          email,
          desiredAccountType: accountType,
        });
        setSuccessMessage(
          "Application submitted! You will be notified once it is reviewed."
        );
        // Clear form
        setUsername("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setAccountType("Nova Everyday");
        setTimeout(() => {
          setAction("login");
          setSuccessMessage("");
        }, 3000);
      } else {
        // Login or Admin Login
        const userToFind =
          action === "adminLogin"
            ? MOCK_USERS.find(
                (u) => u.username === username && u.role === AuthRole.Admin
              )
            : MOCK_USERS.find(
                (u) => u.username === username && u.role === AuthRole.User
              );

        // Mock password check (in real app, this is backend validated)
        if (userToFind && password === "password123") {
          // Using a common mock password
          login(userToFind);
          navigate(
            userToFind.role === AuthRole.Admin
              ? "/dashboard/admin"
              : "/dashboard/user"
          );
        } else {
          setError("Invalid credentials. Please try again.");
        }
      }
      setIsLoading(false);
    }, 1000);
  };

  const getTitle = () => {
    if (action === "login") return "User Login";
    if (action === "register") return "Apply for an Account";
    if (action === "adminLogin") return "Admin Login";
    return "Welcome";
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/images/banking-login-bg.jpg')`,
        }}
      ></div>
      <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-black/20 to-[#A41E22]/30"></div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-[#A41E22]/20 to-[#8C1A1F]/20 rounded-full blur-3xl anim-float"></div>
      <div
        className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-br from-[#8C1A1F]/20 to-[#751016]/20 rounded-full blur-3xl anim-float"
        style={{ animationDelay: "2s" }}
      ></div>

      {/* Header */}
      <Link
        to="/"
        className="absolute top-6 left-6 text-2xl font-bold flex items-center text-white hover:text-red-200 transition-all duration-300 hover-lift z-10 group bg-black/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20"
      >
        <SparklesIcon className="h-8 w-8 mr-2 text-white group-hover:rotate-12 transition-transform duration-300" />
        <span className="bg-gradient-to-r from-white to-red-200 bg-clip-text text-transparent">
          NovaBank
        </span>
      </Link>

      {/* Left Side - Information Panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center p-12 relative z-10">
        <div className="max-w-lg bg-white/10 backdrop-blur-lg border border-white/20 p-8 rounded-2xl">
          <h2 className="text-4xl font-bold text-white mb-6 anim-slideInLeft">
            {action === "register"
              ? "Join NovaBank Today"
              : "Welcome Back to NovaBank"}
          </h2>
          <p
            className="text-lg text-white/90 mb-8 anim-slideInLeft"
            style={{ animationDelay: "0.2s" }}
          >
            {action === "register"
              ? "Experience the future of digital banking with cutting-edge security and innovative features."
              : "Access your accounts securely and manage your finances with ease."}
          </p>

          <div className="space-y-6">
            <div
              className="flex items-center space-x-4 anim-slideInLeft"
              style={{ animationDelay: "0.4s" }}
            >
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-[#A41E22] to-[#8C1A1F] rounded-full flex items-center justify-center">
                <ShieldCheckIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white">
                  Bank-Grade Security
                </h3>
                <p className="text-white/80 text-sm">
                  256-bit encryption and multi-factor authentication
                </p>
              </div>
            </div>

            <div
              className="flex items-center space-x-4 anim-slideInLeft"
              style={{ animationDelay: "0.6s" }}
            >
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-[#A41E22] to-[#8C1A1F] rounded-full flex items-center justify-center">
                <CreditCardIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white">
                  Digital-First Banking
                </h3>
                <p className="text-white/80 text-sm">
                  Seamless online and mobile banking experience
                </p>
              </div>
            </div>

            <div
              className="flex items-center space-x-4 anim-slideInLeft"
              style={{ animationDelay: "0.8s" }}
            >
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-[#A41E22] to-[#8C1A1F] rounded-full flex items-center justify-center">
                <BuildingLibraryIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white">
                  Trusted Institution
                </h3>
                <p className="text-white/80 text-sm">
                  FDIC insured with over 100,000 satisfied customers
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md bg-white/80 backdrop-blur-lg border border-white/20 p-8 rounded-2xl shadow-2xl anim-slideInRight relative">
          {/* Form gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/20 rounded-2xl"></div>

          <div className="relative z-10">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-[#A41E22] to-[#8C1A1F] rounded-full mb-4 anim-gentleBounce">
                <SparklesIcon className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                {getTitle()}
              </h1>
              <p className="text-gray-600">
                {action === "register"
                  ? "Create your account in minutes"
                  : "Secure access to your finances"}
              </p>
            </div>

            {/* Demo Credentials Notice */}
            {action !== "register" && (
              <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700 anim-fadeIn">
                <div className="flex items-center space-x-2">
                  <CheckCircleIcon className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">Demo Credentials</span>
                </div>
                <p className="mt-1">
                  Username: {action === "adminLogin" ? "admin" : "john.doe"} |
                  Password: password123
                </p>
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 anim-shake">
                <div className="flex items-center space-x-2">
                  <svg
                    className="h-4 w-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>{error}</span>
                </div>
              </div>
            )}

            {successMessage && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 anim-pulse">
                <div className="flex items-center space-x-2">
                  <CheckCircleIcon className="h-4 w-4 text-green-600" />
                  <span>{successMessage}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="username"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    {action === "register" ? "Full Name" : "Username"}
                  </label>
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full p-4 bg-white/70 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#A41E22] focus:border-[#A41E22] outline-none text-gray-800 placeholder-gray-500 transition-all duration-200 hover:bg-white/90"
                    placeholder={
                      action === "register"
                        ? "John Doe"
                        : action === "adminLogin"
                        ? "admin"
                        : "john.doe"
                    }
                  />
                </div>

                {action === "register" && (
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full p-4 bg-white/70 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#A41E22] focus:border-[#A41E22] outline-none text-gray-800 placeholder-gray-500 transition-all duration-200 hover:bg-white/90"
                      placeholder="you@example.com"
                    />
                  </div>
                )}

                <div>
                  <label
                    htmlFor="password_auth"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password_auth"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full p-4 bg-white/70 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#A41E22] focus:border-[#A41E22] outline-none text-gray-800 placeholder-gray-500 transition-all duration-200 hover:bg-white/90 pr-12"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
                    >
                      {showPassword ? (
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464M9.878 9.878l-6.415-6.414M14.12 14.12l4.243 4.243m-4.242-4.242L15.536 15.536m-1.414-1.414l6.414 6.414"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {action === "register" && (
                  <>
                    <div>
                      <label
                        htmlFor="confirmPassword"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Confirm Password
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          id="confirmPassword"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          className="w-full p-4 bg-white/70 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#A41E22] focus:border-[#A41E22] outline-none text-gray-800 placeholder-gray-500 transition-all duration-200 hover:bg-white/90 pr-12"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
                        >
                          {showConfirmPassword ? (
                            <svg
                              className="h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464M9.878 9.878l-6.415-6.414M14.12 14.12l4.243 4.243m-4.242-4.242L15.536 15.536m-1.414-1.414l6.414 6.414"
                              />
                            </svg>
                          ) : (
                            <svg
                              className="h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="accountType"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Account Type
                      </label>
                      <select
                        id="accountType"
                        value={accountType}
                        onChange={(e) => setAccountType(e.target.value)}
                        className="w-full p-4 bg-white/70 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#A41E22] focus:border-[#A41E22] outline-none text-gray-800 transition-all duration-200 hover:bg-white/90"
                      >
                        <option value="Nova Everyday">
                          Nova Everyday (Checking)
                        </option>
                        <option value="Nova Savings">
                          Nova Savings (High Interest)
                        </option>
                        <option value="Nova Premier">
                          Nova Premier (Premium)
                        </option>
                        <option value="Nova Business">
                          Nova Business (Commercial)
                        </option>
                      </select>
                    </div>
                  </>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-[#A41E22] to-[#8C1A1F] hover:from-[#8C1A1F] hover:to-[#751016] text-white font-semibold py-4 px-6 rounded-lg text-lg transition-all duration-300 shadow-lg hover:shadow-xl hover-lift disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center group"
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    {action === "register" ? "Create Account" : "Sign In"}
                    <svg
                      className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 text-center space-y-4">
              {action === "login" && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    Don't have an account?{" "}
                    <button
                      onClick={() => setAction("register")}
                      className="font-medium text-[#A41E22] hover:text-[#8C1A1F] hover:underline transition-colors duration-200"
                    >
                      Apply for an account
                    </button>
                  </p>
                  <p className="text-sm text-gray-600">
                    Need admin access?{" "}
                    <button
                      onClick={() => setAction("adminLogin")}
                      className="font-medium text-[#A41E22] hover:text-[#8C1A1F] hover:underline transition-colors duration-200"
                    >
                      Admin Login
                    </button>
                  </p>
                </div>
              )}

              {action === "register" && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    Already have an account?{" "}
                    <button
                      onClick={() => setAction("login")}
                      className="font-medium text-[#A41E22] hover:text-[#8C1A1F] hover:underline transition-colors duration-200"
                    >
                      Sign in here
                    </button>
                  </p>
                  <p className="text-xs text-gray-500 mt-4 leading-relaxed">
                    By creating an account, you agree to our{" "}
                    <Link
                      to="/terms"
                      className="text-[#A41E22] hover:underline"
                    >
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link
                      to="/privacy"
                      className="text-[#A41E22] hover:underline"
                    >
                      Privacy Policy
                    </Link>
                  </p>
                </div>
              )}

              {action === "adminLogin" && (
                <p className="text-sm text-gray-600">
                  Not an admin?{" "}
                  <button
                    onClick={() => setAction("login")}
                    className="font-medium text-[#A41E22] hover:text-[#8C1A1F] hover:underline transition-colors duration-200"
                  >
                    User Login
                  </button>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
