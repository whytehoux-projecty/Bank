import Link from 'next/link';
import { Shield, Phone, Mail, MapPin, Facebook, Instagram, Twitter, Linkedin } from 'lucide-react';
import { BANK_INFO, ROUTES } from '@/lib/constants';

const footerSections = [
    {
        heading: 'Personal Banking',
        links: [
            { name: 'Checking Accounts', href: ROUTES.personalBanking },
            { name: 'Savings Accounts', href: ROUTES.personalBanking },
            { name: 'Credit Cards', href: ROUTES.personalBanking },
            { name: 'Personal Loans', href: ROUTES.personalBanking },
            { name: 'Mortgages', href: ROUTES.personalBanking },
        ],
    },
    {
        heading: 'Business Banking',
        links: [
            { name: 'Business Checking', href: ROUTES.businessBanking },
            { name: 'Merchant Services', href: ROUTES.businessBanking },
            { name: 'Business Loans', href: ROUTES.businessBanking },
            { name: 'Payroll Services', href: ROUTES.businessBanking },
            { name: 'Treasury Management', href: ROUTES.businessBanking },
        ],
    },
    {
        heading: 'Heritage Vault',
        links: [
            { name: 'Sign In', href: ROUTES.vault },
            { name: 'Open Account', href: ROUTES.apply },
            { name: 'Mobile Banking', href: ROUTES.vault },
            { name: 'Wire Transfers', href: ROUTES.vault },
            { name: 'Account Statements', href: ROUTES.vault },
        ],
    },
    {
        heading: 'Company',
        links: [
            { name: 'About JP Heritage', href: ROUTES.about },
            { name: 'Leadership', href: `${ROUTES.about}#leadership` },
            { name: 'Careers', href: '/careers' },
            { name: 'Press & Media', href: '/press' },
            { name: 'Investor Relations', href: '/investors' },
        ],
    },
];

const legalLinks = [
    { name: 'Privacy Policy', href: ROUTES.privacy },
    { name: 'Terms of Use', href: ROUTES.terms },
    { name: 'Accessibility', href: '/accessibility' },
    { name: 'Cookie Preferences', href: '/cookies' },
    { name: 'Security Center', href: '/security' },
];

const socialLinks = [
    { icon: Facebook, label: 'Facebook', href: '#' },
    { icon: Instagram, label: 'Instagram', href: '#' },
    { icon: Twitter, label: 'X (Twitter)', href: '#' },
    { icon: Linkedin, label: 'LinkedIn', href: '#' },
];

export function Footer() {
    return (
        <footer className="bg-[#091C38] text-white">
            {/* Main footer content */}
            <div className="container mx-auto px-6 py-16 max-w-7xl">
                <div className="grid grid-cols-1 lg:grid-cols-6 gap-12">
                    {/* Brand column */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Logo */}
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#B8960C] flex items-center justify-center shadow-gold-glow flex-shrink-0">
                                <Shield className="w-5 h-5 text-white" strokeWidth={2} />
                            </div>
                            <div className="flex flex-col leading-none">
                                <span className="text-[10px] font-medium text-[#B8960C] tracking-[0.2em] uppercase">JP Heritage</span>
                                <span className="text-lg font-bold text-white tracking-wide font-playfair">BANK</span>
                            </div>
                        </div>

                        <p className="text-white/60 text-sm leading-relaxed max-w-xs">
                            Serving generations of families and businesses since {BANK_INFO.founded}. Your prosperity is our purpose.
                        </p>

                        {/* Contact info */}
                        <div className="space-y-3">
                            <a href={`tel:${BANK_INFO.phone}`} className="flex items-center gap-3 text-sm text-white/60 hover:text-[#D4AF7A] transition-colors group">
                                <Phone className="w-4 h-4 text-[#B8960C] flex-shrink-0" />
                                <span>{BANK_INFO.phone}</span>
                            </a>
                            <a href={`mailto:${BANK_INFO.email}`} className="flex items-center gap-3 text-sm text-white/60 hover:text-[#D4AF7A] transition-colors">
                                <Mail className="w-4 h-4 text-[#B8960C] flex-shrink-0" />
                                <span>{BANK_INFO.email}</span>
                            </a>
                            <div className="flex items-start gap-3 text-sm text-white/60">
                                <MapPin className="w-4 h-4 text-[#B8960C] flex-shrink-0 mt-0.5" />
                                <span>{BANK_INFO.address}</span>
                            </div>
                        </div>

                        {/* Social links */}
                        <div className="flex gap-3">
                            {socialLinks.map(({ icon: Icon, label, href }) => (
                                <a
                                    key={label}
                                    href={href}
                                    aria-label={label}
                                    className="w-9 h-9 rounded-none bg-white/10 hover:bg-[#B8960C] flex items-center justify-center transition-all duration-200 hover:-translate-y-0.5"
                                >
                                    <Icon className="w-4 h-4" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Nav columns */}
                    {footerSections.map((section) => (
                        <div key={section.heading} className="space-y-4">
                            <h3 className="text-xs font-semibold text-[#B8960C] uppercase tracking-widest">{section.heading}</h3>
                            <ul className="space-y-3">
                                {section.links.map((link) => (
                                    <li key={link.name}>
                                        <Link href={link.href} className="text-sm text-white/60 hover:text-white transition-colors">
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom bar */}
            <div className="border-t border-white/10">
                <div className="container mx-auto px-6 py-6 max-w-7xl">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-xs text-white/40 text-center md:text-left">
                            &copy; {new Date().getFullYear()} JP Heritage Bank N.A. All rights reserved. {BANK_INFO.fdic}
                        </p>
                        <div className="flex flex-wrap items-center gap-4 justify-center">
                            {legalLinks.map((link) => (
                                <Link key={link.name} href={link.href} className="text-xs text-white/40 hover:text-white/70 transition-colors">
                                    {link.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
