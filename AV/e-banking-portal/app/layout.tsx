export const runtime = 'edge';
import './globals.css';
import type { Metadata } from 'next';
import EBankingLayout from './EBankingLayout';

export const metadata: Metadata = {
    title: 'AURUM VAULT - E-Banking Portal',
    description: 'Secure online banking for AURUM VAULT customers',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body suppressHydrationWarning>
                <EBankingLayout>{children}</EBankingLayout>
            </body>
        </html>
    );
}
