import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { exportDocumentAsPDF } from "./StaffDocuments";
import { format, startOfWeek, endOfWeek, isWithinInterval, nextWednesday, isWednesday, differenceInHours, setHours, isPast } from "date-fns";
import {
  FileText, DollarSign, HardHat, ClipboardCheck, Send, Loader2, Plus, Clock,
  CheckCircle2, AlertCircle, ChevronDown, ChevronUp, Calendar, ShieldCheck,
  FileWarning, Download, ArrowLeft, FolderOpen, Bell,
} from "lucide-react";
import logoPeMark from "@/assets/logo-pe-mark.png";

// Staff-specific document types (construction & payroll)
const STAFF_DOC_TYPES = {
  swms: { label: "SWMS", description: "Safe Work Method Statement", icon: HardHat, color: "text-orange-500" },
  work_permit: { label: "Work Permit", description: "Hot works, confined space & excavation permits", icon: ShieldCheck, color: "text-amber-600" },
  risk_assessment: { label: "Risk Assessment", description: "Job-specific risk assessment & controls", icon: FileWarning, color: "text-red-500" },
  payment_slip: { label: "Payment Slip", description: "Weekly timesheet — due every Wednesday", icon: DollarSign, color: "text-green-500" },
  site_inspection: { label: "Site Inspection", description: "Construction site condition report", icon: ClipboardCheck, color: "text-blue-500" },
} as const;

type StaffDocType = keyof typeof STAFF_DOC_TYPES;

const STATUS_CONFIG = {
  draft: { label: "Draft", variant: "outline" as const, color: "text-muted-foreground" },
  submitted: { label: "Submitted", variant: "default" as const, color: "text-blue-500" },
  approved: { label: "Approved", variant: "secondary" as const, color: "text-green-500" },
  rejected: { label: "Needs Revision", variant: "destructive" as const, color: "text-destructive" },
};

