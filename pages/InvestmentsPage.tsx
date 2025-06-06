import React, { useState } from "react";
import { AnimatedSection } from "../components/AnimatedSection";
import {
  ChartBarIcon,
  BuildingLibraryIcon,
  SparklesIcon,
  ShieldCheckIcon,
  BanknotesIcon,
} from "../constants";

interface InvestmentProduct {
  id: string;
  name: string;
  type: "etf" | "mutual-fund" | "cd" | "savings" | "retirement";
  minInvestment: number;
  expectedReturn: string;
  riskLevel: "Low" | "Medium" | "High";
  features: string[];
  description: string;
  color: string;
  icon: React.ComponentType<any>;
}

const INVESTMENT_PRODUCTS: InvestmentProduct[] = [
  {
    id: "high-yield-savings",
    name: "High-Yield Savings Account",
    type: "savings",
    minInvestment: 100,
    expectedReturn: "4.25% APY",
    riskLevel: "Low",
    features: [
      "FDIC insured up to $250,000",
      "No monthly maintenance fees",
      "Online and mobile banking",
      "Unlimited transfers",
      "Competitive interest rate",
      "No minimum balance requirement",
    ],
    description:
      "Grow your money safely with our high-yield savings account offering competitive rates.",
    color: "from-green-500 to-green-700",
    icon: BanknotesIcon,
  },
  {
    id: "certificates-deposit",
    name: "Certificates of Deposit",
    type: "cd",
    minInvestment: 1000,
    expectedReturn: "4.75% - 5.25% APY",
    riskLevel: "Low",
    features: [
      "FDIC insured up to $250,000",
      "Fixed interest rates",
      "Terms from 6 months to 5 years",
      "Automatic renewal options",
      "Penalty-free withdrawals during grace period",
      "Competitive rates for all terms",
    ],
    description:
      "Lock in competitive rates with our flexible certificate of deposit options.",
    color: "from-blue-500 to-blue-700",
    icon: ShieldCheckIcon,
  },
  {
    id: "nova-growth-fund",
    name: "NovaBank Growth Fund",
    type: "mutual-fund",
    minInvestment: 500,
    expectedReturn: "8% - 12% annually",
    riskLevel: "Medium",
    features: [
      "Diversified portfolio management",
      "Professional fund managers",
      "Quarterly performance reports",
      "Low expense ratios",
      "Automatic reinvestment options",
      "Tax-efficient strategies",
    ],
    description:
      "A professionally managed diversified portfolio focused on long-term growth.",
    color: "from-purple-500 to-purple-700",
    icon: ChartBarIcon,
  },
  {
    id: "etf-portfolio",
    name: "Nova Smart ETF Portfolio",
    type: "etf",
    minInvestment: 100,
    expectedReturn: "6% - 10% annually",
    riskLevel: "Medium",
    features: [
      "AI-powered portfolio optimization",
      "Low-cost ETF investments",
      "Automatic rebalancing",
      "Tax-loss harvesting",
      "Real-time portfolio monitoring",
      "Personalized risk assessment",
    ],
    description:
      "AI-managed ETF portfolios designed to optimize returns while managing risk.",
    color: "from-[#A41E22] to-[#8C1A1F]",
    icon: SparklesIcon,
  },
  {
    id: "retirement-ira",
    name: "NovaBank IRA Plans",
    type: "retirement",
    minInvestment: 250,
    expectedReturn: "7% - 11% annually",
    riskLevel: "Medium",
    features: [
      "Traditional and Roth IRA options",
      "Tax advantages",
      "Wide range of investment choices",
      "Retirement planning tools",
      "Professional guidance",
      "No account fees",
    ],
    description:
      "Build your retirement savings with tax-advantaged IRA accounts and expert guidance.",
    color: "from-orange-500 to-orange-700",
    icon: BuildingLibraryIcon,
  },
];

