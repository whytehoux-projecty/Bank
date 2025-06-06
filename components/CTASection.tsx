import React from "react";
import { Link } from "react-router-dom";
import { AnimatedSection } from "./AnimatedSection";
import { SparklesIcon } from "../constants";

const CTASection: React.FC = () => {
  return (
    <AnimatedSection className="py-20 bg-gradient-to-br from-[#A41E22] via-[#8C1A1F] to-[#751016] relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-20 h-20 bg-white rounded-full blur-xl"></div>
        <div className="absolute top-32 right-20 w-16 h-16 bg-white rounded-full blur-lg"></div>
        <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-white rounded-full blur-2xl"></div>
        <div className="absolute bottom-32 right-10 w-12 h-12 bg-white rounded-full blur-md"></div>
      </div>

      <div className="container mx-auto px-4 text-center relative z-10">
        <AnimatedSection delay={200} animation="fadeInUp">
          <SparklesIcon className="h-16 w-16 text-white mx-auto mb-6 anim-float" />
        </AnimatedSection>

        <AnimatedSection delay={400} animation="fadeInUp">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Ready to Transform Your Banking?
          </h2>
        </AnimatedSection>

        <AnimatedSection delay={600} animation="fadeInUp">
          <p className="text-xl md:text-2xl text-white/90 mb-10 max-w-3xl mx-auto leading-relaxed">
            Join over 100,000 customers who have already discovered the future
            of digital banking. Experience AI-powered insights, military-grade
            security, and personalized financial solutions.
          </p>
        </AnimatedSection>

        <AnimatedSection delay={800} animation="fadeInUp">
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/auth"
              className="inline-flex items-center px-8 py-4 bg-white hover:bg-gray-100 text-[#A41E22] font-bold rounded-lg text-lg transition-all duration-300 hover-lift shadow-2xl group"
            >
              <SparklesIcon className="h-6 w-6 mr-2 group-hover:rotate-12 transition-transform duration-300" />
              Start Banking Today
              <span className="ml-2 group-hover:translate-x-1 transition-transform duration-300">
                →
              </span>
            </Link>

            <Link
              to="/contact"
              className="inline-flex items-center px-8 py-4 bg-transparent border-2 border-white hover:bg-white hover:text-[#A41E22] text-white font-bold rounded-lg text-lg transition-all duration-300 hover-lift"
            >
              Talk to an Expert
            </Link>
          </div>
        </AnimatedSection>

        <AnimatedSection delay={1000} animation="fadeInUp">
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">5 min</div>
              <div className="text-white/80">Account Setup</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">24/7</div>
              <div className="text-white/80">AI Support</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">₦0</div>
              <div className="text-white/80">Setup Fees</div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </AnimatedSection>
  );
};

export default CTASection;
