import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../App";
import { AuthRole, NavLinkItem } from "../types";
import { websiteClasses } from "../theme";
import {
  NAV_LINKS,
  ArrowRightOnRectangleIcon,
  SparklesIcon,
} from "../constants";

const Navbar: React.FC = () => {
  const { role, logout, currentUser } = useAuth();
  const router = useRouter();

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
  };

  return (
    <nav
      className={`bg-gradient-to-r from-navy-900 via-navy-800 to-navy-900 backdrop-blur-md text-white p-4 fixed w-full top-0 z-50 shadow-luxury border-b border-navy-700/20`}
    >
      <div className="container mx-auto flex justify-between items-center">
        <Link
          href="/"
          className="text-2xl md:text-3xl font-bold flex items-center text-white transition-all duration-300 hover:scale-105 group"
        >
          <SparklesIcon className="h-8 w-8 md:h-9 md:w-9 mr-2 text-gold-400 transition-transform duration-300 group-hover:rotate-12" />
          <span className="bg-gradient-to-r from-gold-400 to-gold-300 bg-clip-text text-transparent">
            Aurum Vault
          </span>
        </Link>

        <div className="hidden md:flex space-x-6 items-center">
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
                    className={`px-4 py-2 ${websiteClasses.surface} hover:bg-gray-50 ${websiteClasses.primary} rounded-lg font-semibold transition-all duration-300 hover-lift flex items-center shadow-lg`}
                  >
                    {Icon && <Icon className="h-5 w-5 mr-2" />}
                    Login
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
                    className="px-3 py-2 text-sm font-medium hover:text-gray-200 transition-all duration-300 hover:bg-white/10 rounded-lg flex items-center group backdrop-blur-sm"
                  >
                    {Icon && (
                      <Icon className="h-5 w-5 mr-2 transition-transform duration-300 group-hover:scale-110" />
                    )}
                    Dashboard
                  </Link>
                );
              }
            }

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
                className={`px-4 py-2 ${websiteClasses.surface} hover:bg-gray-50 ${websiteClasses.primary} rounded-lg font-semibold transition-all duration-300 hover-lift flex items-center shadow-lg`}
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
                Logout
              </button>
            </div>
          )}
        </div>

        {/* Mobile menu - simplified for now */}
        <div className="md:hidden flex items-center space-x-2">
          {navLinks.slice(0, 2).map((link) => {
            if (link.auth && !link.auth.includes(role)) return null;
            const Icon = link.icon;
            return (
              <Link
                key={link.label}
                href={link.path}
                className="px-2 py-1 text-xs hover:text-gray-200 transition-colors duration-200 flex items-center"
              >
                {Icon && <Icon className="h-4 w-4 mr-1" />}
                {link.label}
              </Link>
            );
          })}
          {role !== AuthRole.Guest && (
            <button
              onClick={handleLogout}
              className={`px-2 py-1 ${websiteClasses.surface} hover:bg-gray-50 ${websiteClasses.primary} rounded font-semibold transition-all duration-200 text-xs flex items-center`}
            >
              <ArrowRightOnRectangleIcon className="h-4 w-4 mr-1" />
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
