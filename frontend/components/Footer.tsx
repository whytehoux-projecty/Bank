import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-r from-[#0D9488] via-[#0F766E] to-[#0D9488] text-gray-100 p-12 mt-20">
      <div className="container mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div className="anim-fadeInUp">
            <h3 className="text-xl font-bold mb-4 text-white">NovaBank</h3>
            <p className="text-sm leading-relaxed mb-4">
              Revolutionizing digital banking with AI-powered solutions and
              personalized financial services.
            </p>
            <p className="text-xs opacity-90">
              Licensed and regulated financial institution
            </p>
          </div>

          {/* Services */}
          <div className="anim-fadeInUp">
            <h4 className="font-semibold mb-4 text-white">Services</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="#/info"
                  className="hover:text-white transition-colors duration-300"
                >
                  Personal Banking
                </a>
              </li>
              <li>
                <a
                  href="#/info"
                  className="hover:text-white transition-colors duration-300"
                >
                  Business Accounts
                </a>
              </li>
              <li>
                <a
                  href="#/info"
                  className="hover:text-white transition-colors duration-300"
                >
                  Loans & Credit
                </a>
              </li>
              <li>
                <a
                  href="#/info"
                  className="hover:text-white transition-colors duration-300"
                >
                  Investment Services
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="anim-fadeInUp">
            <h4 className="font-semibold mb-4 text-white">Support</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="#/contact"
                  className="hover:text-white transition-colors duration-300"
                >
                  Contact Us
                </a>
              </li>
              <li>
                <a
                  href="#/help"
                  className="hover:text-white transition-colors duration-300"
                >
                  Help Center
                </a>
              </li>
              <li>
                <a
                  href="#/security"
                  className="hover:text-white transition-colors duration-300"
                >
                  Security Center
                </a>
              </li>
              <li>
                <a
                  href="#/faq"
                  className="hover:text-white transition-colors duration-300"
                >
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="anim-fadeInUp">
            <h4 className="font-semibold mb-4 text-white">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="#/privacy"
                  className="hover:text-white transition-colors duration-300"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="#/terms"
                  className="hover:text-white transition-colors duration-300"
                >
                  Terms of Service
                </a>
              </li>
              <li>
                <a
                  href="#/compliance"
                  className="hover:text-white transition-colors duration-300"
                >
                  Compliance
                </a>
              </li>
              <li>
                <a
                  href="#/accessibility"
                  className="hover:text-white transition-colors duration-300"
                >
                  Accessibility
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/20 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm anim-fadeInUp">
            &copy; {new Date().getFullYear()} NovaBank. All rights reserved. |
            FDIC Insured
          </p>
          <p className="text-sm mt-4 md:mt-0 anim-fadeInUp opacity-90">
            Modern Banking for a Modern World
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