export default function StaffDocumentPortal() {
  const { user, loading: authLoading, isAdmin, isEmployee } = useAuth();
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<any[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [activeTab, setActiveTab] = useState<StaffDocType>("swms");
  const [expandedDoc, setExpandedDoc] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) navigate("/hq");
    if (!authLoading && user && !isEmployee && !isAdmin) navigate("/hq");
  }, [user, authLoading, isEmployee, isAdmin, navigate]);

  useEffect(() => {
    if (user) fetchDocuments();
  }, [user]);

  const fetchDocuments = async () => {
    setLoadingDocs(true);
    const { data, error } = await supabase
      .from("staff_documents")
      .select("*")
      .in("document_type", Object.keys(STAFF_DOC_TYPES))
      .order("created_at", { ascending: false });
    if (!error) setDocuments(data || []);
    setLoadingDocs(false);
  };

  if (authLoading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
        </div>
      </Layout>
    );
  }

  if (!user) return null;

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekEnd_ = endOfWeek(new Date(), { weekStartsOn: 1 });
  const thisWeekDocs = documents.filter(d =>
    d.submitted_at && isWithinInterval(new Date(d.submitted_at), { start: weekStart, end: weekEnd_ })
  );
  const filteredDocs = documents.filter(d => d.document_type === activeTab);

  // Payment slip deadline
  const now = new Date();
  const hasSubmittedPaymentThisWeek = documents.some(
    d => d.document_type === "payment_slip" && d.submitted_at &&
      isWithinInterval(new Date(d.submitted_at), { start: weekStart, end: weekEnd_ })
  );

  return (
    <Layout>
      <div className="section-padding">
        <div className="section-container max-w-5xl">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <img src={logoPeMark} alt="PE" className="h-8 w-8 object-contain" />
              </div>
              <div>
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">Staff Document Repository</h1>
                <p className="text-muted-foreground text-sm mt-0.5">
                  Construction safety, permits, risk assessments & payroll
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => navigate("/employee")}>
                <ArrowLeft className="mr-1.5 h-4 w-4" /> Dashboard
              </Button>
              <Button size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground" onClick={() => navigate("/documents")}>
                <Plus className="mr-1.5 h-4 w-4" /> New Document
              </Button>
            </div>
          </div>

          {/* Wednesday Payment Slip Deadline */}
          {!hasSubmittedPaymentThisWeek ? (
            <Card className={`mb-6 ${isWednesday(now) ? "border-destructive/40 bg-destructive/5" : "border-orange-500/30 bg-orange-500/5"}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Bell className={`h-5 w-5 shrink-0 ${isWednesday(now) ? "text-destructive" : "text-orange-500"}`} />
                    <div>
                      <p className="font-semibold text-sm">
                        {isWednesday(now) ? "⚠️ Payment Slip Due Today!" : "💰 Payment Slip Due Wednesday"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Week of {format(weekStart, "d MMM")} – {format(weekEnd_, "d MMM yyyy")}
                      </p>
                    </div>
                  </div>
                  <Button size="sm" className="shrink-0 bg-accent hover:bg-accent/90 text-accent-foreground" onClick={() => navigate("/documents")}>
                    <DollarSign className="mr-1.5 h-4 w-4" /> Submit Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="mb-6 border-green-500/30 bg-green-500/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <p className="font-semibold text-sm text-green-700 dark:text-green-400">Payment Slip Submitted ✓ — Week of {format(weekStart, "d MMM")}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Weekly Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Docs</CardDescription>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <FolderOpen className="h-5 w-5 text-muted-foreground" />
                  {documents.length}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>This Week</CardDescription>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-accent" />
                  {thisWeekDocs.length}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Approved</CardDescription>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  {documents.filter(d => d.status === "approved").length}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Pending</CardDescription>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-500" />
                  {documents.filter(d => d.status === "submitted").length}
                </CardTitle>
              </CardHeader>
            </Card>
          </div>

          {/* Document Tabs */}
          <Tabs value={activeTab} onValueChange={v => setActiveTab(v as StaffDocType)}>
            <TabsList className="grid grid-cols-5 mb-6">
              {(Object.entries(STAFF_DOC_TYPES) as [StaffDocType, typeof STAFF_DOC_TYPES[StaffDocType]][]).map(([key, cfg]) => {
                const TabIcon = cfg.icon;
                const count = documents.filter(d => d.document_type === key).length;
                return (
                  <TabsTrigger key={key} value={key} className="flex items-center gap-1.5 text-xs sm:text-sm">
                    <TabIcon className={`h-4 w-4 ${cfg.color}`} />
                    <span className="hidden sm:inline">{cfg.label}</span>
                    {count > 0 && <Badge variant="secondary" className="text-xs ml-1">{count}</Badge>}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {(Object.keys(STAFF_DOC_TYPES) as StaffDocType[]).map(key => (
              <TabsContent key={key} value={key}>
                {loadingDocs ? (
                  <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
                ) : filteredDocs.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
                    <p className="font-medium text-muted-foreground">No {STAFF_DOC_TYPES[key].label} documents yet</p>
                    <Button variant="outline" size="sm" className="mt-3" onClick={() => navigate("/documents")}>
                      <Plus className="mr-1.5 h-4 w-4" /> Create {STAFF_DOC_TYPES[key].label}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredDocs.map(doc => {
                      const cfg = STAFF_DOC_TYPES[doc.document_type as StaffDocType];
                      const Icon = cfg?.icon || FileText;
                      const st = STATUS_CONFIG[doc.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.draft;
                      const isExpanded = expandedDoc === doc.id;

                      return (
                        <Card key={doc.id} className="hover:border-accent/30 transition-colors">
                          <CardContent className="p-4">
                            <div
                              className="flex items-center justify-between cursor-pointer"
                              onClick={() => setExpandedDoc(isExpanded ? null : doc.id)}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className={`p-2 rounded-lg bg-muted/50 ${cfg?.color || "text-muted-foreground"}`}>
                                  <Icon className="h-5 w-5" />
                                </div>
                                <div className="min-w-0">
                                  <p className="font-medium text-sm truncate">{doc.title}</p>
                                  <p className="text-xs text-muted-foreground mt-0.5">
                                    {doc.submitted_at
                                      ? format(new Date(doc.submitted_at), "d MMM yyyy, h:mm a")
                                      : format(new Date(doc.created_at), "d MMM yyyy")}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <Badge variant={st.variant}>{st.label}</Badge>
                                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                              </div>
                            </div>
                            {isExpanded && (
                              <div className="mt-4 pt-4 border-t">
                                <pre className="text-xs bg-muted/50 rounded p-3 overflow-auto max-h-60 whitespace-pre-wrap">
                                  {JSON.stringify(doc.form_data, null, 2)}
                                </pre>
                                {doc.review_notes && (
                                  <div className="mt-2 p-2 rounded bg-destructive/10 text-sm">
                                    <strong>Admin Notes:</strong> {doc.review_notes}
                                  </div>
                                )}
                                <Button variant="outline" size="sm" className="mt-3" onClick={() => exportDocumentAsPDF(doc)}>
                                  <Download className="mr-1.5 h-3.5 w-3.5" /> Export PDF
                                </Button>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}
