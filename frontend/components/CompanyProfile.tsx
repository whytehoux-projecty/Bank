import React from "react";
import { AnimatedSection } from "./AnimatedSection";
import {
  BuildingLibraryIcon,
  UsersIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  SparklesIcon,
  GlobeAltIcon,
} from "../constants";

const CompanyProfile: React.FC = () => {
  const stats = [
    {
      icon: UsersIcon,
      number: "500K+",
      label: "Active Customers",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: BuildingLibraryIcon,
      number: "$50B+",
      label: "Assets Under Management",
      color: "from-green-500 to-green-600",
    },
    {
      icon: GlobeAltIcon,
      number: "50+",
      label: "Countries Served",
      color: "from-purple-500 to-purple-600",
    },
    {
      icon: ChartBarIcon,
      number: "99.9%",
      label: "Uptime Reliability",
      color: "from-red-500 to-red-600",
    },
  ];

  return (
    <AnimatedSection>
      <div className="relative overflow-hidden rounded-2xl shadow-2xl">
        <div
          className="h-96 bg-cover bg-center relative"
          style={{ backgroundImage: "url('/images/banking-hero.jpg')" }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#A41E22]/95 via-[#8C1A1F]/85 to-[#751016]/95"></div>

          <div className="relative z-10 h-full flex items-center p-8 md:p-12">
            <div className="max-w-4xl">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <SparklesIcon className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-4xl font-bold text-white">
                    About NovaBank
                  </h2>
                  <p className="text-white/80 text-lg">
                    Leading the Digital Banking Revolution
                  </p>
                </div>
              </div>

              <p className="text-xl text-white/90 mb-8 leading-relaxed">
                Founded with a vision to democratize banking, NovaBank combines
                cutting-edge technology with personalized service to deliver
                exceptional financial experiences. Our AI-powered platform and
                commitment to security make us the trusted choice for modern
                banking.
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                  <div
                    key={index}
                    className="bg-white/20 backdrop-blur-sm rounded-lg p-4 text-center"
                  >
                    <div
                      className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-full flex items-center justify-center mx-auto mb-3`}
                    >
                      <stat.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">
                      {stat.number}
                    </div>
                    <div className="text-sm text-white/80">{stat.label}</div>
                  </div>
                ))}
              </div>

              <div className="mt-8 grid md:grid-cols-3 gap-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                  <div className="flex items-center space-x-3 mb-3">
                    <ShieldCheckIcon className="h-6 w-6 text-green-300" />
                    <h3 className="text-lg font-semibold text-white">
                      Bank-Grade Security
                    </h3>
                  </div>
                  <p className="text-white/80 text-sm">
                    Advanced encryption and multi-layered security protocols
                    protect your financial data.
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                  <div className="flex items-center space-x-3 mb-3">
                    <SparklesIcon className="h-6 w-6 text-blue-300" />
                    <h3 className="text-lg font-semibold text-white">
                      AI-Powered Insights
                    </h3>
                  </div>
                  <p className="text-white/80 text-sm">
                    Get personalized financial advice and insights powered by
                    advanced AI technology.
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                  <div className="flex items-center space-x-3 mb-3">
                    <GlobeAltIcon className="h-6 w-6 text-purple-300" />
                    <h3 className="text-lg font-semibold text-white">
                      Global Reach
                    </h3>
                  </div>
                  <p className="text-white/80 text-sm">
                    Access your accounts and make transactions from anywhere in
                    the world.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
};

export default CompanyProfile;
