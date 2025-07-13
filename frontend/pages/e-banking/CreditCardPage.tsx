import React, { useState } from "react";
import { AnimatedSection } from "../../components/AnimatedSection";
import {
  CreditCardIcon,
  ShieldCheckIcon,
  SparklesIcon,
  ChartBarIcon,
  BanknotesIcon,
} from "../../constants";

interface CreditCardType {
  id: string;
  name: string;
  type: "visa" | "mastercard" | "premium";
  annualFee: number;
  cashbackRate: string;
  rewardsProgram: string;
  creditLimit: string;
  apr: string;
  features: string[];
  color: string;
  image: string;
}

const CREDIT_CARDS: CreditCardType[] = [
  {
    id: "nova-rewards",
    name: "NovaBank Rewards Card",
    type: "visa",
    annualFee: 0,
    cashbackRate: "1.5%",
    rewardsProgram: "NovaRewards",
    creditLimit: "Up to $25,000",
    apr: "18.9% - 28.9%",
    features: [
      "1.5% cashback on all purchases",
      "No annual fee",
      "0% intro APR for 12 months",
      "Mobile banking & alerts",
      "Fraud protection",
      "Credit score monitoring",
    ],
    color: "from-blue-500 to-blue-700",
    image: "/images/credit-card-feature.jpg",
  },
  {
    id: "nova-premium",
    name: "NovaBank Premium MasterCard",
    type: "mastercard",
    annualFee: 95,
    cashbackRate: "2%",
    rewardsProgram: "Nova Premium",
    creditLimit: "Up to $50,000",
    apr: "16.9% - 26.9%",
    features: [
      "2% cashback on groceries & gas",
      "1% on all other purchases",
      "Travel insurance coverage",
      "Purchase protection",
      "Concierge services",
      "Airport lounge access",
    ],
    color: "from-purple-500 to-purple-700",
    image: "/images/banking-security.jpg",
  },
  {
    id: "nova-platinum",
    name: "NovaBank Platinum Elite",
    type: "premium",
    annualFee: 295,
    cashbackRate: "3%",
    rewardsProgram: "Nova Elite",
    creditLimit: "Up to $100,000",
    apr: "14.9% - 24.9%",
    features: [
      "3% cashback on dining & travel",
      "2% on groceries & gas",
      "1% on all other purchases",
      "Premium travel insurance",
      "24/7 concierge service",
      "Global airport lounge access",
      "Hotel upgrades & benefits",
    ],
    color: "from-[#A41E22] to-[#8C1A1F]",
    image: "/images/happy-banking-customer.jpg",
  },
];

