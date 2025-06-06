import React from "react";
import { Link } from "react-router-dom";
import {
  SparklesIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
} from "../constants";

const TermsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="flex items-center space-x-2 text-2xl font-bold text-[#A41E22] hover:text-[#8C1A1F] transition-all duration-300 hover-lift group"
            >
              <SparklesIcon className="h-8 w-8 group-hover:rotate-12 transition-transform duration-300" />
              <span className="bg-gradient-to-r from-[#A41E22] to-[#8C1A1F] bg-clip-text text-transparent">
                NovaBank
              </span>
            </Link>
            <Link
              to="/auth"
              className="bg-gradient-to-r from-[#A41E22] to-[#8C1A1F] hover:from-[#8C1A1F] hover:to-[#751016] text-white px-6 py-2 rounded-lg font-semibold transition-all duration-300 hover-lift"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden py-16">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/banking-hero.jpg')" }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#A41E22]/90 via-[#8C1A1F]/80 to-[#751016]/90"></div>
        <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-3xl anim-float"></div>
        <div
          className="absolute bottom-10 right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl anim-float"
          style={{ animationDelay: "2s" }}
        ></div>

        <div className="max-w-4xl mx-auto px-4 text-center relative z-10 text-white">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-6 anim-gentleBounce">
            <DocumentTextIcon className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold mb-4 anim-slideInDown">
            Terms & Conditions
          </h1>
          <p className="text-xl opacity-90 anim-slideInUp">
            Your trust and security are our top priorities
          </p>
          <p className="text-sm opacity-75 mt-2">Last updated: December 2024</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 lg:p-12">
          {/* Quick Summary */}
          <div className="mb-12 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <CheckCircleIcon className="h-6 w-6 text-blue-600 mr-2" />
              Quick Summary
            </h2>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
              <div className="flex items-start space-x-2">
                <ShieldCheckIcon className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Your deposits are FDIC insured up to $250,000</span>
              </div>
              <div className="flex items-start space-x-2">
                <ShieldCheckIcon className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>We never sell your personal information</span>
              </div>
              <div className="flex items-start space-x-2">
                <ShieldCheckIcon className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>24/7 fraud monitoring and protection</span>
              </div>
              <div className="flex items-start space-x-2">
                <ShieldCheckIcon className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Zero liability for unauthorized transactions</span>
              </div>
            </div>
          </div>

          {/* Terms Content */}
          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                1. Acceptance of Terms
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                By accessing and using NovaBank's digital banking services, you
                acknowledge that you have read, understood, and agree to be
                bound by these Terms and Conditions. These terms constitute a
                legally binding agreement between you and NovaBank.
              </p>
              <p className="text-gray-700 leading-relaxed">
                If you do not agree to these terms, please do not use our
                services. We reserve the right to modify these terms at any
                time, and we will notify you of any significant changes.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                2. Account Opening and Eligibility
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                To open an account with NovaBank, you must be at least 18 years
                old and a legal resident of the United States. You agree to
                provide accurate, current, and complete information during the
                registration process and to update such information to keep it
                accurate, current, and complete.
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-yellow-800 mb-2">
                  Required Documentation
                </h3>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Valid government-issued photo ID</li>
                  <li>• Social Security Number verification</li>
                  <li>• Proof of address (utility bill or bank statement)</li>
                  <li>• Initial deposit (minimum varies by account type)</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                3. Account Security and Access
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                You are responsible for maintaining the confidentiality of your
                account credentials, including your username, password, and any
                other authentication methods. You agree to:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                <li>
                  Use strong, unique passwords and enable two-factor
                  authentication when available
                </li>
                <li>
                  Notify us immediately of any unauthorized access or security
                  breaches
                </li>
                <li>
                  Log out of your account when finished, especially on shared
                  devices
                </li>
                <li>
                  Keep your contact information updated for security
                  notifications
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                4. Digital Banking Services
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                NovaBank provides various digital banking services, including
                but not limited to:
              </p>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">
                    Core Services
                  </h3>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Account balance inquiries</li>
                    <li>• Transaction history</li>
                    <li>• Fund transfers</li>
                    <li>• Bill payment services</li>
                    <li>• Mobile check deposits</li>
                  </ul>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">
                    Premium Features
                  </h3>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• AI-powered financial insights</li>
                    <li>• Advanced budgeting tools</li>
                    <li>• Investment advisory services</li>
                    <li>• Priority customer support</li>
                    <li>• Enhanced security features</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                5. Fees and Charges
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                NovaBank is committed to transparent pricing. All applicable
                fees are disclosed in our Fee Schedule, available on our website
                and mobile app. Common fees may include:
              </p>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300 text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 px-4 py-2 text-left font-semibold">
                        Service
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-left font-semibold">
                        Fee
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">
                        Monthly maintenance (Nova Everyday)
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        $0 with minimum balance
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">
                        ATM withdrawals (in-network)
                      </td>
                      <td className="border border-gray-300 px-4 py-2">Free</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">
                        ATM withdrawals (out-of-network)
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        $2.50
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">
                        Domestic wire transfers
                      </td>
                      <td className="border border-gray-300 px-4 py-2">$15</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">
                        International wire transfers
                      </td>
                      <td className="border border-gray-300 px-4 py-2">$25</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                6. Privacy and Data Protection
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Your privacy is paramount to us. We collect and use your
                personal information in accordance with our Privacy Policy and
                applicable laws, including:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                <li>Bank Secrecy Act and Anti-Money Laundering regulations</li>
                <li>Fair Credit Reporting Act</li>
                <li>Gramm-Leach-Bliley Act</li>
                <li>California Consumer Privacy Act (where applicable)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                7. Liability and Dispute Resolution
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                NovaBank provides banking services with industry-standard
                protections and is not liable for losses resulting from:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                <li>
                  Unauthorized access due to failure to secure account
                  credentials
                </li>
                <li>Technical issues beyond our reasonable control</li>
                <li>Third-party service provider failures</li>
                <li>Market fluctuations affecting investment products</li>
              </ul>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 mb-2">
                  Dispute Resolution Process
                </h3>
                <p className="text-sm text-blue-700">
                  For any disputes, we encourage first contacting our customer
                  service team. If unresolved, disputes may be submitted to
                  binding arbitration as outlined in your account agreement.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                8. Account Closure and Termination
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Either party may terminate the banking relationship at any time
                with proper notice. Upon closure:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                <li>Outstanding fees and charges must be settled</li>
                <li>
                  Remaining balances will be returned via check or transfer
                </li>
                <li>Automatic payments and deposits should be redirected</li>
                <li>
                  Account records will be maintained per regulatory requirements
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                9. Regulatory Compliance
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                NovaBank is a member of the Federal Deposit Insurance
                Corporation (FDIC) and complies with all applicable banking
                regulations. Your deposits are insured up to the maximum amount
                allowed by law.
              </p>
              <div className="flex items-center space-x-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <ShieldCheckIcon className="h-8 w-8 text-green-600 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-green-800">FDIC Insured</h3>
                  <p className="text-sm text-green-700">
                    Member FDIC. Equal Housing Lender.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                10. Contact Information
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                For questions about these terms or our services, please contact
                us:
              </p>
              <div className="bg-gray-50 rounded-lg p-6 space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-[#A41E22] rounded-full"></div>
                  <span className="text-gray-700">
                    <strong>Phone:</strong> 1-800-NOVA-BANK (1-800-668-2226)
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-[#A41E22] rounded-full"></div>
                  <span className="text-gray-700">
                    <strong>Email:</strong> support@novabank.com
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-[#A41E22] rounded-full"></div>
                  <span className="text-gray-700">
                    <strong>Address:</strong> 123 Financial District, New York,
                    NY 10004
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-[#A41E22] rounded-full"></div>
                  <span className="text-gray-700">
                    <strong>Hours:</strong> Monday-Friday 8AM-8PM ET, Saturday
                    9AM-5PM ET
                  </span>
                </div>
              </div>
            </section>
          </div>

          {/* Agreement Section */}
          <div className="mt-12 p-6 bg-gradient-to-r from-[#A41E22]/5 to-[#8C1A1F]/5 rounded-xl border border-red-100">
            <h3 className="text-xl font-bold text-gray-800 mb-3">
              Agreement Acknowledgment
            </h3>
            <p className="text-gray-700 text-sm leading-relaxed">
              By using NovaBank's services, you acknowledge that you have read,
              understood, and agree to be bound by these Terms and Conditions,
              along with our Privacy Policy and any other applicable agreements.
              These terms are effective as of the date you first use our
              services and will remain in effect until terminated by either
              party in accordance with the provisions outlined above.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <SparklesIcon className="h-6 w-6 text-[#A41E22]" />
            <span className="text-xl font-bold">NovaBank</span>
          </div>
          <p className="text-gray-400 text-sm">
            © 2024 NovaBank. All rights reserved. Member FDIC. Equal Housing
            Lender.
          </p>
          <div className="flex justify-center space-x-6 mt-4 text-sm">
            <Link
              to="/privacy"
              className="text-gray-400 hover:text-white transition-colors duration-200"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms"
              className="text-gray-400 hover:text-white transition-colors duration-200"
            >
              Terms of Service
            </Link>
            <Link
              to="/contact"
              className="text-gray-400 hover:text-white transition-colors duration-200"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default TermsPage;
