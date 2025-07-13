import React from "react";
import Link from "next/link";
import {
  SparklesIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  GlobeAltIcon,
} from "../../constants";

const PrivacyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center space-x-2 text-2xl font-bold text-[#A41E22] hover:text-[#8C1A1F] transition-all duration-300 hover-lift group"
            >
              <SparklesIcon className="h-8 w-8 group-hover:rotate-12 transition-transform duration-300" />
              <span className="bg-gradient-to-r from-gold-300 to-gold-400 bg-clip-text text-transparent">
                Aurum Vault
              </span>
            </Link>
            <Link
              href="/auth"
              className="bg-gradient-to-r from-navy-800 to-navy-900 hover:from-navy-700 hover:to-navy-800 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-300 hover-lift"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#A41E22] via-[#8C1A1F] to-[#751016] text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent"></div>
        <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-3xl anim-float"></div>
        <div
          className="absolute bottom-10 right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl anim-float"
          style={{ animationDelay: "2s" }}
        ></div>

        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-6 anim-gentleBounce">
            <ShieldCheckIcon className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold mb-4 anim-slideInDown">
            Privacy Policy
          </h1>
          <p className="text-xl opacity-90 anim-slideInUp">
            Your privacy and data security are fundamental to our mission
          </p>
          <p className="text-sm opacity-75 mt-2">Last updated: December 2024</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 lg:p-12">
          {/* Privacy Commitments */}
          <div className="mb-12 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <CheckCircleIcon className="h-6 w-6 text-green-600 mr-2" />
              Our Privacy Commitments
            </h2>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
              <div className="flex items-start space-x-2">
                <ShieldCheckIcon className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>
                  We never sell your personal information to third parties
                </span>
              </div>
              <div className="flex items-start space-x-2">
                <ShieldCheckIcon className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>
                  All data is encrypted using industry-leading standards
                </span>
              </div>
              <div className="flex items-start space-x-2">
                <ShieldCheckIcon className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>You control what information you share with us</span>
              </div>
              <div className="flex items-start space-x-2">
                <ShieldCheckIcon className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>
                  Regular security audits and compliance certifications
                </span>
              </div>
            </div>
          </div>

          {/* Privacy Content */}
          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                1. Information We Collect
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                To provide you with exceptional banking services, we collect
                information in several ways. We are committed to collecting only
                the information necessary to serve you better and protect your
                account.
              </p>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-800 mb-3">
                    Personal Information
                  </h3>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Full name and contact details</li>
                    <li>• Social Security Number</li>
                    <li>• Date of birth and address</li>
                    <li>• Employment and income information</li>
                    <li>• Government-issued ID information</li>
                  </ul>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <h3 className="font-semibold text-purple-800 mb-3">
                    Transaction Information
                  </h3>
                  <ul className="text-sm text-purple-700 space-y-1">
                    <li>• Account balances and transaction history</li>
                    <li>• Payment and transfer details</li>
                    <li>• Check images and deposit information</li>
                    <li>• Credit and debit card usage</li>
                    <li>• ATM and branch visit records</li>
                  </ul>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <h3 className="font-semibold text-green-800 mb-3">
                    Device Information
                  </h3>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• IP address and device identifiers</li>
                    <li>• Browser type and operating system</li>
                    <li>• Mobile app usage patterns</li>
                    <li>• Location data (when permitted)</li>
                    <li>• Login timestamps and security logs</li>
                  </ul>
                </div>
                <div className="bg-orange-50 rounded-lg p-4">
                  <h3 className="font-semibold text-orange-800 mb-3">
                    Communication Data
                  </h3>
                  <ul className="text-sm text-orange-700 space-y-1">
                    <li>• Customer service interactions</li>
                    <li>• Email and message correspondence</li>
                    <li>• Survey responses and feedback</li>
                    <li>• Marketing preferences</li>
                    <li>• Support ticket history</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                2. How We Use Your Information
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We use your information primarily to provide, maintain, and
                improve our banking services. Our use of your information is
                guided by legitimate business needs and regulatory requirements.
              </p>

              <div className="space-y-4">
                <div className="border-l-4 border-[#A41E22] pl-4">
                  <h3 className="font-semibold text-gray-800 mb-2">
                    Core Banking Services
                  </h3>
                  <p className="text-sm text-gray-600">
                    Process transactions, maintain accounts, provide customer
                    support, and ensure compliance with banking regulations.
                  </p>
                </div>
                <div className="border-l-4 border-[#8C1A1F] pl-4">
                  <h3 className="font-semibold text-gray-800 mb-2">
                    Security and Fraud Prevention
                  </h3>
                  <p className="text-sm text-gray-600">
                    Monitor for suspicious activities, verify your identity,
                    prevent unauthorized access, and protect against financial
                    crimes.
                  </p>
                </div>
                <div className="border-l-4 border-[#751016] pl-4">
                  <h3 className="font-semibold text-gray-800 mb-2">
                    Product Development
                  </h3>
                  <p className="text-sm text-gray-600">
                    Analyze usage patterns to improve our services, develop new
                    features, and personalize your banking experience.
                  </p>
                </div>
                <div className="border-l-4 border-gray-400 pl-4">
                  <h3 className="font-semibold text-gray-800 mb-2">
                    Legal and Regulatory Compliance
                  </h3>
                  <p className="text-sm text-gray-600">
                    Meet regulatory reporting requirements, respond to legal
                    requests, and maintain required records.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                3. Information Sharing and Disclosure
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We do not sell your personal information. We may share your
                information only in specific circumstances and with trusted
                partners who help us provide our services.
              </p>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-red-800 mb-2">
                  ❌ We NEVER Do This
                </h3>
                <ul className="text-sm text-red-700 space-y-1">
                  <li>• Sell your personal information to data brokers</li>
                  <li>• Share account details for marketing purposes</li>
                  <li>• Provide customer lists to third parties</li>
                  <li>• Use your data for unrelated business purposes</li>
                </ul>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 mb-2">
                  ✅ Limited Sharing We May Do
                </h3>
                <ul className="text-sm text-green-700 space-y-2">
                  <li>
                    <strong>Service Providers:</strong> Trusted partners who
                    help us operate our services (payment processors, cloud
                    storage, customer support)
                  </li>
                  <li>
                    <strong>Legal Requirements:</strong> When required by law,
                    court orders, or regulatory authorities
                  </li>
                  <li>
                    <strong>Business Transfers:</strong> In the event of a
                    merger, acquisition, or sale of assets (with notice to
                    customers)
                  </li>
                  <li>
                    <strong>Consent:</strong> When you explicitly authorize us
                    to share information
                  </li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                4. Data Security and Protection
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Security is at the core of everything we do. We employ multiple
                layers of protection to safeguard your information.
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 font-semibold text-sm">
                        1
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        Encryption
                      </h3>
                      <p className="text-sm text-gray-600">
                        All data is encrypted in transit and at rest using
                        AES-256 encryption standards.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-green-600 font-semibold text-sm">
                        2
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        Access Controls
                      </h3>
                      <p className="text-sm text-gray-600">
                        Multi-factor authentication and role-based access ensure
                        only authorized personnel can access data.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-purple-600 font-semibold text-sm">
                        3
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        Monitoring
                      </h3>
                      <p className="text-sm text-gray-600">
                        24/7 security monitoring and anomaly detection to
                        identify potential threats.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-orange-600 font-semibold text-sm">
                        4
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        Regular Audits
                      </h3>
                      <p className="text-sm text-gray-600">
                        Independent security assessments and compliance audits
                        conducted regularly.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-red-600 font-semibold text-sm">
                        5
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        Incident Response
                      </h3>
                      <p className="text-sm text-gray-600">
                        Comprehensive incident response plan to address any
                        security events quickly.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-teal-600 font-semibold text-sm">
                        6
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        Data Minimization
                      </h3>
                      <p className="text-sm text-gray-600">
                        We collect and retain only the data necessary for our
                        services and regulatory compliance.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                5. Your Privacy Rights and Choices
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                You have significant control over your personal information. We
                provide multiple ways for you to manage your privacy
                preferences.
              </p>

              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-800 mb-2">
                    Access & Portability
                  </h3>
                  <p className="text-sm text-blue-700">
                    Request copies of your personal information and download
                    your data in common formats.
                  </p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-green-800 mb-2">
                    Correction & Updates
                  </h3>
                  <p className="text-sm text-green-700">
                    Update or correct your personal information through your
                    account settings or by contacting us.
                  </p>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h3 className="font-semibold text-orange-800 mb-2">
                    Marketing Preferences
                  </h3>
                  <p className="text-sm text-orange-700">
                    Opt out of marketing communications while still receiving
                    important account notifications.
                  </p>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h3 className="font-semibold text-purple-800 mb-2">
                    Account Deletion
                  </h3>
                  <p className="text-sm text-purple-700">
                    Request account closure and data deletion, subject to legal
                    and regulatory retention requirements.
                  </p>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-800 mb-2">
                  🏛️ State-Specific Rights
                </h3>
                <p className="text-sm text-yellow-700 mb-2">
                  If you're a California resident, you have additional rights
                  under the California Consumer Privacy Act (CCPA):
                </p>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>
                    • Right to know what personal information we collect and how
                    it's used
                  </li>
                  <li>
                    • Right to delete personal information (with certain
                    exceptions)
                  </li>
                  <li>
                    • Right to opt-out of the sale of personal information (we
                    don't sell your data)
                  </li>
                  <li>
                    • Right to non-discrimination for exercising your privacy
                    rights
                  </li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                6. Cookies and Tracking Technologies
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We use cookies and similar technologies to enhance your
                experience, provide security, and analyze how our services are
                used.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300 text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 px-4 py-2 text-left font-semibold">
                        Cookie Type
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-left font-semibold">
                        Purpose
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-left font-semibold">
                        Control
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2 font-medium">
                        Essential
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        Required for basic website functionality and security
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        Cannot be disabled
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2 font-medium">
                        Analytics
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        Help us understand website usage and performance
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        Can be disabled in settings
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2 font-medium">
                        Functional
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        Remember your preferences and settings
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        Can be disabled in settings
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2 font-medium">
                        Marketing
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        Deliver relevant advertisements and content
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        Can be disabled in settings
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                7. International Data Transfers
              </h2>
              <div className="flex items-start space-x-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <GlobeAltIcon className="h-8 w-8 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-blue-800 mb-2">
                    Global Privacy Standards
                  </h3>
                  <p className="text-blue-700 text-sm leading-relaxed">
                    While NovaBank primarily operates in the United States, we
                    may transfer data internationally for processing and
                    storage. All international transfers are protected by
                    appropriate safeguards, including standard contractual
                    clauses and adequacy decisions recognized by regulatory
                    authorities.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                8. Children's Privacy
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                NovaBank does not knowingly collect personal information from
                children under 13 years of age. Our services are designed for
                and directed to adults. If we become aware that we have
                collected information from a child under 13, we will take steps
                to delete such information promptly.
              </p>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h3 className="font-semibold text-orange-800 mb-2">
                  Teen Banking Services
                </h3>
                <p className="text-sm text-orange-700">
                  For customers aged 13-17, we offer supervised banking services
                  with parental consent and oversight. Additional privacy
                  protections apply to these accounts.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                9. Changes to This Privacy Policy
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We may update this Privacy Policy periodically to reflect
                changes in our practices, technology, or legal requirements. We
                will notify you of significant changes through:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                <li>Email notifications to your registered email address</li>
                <li>Prominent notices on our website and mobile app</li>
                <li>In-app notifications when you next log in</li>
                <li>Direct mail for material changes affecting your rights</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                10. Contact Us About Privacy
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We welcome your questions and feedback about our privacy
                practices. Our dedicated privacy team is here to help.
              </p>
              <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">
                      Privacy Office
                    </h3>
                    <div className="space-y-2 text-sm text-gray-700">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-[#A41E22] rounded-full"></div>
                        <span>
                          <strong>Email:</strong> privacy@novabank.com
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-[#A41E22] rounded-full"></div>
                        <span>
                          <strong>Phone:</strong> 1-800-PRIVACY (1-800-774-8229)
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-[#A41E22] rounded-full"></div>
                        <span>
                          <strong>Response Time:</strong> 48 hours for privacy
                          requests
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">
                      Mailing Address
                    </h3>
                    <div className="text-sm text-gray-700">
                      <p>NovaBank Privacy Office</p>
                      <p>123 Financial District</p>
                      <p>New York, NY 10004</p>
                      <p className="mt-2">
                        <strong>Attn:</strong> Privacy Rights Request
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Compliance Certifications */}
          <div className="mt-12 p-6 bg-gradient-to-r from-[#A41E22]/5 to-[#8C1A1F]/5 rounded-xl border border-red-100">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Privacy Compliance & Certifications
            </h3>
            <div className="grid md:grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-white rounded-lg shadow-sm">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <ShieldCheckIcon className="h-6 w-6 text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-800 text-sm">
                  SOC 2 Type II
                </h4>
                <p className="text-xs text-gray-600">
                  Security & Privacy Controls
                </p>
              </div>
              <div className="p-4 bg-white rounded-lg shadow-sm">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <GlobeAltIcon className="h-6 w-6 text-green-600" />
                </div>
                <h4 className="font-semibold text-gray-800 text-sm">
                  ISO 27001
                </h4>
                <p className="text-xs text-gray-600">Information Security</p>
              </div>
              <div className="p-4 bg-white rounded-lg shadow-sm">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <CheckCircleIcon className="h-6 w-6 text-purple-600" />
                </div>
                <h4 className="font-semibold text-gray-800 text-sm">
                  CCPA Compliant
                </h4>
                <p className="text-xs text-gray-600">
                  California Privacy Rights
                </p>
              </div>
            </div>
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
            © 2024 Aurum Vault. All rights reserved. Member FDIC. Equal Housing
            Lender.
          </p>
          <div className="flex justify-center space-x-6 mt-4 text-sm">
            <Link
              href="/privacy"
              className="text-gray-400 hover:text-white transition-colors duration-200"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-gray-400 hover:text-white transition-colors duration-200"
            >
              Terms of Service
            </Link>
            <Link
              href="/contact"
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

export default PrivacyPage;
