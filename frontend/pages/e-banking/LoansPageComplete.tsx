import React, { useState } from "react";
import { AnimatedSection } from "../../components/AnimatedSection";
import {
  BanknotesIcon,
  BuildingLibraryIcon,
  CreditCardIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  SparklesIcon,
} from "../../constants";

interface LoanType {
  id: string;
  name: string;
  type: "personal" | "home" | "auto" | "business";
  minAmount: number;
  maxAmount: number;
  interestRate: string;
  term: string;
  features: string[];
  requirements: string[];
  color: string;
  icon: React.ComponentType<any>;
}

const LOAN_PRODUCTS: LoanType[] = [
  {
    id: "personal-loan",
    name: "NovaBank Personal Loan",
    type: "personal",
    minAmount: 1000,
    maxAmount: 50000,
    interestRate: "6.99% - 24.99%",
    term: "2-7 years",
    features: [
      "No collateral required",
      "Fixed interest rates",
      "Flexible repayment terms",
      "Quick approval process",
      "No prepayment penalties",
      "Direct deposit to your account",
    ],
    requirements: [
      "Minimum credit score of 650",
      "Steady income verification",
      "Minimum annual income of $25,000",
      "Valid government-issued ID",
      "Bank account with direct deposit",
    ],
    color: "from-blue-500 to-blue-700",
    icon: BanknotesIcon,
  },
  {
    id: "home-mortgage",
    name: "NovaBank Home Mortgage",
    type: "home",
    minAmount: 50000,
    maxAmount: 2000000,
    interestRate: "3.25% - 7.50%",
    term: "15-30 years",
    features: [
      "Competitive interest rates",
      "First-time buyer programs",
      "Down payment as low as 3%",
      "Pre-approval available",
      "Local mortgage specialists",
      "Online application process",
    ],
    requirements: [
      "Minimum credit score of 620",
      "Down payment (3-20%)",
      "Proof of income (2 years)",
      "Debt-to-income ratio below 43%",
      "Property appraisal",
      "Homeowners insurance",
    ],
    color: "from-green-500 to-green-700",
    icon: BuildingLibraryIcon,
  },
  {
    id: "auto-loan",
    name: "NovaBank Auto Loan",
    type: "auto",
    minAmount: 5000,
    maxAmount: 150000,
    interestRate: "4.99% - 18.99%",
    term: "2-8 years",
    features: [
      "New and used vehicle financing",
      "Competitive rates",
      "Quick pre-approval",
      "Refinancing options",
      "Direct dealer payments",
      "Gap insurance available",
    ],
    requirements: [
      "Minimum credit score of 600",
      "Proof of income",
      "Vehicle information",
      "Down payment (varies)",
      "Auto insurance",
      "Valid driver's license",
    ],
    color: "from-red-500 to-red-700",
    icon: CreditCardIcon,
  },
  {
    id: "business-loan",
    name: "NovaBank Business Loan",
    type: "business",
    minAmount: 10000,
    maxAmount: 500000,
    interestRate: "5.99% - 29.99%",
    term: "1-10 years",
    features: [
      "Flexible terms",
      "Working capital solutions",
      "Equipment financing",
      "Business line of credit",
      "SBA loan programs",
      "Dedicated business banker",
    ],
    requirements: [
      "Business in operation 2+ years",
      "Minimum annual revenue $100,000",
      "Personal guarantee",
      "Business financial statements",
      "Business plan (if required)",
      "Collateral may be required",
    ],
    color: "from-purple-500 to-purple-700",
    icon: ChartBarIcon,
  },
];