const InvestmentsPage: React.FC = () => {
  const [selectedProduct, setSelectedProduct] =
    useState<InvestmentProduct | null>(null);
  const [investmentCalculator, setInvestmentCalculator] = useState({
    initialAmount: 10000,
    monthlyContribution: 500,
    years: 10,
    annualReturn: 8,
  });

  const calculateInvestmentGrowth = () => {
    const { initialAmount, monthlyContribution, years, annualReturn } =
      investmentCalculator;
    const monthlyRate = annualReturn / 100 / 12;
    const months = years * 12;

    // Future value of initial investment
    const futureValueInitial =
      initialAmount * Math.pow(1 + monthlyRate, months);

    // Future value of monthly contributions (annuity)
    const futureValueMonthly =
      monthlyContribution *
      ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);

    const totalValue = futureValueInitial + futureValueMonthly;
    const totalContributions = initialAmount + monthlyContribution * months;
    const totalGains = totalValue - totalContributions;

    return {
      totalValue,
      totalContributions,
      totalGains,
    };
  };

  const InvestmentProductCard: React.FC<{ product: InvestmentProduct }> = ({
    product,
  }) => {
    const Icon = product.icon;
    const riskColors = {
      Low: "text-green-600 bg-green-100",
      Medium: "text-yellow-600 bg-yellow-100",
      High: "text-red-600 bg-red-100",
    };

    return (
      <AnimatedSection>
        <div className="bg-white rounded-2xl shadow-xl hover-lift transition-all duration-300 overflow-hidden">
          <div className={`h-32 bg-gradient-to-br ${product.color} relative`}>
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">{product.name}</h3>
                  <p className="text-white/80 capitalize">
                    {product.type.replace("-", " ")}
                  </p>
                </div>
                <Icon className="h-8 w-8" />
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-gray-600 text-sm">Minimum Investment</p>
                <p className="font-bold text-lg">
                  ${product.minInvestment.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Expected Return</p>
                <p className="font-bold text-lg text-[#A41E22]">
                  {product.expectedReturn}
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Risk Level</p>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                    riskColors[product.riskLevel]
                  }`}
                >
                  {product.riskLevel}
                </span>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Product Type</p>
                <p className="font-bold text-lg capitalize">
                  {product.type.replace("-", " ")}
                </p>
              </div>
            </div>

            <p className="text-gray-700 mb-4">{product.description}</p>

            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-3">Key Features</h4>
              <ul className="space-y-2">
                {product.features.slice(0, 4).map((feature, index) => (
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

            <div className="flex space-x-3">
              <button
                onClick={() => setSelectedProduct(product)}
                className="flex-1 bg-[#A41E22] hover:bg-[#8C1A1F] text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300"
              >
                Get Started
              </button>
              <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-lg transition-all duration-300">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </AnimatedSection>
    );
  };

  const InvestmentCalculator: React.FC = () => {
    const results = calculateInvestmentGrowth();

    return (
      <AnimatedSection>
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            Investment Calculator
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Initial Investment
                </label>
                <input
                  type="range"
                  min="100"
                  max="100000"
                  step="100"
                  value={investmentCalculator.initialAmount}
                  onChange={(e) =>
                    setInvestmentCalculator((prev) => ({
                      ...prev,
                      initialAmount: Number(e.target.value),
                    }))
                  }
                  title="Initial Investment Amount"
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                  <span>$100</span>
                  <span className="font-semibold text-[#A41E22]">
                    ${investmentCalculator.initialAmount.toLocaleString()}
                  </span>
                  <span>$100,000</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monthly Contribution
                </label>
                <input
                  type="range"
                  min="0"
                  max="5000"
                  step="50"
                  value={investmentCalculator.monthlyContribution}
                  onChange={(e) =>
                    setInvestmentCalculator((prev) => ({
                      ...prev,
                      monthlyContribution: Number(e.target.value),
                    }))
                  }
                  title="Monthly Contribution"
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                  <span>$0</span>
                  <span className="font-semibold text-[#A41E22]">
                    ${investmentCalculator.monthlyContribution.toLocaleString()}
                    /mo
                  </span>
                  <span>$5,000</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Investment Period (Years)
                </label>
                <input
                  type="range"
                  min="1"
                  max="40"
                  step="1"
                  value={investmentCalculator.years}
                  onChange={(e) =>
                    setInvestmentCalculator((prev) => ({
                      ...prev,
                      years: Number(e.target.value),
                    }))
                  }
                  title="Investment Period (Years)"
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                  <span>1 year</span>
                  <span className="font-semibold text-[#A41E22]">
                    {investmentCalculator.years} years
                  </span>
                  <span>40 years</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expected Annual Return (%)
                </label>
                <input
                  type="range"
                  min="1"
                  max="15"
                  step="0.1"
                  value={investmentCalculator.annualReturn}
                  onChange={(e) =>
                    setInvestmentCalculator((prev) => ({
                      ...prev,
                      annualReturn: Number(e.target.value),
                    }))
                  }
                  title="Expected Annual Return (%)"
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                  <span>1%</span>
                  <span className="font-semibold text-[#A41E22]">
                    {investmentCalculator.annualReturn}%
                  </span>
                  <span>15%</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#A41E22] to-[#8C1A1F] rounded-xl p-6 text-white">
              <h3 className="text-2xl font-bold mb-6">Investment Projection</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-white/80 mb-1">Final Portfolio Value</p>
                  <p className="text-4xl font-bold mb-4">
                    $
                    {results.totalValue
                      .toFixed(0)
                      .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-white/80">Total Contributions</p>
                    <p className="font-bold text-lg">
                      $
                      {results.totalContributions
                        .toFixed(0)
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </p>
                  </div>
                  <div>
                    <p className="text-white/80">Investment Gains</p>
                    <p className="font-bold text-lg text-green-300">
                      $
                      {results.totalGains
                        .toFixed(0)
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-white/20">
                  <div className="text-center">
                    <p className="text-white/80 mb-2">Return on Investment</p>
                    <p className="text-2xl font-bold">
                      {(
                        (results.totalGains / results.totalContributions) *
                        100
                      ).toFixed(1)}
                      %
                    </p>
                  </div>
                </div>
              </div>

              <button className="w-full bg-white/20 hover:bg-white/30 text-white font-semibold py-3 px-6 rounded-lg mt-6 transition-all duration-300">
                Start Investing
              </button>
            </div>
          </div>
        </div>
      </AnimatedSection>
    );
  };

  if (selectedProduct) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <AnimatedSection>
            <div className="bg-white rounded-2xl shadow-2xl p-8">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Get Started with {selectedProduct.name}
                </h2>
                <p className="text-gray-600">
                  Begin your investment journey with this carefully selected
                  product
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Product Overview
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Minimum Investment:</span>
                      <span className="font-semibold">
                        ${selectedProduct.minInvestment.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Expected Return:</span>
                      <span className="font-semibold text-[#A41E22]">
                        {selectedProduct.expectedReturn}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Risk Level:</span>
                      <span className="font-semibold">
                        {selectedProduct.riskLevel}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    All Features
                  </h3>
                  <ul className="space-y-2">
                    {selectedProduct.features.map((feature, index) => (
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
              </div>

              <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg mb-8">
                <div className="flex items-start space-x-3">
                  <ShieldCheckIcon className="h-6 w-6 text-blue-600 mt-1" />
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-2">
                      Investment Protection
                    </h4>
                    <p className="text-blue-800 text-sm">
                      Your investments are protected by SIPC insurance up to
                      $500,000, and our bank products are FDIC insured up to
                      $250,000. We use advanced security measures to protect
                      your account.
                    </p>
                  </div>
                </div>
              </div>

              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Initial Investment Amount
                    </label>
                    <input
                      type="number"
                      min={selectedProduct.minInvestment}
                      placeholder={`Minimum $${selectedProduct.minInvestment.toLocaleString()}`}
                      title="Initial Investment Amount"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A41E22] focus:border-[#A41E22] outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Investment Goal
                    </label>
                    <select
                      title="Investment Goal"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A41E22] focus:border-[#A41E22] outline-none"
                    >
                      <option value="">Select Investment Goal</option>
                      <option value="retirement">Retirement</option>
                      <option value="education">Education</option>
                      <option value="emergency-fund">Emergency Fund</option>
                      <option value="wealth-building">Wealth Building</option>
                      <option value="short-term">Short-term Goals</option>
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Investment Timeline
                    </label>
                    <select
                      title="Investment Timeline"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A41E22] focus:border-[#A41E22] outline-none"
                    >
                      <option value="">Select Timeline</option>
                      <option value="1-3-years">1-3 years</option>
                      <option value="3-5-years">3-5 years</option>
                      <option value="5-10-years">5-10 years</option>
                      <option value="10-plus-years">10+ years</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Risk Tolerance
                    </label>
                    <select
                      title="Risk Tolerance"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A41E22] focus:border-[#A41E22] outline-none"
                    >
                      <option value="">Select Risk Tolerance</option>
                      <option value="conservative">Conservative</option>
                      <option value="moderate">Moderate</option>
                      <option value="aggressive">Aggressive</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-between pt-6">
                  <button
                    type="button"
                    onClick={() => setSelectedProduct(null)}
                    className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                  >
                    Back to Products
                  </button>
                  <button
                    type="submit"
                    className="bg-[#A41E22] hover:bg-[#8C1A1F] text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300"
                  >
                    Open Account
                  </button>
                </div>
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
          <div className="relative overflow-hidden rounded-2xl shadow-2xl mb-16">
            <div
              className="h-96 bg-cover bg-center relative"
              style={{
                backgroundImage: "url('/images/investment-feature.jpg')",
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#A41E22]/90 via-[#8C1A1F]/70 to-transparent"></div>
              <div className="relative z-10 h-full flex items-center p-12">
                <div className="max-w-4xl">
                  <h1 className="text-5xl font-bold text-white mb-6">
                    Grow Your Wealth with{" "}
                    <span className="text-red-200">Smart Investments</span>
                  </h1>
                  <p className="text-xl text-white/90 mb-8">
                    From high-yield savings to sophisticated portfolios,
                    discover investment solutions tailored to your financial
                    goals and risk tolerance.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg px-6 py-3">
                      <div className="text-white font-semibold">
                        Returns up to
                      </div>
                      <div className="text-2xl font-bold text-red-200">
                        12% annually
                      </div>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg px-6 py-3">
                      <div className="text-white font-semibold">
                        Minimum investment
                      </div>
                      <div className="text-2xl font-bold text-red-200">
                        $100
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </AnimatedSection>

        {/* Investment Calculator */}
        <InvestmentCalculator />

        {/* Investment Products */}
        <div className="mt-16">
          <AnimatedSection>
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Investment Products
            </h2>
          </AnimatedSection>

          <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-8 mb-16">
            {INVESTMENT_PRODUCTS.map((product) => (
              <InvestmentProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>

        {/* Why Invest with NovaBank */}
        <AnimatedSection>
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-16">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
              Why Invest with NovaBank?
            </h2>
            <div className="grid md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <SparklesIcon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  AI-Powered Insights
                </h3>
                <p className="text-gray-600 text-sm">
                  Advanced algorithms provide personalized investment
                  recommendations
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShieldCheckIcon className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Secure & Protected
                </h3>
                <p className="text-gray-600 text-sm">
                  SIPC and FDIC insurance protection for your investment
                  accounts
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ChartBarIcon className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Professional Management
                </h3>
                <p className="text-gray-600 text-sm">
                  Expert fund managers and financial advisors at your service
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BanknotesIcon className="h-8 w-8 text-[#A41E22]" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Low Fees</h3>
                <p className="text-gray-600 text-sm">
                  Competitive fee structure that doesn't eat into your returns
                </p>
              </div>
            </div>
          </div>
        </AnimatedSection>

        {/* CTA Section */}
        <AnimatedSection>
          <div className="bg-gradient-to-br from-[#A41E22] to-[#8C1A1F] rounded-2xl shadow-2xl p-8 text-white text-center">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Start Investing?
            </h2>
            <p className="text-xl text-white/90 mb-6">
              Open an investment account today and take the first step toward
              financial freedom.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm mb-6">
              <div className="flex items-center space-x-2">
                <ShieldCheckIcon className="h-5 w-5" />
                <span>SIPC Protected</span>
              </div>
              <div className="flex items-center space-x-2">
                <SparklesIcon className="h-5 w-5" />
                <span>AI-Powered</span>
              </div>
              <div className="flex items-center space-x-2">
                <BanknotesIcon className="h-5 w-5" />
                <span>Low Fees</span>
              </div>
            </div>
            <button className="bg-white text-[#A41E22] hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition-all duration-300">
              Get Started
            </button>
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
};

export default InvestmentsPage;
