import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../App";
import { AuthRole, NavLinkItem } from "../types";
import {
  GUEST_NAV_LINKS,
  USER_NAV_LINKS,
  ADMIN_NAV_LINKS,
  ArrowRightOnRectangleIcon,
  SparklesIcon,
} from "../constants";

const Navbar: React.FC = () => {
  const { role, logout, currentUser } = useAuth();
  const navigate = useNavigate();

  let navLinks: NavLinkItem[] = GUEST_NAV_LINKS;
  if (role === AuthRole.User) {
    navLinks = [
      ...GUEST_NAV_LINKS.filter((link) => link.path !== "/auth"),
      ...USER_NAV_LINKS,
    ];
  } else if (role === AuthRole.Admin) {
    navLinks = [
      ...GUEST_NAV_LINKS.filter((link) => link.path !== "/auth"),
      ...ADMIN_NAV_LINKS,
    ];
  }

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="bg-gradient-to-r from-[#A41E22] via-[#8C1A1F] to-[#A41E22] backdrop-blur-md text-white p-4 fixed w-full top-0 z-50 shadow-2xl border-b border-red-900/20">
      <div className="container mx-auto flex justify-between items-center">
        <Link
          to="/"
          className="text-2xl md:text-3xl font-bold flex items-center text-white transition-all duration-300 hover:scale-105 group"
        >
          <SparklesIcon className="h-8 w-8 md:h-9 md:w-9 mr-2 text-white transition-transform duration-300 group-hover:rotate-12" />
          <span className="bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
            NovaBank
          </span>
        </Link>

        <div className="hidden md:flex space-x-6 items-center">
          {navLinks.map((link) => {
            if (link.auth && !link.auth.includes(role)) return null;
            const Icon = link.icon;
            return (
              <Link
                key={link.label}
                to={link.path}
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

        {/* Mobile menu - simplified for now */}
        <div className="md:hidden flex items-center space-x-2">
          {navLinks.slice(0, 2).map((link) => {
            if (link.auth && !link.auth.includes(role)) return null;
            const Icon = link.icon;
            return (
              <Link
                key={link.label}
                to={link.path}
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
              className="px-2 py-1 bg-white hover:bg-gray-100 text-[#A41E22] rounded font-semibold transition-all duration-200 text-xs flex items-center"
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
