import React, { useState } from "react";
import { AnimatedSection } from "./AnimatedSection";
import { ChevronDownIcon, ChevronUpIcon } from "../constants";

// Animation duration for consistent timing
const ANIMATION_DURATION = 300;

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ: React.FC = () => {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const faqItems: FAQItem[] = [
    {
      question: "How secure is NovaBank's digital platform?",
      answer:
        "NovaBank employs military-grade encryption, multi-factor authentication, and advanced fraud detection systems. All transactions are secured with 256-bit SSL encryption and monitored 24/7 by our security team.",
    },
    {
      question: "What makes NovaBank's AI assistant special?",
      answer:
        "Nova, our AI assistant, is powered by advanced machine learning algorithms that provide personalized banking insights, 24/7 customer support, and proactive financial advice based on your spending patterns and goals.",
    },
    {
      question: "How quickly can I open an account?",
      answer:
        "You can open a NovaBank account in less than 10 minutes through our digital platform. Our streamlined process requires just basic information and identity verification, with instant account activation for most customers.",
    },
    {
      question: "Are there any hidden fees?",
      answer:
        "NovaBank believes in transparent pricing. We clearly display all fees upfront with no hidden charges. Many of our digital services are free, and we offer competitive rates on all banking products.",
    },
    {
      question: "Can I access my account from anywhere in the world?",
      answer:
        "Yes! NovaBank's digital platform is accessible worldwide through our secure mobile app and web portal. We also offer international banking services with competitive exchange rates and low transfer fees.",
    },
  ];

  const toggleItem = (index: number) => {
    setOpenItems((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  return (
    <AnimatedSection
      className="py-12 md:py-16 bg-white"
      aria-labelledby="faq-heading"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <header className="text-center mb-12">
          <h2
            id="faq-heading"
            className="text-3xl sm:text-4xl font-bold text-[#0D9488] mb-3"
          >
            Frequently Asked Questions
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions about NovaBank's services
          </p>
        </header>

        <div className="space-y-4">
          {faqItems.map((item, index) => {
            const isOpen = openItems.includes(index);
            const itemId = `faq-item-${index}`;
            const buttonId = `faq-button-${index}`;

            return (
              <AnimatedSection
                key={index}
                delay={index * 100}
                animation="fadeInUp"
                className={`bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 ${
                  isOpen ? "ring-2 ring-[#0D9488] ring-opacity-20" : ""
                }`}
              >
                <h3 className="m-0">
                  <button
                    id={buttonId}
                    aria-expanded={isOpen}
                    aria-controls={itemId}
                    onClick={() => toggleItem(index)}
                    className="w-full px-5 py-4 sm:px-6 sm:py-5 text-left flex justify-between items-center hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#0D9488] focus:ring-opacity-50 rounded-lg"
                  >
                    <span className="text-base sm:text-lg font-semibold text-gray-900 pr-4">
                      {item.question}
                    </span>
                    <span className="flex-shrink-0 ml-2">
                      {isOpen ? (
                        <ChevronUpIcon
                          className="h-5 w-5 text-[#0D9488]"
                          aria-hidden="true"
                        />
                      ) : (
                        <ChevronDownIcon
                          className="h-5 w-5 text-[#0D9488]"
                          aria-hidden="true"
                        />
                      )}
                    </span>
                  </button>
                </h3>

                <div
                  id={itemId}
                  role="region"
                  aria-labelledby={buttonId}
                  className={`px-5 sm:px-6 transition-all duration-${ANIMATION_DURATION} ease-in-out ${
                    isOpen
                      ? "pb-5 sm:pb-6 opacity-100 max-h-48 overflow-visible"
                      : "pb-0 opacity-0 max-h-0 overflow-hidden"
                  }`}
                >
                  <p className="text-gray-600 leading-relaxed">{item.answer}</p>
                </div>
              </AnimatedSection>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600 mb-5 sm:mb-6">
            Still have questions? We're here to help!
          </p>
          <a
            href="/contact"
            className="inline-block bg-gradient-to-r from-[#0D9488] to-[#0F766E] hover:from-[#0F766E] hover:to-[#0D9488] text-white font-semibold py-2.5 px-6 sm:py-3 sm:px-8 rounded-lg transition-all duration-300 hover:shadow-lg transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[#0D9488] focus:ring-opacity-50 focus:ring-offset-2"
            aria-label="Contact our support team"
            role="button"
          >
            Contact Support
          </a>
        </div>
      </div>
    </AnimatedSection>
  );
};

export default FAQ;
