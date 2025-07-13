import React from "react";
import { AnimatedSection } from "./AnimatedSection";

interface PerformanceMetric {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
  icon: string;
}

const PerformanceStats: React.FC = () => {
  const metrics: PerformanceMetric[] = [
    {
      label: "Customer Satisfaction",
      value: "98.5%",
      change: "+2.3%",
      trend: "up",
      icon: "😊",
    },
    {
      label: "Transaction Speed",
      value: "0.8s",
      change: "-0.2s",
      trend: "up",
      icon: "⚡",
    },
    {
      label: "Security Score",
      value: "99.9%",
      change: "+0.1%",
      trend: "up",
      icon: "🔒",
    },
    {
      label: "Mobile App Rating",
      value: "4.9/5",
      change: "+0.1",
      trend: "up",
      icon: "⭐",
    },
  ];

  return (
    <AnimatedSection className="py-16 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#0D9488] mb-4">
            Performance Excellence
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our commitment to excellence reflected in real-time metrics
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric, index) => (
            <AnimatedSection
              key={metric.label}
              delay={index * 100}
              animation="scaleIn"
              className="bg-white p-6 rounded-xl shadow-lg hover-lift border border-gray-100 text-center group"
            >
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                {metric.icon}
              </div>
              <h3 className="text-2xl font-bold text-[#0D9488] mb-2">
                {metric.value}
              </h3>
              <p className="text-gray-600 mb-2 font-medium">{metric.label}</p>
              <div
                className={`text-sm font-semibold ${
                  metric.trend === "up"
                    ? "text-green-600"
                    : metric.trend === "down"
                    ? "text-red-600"
                    : "text-gray-600"
                }`}
              >
                {metric.change} this month
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </AnimatedSection>
  );
};

export default PerformanceStats;
