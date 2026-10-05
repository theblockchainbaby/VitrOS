import { PublicPage } from "@/components/public-site";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getAllPosts, type SanityPost } from "@/sanity/queries";
import { BlogUnavailable } from "./blog-unavailable";
import { format } from "date-fns";

export const metadata: Metadata = {
  title: "Blog | Tissue Culture Lab Tips & Industry Insights | VitrOS",
  description:
    "Practical guides, industry insights, and operations advice for tissue culture labs. Learn how modern labs are scaling faster with better systems.",
  keywords: [
    "tissue culture blog",
    "lab management tips",
    "plant propagation insights",
    "tissue culture operations",
    "lab software guides",
    "contamination tracking tips",
  ],
  openGraph: {
    title: "Blog | Tissue Culture Lab Tips & Industry Insights | VitrOS",
    description:
      "Practical guides, industry insights, and operations advice for tissue culture labs.",
  },
};

export const revalidate = 60;

export default async function BlogPage() {
  let posts: SanityPost[] | null = null;
  try {
    posts = await getAllPosts();
  } catch {
    // Keep a CMS failure distinct from a successful response with no posts.
  }

  return (
    <PublicPage>

      {/* Hero */}
      <section className="py-16 md:py-24 px-4 border-b">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Lab Insights
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Practical guides and industry perspective for tissue culture labs that are serious about scaling.
          </p>
        </div>
      </section>

      {/* Posts */}
      <section className="py-16 px-4 flex-1">
        <div className="max-w-6xl mx-auto">
          {posts === null ? <BlogUnavailable /> : posts.length === 0 ? (
            <p className="text-muted-foreground">No posts yet. Check back soon.</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-8">
              {posts.map((post) => (
                <Link key={post.slug} href={`/blog/${post.slug}`} className="group">
                  <article className="border rounded-xl p-8 h-full hover:border-primary/50 transition-colors bg-background">
                    <div className="flex items-center gap-3 mb-4">
                      {post.category && <Badge variant="secondary">{post.category}</Badge>}
                    </div>
                    <h2 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors leading-snug">
                      {post.title}
                    </h2>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(post.publishedAt), "MMMM d, yyyy")} &middot; {post.author}
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-muted/30 border-t">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">
            See VitrOS in action
          </h2>
          <p className="text-muted-foreground mb-8">
            Track every vessel, spot contamination trends, and scale your lab without the spreadsheet chaos.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/signup">
              <Button size="lg">Start Free <ArrowRight className="h-4 w-4 ml-1" /></Button>
            </Link>
            <Link href="/demo">
              <Button size="lg" variant="outline">Get a Demo</Button>
            </Link>
          </div>
        </div>
      </section>


    </PublicPage>
  );
}
