import type { Metadata } from "next";
import { Inter, IBM_Plex_Serif } from "next/font/google";
import "../styles/animations.css";
import "../theme.css";
import { AuthProvider } from "../components/AuthProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const ibmPlexSerif = IBM_Plex_Serif({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-ibm-plex-serif",
});

export const metadata: Metadata = {
  title: "Aurum Vault - Luxury Banking Redefined",
  description:
    "Experience the pinnacle of private banking with Aurum Vault's sophisticated wealth management solutions tailored for discerning clients.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${ibmPlexSerif.variable}`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
