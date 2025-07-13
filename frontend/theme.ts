// NovaBank Brand Theme System
// Consistent colors, typography, and design tokens

export const NOVABANK_THEME = {
  // Primary Brand Colors
  colors: {
    // Public Website Theme (Teal/Green - Professional, Trustworthy)
    website: {
      primary: "#0D9488", // Teal
      secondary: "#0F766E", // Dark Teal
      accent: "#14B8A6", // Light Teal
      background: "#F0FDFA", // Very Light Teal
      surface: "#FFFFFF", // White
      text: {
        primary: "#134E4A", // Dark Teal
        secondary: "#6B7280", // Gray
        muted: "#9CA3AF", // Light Gray
      },
    },

    // Banking Portal Theme (Deep Blue/Navy - Secure, Professional)
    portal: {
      primary: "#1E40AF", // Deep Blue
      secondary: "#1E3A8A", // Navy Blue
      accent: "#3B82F6", // Blue
      background: "#F8FAFC", // Very Light Blue-Gray
      surface: "#FFFFFF", // White
      sidebar: "#0F172A", // Dark Navy (Sidebar)
      text: {
        primary: "#0F172A", // Dark Navy
        secondary: "#475569", // Slate Gray
        muted: "#94A3B8", // Light Slate
      },
      success: "#10B981", // Green
      warning: "#F59E0B", // Amber
      error: "#EF4444", // Red
      info: "#3B82F6", // Blue
    },
  },

  // Typography
  typography: {
    fontFamily: {
      sans: ["Inter", "system-ui", "sans-serif"],
      mono: ["JetBrains Mono", "monospace"],
    },
    fontSize: {
      xs: "0.75rem",
      sm: "0.875rem",
      base: "1rem",
      lg: "1.125rem",
      xl: "1.25rem",
      "2xl": "1.5rem",
      "3xl": "1.875rem",
      "4xl": "2.25rem",
      "5xl": "3rem",
    },
  },

  // Shadows
  shadows: {
    website: {
      sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
      md: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
      lg: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
      xl: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
    },
    portal: {
      sm: "0 1px 2px 0 rgb(15 23 42 / 0.05)",
      md: "0 4px 6px -1px rgb(15 23 42 / 0.1)",
      lg: "0 10px 15px -3px rgb(15 23 42 / 0.1)",
      xl: "0 20px 25px -5px rgb(15 23 42 / 0.1)",
    },
  },

  // Borders
  borders: {
    website: {
      light: "#E5E7EB",
      medium: "#D1D5DB",
      dark: "#9CA3AF",
    },
    portal: {
      light: "#E2E8F0",
      medium: "#CBD5E1",
      dark: "#94A3B8",
    },
  },
} as const;

// Helper functions for theme usage
export const getWebsiteColors = () => NOVABANK_THEME.colors.website;
export const getPortalColors = () => NOVABANK_THEME.colors.portal;

// CSS class generators
export const websiteClasses = {
  primary: "text-[#0D9488]",
  primaryBg: "bg-[#0D9488]",
  secondary: "text-[#0F766E]",
  secondaryBg: "bg-[#0F766E]",
  accent: "text-[#14B8A6]",
  accentBg: "bg-[#14B8A6]",
  background: "bg-[#F0FDFA]",
  surface: "bg-white",
  textPrimary: "text-[#134E4A]",
  textSecondary: "text-[#6B7280]",
  textMuted: "text-[#9CA3AF]",
};

export const portalClasses = {
  primary: "text-[#1E40AF]",
  primaryBg: "bg-[#1E40AF]",
  secondary: "text-[#1E3A8A]",
  secondaryBg: "bg-[#1E3A8A]",
  accent: "text-[#3B82F6]",
  accentBg: "bg-[#3B82F6]",
  background: "bg-[#F8FAFC]",
  surface: "bg-white",
  sidebar: "bg-[#0F172A]",
  textPrimary: "text-[#0F172A]",
  textSecondary: "text-[#475569]",
  textMuted: "text-[#94A3B8]",
  success: "text-[#10B981]",
  successBg: "bg-[#10B981]",
  warning: "text-[#F59E0B]",
  warningBg: "bg-[#F59E0B]",
  error: "text-[#EF4444]",
  errorBg: "bg-[#EF4444]",
  info: "text-[#3B82F6]",
  infoBg: "bg-[#3B82F6]",
};
