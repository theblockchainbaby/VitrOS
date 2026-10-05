import { BookOpen } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function BlogUnavailable({ article = false }: { article?: boolean }) {
  const Heading = article ? "h1" : "h2";
  return (
    <div role="status" className="max-w-2xl rounded-xl border bg-card p-6 sm:p-8">
      <BookOpen aria-hidden="true" className="mb-4 size-6 text-muted-foreground" />
      <Heading className="text-2xl font-semibold tracking-tight">
        {article ? "Article temporarily unavailable" : "Articles temporarily unavailable"}
      </Heading>
      <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">
        We couldn’t load {article ? "this article" : "the resource library"}. Please try again later. You can still explore VitrOS and its lab workflows.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Button asChild variant="outline"><a href="">Try again</a></Button>
        <Button asChild><Link href={article ? "/blog" : "/features"}>{article ? "Back to resources" : "Explore features"}</Link></Button>
      </div>
    </div>
  );
}
