import { useState } from "react";
import { Mail, Send, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type EmailType = "transactional" | "marketing";

interface SendResult {
  type: EmailType;
  success: boolean;
  emailId?: string;
  error?: string;
  sentAt: string;
}

export function TestEmailPanel() {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState<EmailType | null>(null);
  const [results, setResults] = useState<SendResult[]>([]);
  const [expanded, setExpanded] = useState(false);

  const handleSend = async (type: EmailType) => {
    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      toast.error("Enter a valid email address");
      return;
    }

    setSending(type);
    const { data, error } = await supabase.functions.invoke("send-test-email", {
      body: { to: trimmed, type },
    });

    const result: SendResult = {
      type,
      success: !error && data?.success,
      emailId: data?.emailId,
      error: error?.message || data?.error,
      sentAt: new Date().toLocaleTimeString("en-AU"),
    };

    setResults((prev) => [result, ...prev].slice(0, 10));
    setSending(null);

    if (result.success) {
      toast.success(`${type === "transactional" ? "Transactional" : "Marketing"} test email sent to ${trimmed}`);
    } else {
      toast.error(`Failed: ${result.error || "Unknown error"}`);
    }
  };

  return (
    <Card className="mb-8">
      <CardHeader className="cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-accent" />
            <div>
              <CardTitle className="text-lg">Email Deliverability Test</CardTitle>
              <CardDescription>
                Send test emails to verify Resend is delivering transactional and marketing messages
              </CardDescription>
            </div>
          </div>
          <Mail className={`h-4 w-4 text-muted-foreground transition-transform ${expanded ? "rotate-12" : ""}`} />
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="space-y-4 border-t pt-4">
          <div>
            <Label htmlFor="test-email-to">Recipient Email</Label>
            <Input
              id="test-email-to"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1"
              maxLength={255}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Send a test to yourself or a team member to confirm inbox delivery. Check spam folders too.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              className="flex-1"
              disabled={sending !== null}
              onClick={() => handleSend("transactional")}
            >
              {sending === "transactional" ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Send Transactional Test
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              disabled={sending !== null}
              onClick={() => handleSend("marketing")}
            >
              {sending === "marketing" ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Mail className="h-4 w-4 mr-2" />
              )}
              Send Marketing Test
            </Button>
          </div>

          {results.length > 0 && (
            <div className="space-y-2 pt-2">
              <p className="text-sm font-medium text-muted-foreground">Recent Tests</p>
              {results.map((r, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-3 text-sm p-2.5 rounded-lg border ${
                    r.success
                      ? "bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800"
                      : "bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800"
                  }`}
                >
                  {r.success ? (
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 shrink-0" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <span className="font-medium capitalize">{r.type}</span>
                    {r.success ? (
                      <span className="text-green-700 dark:text-green-300"> — delivered</span>
                    ) : (
                      <span className="text-red-700 dark:text-red-300"> — {r.error}</span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">{r.sentAt}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
