import React, { useState } from "react";
import { INFO_SECTIONS } from "../constants";
import {
  BuildingLibraryIcon,
  GlobeAltIcon,
  UserCircleIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  SparklesIcon,
} from "../constants";
import { AnimatedSection } from "../components/AnimatedSection";
import CompanyProfile from "../components/CompanyProfile";

type InfoSectionKey = keyof typeof INFO_SECTIONS;

const InfoPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<InfoSectionKey>("about");

  const renderContent = (content: string) => {
    return content.split("\n\n").map((paragraph, index) => (
      <div key={index} className="mb-6">
        {paragraph.split("\n").map((line, lineIndex) => {
          if (line.startsWith("- ")) {
            return (
              <ul key={lineIndex} className="ml-4 mb-2">
                <li className="list-disc list-inside text-gray-700 leading-relaxed">
                  {line.substring(2)}
                </li>
              </ul>
            );
          }
          if (line.startsWith("**") && line.endsWith("**")) {
            return (
              <h4
                key={lineIndex}
                className="text-xl font-bold text-[#A41E22] mb-3"
              >
                {line.substring(2, line.length - 2)}
              </h4>
            );
          }
          return (
            <p key={lineIndex} className="text-gray-700 leading-relaxed mb-3">
              {line}
            </p>
          );
        })}
      </div>
    ));
  };

  const sectionIcons: Record<InfoSectionKey, React.ComponentType<any>> = {
    about: BuildingLibraryIcon,
    mission: SparklesIcon,
    services: GlobeAltIcon,
  };

  const stats = [
    { label: "Customers Served", value: "2.5M+", icon: UserCircleIcon },
    { label: "Assets Under Management", value: "$150B+", icon: ChartBarIcon },
    { label: "Years of Excellence", value: "25+", icon: ShieldCheckIcon },
    { label: "Branch Locations", value: "500+", icon: BuildingLibraryIcon },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-red-50">
      {/* Hero Section */}
      <AnimatedSection className="text-center py-20 bg-gradient-to-r from-[#A41E22] to-[#8C1A1F] text-white">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 anim-fadeInUp">
            Discover NovaBank
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90 max-w-3xl mx-auto">
            Leading the future of digital banking with innovation, security, and
            exceptional service
          </p>
          <div className="flex flex-wrap justify-center gap-8 text-lg">
            <div className="flex items-center space-x-2">
              <ShieldCheckIcon className="h-6 w-6" />
              <span>Trusted & Secure</span>
            </div>
            <div className="flex items-center space-x-2">
              <SparklesIcon className="h-6 w-6" />
              <span>Innovation First</span>
            </div>
            <div className="flex items-center space-x-2">
              <UserCircleIcon className="h-6 w-6" />
              <span>Customer Focused</span>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* Company Profile Section */}
      <div className="container mx-auto px-4 py-8">
        <CompanyProfile />
      </div>

      <div className="container mx-auto px-4 py-16">
        {/* Stats Section */}
        <AnimatedSection>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="text-center p-6 bg-white rounded-2xl shadow-lg hover-lift"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-[#A41E22] to-[#8C1A1F] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900 mb-2">
                    {stat.value}
                  </p>
                  <p className="text-gray-600 font-medium">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </AnimatedSection>

        {/* Navigation Tabs */}
        <AnimatedSection>
          <div className="flex justify-center mb-12">
            <div className="bg-white rounded-2xl p-2 shadow-lg">
              <div className="flex space-x-2">
                {(Object.keys(INFO_SECTIONS) as InfoSectionKey[]).map((key) => {
                  const Icon = sectionIcons[key];
                  return (
                    <button
                      key={key}
                      onClick={() => setActiveSection(key)}
                      className={`flex items-center space-x-3 px-6 py-4 rounded-xl font-semibold transition-all duration-300 ${
                        activeSection === key
                          ? "bg-gradient-to-r from-[#A41E22] to-[#8C1A1F] text-white shadow-lg scale-105"
                          : "text-gray-600 hover:bg-red-50 hover:text-[#A41E22]"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="hidden md:block">
                        {INFO_SECTIONS[key].title}
                      </span>
                      <span className="md:hidden">
                        {INFO_SECTIONS[key].title.split(" ")[0]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </AnimatedSection>

        {/* Content Section */}
        <AnimatedSection key={activeSection}>
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden hover-lift">
            <div className="bg-gradient-to-r from-[#A41E22]/10 to-[#8C1A1F]/10 p-8 md:p-12">
              <div className="flex items-center space-x-4 mb-6">
                {(() => {
                  const Icon = sectionIcons[activeSection];
                  return <Icon className="h-12 w-12 text-[#A41E22]" />;
                })()}
                <h2 className="text-4xl font-bold text-[#A41E22]">
                  {INFO_SECTIONS[activeSection].title}
                </h2>
              </div>
            </div>
            <div className="p-8 md:p-12">
              <div className="prose prose-xl max-w-none">
                {renderContent(INFO_SECTIONS[activeSection].content)}
              </div>
            </div>
          </div>
        </AnimatedSection>

        {/* Additional Features Section */}
        <div className="mt-20">
          <AnimatedSection>
            <h2 className="text-4xl font-bold text-center mb-12 text-[#A41E22]">
              Why Choose NovaBank?
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-8 bg-white rounded-2xl shadow-lg hover-lift">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShieldCheckIcon className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900">
                  Bank-Level Security
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Your money and data are protected with military-grade
                  encryption and multi-factor authentication.
                </p>
              </div>

              <div className="text-center p-8 bg-white rounded-2xl shadow-lg hover-lift">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <SparklesIcon className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900">
                  Innovative Technology
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Experience cutting-edge banking technology with AI-powered
                  insights and seamless digital experiences.
                </p>
              </div>

              <div className="text-center p-8 bg-white rounded-2xl shadow-lg hover-lift">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <UserCircleIcon className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900">
                  24/7 Support
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Get help whenever you need it with our round-the-clock
                  customer support and AI assistance.
                </p>
              </div>
            </div>
          </AnimatedSection>
        </div>

        {/* Awards & Recognition */}
        <div className="mt-20">
          <AnimatedSection>
            <div className="bg-gradient-to-r from-[#A41E22] to-[#8C1A1F] rounded-3xl p-12 text-white text-center">
              <h2 className="text-4xl font-bold mb-8">Awards & Recognition</h2>
              <div className="grid md:grid-cols-3 gap-8">
                <div>
                  <h3 className="text-2xl font-bold mb-2">
                    🏆 Best Digital Bank 2024
                  </h3>
                  <p className="opacity-90">Banking Excellence Awards</p>
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">
                    ⭐ Top Customer Service
                  </h3>
                  <p className="opacity-90">Financial Services Institute</p>
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">
                    🚀 Innovation Leader
                  </h3>
                  <p className="opacity-90">FinTech Innovation Awards</p>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </div>
  );
};

export default InfoPage;
