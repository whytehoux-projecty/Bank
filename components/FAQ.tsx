import React, { useState } from "react";
import { AnimatedSection } from "./AnimatedSection";
import { ChevronDownIcon, ChevronUpIcon } from "../constants";

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
    <AnimatedSection className="py-16 bg-white">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#A41E22] mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-600">
            Find answers to common questions about NovaBank's services
          </p>
        </div>

        <div className="space-y-4">
          {faqItems.map((item, index) => (
            <AnimatedSection
              key={index}
              delay={index * 100}
              animation="fadeInUp"
              className="bg-gray-50 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <button
                onClick={() => toggleItem(index)}
                className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-100 transition-colors duration-200"
              >
                <h3 className="text-lg font-semibold text-[#A41E22] pr-4">
                  {item.question}
                </h3>
                {openItems.includes(index) ? (
                  <ChevronUpIcon className="h-5 w-5 text-[#A41E22] flex-shrink-0" />
                ) : (
                  <ChevronDownIcon className="h-5 w-5 text-[#A41E22] flex-shrink-0" />
                )}
              </button>

              <div
                className={`px-6 transition-all duration-300 ease-in-out ${
                  openItems.includes(index)
                    ? "pb-4 opacity-100 max-h-40"
                    : "pb-0 opacity-0 max-h-0 overflow-hidden"
                }`}
              >
                <p className="text-gray-600 leading-relaxed">{item.answer}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            Still have questions? We're here to help!
          </p>
          <a
            href="/contact"
            className="inline-block bg-gradient-to-r from-[#A41E22] to-[#8C1A1F] hover:from-[#8C1A1F] hover:to-[#751016] text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300 hover-lift shadow-lg"
          >
            Contact Support
          </a>
        </div>
      </div>
    </AnimatedSection>
  );
};

export default FAQ;
