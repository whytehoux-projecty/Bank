import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../App";
import { AuthRole } from "../types";
import PerformanceStats from "../components/PerformanceStats";
import FAQ from "../components/FAQ";
import TestimonialsSection from "../components/TestimonialsSection";
import CTASection from "../components/CTASection";

const FeatureCard: React.FC<{
  title: string;
  description: string;
  icon?: React.ReactNode;
  imageUrl?: string;
  linkTo?: string;
  animationDelay?: string;
}> = ({ title, description, icon, imageUrl, linkTo, animationDelay }) => {
  const cardContent = (
    <div
      className="bg-white p-8 rounded-xl shadow-lg h-full flex flex-col transition-all duration-300 hover:shadow-2xl hover-lift anim-fadeInUp group"
      style={{ animationDelay }}
    >
      {imageUrl ? (
        <div className="relative overflow-hidden rounded-lg mb-6">
          <img
            src={imageUrl}
            alt={title}
            className="h-40 w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#A41E22]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
      ) : (
        icon && (
          <div className="text-[#A41E22] mb-6 transform transition-transform duration-300 group-hover:scale-110">
            {icon}
          </div>
        )
      )}
      <h3 className="text-xl font-bold mb-3 text-[#A41E22] group-hover:text-[#8C1A1F] transition-colors duration-300">
        {title}
      </h3>
      <p className="text-gray-600 flex-grow leading-relaxed">{description}</p>
      {linkTo && (
        <div className="mt-6">
          <span className="text-[#A41E22] hover:text-[#8C1A1F] font-semibold group transition-colors duration-300">
            Learn More{" "}
            <span className="inline-block transition-transform duration-300 group-hover:translate-x-2">
              &rarr;
            </span>
          </span>
        </div>
      )}
    </div>
  );
  return linkTo ? (
    <Link to={linkTo} className="block h-full">
      {cardContent}
    </Link>
  ) : (
    <div className="h-full">{cardContent}</div>
  );
};

