import { useState, useEffect } from "react";
import { ABTestStatsPanel } from "@/components/ABTestStatsPanel";
import { CommunicationsHub } from "@/components/CommunicationsHub";
import { WebsiteIntelligence } from "@/components/WebsiteIntelligence";
import { RevenueStrip } from "@/components/RevenueStrip";
import { DecisionPanel } from "@/components/DecisionPanel";
import { QuotesDashboard } from "@/components/QuotesDashboard";
import { QuoteBuilder } from "@/components/QuoteBuilder";
import { ProjectProfitTracker } from "@/components/ProjectProfitTracker";
import { AdminStaffOnboarding } from "@/components/AdminStaffOnboarding";
import { CRMPipeline } from "@/components/crm/CRMPipeline";
import { SharedCalendarView } from "@/components/SharedCalendarView";
import { AdminTrainerPanel } from "@/components/AdminTrainerPanel";
import { TestEmailPanel } from "@/components/TestEmailPanel";
import { AdminAttachmentViewer } from "@/components/AdminAttachmentViewer";
import { FinancialDashboard } from "@/components/FinancialDashboard";
import { AIOperationsAssistant } from "@/components/AIOperationsAssistant";
import { AssessmentAvailabilityManager } from "@/components/AssessmentAvailabilityManager";
import { TodaysPlan } from "@/components/TodaysPlan";
import { OperationsCommandCentre } from "@/components/OperationsCommandCentre";
import { FollowUpEngine } from "@/components/FollowUpEngine";
import { AdminSystemSettings } from "@/components/AdminSystemSettings";
import { FollowUpCommandView } from "@/components/FollowUpCommandView";
import { ClientExperiencePanel } from "@/components/ClientExperiencePanel";
import { AutoSendOverviewPanel, AutoSendSettingsPanel } from "@/components/AutoSendTimingPanel";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  LogOut, RefreshCw, Calendar, Settings, Zap, Save,
  ExternalLink, CalendarDays, Download, MessageSquare,
  Crown, Shield, HardHat,
} from "lucide-react";
import { format } from "date-fns";

type ViewMode = "founder" | "admin" | "operations";

const VIEW_MODES: { value: ViewMode; label: string; icon: typeof Crown; desc: string }[] = [
  { value: "founder", label: "Founder", icon: Crown, desc: "Full system view" },
  { value: "admin", label: "Admin", icon: Shield, desc: "Leads, quotes & comms" },
  { value: "operations", label: "Operations", icon: HardHat, desc: "Jobs, schedule & docs" },
];