const CreditCardPage: React.FC = () => {
  const [selectedCard, setSelectedCard] = useState<CreditCardType | null>(null);
  const [applicationStep, setApplicationStep] = useState(0);
  const [applicationData, setApplicationData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    annualIncome: "",
    employment: "",
    ssn: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setApplicationData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const CreditCardDisplay: React.FC<{
    card: CreditCardType;
    onSelect: () => void;
  }> = ({ card, onSelect }) => (
    <AnimatedSection>
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden hover-lift transition-all duration-300">
        <div className={`h-48 bg-gradient-to-br ${card.color} relative`}>
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative p-6 text-white">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold mb-1">{card.name}</h3>
                <p className="text-white/80 capitalize">{card.type} Card</p>
              </div>
              <CreditCardIcon className="h-8 w-8" />
            </div>
            <div className="absolute bottom-6 left-6">
              <div className="text-2xl font-mono">•••• •••• •••• 1234</div>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-gray-600 text-sm">Cashback Rate</p>
              <p className="font-bold text-lg text-[#A41E22]">
                {card.cashbackRate}
              </p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Annual Fee</p>
              <p className="font-bold text-lg">${card.annualFee}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Credit Limit</p>
              <p className="font-bold text-lg">{card.creditLimit}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">APR</p>
              <p className="font-bold text-lg">{card.apr}</p>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 mb-3">Key Features</h4>
            <ul className="space-y-2">
              {card.features.map((feature, index) => (
                <li
                  key={index}
                  className="flex items-center text-sm text-gray-600"
                >
                  <div className="w-2 h-2 bg-[#A41E22] rounded-full mr-3"></div>
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          <button
            onClick={onSelect}
            className="w-full bg-[#A41E22] hover:bg-[#8C1A1F] text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 hover:shadow-lg"
          >
            Apply Now
          </button>
        </div>
      </div>
    </AnimatedSection>
  );

  const ApplicationForm: React.FC = () => (
    <AnimatedSection>
      <div className="bg-white rounded-2xl shadow-2xl p-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Credit Card Application
          </h2>
          <p className="text-gray-600">Apply for your {selectedCard?.name}</p>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between text-sm text-gray-500 mb-2">
              <span>Personal Information</span>
              <span>Review & Submit</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              {/* Dynamic progress bar - inline style needed for dynamic width */}
              <div
                className="bg-[#A41E22] h-2 rounded-full transition-all duration-300"
                style={{ width: `${(applicationStep + 1) * 50}%` }}
              ></div>
            </div>
          </div>
        </div>

        {applicationStep === 0 ? (
          <form className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  value={applicationData.firstName}
                  onChange={(e) =>
                    handleInputChange("firstName", e.target.value)
                  }
                  placeholder="Enter your first name"
                  title="First Name"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A41E22] focus:border-[#A41E22] outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  value={applicationData.lastName}
                  onChange={(e) =>
                    handleInputChange("lastName", e.target.value)
                  }
                  placeholder="Enter your last name"
                  title="Last Name"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A41E22] focus:border-[#A41E22] outline-none"
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={applicationData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="Enter your email address"
                  title="Email Address"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A41E22] focus:border-[#A41E22] outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={applicationData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="Enter your phone number"
                  title="Phone Number"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A41E22] focus:border-[#A41E22] outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <input
                type="text"
                value={applicationData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                placeholder="Enter your street address"
                title="Street Address"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A41E22] focus:border-[#A41E22] outline-none"
                required
              />
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <input
                  type="text"
                  value={applicationData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  placeholder="Enter your city"
                  title="City"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A41E22] focus:border-[#A41E22] outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State
                </label>
                <input
                  type="text"
                  value={applicationData.state}
                  onChange={(e) => handleInputChange("state", e.target.value)}
                  placeholder="Enter your state"
                  title="State"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A41E22] focus:border-[#A41E22] outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ZIP Code
                </label>
                <input
                  type="text"
                  value={applicationData.zipCode}
                  onChange={(e) => handleInputChange("zipCode", e.target.value)}
                  placeholder="Enter your ZIP code"
                  title="ZIP Code"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A41E22] focus:border-[#A41E22] outline-none"
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Annual Income
                </label>
                <input
                  type="number"
                  value={applicationData.annualIncome}
                  onChange={(e) =>
                    handleInputChange("annualIncome", e.target.value)
                  }
                  placeholder="Enter your annual income"
                  title="Annual Income"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A41E22] focus:border-[#A41E22] outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Employment Status
                </label>
                <select
                  value={applicationData.employment}
                  onChange={(e) =>
                    handleInputChange("employment", e.target.value)
                  }
                  title="Employment Status"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A41E22] focus:border-[#A41E22] outline-none"
                  required
                >
                  <option value="">Select Employment Status</option>
                  <option value="employed">Employed Full-time</option>
                  <option value="part-time">Employed Part-time</option>
                  <option value="self-employed">Self-employed</option>
                  <option value="student">Student</option>
                  <option value="retired">Retired</option>
                  <option value="unemployed">Unemployed</option>
                </select>
              </div>
            </div>

            <div className="flex justify-between pt-6">
              <button
                type="button"
                onClick={() => setSelectedCard(null)}
                className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors"
              >
                Back to Cards
              </button>
              <button
                type="button"
                onClick={() => setApplicationStep(1)}
                className="bg-[#A41E22] hover:bg-[#8C1A1F] text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300"
              >
                Continue
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Application Summary
              </h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p>
                    <span className="font-medium">Name:</span>{" "}
                    {applicationData.firstName} {applicationData.lastName}
                  </p>
                  <p>
                    <span className="font-medium">Email:</span>{" "}
                    {applicationData.email}
                  </p>
                  <p>
                    <span className="font-medium">Phone:</span>{" "}
                    {applicationData.phone}
                  </p>
                </div>
                <div>
                  <p>
                    <span className="font-medium">Income:</span> $
                    {parseInt(
                      applicationData.annualIncome || "0"
                    ).toLocaleString()}
                  </p>
                  <p>
                    <span className="font-medium">Employment:</span>{" "}
                    {applicationData.employment}
                  </p>
                  <p>
                    <span className="font-medium">Selected Card:</span>{" "}
                    {selectedCard?.name}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 p-6 rounded-lg">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <ShieldCheckIcon className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-green-800">
                  Pre-Approval Check
                </h3>
              </div>
              <p className="text-green-700 text-sm mb-4">
                Based on your information, you're likely to be approved for this
                card with these estimated terms:
              </p>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p>
                    <span className="font-medium">Estimated Credit Limit:</span>{" "}
                    $8,000 - $15,000
                  </p>
                  <p>
                    <span className="font-medium">APR:</span>{" "}
                    {selectedCard?.apr}
                  </p>
                </div>
                <div>
                  <p>
                    <span className="font-medium">Approval Probability:</span>{" "}
                    Excellent (90%+)
                  </p>
                  <p>
                    <span className="font-medium">Processing Time:</span>{" "}
                    Instant Decision
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-6">
              <button
                type="button"
                onClick={() => setApplicationStep(0)}
                className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors"
              >
                Back to Edit
              </button>
              <button
                type="button"
                onClick={() => {
                  // Handle application submission
                  alert(
                    "Application submitted successfully! You will receive a decision within 60 seconds."
                  );
                  setSelectedCard(null);
                  setApplicationStep(0);
                }}
                className="bg-[#A41E22] hover:bg-[#8C1A1F] text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300"
              >
                Submit Application
              </button>
            </div>
          </div>
        )}
      </div>
    </AnimatedSection>
  );

  if (selectedCard) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <ApplicationForm />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Hero Section */}
        <AnimatedSection>
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Choose Your Perfect{" "}
              <span className="text-[#A41E22]">Credit Card</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover credit cards designed for your lifestyle. From cashback
              rewards to premium travel benefits, find the card that matches
              your spending habits and financial goals.
            </p>
          </div>
        </AnimatedSection>

        {/* Benefits Section */}
        <AnimatedSection>
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-16">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
              Why Choose NovaBank Credit Cards?
            </h2>
            <div className="grid md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <SparklesIcon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Instant Approval
                </h3>
                <p className="text-gray-600 text-sm">
                  Get approved in 60 seconds with our AI-powered decision engine
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BanknotesIcon className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Competitive Rewards
                </h3>
                <p className="text-gray-600 text-sm">
                  Earn up to 3% cashback on every purchase with no caps or
                  limits
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShieldCheckIcon className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Advanced Security
                </h3>
                <p className="text-gray-600 text-sm">
                  Bank-grade security with real-time fraud monitoring and alerts
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ChartBarIcon className="h-8 w-8 text-[#A41E22]" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Smart Insights
                </h3>
                <p className="text-gray-600 text-sm">
                  AI-powered spending analysis and personalized financial tips
                </p>
              </div>
            </div>
          </div>
        </AnimatedSection>

        {/* Credit Cards Grid */}
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {CREDIT_CARDS.map((card) => (
            <CreditCardDisplay
              key={card.id}
              card={card}
              onSelect={() => setSelectedCard(card)}
            />
          ))}
        </div>

        {/* Additional Information */}
        <AnimatedSection>
          <div className="bg-gradient-to-br from-[#A41E22] to-[#8C1A1F] rounded-2xl shadow-2xl p-8 text-white text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Apply?</h2>
            <p className="text-xl text-white/90 mb-6">
              Join over 2.5 million satisfied customers who trust NovaBank for
              their credit needs.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <ShieldCheckIcon className="h-5 w-5" />
                <span>No Impact on Credit Score</span>
              </div>
              <div className="flex items-center space-x-2">
                <SparklesIcon className="h-5 w-5" />
                <span>Instant Decision</span>
              </div>
              <div className="flex items-center space-x-2">
                <BanknotesIcon className="h-5 w-5" />
                <span>No Hidden Fees</span>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
};

export default CreditCardPage;
