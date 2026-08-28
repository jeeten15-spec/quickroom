import type { Metadata } from "next";
import { Cormorant_Garamond, Outfit } from "next/font/google";
import "./globals.css";
import { site } from "@/config/site";
import { project } from "@/config/project";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(base),
  title: {
    default: `${project.name} | Gated villa plots near Hyderabad | ${site.companyName}`,
    template: `%s | ${site.companyName}`,
  },
  description: `${project.headline}. ${project.type} in ${project.location}. Indicative starting price ${project.startingPrice}. Demonstration website for a sample project.`,
  keywords: [
    "Real estate in Hyderabad",
    "Properties for sale in Hyderabad",
    "Gated villa plots near Hyderabad",
    "Plots in Mokila",
    "Properties near Financial District",
    "Book a property site visit",
    "Hyderabad real-estate consultant",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    title: `${project.name} — gated villa plots, Mokila, Hyderabad (demo)`,
    description: project.valueProposition,
    url: base,
    siteName: site.companyName,
    images: [{ url: "/media/og.jpg", width: 1200, height: 630, alt: project.hero.alt }],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${project.name} | ${site.companyName}`,
    description: project.valueProposition,
    images: ["/media/og.jpg"],
  },
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "RealEstateAgent",
        name: site.companyName,
        telephone: site.phone,
        email: site.email,
        address: {
          "@type": "PostalAddress",
          streetAddress: site.officeAddress,
          addressLocality: "Hyderabad",
          addressCountry: "IN",
        },
        description: "Demonstration RealEstateAgent placeholder — not a licensed listing of a real firm.",
      },
      {
        "@type": "LocalBusiness",
        name: site.companyName,
        image: `${base}/media/logo.svg`,
        url: base,
        telephone: site.phone,
      },
      {
        "@type": "FAQPage",
        mainEntity: project.faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };

  return (
    <html lang="en-IN">
      <body className={`${outfit.variable} ${cormorant.variable} antialiased bg-ivory text-charcoal`}>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        {children}
      </body>
    </html>
  );
}
