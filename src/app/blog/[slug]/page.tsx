import styles from "@/components/public-site.module.css";
import { PublicPage } from "@/components/public-site";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PortableText } from "next-sanity";
import { getPostBySlug, getAllSlugs, type SanityPost } from "@/sanity/queries";
import { BlogUnavailable } from "../blog-unavailable";
import { format } from "date-fns";

interface Props {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60;

export async function generateStaticParams() {
  try {
    const slugs = await getAllSlugs();
    return slugs.map((slug) => ({ slug }));
  } catch {
    // Articles remain available on demand when the CMS recovers.
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  let post: SanityPost | null;
  try {
    post = await getPostBySlug(slug);
  } catch {
    return { title: "Article unavailable | VitrOS", robots: { index: false } };
  }
  if (!post) return {};
  return {
    title: `${post.title} | VitrOS Blog`,
    description: post.excerpt,
    openGraph: {
      title: `${post.title} | VitrOS Blog`,
      description: post.excerpt,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  let post: SanityPost | null;
  try {
    post = await getPostBySlug(slug);
  } catch {
    return <PublicPage><section className="mx-auto max-w-6xl px-4 py-16 md:py-24"><BlogUnavailable article /></section></PublicPage>;
  }
  if (!post) notFound();

  return (
    <PublicPage>

      {/* Article */}
      <article className="flex-1 py-12 md:py-20 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Back */}
          <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-10">
            <ArrowLeft className="h-4 w-4" />
            Back to Blog
          </Link>

          {/* Header */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              {post.category && <Badge variant="secondary">{post.category}</Badge>}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight mb-4">
              {post.title}
            </h1>
            <p className="text-muted-foreground">
              {format(new Date(post.publishedAt), "MMMM d, yyyy")} &middot; Written by {post.author}
            </p>
          </div>

          {/* Content */}
          <div className={styles.article}>
            <PortableText value={post.body} />
          </div>

          {/* CTA */}
          <div className="mt-16 pt-10 border-t">
            <h3 className="text-xl font-semibold mb-2">Ready to modernize your lab?</h3>
            <p className="text-muted-foreground mb-6 text-sm">
              VitrOS gives your team vessel-level tracking, barcode scanning, and contamination analytics in one platform built for tissue culture.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/signup">
                <Button>Start Free <ArrowRight className="h-4 w-4 ml-1" /></Button>
              </Link>
              <Link href="/demo">
                <Button variant="outline">Get a Demo</Button>
              </Link>
            </div>
          </div>
        </div>
      </article>


    </PublicPage>
  );
}
