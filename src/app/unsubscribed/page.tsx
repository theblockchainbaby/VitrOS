import { AuthShell } from "@/components/auth-shell";

type SearchParams = Promise<{ e?: string; status?: string }>;
export const metadata = { title: "Email preferences | VitrOS", robots: { index: false, follow: false } };

export default async function UnsubscribedPage({ searchParams }: { searchParams: SearchParams }) {
  const { e: email, status } = await searchParams;
  const isError = status === "invalid" || status === "error";
  return <AuthShell title={isError ? "We couldn’t process that link" : "You’re unsubscribed"} description="Your VitrOS email preferences">
    <div role={isError ? "alert" : "status"} className="space-y-4 text-sm leading-relaxed text-muted-foreground break-words">
      {isError ? <><p>The unsubscribe link may be malformed or expired.</p><p>Reply to a VitrOS email with “unsubscribe”, or <a href="mailto:support@vitroslabs.com?subject=Unsubscribe" className="text-primary underline underline-offset-4">contact support</a> for help.</p></> : <><p>{email || "This address"} will no longer receive marketing or outreach emails from VitrOS.</p><p>If this was a mistake, reply to a previous email to ask to resubscribe.</p></>}
    </div>
  </AuthShell>;
}
