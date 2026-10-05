"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Send, Bot, User, Loader2, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/page-header";

interface Message {
  role: "user" | "assistant";
  content: string;
  toolsUsed?: string[];
}

const SUGGESTIONS = [
  "How many vessels do we have in each stage?",
  "What is our contamination rate this month?",
  "Show me all cultivars and their vessel counts",
  "Which clone lines have been tested recently?",
  "Do we have any sales orders pending?",
  "What does our tech performance look like this week?",
];

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  async function handleSubmit(text?: string, retry = false) {
    const message = retry ? messages[messages.length - 1]?.content : text || input.trim();
    if (!message || loading) return;

    const userMessage: Message = { role: "user", content: message };
    const newMessages = retry ? messages : [...messages, userMessage];
    setMessages(newMessages);
    if (!retry) setInput("");
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to get response");
      }

      const data = await res.json();
      setMessages([
        ...newMessages,
        { role: "assistant", content: data.response, toolsUsed: data.toolsUsed },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "The assistant could not respond. Please try again.");
      setMessages(newMessages);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      handleSubmit();
    }
  }

  return (
    <div className="flex min-h-[36rem] h-[calc(100dvh-8rem)] flex-col gap-6 min-w-0">
      <PageHeader
        title="Lab Assistant"
        description="Ask questions about your lab data in plain English"
      />

      <Card className="flex-1 min-h-0 min-w-0 flex flex-col overflow-hidden py-0 gap-0">
        {/* Messages */}
        <div ref={scrollRef} role="log" aria-label="Conversation" aria-live="polite" aria-busy={loading} className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-5">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="rounded-full bg-primary/10 p-4 mb-4">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">VitrOS Lab Assistant</h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-md">
                Ask me anything about your lab operations. I can query your vessels, cultivars,
                contamination data, tech performance, clone lines, and production forecasts in real time.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSubmit(s)}
                    className="text-left text-sm px-3 py-3 rounded-lg border hover:bg-muted transition-colors focus-visible:outline-2 focus-visible:outline-ring"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((m, i) => (
              <div
                key={i}
                className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.role === "assistant" && (
                  <div className="shrink-0 rounded-full bg-primary/10 h-8 w-8 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                )}
                <div
                  className={`min-w-0 max-w-[90%] sm:max-w-[80%] rounded-lg px-4 py-3 ${
                    m.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <div className="text-sm whitespace-pre-wrap leading-relaxed break-words">{m.content}</div>
                  {m.toolsUsed && m.toolsUsed.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {m.toolsUsed.map((t) => (
                        <Badge key={t} variant="secondary" className="text-xs">
                          {({ query_vessels: "Vessels", query_cultivars: "Cultivars", query_contamination: "Contamination", query_tech_performance: "Team performance", query_clone_lines: "Clone lines", query_sales_orders: "Sales orders", query_forecasting: "Forecast", query_demand_planning: "Demand planning", query_inventory: "Inventory", query_locations: "Locations", query_media: "Media" } as Record<string, string>)[t] || "Lab records"}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                {m.role === "user" && (
                  <div className="shrink-0 rounded-full bg-foreground/10 h-8 w-8 flex items-center justify-center">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))
          )}
          {loading && (
            <div className="flex gap-3">
              <div className="shrink-0 rounded-full bg-primary/10 h-8 w-8 flex items-center justify-center">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <div className="bg-muted rounded-lg px-4 py-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Querying your lab data...
                </div>
              </div>
            </div>
          )}
        </div>

        {error && <div role="alert" className="mx-4 mb-4 rounded-lg border border-destructive/30 p-3 text-sm"><p>{error}</p><Button variant="outline" size="sm" className="mt-2" disabled={loading} onClick={() => handleSubmit(undefined, true)}>Retry response</Button></div>}
        {/* Input */}
        <div className="border-t p-4">
          <div className="flex gap-2">
            <Textarea
              ref={inputRef}
              aria-label="Message to the lab assistant"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your lab..."
              className="min-h-[44px] max-h-[120px] resize-none"
              rows={1}
              disabled={loading}
            />
            <Button
              onClick={() => handleSubmit()}
              disabled={!input.trim() || loading}
              size="icon"
              aria-label={loading ? "Waiting for response" : "Send message"}
              className="shrink-0 h-[44px] w-[44px]"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Enter to send · Shift + Enter for a new line. Verify important counts against the source records.</p>
        </div>
      </Card>
    </div>
  );
}
