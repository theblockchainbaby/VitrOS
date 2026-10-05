import { HomePage } from "@/components/home-page";
import { homeStructuredData, publicPageMetadata, SITE_DESCRIPTION, SITE_TITLE } from "@/lib/seo";

export const metadata = publicPageMetadata({
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  path: "/",
});

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeStructuredData).replace(/</g, "\\u003c") }}
      />
      <HomePage />
    </>
  );
}
