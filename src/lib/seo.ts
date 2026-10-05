import type { Metadata } from "next";

export const SITE_URL = "https://vitroslabs.com";
export const SITE_TITLE = "Plant Tissue Culture Lab Management Software | VitrOS";
export const SITE_DESCRIPTION =
  "Manage plant tissue culture vessels, track lineage, schedule subcultures, and review contamination in one connected lab workspace. Explore VitrOS.";

const socialImage = {
  url: `${SITE_URL}/images/product/tissue-culture-dashboard.png`,
  width: 2880,
  height: 2160,
  alt: "VitrOS tissue culture lab dashboard with demonstration data",
};

// Private app and account routes inherit noindex from the root layout. Public
// pages opt in explicitly so a new workspace route cannot inherit home SEO.
export function publicPageMetadata({
  title,
  description,
  path,
  keywords,
}: {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
}): Metadata {
  const canonical = new URL(path, SITE_URL).toString();

  return {
    title,
    description,
    keywords,
    alternates: { canonical },
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "VitrOS",
      locale: "en_US",
      type: "website",
      images: [socialImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [socialImage],
    },
  };
}

export const homeStructuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "VitrOS Labs",
      url: SITE_URL,
      logo: `${SITE_URL}/logo-icon.png`,
      email: "support@vitroslabs.com",
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${SITE_URL}/#software`,
      name: "VitrOS",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      description: SITE_DESCRIPTION,
      url: SITE_URL,
      screenshot: socialImage.url,
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
  ],
};
