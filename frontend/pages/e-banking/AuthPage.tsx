import React from "react";

const AuthPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 flex items-center justify-center">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold text-gold-300">
          Aurum Vault Authentication
        </h1>
        <p className="text-white/80 text-lg">
          This page is temporarily under maintenance.
        </p>
        <p className="text-white/60">
          Please check back soon for the full authentication experience.
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
