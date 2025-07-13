import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../App";
import { AuthRole, NavLinkItem } from "../types";
import {
  NAV_LINKS,
  ArrowRightOnRectangleIcon,
  SparklesIcon,
} from "../constants";

// Hamburger menu icon
const HamburgerIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 6h16M4 12h16M4 18h16"
    />
  </svg>
);

// Close menu icon
const CloseIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

const MobileNavbar: React.FC = () => {
  const { role, logout, currentUser } = useAuth();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Filter navigation links based on user role
  const navLinks: NavLinkItem[] = NAV_LINKS.filter((link) => {
    // If link has no auth requirement, show it to everyone
    if (!link.auth) return true;

    // If user is not logged in, only show links without auth requirement
    if (role === AuthRole.Guest) return false;

    // Show link if user's role is in the auth array
    return link.auth.includes(role);
  });

  const handleLogout = () => {
    logout();
    router.push("/");
    setIsMenuOpen(false);
  };

  const handleNavigation = (path: string) => {
    router.push(path);
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-gradient-to-r from-[#0D9488] via-[#0F766E] to-[#0D9488] backdrop-blur-md text-white p-4 fixed w-full top-0 z-50 shadow-2xl border-b border-teal-900/20">
      <div className="container mx-auto flex justify-between items-center">
        <Link
          href="/"
          className="text-2xl md:text-3xl font-bold flex items-center text-white transition-all duration-300 hover:scale-105 group"
          onClick={closeMenu}
        >
          <SparklesIcon className="h-8 w-8 md:h-9 md:w-9 mr-2 text-white transition-transform duration-300 group-hover:rotate-12" />
          <span className="bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
            Aurum Vault
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex space-x-6 items-center">
          {navLinks.map((link) => {
            if (link.auth && !link.auth.includes(role)) return null;
            const Icon = link.icon;
            return (
              <Link
                key={link.label}
                href={link.path}
                className="px-3 py-2 text-sm font-medium hover:text-gray-200 transition-all duration-300 hover:bg-white/10 rounded-lg flex items-center group backdrop-blur-sm"
              >
                {Icon && (
                  <Icon className="h-5 w-5 mr-2 transition-transform duration-300 group-hover:scale-110" />
                )}
                {link.label}
              </Link>
            );
          })}
          {role !== AuthRole.Guest && (
            <div className="flex items-center space-x-4">
              <span className="text-sm opacity-90">
                Welcome, {currentUser?.username || "User"}
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-white hover:bg-gray-100 text-[#A41E22] rounded-lg font-semibold transition-all duration-300 hover-lift flex items-center shadow-lg"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
                Logout
              </button>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={toggleMenu}
          className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors duration-200"
          aria-label="Toggle navigation menu"
        >
          {isMenuOpen ? (
            <CloseIcon className="h-6 w-6" />
          ) : (
            <HamburgerIcon className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={closeMenu}
        />
      )}

      {/* Mobile Menu */}
      <div
        className={`md:hidden fixed top-0 right-0 h-full w-80 max-w-[80vw] bg-gradient-to-b from-[#A41E22] to-[#8C1A1F] shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center">
              <SparklesIcon className="h-8 w-8 mr-2 text-white" />
              <span className="text-xl font-bold text-white">Aurum Vault</span>
            </div>
            <button
              onClick={closeMenu}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors duration-200"
              aria-label="Close menu"
            >
              <CloseIcon className="h-6 w-6 text-white" />
            </button>
          </div>

          <div className="space-y-4">
            {navLinks.map((link) => {
              // Skip auth-protected links for guests, except the special "Online Banking" link
              if (link.auth && !link.auth.includes(role)) return null;

              const Icon = link.icon;

              // Handle the dynamic "Online Banking" link
              if (link.path === "/auth") {
                // For guests, show "Login" and link to auth page
                if (role === AuthRole.Guest) {
                  return (
                    <Link
                      key="login"
                      href="/auth"
                      className="flex items-center px-4 py-3 text-white hover:bg-white/10 rounded-lg transition-all duration-200 group"
                      onClick={() => handleNavigation("/auth")}
                    >
                      {Icon && (
                        <Icon className="h-5 w-5 mr-3 transition-transform duration-300 group-hover:scale-110" />
                      )}
                      <span className="font-medium">Login</span>
                    </Link>
                  );
                }
                // For authenticated users, show "Dashboard" and link to appropriate dashboard
                else {
                  const dashboardPath =
                    role === AuthRole.Admin
                      ? "/dashboard/admin"
                      : "/dashboard/user";
                  return (
                    <Link
                      key="dashboard"
                      href={dashboardPath}
                      className="flex items-center px-4 py-3 text-white hover:bg-white/10 rounded-lg transition-all duration-200 group"
                      onClick={() => handleNavigation(dashboardPath)}
                    >
                      {Icon && (
                        <Icon className="h-5 w-5 mr-3 transition-transform duration-300 group-hover:scale-110" />
                      )}
                      <span className="font-medium">Dashboard</span>
                    </Link>
                  );
                }
              }

              return (
                <Link
                  key={link.label}
                  href={link.path}
                  className="flex items-center px-4 py-3 text-white hover:bg-white/10 rounded-lg transition-all duration-200 group"
                  onClick={() => handleNavigation(link.path)}
                >
                  {Icon && (
                    <Icon className="h-5 w-5 mr-3 transition-transform duration-300 group-hover:scale-110" />
                  )}
                  <span className="font-medium">{link.label}</span>
                </Link>
              );
            })}
          </div>

          {role !== AuthRole.Guest && (
            <div className="mt-8 pt-6 border-t border-white/20">
              <div className="text-white/80 text-sm mb-4">
                Welcome, {currentUser?.username || "User"}
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center px-4 py-3 bg-white hover:bg-gray-100 text-[#A41E22] rounded-lg font-semibold transition-all duration-300 shadow-lg"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default MobileNavbar;
