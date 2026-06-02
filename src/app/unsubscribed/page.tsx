type SearchParams = Promise<{ e?: string; status?: string }>;

export const metadata = {
  title: "Unsubscribed from VitrOS",
  robots: { index: false, follow: false },
};

export default async function UnsubscribedPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const email = params.e;
  const status = params.status;

  const isError = status === "invalid" || status === "error";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f1419",
        color: "#e6e8eb",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
      }}
    >
      <div
        style={{
          maxWidth: 520,
          background: "#1a2230",
          padding: "44px 40px",
          borderRadius: 12,
          border: "1px solid #2a3441",
        }}
      >
        {isError ? (
          <>
            <h1
              style={{
                fontSize: 22,
                fontWeight: 700,
                margin: "0 0 12px 0",
                color: "#f8d4a1",
              }}
            >
              We could not process that unsubscribe link
            </h1>
            <p style={{ lineHeight: 1.6, color: "#a8b1bd", margin: "0 0 16px 0" }}>
              The link may be malformed or expired. If you want off our list,
              just reply to any email you have received from VitrOS with the
              word &quot;unsubscribe&quot; and we will remove you within a day.
            </p>
          </>
        ) : (
          <>
            <h1
              style={{
                fontSize: 22,
                fontWeight: 700,
                margin: "0 0 12px 0",
                color: "#9be3a3",
              }}
            >
              You are unsubscribed
            </h1>
            <p style={{ lineHeight: 1.6, color: "#a8b1bd", margin: "0 0 8px 0" }}>
              {email
                ? `${email} will no longer receive marketing or outreach emails from VitrOS.`
                : "That address will no longer receive marketing or outreach emails from VitrOS."}
            </p>
            <p style={{ lineHeight: 1.6, color: "#a8b1bd", margin: "0 0 24px 0" }}>
              We are sorry to see you go. If this was a mistake, reply to any
              prior email and we will resubscribe you.
            </p>
          </>
        )}
        <div
          style={{
            borderTop: "1px solid #2a3441",
            paddingTop: 20,
            marginTop: 24,
            fontSize: 13,
            color: "#6b7884",
          }}
        >
          VitrOS Labs
          <br />
          <a
            href="https://vitroslabs.com"
            style={{ color: "#2d8a3c", textDecoration: "none" }}
          >
            vitroslabs.com
          </a>
        </div>
      </div>
    </div>
  );
}
