
import BankMergerShowcase from '@/components/commercial/BankMergerShowcase';
import { Smartphone, ShieldCheck, Globe, Headphones } from 'lucide-react';
import { EBankingWidget } from '@/components/commercial/EBankingWidget';
import { ProductGrid } from '@/components/commercial/ProductGrid';
import { ROUTES } from '@/lib/constants';
import Image from 'next/image';

export default function Home() {
  return (
    <main>
      {/* Hero Section with E-Banking Widget */}
      <section className="relative overflow-hidden py-20 md:py-32">
        {/* Hero Background Image */}
        <Image
          src="/images/new/banking-hero.jpg"
          alt="Aurum Vault Banking"
          fill
          className="object-cover -z-20"
          priority
        />
        <div className="absolute inset-0 bg-white/90 -z-10" />

        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Hero Content */}
            <div className="space-y-8 animate-fade-in-up">
              <h1 className="text-4xl md:text-6xl font-bold text-charcoal leading-tight">
                Time-Tested Banking for Every Generation
              </h1>
              <p className="text-lg md:text-xl text-charcoal-light leading-relaxed">
                Since 1888, we&apos;ve helped families, businesses, and individuals build secure financial futures.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href={ROUTES.signup}
                  className="inline-flex items-center justify-center gap-2 h-14 px-8 text-lg font-semibold rounded-lg bg-vintage-green text-white hover:bg-vintage-green-dark transition-all shadow-vintage hover:shadow-vintage-lg hover:-translate-y-0.5"
                >
                  Open Your Account
                </a>
                <a
                  href="#services"
                  className="inline-flex items-center justify-center gap-2 h-14 px-8 text-lg font-semibold rounded-lg bg-transparent text-vintage-green border-2 border-vintage-green hover:bg-vintage-green hover:text-white transition-all"
                >
                  Explore Services
                </a>
              </div>
            </div>

            {/* E-Banking Widget */}
            <div className="flex items-center justify-center">
              <EBankingWidget className="w-full max-w-md" />
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Aurum Vault - Digital Features */}
      <section className="py-20 bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold font-playfair text-charcoal mb-4">
              Banking for the Modern Era
            </h2>
            <p className="text-lg text-charcoal-light max-w-2xl mx-auto">
              Experience the perfect blend of century-old security and cutting-edge digital convenience.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 text-center">
            {/* Feature 1 */}
            <div className="p-6 rounded-xl bg-off-white hover:bg-white hover:shadow-xl transition-all duration-300 group border border-transparent hover:border-vintage-green/10">
              <div className="w-16 h-16 mx-auto bg-vintage-green/5 rounded-full flex items-center justify-center mb-6 group-hover:bg-vintage-green group-hover:text-white transition-colors text-vintage-green">
                <Smartphone className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-charcoal mb-2">Mobile First</h3>
              <p className="text-sm text-charcoal-light">Manage your finances on the go with our award-winning app.</p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-xl bg-off-white hover:bg-white hover:shadow-xl transition-all duration-300 group border border-transparent hover:border-vintage-green/10">
              <div className="w-16 h-16 mx-auto bg-vintage-green/5 rounded-full flex items-center justify-center mb-6 group-hover:bg-vintage-green group-hover:text-white transition-colors text-vintage-green">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-charcoal mb-2">Secure & Insured</h3>
              <p className="text-sm text-charcoal-light">Bank-grade encryption and FDIC insurance up to $250k.</p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-xl bg-off-white hover:bg-white hover:shadow-xl transition-all duration-300 group border border-transparent hover:border-vintage-green/10">
              <div className="w-16 h-16 mx-auto bg-vintage-green/5 rounded-full flex items-center justify-center mb-6 group-hover:bg-vintage-green group-hover:text-white transition-colors text-vintage-green">
                <Globe className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-charcoal mb-2">Global Access</h3>
              <p className="text-sm text-charcoal-light">Fee-free ATMs worldwide and instant international transfers.</p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-xl bg-off-white hover:bg-white hover:shadow-xl transition-all duration-300 group border border-transparent hover:border-vintage-green/10">
              <div className="w-16 h-16 mx-auto bg-vintage-green/5 rounded-full flex items-center justify-center mb-6 group-hover:bg-vintage-green group-hover:text-white transition-colors text-vintage-green">
                <Headphones className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-charcoal mb-2">24/7 Support</h3>
              <p className="text-sm text-charcoal-light">Real human support whenever you need it, day or night.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Product Grid - Our Banking Solutions */}
      <ProductGrid />



      {/* Bank Merger Showcase */}
      <BankMergerShowcase />

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-vintage-green to-vintage-green-dark text-white">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Ready to Start Your Financial Journey?
          </h2>
          <p className="text-lg md:text-xl mb-8 text-warm-cream">
            Open an account in minutes and experience banking the way it should be.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={ROUTES.signup}
              className="inline-flex items-center justify-center gap-2 h-14 px-8 text-lg font-semibold rounded-lg bg-soft-gold text-charcoal hover:bg-soft-gold-dark transition-all shadow-vintage-lg hover:shadow-vintage-xl hover:-translate-y-0.5"
            >
              Open Account Now
            </a>
            <a
              href={ROUTES.about}
              className="inline-flex items-center justify-center gap-2 h-14 px-8 text-lg font-semibold rounded-lg bg-transparent text-white border-2 border-white hover:bg-white hover:text-vintage-green transition-all"
            >
              Learn More
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
