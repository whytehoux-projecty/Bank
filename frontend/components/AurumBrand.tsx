import React from "react";
import { AURUM_BRANDING } from "../constants";
import { AurumVaultIcon, DiamondIcon, CrownIcon } from "../constants";

interface AurumBrandProps {
  variant?: "logo" | "full" | "tagline" | "minimal";
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export const AurumBrand: React.FC<AurumBrandProps> = ({
  variant = "full",
  size = "md",
  className = "",
}) => {
  const sizeClasses = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-4xl",
    xl: "text-6xl",
  };

  const iconSizes = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-12 w-12",
    xl: "h-16 w-16",
  };

  if (variant === "logo") {
    return (
      <div className={`flex items-center space-x-3 ${className}`}>
        <div className="relative">
          <AurumVaultIcon className={`${iconSizes[size]} text-gold-500`} />
          <DiamondIcon className="absolute -top-1 -right-1 h-3 w-3 text-gold-400" />
        </div>
        <span
          className={`font-bold bg-metallic-gold bg-clip-text text-transparent ${sizeClasses[size]}`}
        >
          {AURUM_BRANDING.name}
        </span>
      </div>
    );
  }

  if (variant === "minimal") {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <AurumVaultIcon className={`${iconSizes[size]} text-gold-500`} />
        <span className={`font-semibold text-gold-500 ${sizeClasses[size]}`}>
          Aurum
        </span>
      </div>
    );
  }

  if (variant === "tagline") {
    return (
      <div className={`text-center ${className}`}>
        <div className="flex items-center justify-center space-x-3 mb-2">
          <AurumVaultIcon className={`${iconSizes[size]} text-gold-500`} />
          <span
            className={`font-bold bg-metallic-gold bg-clip-text text-transparent ${sizeClasses[size]}`}
          >
            {AURUM_BRANDING.name}
          </span>
          <CrownIcon className={`${iconSizes[size]} text-gold-400`} />
        </div>
        <p className="text-gold-400 font-medium text-sm opacity-90">
          {AURUM_BRANDING.tagline}
        </p>
      </div>
    );
  }

  return (
    <div className={`text-center ${className}`}>
      <div className="flex items-center justify-center space-x-4 mb-4">
        <div className="relative">
          <AurumVaultIcon className={`${iconSizes[size]} text-gold-500`} />
          <DiamondIcon className="absolute -top-2 -right-2 h-4 w-4 text-gold-400 animate-pulse" />
        </div>
        <div>
          <h1
            className={`font-bold bg-metallic-gold bg-clip-text text-transparent ${sizeClasses[size]}`}
          >
            {AURUM_BRANDING.name}
          </h1>
          <p className="text-gold-400 font-medium text-sm opacity-90">
            {AURUM_BRANDING.tagline}
          </p>
        </div>
        <CrownIcon className={`${iconSizes[size]} text-gold-400`} />
      </div>
      <p className="text-gray-300 text-sm max-w-md mx-auto leading-relaxed">
        {AURUM_BRANDING.description}
      </p>
    </div>
  );
};

export default AurumBrand;