export default function Admin() {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [hubspotApiKey, setHubspotApiKey] = useState("");
  const [hubspotEnabled, setHubspotEnabled] = useState(false);
  const [isSavingCrm, setIsSavingCrm] = useState(false);
  const [showCrmSettings, setShowCrmSettings] = useState(false);
  const [quoteForInquiryId, setQuoteForInquiryId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const saved = localStorage.getItem("pe-admin-view-mode");
    return (saved as ViewMode) || "founder";
  });

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) navigate("/login");
  }, [user, isAdmin, loading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      supabase
        .from("integration_settings")
        .select("key, value")
        .in("key", ["hubspot_api_key"])
        .then(({ data }) => {
          if (data) {
            const hubspot = data.find((s) => s.key === "hubspot_api_key");
            if (hubspot?.value) {
              setHubspotApiKey(hubspot.value);
              setHubspotEnabled(true);
            }
          }
        });
    }
  }, [isAdmin]);

  const fetchBookings = async () => {
    setIsLoadingData(true);
    const { data } = await supabase
      .from("bookings")
      .select("*")
      .order("booking_date", { ascending: true })
      .limit(10);
    setBookings(data || []);
    setIsLoadingData(false);
  };

  useEffect(() => {
    if (isAdmin) fetchBookings();
  }, [isAdmin]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleSaveCrmSettings = async () => {
    setIsSavingCrm(true);
    try {
      if (hubspotEnabled && hubspotApiKey.trim()) {
        const { error } = await supabase
          .from("integration_settings")
          .upsert({ key: "hubspot_api_key", value: hubspotApiKey.trim(), description: "HubSpot Private App Access Token" }, { onConflict: "key" });
        if (error) throw error;
        toast.success("HubSpot integration saved");
      } else {
        await supabase.from("integration_settings").delete().eq("key", "hubspot_api_key");
        setHubspotApiKey("");
        toast.success("HubSpot integration disabled");
      }
    } catch {
      toast.error("Failed to save CRM settings");
    } finally {
      setIsSavingCrm(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center bg-secondary">
          <RefreshCw className="h-6 w-6 animate-spin text-accent" />
        </div>
      </Layout>
    );
  }

  if (!isAdmin) return null;

  return (
    <Layout>
      <div className="bg-secondary min-h-screen">
        {/* Header band */}
        <div className="border-b border-border/40 bg-card/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-accent font-sans mb-1">Control Centre</p>
              <h1 className="font-serif text-2xl tracking-tight text-foreground">Admin Dashboard</h1>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {user?.email} · {format(new Date(), "EEEE, d MMMM")}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleSignOut} className="text-[11px] uppercase tracking-wider border-border/50 hover:border-accent/30">
                <LogOut className="mr-2 h-3.5 w-3.5" />
                Sign Out
              </Button>
            </div>
          </div>

          {/* View Mode Switcher */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-4 -mt-1">
            <div className="flex items-center gap-1 bg-card/60 border border-border/30 rounded-sm p-0.5 w-fit">
              {VIEW_MODES.map((mode) => (
                <button
                  key={mode.value}
                  onClick={() => { setViewMode(mode.value); localStorage.setItem("pe-admin-view-mode", mode.value); }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-[11px] uppercase tracking-wider transition-all duration-200 ${
                    viewMode === mode.value
                      ? "bg-accent text-accent-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  <mode.icon className="h-3.5 w-3.5" />
                  {mode.label}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground/50 mt-1.5">
              {VIEW_MODES.find((m) => m.value === viewMode)?.desc}
            </p>
          </div>
        </div>

        {/* ── Action Strip ── */}
        <div className="border-b border-border/20 bg-card/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-6 overflow-x-auto">
            {[
              { label: "New Enquiry", action: () => navigate("/contact") },
              { label: "Create Quote", action: () => setQuoteForInquiryId("new") },
              { label: "View Follow-Ups", action: () => document.getElementById("follow-ups-section")?.scrollIntoView({ behavior: "smooth" }) },
              { label: "Open Pipeline", action: () => document.getElementById("pipeline-section")?.scrollIntoView({ behavior: "smooth" }) },
              { label: "Convert to Project", action: () => document.getElementById("pipeline-section")?.scrollIntoView({ behavior: "smooth" }) },
            ].map((item) => (
              <button
                key={item.label}
                onClick={item.action}
                className="text-[11px] uppercase tracking-[0.15em] font-medium text-muted-foreground/60 hover:text-foreground/90 transition-opacity duration-300 whitespace-nowrap flex-shrink-0"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">

          {/* ═══════════════════════════════════════════════════════ */}
          {/* FOUNDER + ADMIN: Revenue Strip                          */}
          {/* ═══════════════════════════════════════════════════════ */}
          {viewMode !== "operations" && <RevenueStrip />}

          {/* FOUNDER ONLY: Decision Panel */}
          {viewMode === "founder" && <DecisionPanel />}

          {/* FOUNDER + ADMIN: Follow-Up Engine */}
          {viewMode !== "operations" && <FollowUpEngine />}

          {/* FOUNDER + ADMIN: Auto-Send Overview */}
          {viewMode !== "operations" && <AutoSendOverviewPanel />}

          {/* FOUNDER + ADMIN: Communications Hub */}
          {viewMode !== "operations" && <CommunicationsHub />}

          {/* FOUNDER + OPERATIONS: Operations Command Centre */}
          {(viewMode === "founder" || viewMode === "operations") && <OperationsCommandCentre />}

          {/* FOUNDER + ADMIN: Quote System */}
          {viewMode !== "operations" && <QuotesDashboard />}

          {/* ═══ CRM PIPELINE — replaces old stats + inquiry table ═══ */}
          {viewMode !== "operations" && (
          <div id="pipeline-section">
            <CRMPipeline onCreateQuote={(id) => setQuoteForInquiryId(id)} />
          </div>
          )}

          {/* Follow-Up Command View */}
          <div id="follow-ups-section">
            <FollowUpCommandView />
          </div>

          {/* Today's Plan */}
          <TodaysPlan />

          {/* Upcoming Bookings */}
          {bookings.length > 0 && (
            <Card className="bg-card/80 border-border/40">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60 mb-1">Schedule</p>
                    <CardTitle className="text-base font-medium">Upcoming Bookings</CardTitle>
                  </div>
                  <Link to="/bookings">
                    <Button variant="ghost" size="sm" className="text-[11px] text-accent hover:text-accent/80">
                      View All <ExternalLink className="ml-1 h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {bookings.slice(0, 6).map((booking) => (
                    <div key={booking.id} className="p-3 rounded-sm border border-border/30 bg-background/40 hover:border-accent/20 transition-all duration-200">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-foreground">{booking.client_name}</p>
                        <Badge variant="outline" className="text-[9px] uppercase tracking-wider">
                          {booking.status}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        {format(new Date(booking.booking_date), "MMM d")}
                        {booking.booking_time && ` · ${booking.booking_time}`}
                      </p>
                      <p className="text-[11px] text-accent/80 mt-0.5">{booking.service_type}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Calendar — Founder + Operations */}
          {viewMode !== "admin" && <SharedCalendarView isAdmin={true} />}

          {/* Trainer Pipeline — Founder only */}
          {viewMode === "founder" && <AdminTrainerPanel />}

          {/* Staff & Onboarding — Founder + Admin */}
          {viewMode !== "operations" && <AdminStaffOnboarding />}

          {/* AI Operations Assistant — Founder only */}
          {viewMode === "founder" && <AIOperationsAssistant inquiries={[]} />}

          {/* Site Assessment Manager — Founder + Operations */}
          {(viewMode === "founder" || viewMode === "operations") && <AssessmentAvailabilityManager />}

          {/* Project Profit Tracker — Founder only */}
          {viewMode === "founder" && <ProjectProfitTracker />}

          {/* Client Experience — Founder + Operations */}
          {(viewMode === "founder" || viewMode === "operations") && <ClientExperiencePanel />}

          {/* Financial Control — Founder only */}
          {viewMode === "founder" && <FinancialDashboard />}

          {/* Website Intelligence — Founder only */}
          {viewMode === "founder" && <WebsiteIntelligence />}

          {/* A/B Tests — Founder only */}
          {viewMode === "founder" && <ABTestStatsPanel />}

          {/* System Settings — Founder only */}
          {viewMode === "founder" && <AdminSystemSettings />}

          {/* CRM Settings — Founder only */}
          {viewMode === "founder" && (
            <Card className="bg-card/80 border-border/40">
              <CardHeader className="cursor-pointer" onClick={() => setShowCrmSettings(!showCrmSettings)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Zap className="h-4 w-4 text-accent/60" />
                    <div>
                      <CardTitle className="text-sm font-medium">CRM Integration</CardTitle>
                      <CardDescription className="text-[11px]">
                        {hubspotEnabled ? "HubSpot connected" : "Connect HubSpot to auto-sync leads"}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {hubspotEnabled && (
                      <Badge variant="secondary" className="bg-accent/15 text-accent text-[9px] uppercase tracking-wider">
                        Active
                      </Badge>
                    )}
                    <Settings className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${showCrmSettings ? "rotate-90" : ""}`} />
                  </div>
                </div>
              </CardHeader>
              {showCrmSettings && (
                <CardContent className="space-y-4 border-t border-border/30 pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="hubspot-toggle" className="text-sm font-medium">Enable HubSpot Sync</Label>
                      <p className="text-[11px] text-muted-foreground">Auto-create contacts for new inquiries</p>
                    </div>
                    <Switch id="hubspot-toggle" checked={hubspotEnabled} onCheckedChange={setHubspotEnabled} />
                  </div>
                  {hubspotEnabled && (
                    <div className="space-y-2">
                      <Label htmlFor="hubspot-key" className="text-[11px] uppercase tracking-wider text-muted-foreground">Access Token</Label>
                      <Input
                        id="hubspot-key"
                        type="password"
                        placeholder="pat-na1-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                        value={hubspotApiKey}
                        onChange={(e) => setHubspotApiKey(e.target.value)}
                        className="h-10 bg-background/60 border-border/50 rounded-sm text-sm"
                      />
                    </div>
                  )}
                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      onClick={handleSaveCrmSettings}
                      disabled={isSavingCrm || (hubspotEnabled && !hubspotApiKey.trim())}
                      className="text-[11px] uppercase tracking-wider"
                    >
                      {isSavingCrm ? <RefreshCw className="h-3.5 w-3.5 mr-2 animate-spin" /> : <Save className="h-3.5 w-3.5 mr-2" />}
                      Save
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>
          )}

          {/* Email Test — Founder + Admin */}
          {viewMode !== "operations" && <TestEmailPanel />}



        </div>
      </div>

      {/* Quote Builder Dialog */}
      <Dialog open={!!quoteForInquiryId} onOpenChange={(v) => !v && setQuoteForInquiryId(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg">Create Quote from Inquiry</DialogTitle>
          </DialogHeader>
          <QuoteBuilder inquiryId={quoteForInquiryId} onSaved={() => setQuoteForInquiryId(null)} onClose={() => setQuoteForInquiryId(null)} />
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