const LoansPage: React.FC = () => {
  const [selectedLoan, setSelectedLoan] = useState<LoanType | null>(null);
  const [applicationStep, setApplicationStep] = useState(0);
  const [calculatorValues, setCalculatorValues] = useState({
    amount: 25000,
    term: 5,
    rate: 8.99,
  });
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
    loanPurpose: "",
    loanAmount: "",
    ssn: "",
  });

  const calculateMonthlyPayment = () => {
    const principal = calculatorValues.amount;
    const monthlyRate = calculatorValues.rate / 100 / 12;
    const months = calculatorValues.term * 12;

    if (monthlyRate === 0) return principal / months;

    const monthlyPayment =
      (principal * (monthlyRate * Math.pow(1 + monthlyRate, months))) /
      (Math.pow(1 + monthlyRate, months) - 1);
    return monthlyPayment;
  };

  const handleInputChange = (field: string, value: string) => {
    setApplicationData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const LoanProductCard: React.FC<{ loan: LoanType }> = ({ loan }) => {
    const Icon = loan.icon;

    return (
      <AnimatedSection>
        <div className="bg-white rounded-2xl shadow-xl hover-lift transition-all duration-300 overflow-hidden">
          <div className={`h-32 bg-gradient-to-br ${loan.color} relative`}>
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative p-6 text-white">
              <div className="flex items-center justify-between">
                <Icon className="h-8 w-8" />
                <div className="text-right">
                  <p className="text-sm text-white/80">
                    {loan.type.replace("-", " ").toUpperCase()}
                  </p>
                  <p className="text-lg font-bold">{loan.interestRate}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {loan.name}
            </h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-gray-600 text-sm">Loan Amount</p>
                <p className="font-semibold">
                  ${loan.minAmount.toLocaleString()} - $
                  {loan.maxAmount.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Term</p>
                <p className="font-semibold">{loan.term}</p>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="font-semibold text-gray-900 mb-2">Key Features</h4>
              <ul className="space-y-1">
                {loan.features.slice(0, 3).map((feature, index) => (
                  <li
                    key={index}
                    className="flex items-center text-sm text-gray-600"
                  >
                    <div className="w-2 h-2 bg-[#A41E22] rounded-full mr-2"></div>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => setSelectedLoan(loan)}
              className="w-full bg-[#A41E22] hover:bg-[#8C1A1F] text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300"
            >
              Apply Now
            </button>
          </div>
        </div>
      </AnimatedSection>
    );
  };

  const LoanCalculator: React.FC = () => {
    const monthlyPayment = calculateMonthlyPayment();
    const totalPaid = monthlyPayment * calculatorValues.term * 12;
    const totalInterest = totalPaid - calculatorValues.amount;

    return (
      <AnimatedSection>
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            Loan Calculator
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loan Amount: ${calculatorValues.amount.toLocaleString()}
                </label>
                <input
                  type="range"
                  min="1000"
                  max="500000"
                  step="1000"
                  value={calculatorValues.amount}
                  onChange={(e) =>
                    setCalculatorValues((prev) => ({
                      ...prev,
                      amount: parseInt(e.target.value),
                    }))
                  }
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                  <span>$1,000</span>
                  <span>$500,000</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loan Term: {calculatorValues.term} years
                </label>
                <input
                  type="range"
                  min="1"
                  max="30"
                  step="1"
                  value={calculatorValues.term}
                  onChange={(e) =>
                    setCalculatorValues((prev) => ({
                      ...prev,
                      term: parseInt(e.target.value),
                    }))
                  }
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                  <span>1 year</span>
                  <span>30 years</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Interest Rate: {calculatorValues.rate}%
                </label>
                <input
                  type="range"
                  min="3"
                  max="30"
                  step="0.1"
                  value={calculatorValues.rate}
                  onChange={(e) =>
                    setCalculatorValues((prev) => ({
                      ...prev,
                      rate: parseFloat(e.target.value),
                    }))
                  }
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                  <span>3.0%</span>
                  <span>30.0%</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#A41E22] to-[#8C1A1F] rounded-xl p-6 text-white">
              <h3 className="text-xl font-bold mb-4">Your Loan Summary</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Monthly Payment:</span>
                  <span className="text-2xl font-bold">
                    ${monthlyPayment.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Total Interest:</span>
                  <span className="font-semibold">
                    ${totalInterest.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Total Amount:</span>
                  <span className="font-semibold">${totalPaid.toFixed(2)}</span>
                </div>
              </div>
              <button className="w-full mt-6 bg-white text-[#A41E22] font-semibold py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors">
                Get Pre-Approved
              </button>
            </div>
          </div>
        </div>
      </AnimatedSection>
    );
  };

  if (selectedLoan) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <AnimatedSection>
            <div className="bg-white rounded-2xl shadow-2xl p-8">
              <div className="mb-8">
                <button
                  onClick={() => setSelectedLoan(null)}
                  className="text-[#A41E22] hover:text-[#8C1A1F] font-medium mb-4"
                >
                  ← Back to Loan Products
                </button>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Apply for {selectedLoan.name}
                </h2>
                <p className="text-gray-600">
                  Complete your loan application in just a few minutes
                </p>
              </div>

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
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
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
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
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
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A41E22] focus:border-[#A41E22] outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Loan Amount
                    </label>
                    <input
                      type="number"
                      value={applicationData.loanAmount}
                      onChange={(e) =>
                        handleInputChange("loanAmount", e.target.value)
                      }
                      min={selectedLoan.minAmount}
                      max={selectedLoan.maxAmount}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A41E22] focus:border-[#A41E22] outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Loan Purpose
                  </label>
                  <select
                    value={applicationData.loanPurpose}
                    onChange={(e) =>
                      handleInputChange("loanPurpose", e.target.value)
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A41E22] focus:border-[#A41E22] outline-none"
                    required
                  >
                    <option value="">Select loan purpose</option>
                    <option value="debt-consolidation">
                      Debt Consolidation
                    </option>
                    <option value="home-improvement">Home Improvement</option>
                    <option value="vehicle-purchase">Vehicle Purchase</option>
                    <option value="education">Education</option>
                    <option value="medical">Medical Expenses</option>
                    <option value="business">Business</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">
                    Estimated Loan Terms
                  </h3>
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-blue-700">Interest Rate:</p>
                      <p className="font-semibold">
                        {selectedLoan.interestRate}
                      </p>
                    </div>
                    <div>
                      <p className="text-blue-700">Term:</p>
                      <p className="font-semibold">{selectedLoan.term}</p>
                    </div>
                    <div>
                      <p className="text-blue-700">Monthly Payment:</p>
                      <p className="font-semibold">
                        $
                        {applicationData.loanAmount
                          ? (
                              (parseInt(applicationData.loanAmount) * 0.08) /
                              12
                            ).toFixed(2)
                          : "---"}
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  onClick={(e) => {
                    e.preventDefault();
                    alert(
                      "Loan application submitted successfully! You will receive a decision within 24 hours."
                    );
                    setSelectedLoan(null);
                  }}
                  className="w-full bg-[#A41E22] hover:bg-[#8C1A1F] text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300"
                >
                  Submit Application
                </button>
              </form>
            </div>
          </AnimatedSection>
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
              <span className="text-[#A41E22]">Loan Solutions</span> for Every
              Need
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Whether you're buying a home, starting a business, or
              consolidating debt, our competitive rates and flexible terms help
              you achieve your financial goals.
            </p>
          </div>
        </AnimatedSection>

        {/* Loan Calculator */}
        <LoanCalculator />

        {/* Loan Products */}
        <div className="mt-16">
          <AnimatedSection>
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Our Loan Products
              </h2>
              <p className="text-xl text-gray-600">
                Find the perfect loan for your financial situation
              </p>
            </div>
          </AnimatedSection>

          <div className="grid lg:grid-cols-2 gap-8 mb-16">
            {LOAN_PRODUCTS.map((loan) => (
              <LoanProductCard key={loan.id} loan={loan} />
            ))}
          </div>
        </div>

        {/* Why Choose NovaBank */}
        <AnimatedSection>
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-16">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
              Why Choose NovaBank for Your Loan?
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <SparklesIcon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Fast Approval
                </h3>
                <p className="text-gray-600 text-sm">
                  Get approved in as little as 24 hours with our streamlined
                  application process
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BanknotesIcon className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Competitive Rates
                </h3>
                <p className="text-gray-600 text-sm">
                  Enjoy some of the lowest interest rates in the market with
                  flexible terms
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShieldCheckIcon className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Secure & Trusted
                </h3>
                <p className="text-gray-600 text-sm">
                  Your personal information is protected with bank-grade
                  security
                </p>
              </div>
            </div>
          </div>
        </AnimatedSection>

        {/* CTA Section */}
        <AnimatedSection>
          <div className="bg-gradient-to-br from-[#A41E22] to-[#8C1A1F] rounded-2xl shadow-2xl p-8 text-white text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-xl text-white/90 mb-6">
              Take the first step towards your financial goals with NovaBank's
              competitive loan solutions.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <ShieldCheckIcon className="h-5 w-5" />
                <span>No Hidden Fees</span>
              </div>
              <div className="flex items-center space-x-2">
                <SparklesIcon className="h-5 w-5" />
                <span>Quick Pre-Approval</span>
              </div>
              <div className="flex items-center space-x-2">
                <BanknotesIcon className="h-5 w-5" />
                <span>Flexible Terms</span>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
};

export default LoansPage;
