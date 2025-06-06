import React, { useState } from "react";
import {
  PhoneIcon,
  InformationCircleIcon,
  ChatBubbleBottomCenterTextIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  BuildingLibraryIcon,
} from "../constants";
import { AnimatedSection } from "../components/AnimatedSection";

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    category: "general",
    phone: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const contactCategories = [
    { value: "general", label: "General Inquiry" },
    { value: "account", label: "Account Support" },
    { value: "cards", label: "Cards & Payments" },
    { value: "loans", label: "Loans & Mortgages" },
    { value: "investments", label: "Investment Services" },
    { value: "business", label: "Business Banking" },
    { value: "technical", label: "Technical Support" },
    { value: "complaints", label: "Complaints & Feedback" },
  ];

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Mock submission
    console.log("Contact form submitted:", formData);
    setTimeout(() => {
      setIsSubmitted(true);
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
        category: "general",
        phone: "",
      });
      setIsSubmitting(false);
      setTimeout(() => setIsSubmitted(false), 5000);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-red-50">
      {/* Hero Section */}
      <AnimatedSection className="text-center py-16 bg-gradient-to-r from-[#A41E22] to-[#8C1A1F] text-white">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 anim-fadeInUp">
            Get in Touch
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90 max-w-3xl mx-auto">
            We're here to help you with all your banking needs. Reach out to us
            anytime.
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-lg">
            <div className="flex items-center space-x-2">
              <PhoneIcon className="h-6 w-6" />
              <span>24/7 Support</span>
            </div>
            <div className="flex items-center space-x-2">
              <ShieldCheckIcon className="h-6 w-6" />
              <span>Secure Communication</span>
            </div>
            <div className="flex items-center space-x-2">
              <ChatBubbleBottomCenterTextIcon className="h-6 w-6" />
              <span>Multiple Channels</span>
            </div>
          </div>
        </div>
      </AnimatedSection>

      <div className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <AnimatedSection>
              <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 hover-lift">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-[#A41E22] mb-4">
                    Send Us a Message
                  </h2>
                  <p className="text-gray-600">
                    Fill out the form below and we'll get back to you within 24
                    hours
                  </p>
                </div>

                {isSubmitted && (
                  <div className="mb-6 p-6 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl anim-fadeIn shadow-lg">
                    <div className="flex items-center space-x-3">
                      <svg
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <div>
                        <h3 className="font-semibold">
                          Message Sent Successfully!
                        </h3>
                        <p className="text-sm opacity-90">
                          We'll get back to you within 24 hours.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-semibold text-gray-700 mb-2"
                      >
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        id="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full p-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#A41E22]/20 focus:border-[#A41E22] outline-none text-gray-800 placeholder-gray-500 transition-all duration-300"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-semibold text-gray-700 mb-2"
                      >
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        id="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full p-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#A41E22]/20 focus:border-[#A41E22] outline-none text-gray-800 placeholder-gray-500 transition-all duration-300"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label
                        htmlFor="phone"
                        className="block text-sm font-semibold text-gray-700 mb-2"
                      >
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        id="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full p-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#A41E22]/20 focus:border-[#A41E22] outline-none text-gray-800 placeholder-gray-500 transition-all duration-300"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="category"
                        className="block text-sm font-semibold text-gray-700 mb-2"
                      >
                        Category *
                      </label>
                      <select
                        name="category"
                        id="category"
                        value={formData.category}
                        onChange={handleChange}
                        required
                        className="w-full p-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#A41E22]/20 focus:border-[#A41E22] outline-none text-gray-800 transition-all duration-300"
                      >
                        {contactCategories.map((cat) => (
                          <option key={cat.value} value={cat.value}>
                            {cat.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="subject"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      Subject *
                    </label>
                    <input
                      type="text"
                      name="subject"
                      id="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full p-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#A41E22]/20 focus:border-[#A41E22] outline-none text-gray-800 placeholder-gray-500 transition-all duration-300"
                      placeholder="Brief description of your inquiry"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="message"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      Message *
                    </label>
                    <textarea
                      name="message"
                      id="message"
                      rows={6}
                      value={formData.message}
                      onChange={handleChange}
                      required
                      className="w-full p-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#A41E22]/20 focus:border-[#A41E22] outline-none text-gray-800 placeholder-gray-500 transition-all duration-300 resize-none"
                      placeholder="Please provide details about your inquiry..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-[#A41E22] to-[#8C1A1F] hover:from-[#8C1A1F] hover:to-[#751016] text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-3"
                  >
                    {isSubmitting ? (
                      <>
                        <svg
                          className="animate-spin h-6 w-6"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        <span>Sending Message...</span>
                      </>
                    ) : (
                      <>
                        <ChatBubbleBottomCenterTextIcon className="h-6 w-6" />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </AnimatedSection>
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            <div
              className="bg-white p-8 rounded-xl shadow-2xl anim-fadeInUp transition-all duration-300 hover:shadow-xl hover:scale-[1.02]"
              style={{ animationDelay: "0.3s" }}
            >
              <h3 className="text-xl font-semibold mb-4 text-[#A41E22] flex items-center">
                {" "}
                {/* Zenith Red */}
                <PhoneIcon className="h-6 w-6 mr-3 text-[#A41E22]" />{" "}
                {/* Zenith Red */}
                Call Us
              </h3>
              <p className="text-gray-700">
                Customer Support:{" "}
                <a
                  href="tel:+1800NOVABNK"
                  className="text-[#A41E22] hover:underline hover:text-[#8C1A1F] transition-colors"
                >
                  +1 (800) NOVA-BNK
                </a>
              </p>{" "}
              {/* Zenith Red */}
              <p className="text-gray-700">
                General Inquiries:{" "}
                <a
                  href="tel:+18001234567"
                  className="text-[#A41E22] hover:underline hover:text-[#8C1A1F] transition-colors"
                >
                  +1 (800) 123-4567
                </a>
              </p>{" "}
              {/* Zenith Red */}
              <p className="text-sm text-gray-500 mt-2">
                Available 24/7 for your convenience.
              </p>
            </div>
            <div
              className="bg-white p-8 rounded-xl shadow-2xl anim-fadeInUp transition-all duration-300 hover:shadow-xl hover:scale-[1.02]"
              style={{ animationDelay: "0.4s" }}
            >
              <h3 className="text-xl font-semibold mb-4 text-[#A41E22] flex items-center">
                {" "}
                {/* Zenith Red */}
                <InformationCircleIcon className="h-6 w-6 mr-3 text-[#A41E22]" />{" "}
                {/* Zenith Red */}
                Visit Us (HQ)
              </h3>
              <p className="text-gray-700">
                NovaBank Towers, 123 Future Drive, Tech City, TX 75001
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Please schedule an appointment for in-person visits.
              </p>
            </div>
            <div
              className="bg-white p-8 rounded-xl shadow-2xl anim-fadeInUp transition-all duration-300 hover:shadow-xl hover:scale-[1.02]"
              style={{ animationDelay: "0.5s" }}
            >
              <h3 className="text-xl font-semibold mb-4 text-[#A41E22]">
                Operating Hours
              </h3>{" "}
              {/* Zenith Red */}
              <p className="text-gray-700">Digital Banking: 24/7</p>
              <p className="text-gray-700">Customer Support (Phone): 24/7</p>
              <p className="text-gray-700">
                Branch Hours (By Appointment): Mon - Fri, 9 AM - 5 PM
              </p>
            </div>
          </div>
        </div>

        {/* Contact Information Sidebar */}
        <div className="space-y-8">
          {/* Quick Contact */}
          <AnimatedSection>
            <div className="bg-gradient-to-br from-[#A41E22] to-[#8C1A1F] text-white p-8 rounded-2xl shadow-2xl hover-lift">
              <h3 className="text-2xl font-bold mb-6 flex items-center">
                <PhoneIcon className="h-8 w-8 mr-3" />
                Quick Contact
              </h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <PhoneIcon className="h-5 w-5 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">24/7 Customer Support</p>
                    <a
                      href="tel:+1800NOVABANK"
                      className="text-red-100 hover:text-white transition-colors"
                    >
                      +1 (800) NOVA-BANK
                    </a>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <ChatBubbleBottomCenterTextIcon className="h-5 w-5 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Live Chat</p>
                    <p className="text-red-100">Available 24/7 in your app</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <GlobeAltIcon className="h-5 w-5 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Online Banking</p>
                    <p className="text-red-100">Secure access anytime</p>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedSection>

          {/* Branch Information */}
          <AnimatedSection>
            <div className="bg-white p-8 rounded-2xl shadow-xl hover-lift border border-gray-100">
              <h3 className="text-xl font-bold mb-6 text-[#A41E22] flex items-center">
                <BuildingLibraryIcon className="h-6 w-6 mr-3" />
                Visit Our Headquarters
              </h3>
              <div className="space-y-4 text-gray-700">
                <div>
                  <p className="font-semibold text-gray-900">NovaBank Towers</p>
                  <p>123 Financial District</p>
                  <p>New York, NY 10004</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Business Hours</p>
                  <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                  <p>Saturday: 10:00 AM - 4:00 PM</p>
                  <p>Sunday: Closed</p>
                </div>
                <div className="pt-4">
                  <button className="w-full bg-gray-100 hover:bg-gray-200 text-[#A41E22] font-semibold py-3 px-4 rounded-lg transition-colors">
                    Schedule Appointment
                  </button>
                </div>
              </div>
            </div>
          </AnimatedSection>

          {/* Emergency Support */}
          <AnimatedSection>
            <div className="bg-gradient-to-br from-red-600 to-red-700 text-white p-8 rounded-2xl shadow-xl hover-lift">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <ShieldCheckIcon className="h-6 w-6 mr-3" />
                Emergency Support
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="font-semibold">Lost/Stolen Cards</p>
                  <a
                    href="tel:+18002347890"
                    className="text-red-100 hover:text-white"
                  >
                    +1 (800) 234-7890
                  </a>
                </div>
                <div>
                  <p className="font-semibold">Fraud Reporting</p>
                  <a
                    href="tel:+18009876543"
                    className="text-red-100 hover:text-white"
                  >
                    +1 (800) 987-6543
                  </a>
                </div>
                <p className="text-sm text-red-100 mt-4">
                  Available 24/7 for your security
                </p>
              </div>
            </div>
          </AnimatedSection>
        </div>

        {/* Additional Contact Methods */}
        <div className="mt-16">
          <AnimatedSection>
            <h2 className="text-3xl font-bold text-center mb-12 text-[#A41E22]">
              More Ways to Connect
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-8 bg-white rounded-2xl shadow-lg hover-lift">
                <div className="w-16 h-16 bg-gradient-to-br from-[#A41E22] to-[#8C1A1F] rounded-full flex items-center justify-center mx-auto mb-6">
                  <ChatBubbleBottomCenterTextIcon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-900">
                  Live Chat
                </h3>
                <p className="text-gray-600 mb-6">
                  Get instant help with our AI-powered chat support, available
                  24/7.
                </p>
                <button className="bg-[#A41E22] hover:bg-[#8C1A1F] text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                  Start Chat
                </button>
              </div>

              <div className="text-center p-8 bg-white rounded-2xl shadow-lg hover-lift">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <GlobeAltIcon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-900">
                  Social Media
                </h3>
                <p className="text-gray-600 mb-6">
                  Follow us for updates, tips, and connect with our community.
                </p>
                <div className="flex justify-center space-x-4">
                  <button className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-lg transition-colors">
                    <span className="sr-only">Facebook</span>
                    <svg
                      className="h-5 w-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </button>
                  <button className="bg-blue-400 hover:bg-blue-500 text-white p-3 rounded-lg transition-colors">
                    <span className="sr-only">Twitter</span>
                    <svg
                      className="h-5 w-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="text-center p-8 bg-white rounded-2xl shadow-lg hover-lift">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <InformationCircleIcon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-900">
                  Help Center
                </h3>
                <p className="text-gray-600 mb-6">
                  Browse our comprehensive FAQ and support articles.
                </p>
                <button className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                  Visit Help Center
                </button>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
