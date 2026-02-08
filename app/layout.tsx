import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "Portfolio - Développeur Web Full-Stack Junior",
  description: "Portfolio de développeur web full-stack junior spécialisé en Django, Vue.js, React et Next.js. Découvrez mes projets et compétences.",
  keywords: ["développeur web", "full-stack", "Django", "Vue.js", "React", "Next.js", "portfolio"],
  authors: [{ name: "Djeff Kuate" }],
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "Portfolio - Développeur Web Full-Stack Junior",
    description: "Portfolio de développeur web full-stack junior spécialisé en Django, Vue.js, React et Next.js.",
    type: "website",
    locale: "fr_FR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans bg-dark-950 text-white antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