const HomePage: React.FC = () => {
  const { role } = useAuth();

  return (
    <div className="space-y-20 md:space-y-32 py-4">
      {/* Hero Section */}
      <section
        className="text-center py-20 md:py-32 bg-cover bg-center rounded-2xl shadow-2xl relative overflow-hidden anim-fadeIn"
        style={{
          backgroundImage: "url('/images/banking-login-bg.jpg')",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/90"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#A41E22]/30 to-transparent"></div>
        <div className="relative z-10 p-6">
          <h1 className="text-5xl md:text-7xl font-bold mb-8 text-white anim-fadeInUp">
            Welcome to{" "}
            <span className="gradient-text bg-gradient-to-r from-red-300 via-red-200 to-red-100 bg-clip-text text-transparent anim-float">
              NovaBank
            </span>
          </h1>
          <p
            className="text-xl md:text-2xl text-gray-200 mb-12 max-w-4xl mx-auto anim-fadeInUp leading-relaxed"
            style={{ animationDelay: "0.2s" }}
          >
            Experience the future of digital banking with AI-powered insights,
            personalized services, and fortress-level security.
          </p>
          <div
            className="anim-fadeInUp space-y-4 md:space-y-0 md:space-x-4 md:flex md:justify-center"
            style={{ animationDelay: "0.4s" }}
          >
            {role === AuthRole.Guest && (
              <>
                <Link
                  to="/auth"
                  className="inline-block bg-gradient-to-r from-[#A41E22] to-[#8C1A1F] hover:from-[#8C1A1F] hover:to-[#751016] text-white font-bold py-4 px-10 rounded-lg text-lg transition-all duration-300 hover-lift shadow-lg anim-glow"
                >
                  Get Started Today
                </Link>
                <Link
                  to="/info"
                  className="inline-block bg-transparent border-2 border-white text-white hover:bg-white hover:text-[#A41E22] font-bold py-4 px-10 rounded-lg text-lg transition-all duration-300 hover-lift"
                >
                  Learn More
                </Link>
              </>
            )}
            {role === AuthRole.User && (
              <Link
                to="/dashboard/user"
                className="inline-block bg-[#A41E22] hover:bg-[#8C1A1F] text-white font-bold py-4 px-10 rounded-lg text-lg transition-all duration-300 hover-lift shadow-lg"
              >
                Go to Dashboard
              </Link>
            )}
            {role === AuthRole.Admin && (
              <Link
                to="/dashboard/admin"
                className="inline-block bg-[#A41E22] hover:bg-[#8C1A1F] text-white font-bold py-4 px-10 rounded-lg text-lg transition-all duration-300 hover-lift shadow-lg"
              >
                Admin Panel
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="anim-fadeInUp">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-[#A41E22] anim-slideInLeft">
            Why Choose NovaBank?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto anim-slideInRight">
            Discover banking solutions designed for the modern world
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-10">
          <FeatureCard
            imageUrl="/images/mobile-banking.jpg"
            title="AI-Powered Banking"
            description="Experience intelligent banking with our advanced AI assistant Nova, providing personalized insights and 24/7 support for all your financial needs."
            linkTo="/info"
            animationDelay="0.2s"
          />
          <FeatureCard
            imageUrl="/images/happy-banking-customer.jpg"
            title="Personalized Solutions"
            description="Tailored banking products and services designed specifically for your lifestyle, goals, and financial aspirations."
            linkTo="/auth"
            animationDelay="0.4s"
          />
          <FeatureCard
            imageUrl="/images/banking-security.jpg"
            title="Enterprise Security"
            description="Bank with confidence knowing your assets are protected by military-grade encryption and advanced security protocols."
            linkTo="/info"
            animationDelay="0.6s"
          />
        </div>
      </section>

      {/* Services Section - Inspired by Zenith Bank */}
      <section className="anim-fadeInUp">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-[#A41E22]">
            Banking Services
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive financial solutions for individuals and businesses
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-lg hover-lift anim-scaleIn border border-gray-100">
            <div className="w-12 h-12 bg-gradient-to-r from-[#A41E22] to-[#8C1A1F] rounded-lg flex items-center justify-center mb-4">
              <span className="text-white font-bold text-xl">₦</span>
            </div>
            <h3 className="text-lg font-bold mb-2 text-[#A41E22]">
              Internet Banking
            </h3>
            <p className="text-gray-600 text-sm">
              Handle all your banking functions from one secure platform
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg hover-lift anim-scaleIn border border-gray-100">
            <div className="w-12 h-12 bg-gradient-to-r from-[#A41E22] to-[#8C1A1F] rounded-lg flex items-center justify-center mb-4">
              <span className="text-white font-bold text-xl">📱</span>
            </div>
            <h3 className="text-lg font-bold mb-2 text-[#A41E22]">
              Mobile App
            </h3>
            <p className="text-gray-600 text-sm">
              Banking on the go with our advanced mobile application
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg hover-lift anim-scaleIn border border-gray-100">
            <div className="w-12 h-12 bg-gradient-to-r from-[#A41E22] to-[#8C1A1F] rounded-lg flex items-center justify-center mb-4">
              <span className="text-white font-bold text-xl">🔒</span>
            </div>
            <h3 className="text-lg font-bold mb-2 text-[#A41E22]">
              Secure Transactions
            </h3>
            <p className="text-gray-600 text-sm">
              Military-grade security for all your financial transactions
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg hover-lift anim-scaleIn border border-gray-100">
            <div className="w-12 h-12 bg-gradient-to-r from-[#A41E22] to-[#8C1A1F] rounded-lg flex items-center justify-center mb-4">
              <span className="text-white font-bold text-xl">24/7</span>
            </div>
            <h3 className="text-lg font-bold mb-2 text-[#A41E22]">
              Customer Support
            </h3>
            <p className="text-gray-600 text-sm">
              Round-the-clock assistance for all your banking needs
            </p>
          </div>
        </div>
      </section>

      {/* Quick Actions Section */}
      <section className="bg-gradient-to-br from-gray-50 via-white to-gray-50 py-16 px-8 rounded-2xl anim-fadeInUp relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#A41E22]/5 to-transparent"></div>
        <div className="relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#A41E22]">
              Quick Actions
            </h2>
            <p className="text-lg text-gray-600">
              Common banking tasks made simple
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-md hover-lift text-center border border-gray-100 group">
              <div className="w-16 h-16 bg-gradient-to-r from-[#A41E22] to-[#8C1A1F] rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <span className="text-white text-2xl">💳</span>
              </div>
              <h3 className="font-bold text-[#A41E22] mb-2">Open Account</h3>
              <p className="text-sm text-gray-600">
                Start your banking journey today
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md hover-lift text-center border border-gray-100 group">
              <div className="w-16 h-16 bg-gradient-to-r from-[#A41E22] to-[#8C1A1F] rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <span className="text-white text-2xl">💰</span>
              </div>
              <h3 className="font-bold text-[#A41E22] mb-2">Transfer Funds</h3>
              <p className="text-sm text-gray-600">
                Send money instantly and securely
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md hover-lift text-center border border-gray-100 group">
              <div className="w-16 h-16 bg-gradient-to-r from-[#A41E22] to-[#8C1A1F] rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <span className="text-white text-2xl">📊</span>
              </div>
              <h3 className="font-bold text-[#A41E22] mb-2">View Balance</h3>
              <p className="text-sm text-gray-600">Check your account status</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md hover-lift text-center border border-gray-100 group">
              <div className="w-16 h-16 bg-gradient-to-r from-[#A41E22] to-[#8C1A1F] rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <span className="text-white text-2xl">📞</span>
              </div>
              <h3 className="font-bold text-[#A41E22] mb-2">Get Support</h3>
              <p className="text-sm text-gray-600">24/7 customer assistance</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="anim-fadeInUp">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-[#A41E22]">
            What Our Customers Say
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Trusted by thousands of customers worldwide
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-xl shadow-lg hover-lift anim-slideInLeft border border-gray-100">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-[#A41E22] to-[#8C1A1F] rounded-full flex items-center justify-center text-white font-bold">
                S
              </div>
              <div className="ml-4">
                <h4 className="font-semibold text-gray-800">Sarah Johnson</h4>
                <p className="text-sm text-gray-600">Small Business Owner</p>
              </div>
            </div>
            <p className="text-gray-600 italic leading-relaxed">
              "NovaBank's AI assistant has transformed how I manage my business
              finances. The personalized insights helped me optimize my cash
              flow and make better decisions."
            </p>
            <div className="flex mt-4 text-yellow-400">{"★".repeat(5)}</div>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg hover-lift anim-fadeInUp border border-gray-100">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-[#A41E22] to-[#8C1A1F] rounded-full flex items-center justify-center text-white font-bold">
                M
              </div>
              <div className="ml-4">
                <h4 className="font-semibold text-gray-800">Michael Chen</h4>
                <p className="text-sm text-gray-600">Software Engineer</p>
              </div>
            </div>
            <p className="text-gray-600 italic leading-relaxed">
              "The security features and modern interface make banking a
              pleasure. I love the real-time notifications and the seamless
              mobile experience."
            </p>
            <div className="flex mt-4 text-yellow-400">{"★".repeat(5)}</div>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg hover-lift anim-slideInRight border border-gray-100">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-[#A41E22] to-[#8C1A1F] rounded-full flex items-center justify-center text-white font-bold">
                E
              </div>
              <div className="ml-4">
                <h4 className="font-semibold text-gray-800">Emily Rodriguez</h4>
                <p className="text-sm text-gray-600">Marketing Director</p>
              </div>
            </div>
            <p className="text-gray-600 italic leading-relaxed">
              "Outstanding customer service and innovative features. The AI
              assistant is like having a personal financial advisor available
              24/7."
            </p>
            <div className="flex mt-4 text-yellow-400">{"★".repeat(5)}</div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="bg-gradient-to-r from-[#A41E22] via-[#8C1A1F] to-[#751016] text-white py-16 px-8 rounded-2xl anim-fadeInUp shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
        <div className="grid md:grid-cols-3 gap-8 text-center relative z-10">
          <div className="anim-slideInLeft hover-lift">
            <div className="text-4xl md:text-5xl font-bold mb-2 anim-glow">
              500K+
            </div>
            <div className="text-lg opacity-90">Satisfied Customers</div>
          </div>
          <div className="anim-fadeInUp hover-lift">
            <div className="text-4xl md:text-5xl font-bold mb-2 anim-glow">
              $2.5B+
            </div>
            <div className="text-lg opacity-90">Assets Under Management</div>
          </div>
          <div className="anim-slideInRight hover-lift">
            <div className="text-4xl md:text-5xl font-bold mb-2 anim-glow">
              99.9%
            </div>
            <div className="text-lg opacity-90">Uptime Guarantee</div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="bg-gradient-to-br from-gray-50 via-white to-gray-50 p-12 rounded-2xl shadow-xl text-center anim-fadeInUp border border-gray-100 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#A41E22]/5 to-transparent"></div>
        <div className="relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-[#A41E22] anim-slideDown">
            Ready to Transform Your Banking?
          </h2>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed anim-fadeInUp">
            Join the revolution of intelligent banking. Open your NovaBank
            account today and experience the future of finance.
          </p>
          {role === AuthRole.Guest && (
            <div className="space-y-4 md:space-y-0 md:space-x-4 md:flex md:justify-center anim-zoomIn">
              <Link
                to="/auth?action=register"
                className="inline-block bg-gradient-to-r from-[#A41E22] to-[#8C1A1F] hover:from-[#8C1A1F] hover:to-[#751016] text-white font-bold py-4 px-10 rounded-lg text-lg transition-all duration-300 hover-lift shadow-lg anim-glow"
              >
                Open Account Now
              </Link>
              <Link
                to="/contact"
                className="inline-block bg-transparent border-2 border-[#A41E22] text-[#A41E22] hover:bg-[#A41E22] hover:text-white font-bold py-4 px-10 rounded-lg text-lg transition-all duration-300 hover-lift"
              >
                Contact Us
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* News & Updates Section */}
      <section className="anim-fadeInUp">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-[#A41E22]">
            Latest News & Updates
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Stay informed about our latest features and banking industry
            insights
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <article className="bg-white rounded-xl shadow-lg overflow-hidden hover-lift anim-scaleIn border border-gray-100">
            <div className="h-48 bg-gradient-to-br from-[#A41E22] to-[#8C1A1F] flex items-center justify-center">
              <span className="text-white text-4xl">🚀</span>
            </div>
            <div className="p-6">
              <div className="text-sm text-gray-500 mb-2">June 5, 2025</div>
              <h3 className="text-xl font-bold mb-3 text-[#A41E22]">
                Nova AI Assistant 2.0 Launched
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Enhanced AI capabilities with improved financial insights and
                24/7 personalized support for all customers.
              </p>
            </div>
          </article>

          <article className="bg-white rounded-xl shadow-lg overflow-hidden hover-lift anim-scaleIn border border-gray-100">
            <div className="h-48 bg-gradient-to-br from-[#A41E22] to-[#8C1A1F] flex items-center justify-center">
              <span className="text-white text-4xl">🔐</span>
            </div>
            <div className="p-6">
              <div className="text-sm text-gray-500 mb-2">June 1, 2025</div>
              <h3 className="text-xl font-bold mb-3 text-[#A41E22]">
                Enhanced Security Features
              </h3>
              <p className="text-gray-600 leading-relaxed">
                New biometric authentication and real-time fraud detection to
                keep your accounts safer than ever.
              </p>
            </div>
          </article>

          <article className="bg-white rounded-xl shadow-lg overflow-hidden hover-lift anim-scaleIn border border-gray-100 md:col-span-2 lg:col-span-1">
            <div className="h-48 bg-gradient-to-br from-[#A41E22] to-[#8C1A1F] flex items-center justify-center">
              <span className="text-white text-4xl">💳</span>
            </div>
            <div className="p-6">
              <div className="text-sm text-gray-500 mb-2">May 28, 2025</div>
              <h3 className="text-xl font-bold mb-3 text-[#A41E22]">
                New Premium Cards Available
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Introducing our new premium credit cards with exclusive rewards
                and worldwide benefits.
              </p>
            </div>
          </article>
        </div>
      </section>

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* Performance Stats Section */}
      <PerformanceStats />

      {/* Call to Action Section */}
      <CTASection />

      {/* FAQ Section */}
      <FAQ />
    </div>
  );
};

export default HomePage;
