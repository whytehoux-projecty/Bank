import React from "react";
import { Shield, Lock } from "lucide-react";
import { portalClasses } from "../theme";

interface SecurityIndicatorProps {
  className?: string;
}

export const SecurityIndicator: React.FC<SecurityIndicatorProps> = ({
  className = "",
}) => {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="flex items-center space-x-1 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
        <Shield className="h-3 w-3" />
        <span>Secure Session</span>
      </div>
      <div className="flex items-center space-x-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
        <Lock className="h-3 w-3" />
        <span>256-bit SSL</span>
      </div>
    </div>
  );
};

interface PortalHeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export const PortalHeader: React.FC<PortalHeaderProps> = ({
  title,
  subtitle,
  children,
}) => {
  return (
    <div
      className={`${portalClasses.surface} border-b border-[#E2E8F0] px-6 py-4 shadow-sm`}
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-semibold ${portalClasses.textPrimary}`}>
            {title}
          </h1>
          {subtitle && (
            <p className={`text-sm ${portalClasses.textSecondary} mt-1`}>
              {subtitle}
            </p>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <SecurityIndicator />
          {children}
        </div>
      </div>
    </div>
  );
};

export default PortalHeader;
