import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { format } from "date-fns";
import { exportDocumentAsPDF } from "@/lib/documentUtils";
import {
  FileText,
  DollarSign,
  HardHat,
  ClipboardCheck,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Loader2,
  RefreshCw,
  Filter,
  Download,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  ArrowLeft,
  ShieldCheck,
  FileWarning,
  ClipboardList,
  AlertTriangle,
  Heart,
} from "lucide-react";
import logoPeMark from "@/assets/logo-pe-mark.png";

const DOC_TYPES = {
  all: { label: "All Documents", icon: FileText, color: "text-foreground" },
  swms: { label: "SWMS", icon: HardHat, color: "text-orange-500" },
  work_permit: { label: "Work Permits", icon: ShieldCheck, color: "text-amber-600" },
  risk_assessment: { label: "Risk Assessments", icon: FileWarning, color: "text-red-500" },
  payment_slip: { label: "Payment Slips", icon: DollarSign, color: "text-green-500" },
  site_inspection: { label: "Site Inspections", icon: ClipboardCheck, color: "text-blue-500" },
  event_checklist: { label: "Event Safety", icon: FileText, color: "text-purple-500" },
  daily_site_report: { label: "Daily Reports", icon: ClipboardList, color: "text-cyan-500" },
  incident_report: { label: "Incident Reports", icon: AlertTriangle, color: "text-rose-500" },
  horse_care_log: { label: "Horse Care Logs", icon: Heart, color: "text-pink-500" },
} as const;

type DocFilter = keyof typeof DOC_TYPES;

const STATUS_CONFIG = {
  draft: { label: "Draft", icon: Clock, variant: "outline" as const, color: "text-muted-foreground" },
  submitted: { label: "Submitted", icon: Clock, variant: "default" as const, color: "text-blue-500" },
  approved: { label: "Approved", icon: CheckCircle2, variant: "secondary" as const, color: "text-green-500" },
  rejected: { label: "Needs Revision", icon: XCircle, variant: "destructive" as const, color: "text-destructive" },
};

interface StaffDoc {
  id: string;
  user_id: string;
  document_type: string;
  title: string;
  form_data: any;
  status: string;
  submitted_at: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_notes: string | null;
  created_at: string;
  updated_at: string;
}

function FormDataDisplay({ data }: { data: any }) {
  if (!data || typeof data !== "object") return null;

  const renderValue = (key: string, value: any): JSX.Element | null => {
    if (value === null || value === undefined || value === "") return null;

    // Render photo URLs as image grid
    if (key === "photo_urls" && Array.isArray(value) && value.length > 0) {
      return (
        <div key={key} className="col-span-full">
          <p className="text-xs font-semibold text-muted-foreground mb-1">Site Photos</p>
          <div className="grid grid-cols-3 gap-2">
            {value.map((path: string, i: number) => {
              const url = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/staff-document-photos/${path}`;
              return (
                <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="block rounded-lg overflow-hidden border border-border aspect-square">
                  <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                </a>
              );
            })}
          </div>
        </div>
      );
    }

    const label = key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());

    if (Array.isArray(value)) {
      if (value.length === 0) return null;
      // Check if array of objects (like days, checklist)
      if (typeof value[0] === "object") {
        return (
          <div key={key} className="col-span-full">
            <p className="text-xs font-semibold text-muted-foreground mb-1">{label}</p>
            <div className="space-y-1">
              {value.map((item, i) => (
                <div key={i} className="text-sm bg-muted/30 rounded px-3 py-1.5 flex flex-wrap gap-x-4 gap-y-0.5">
                  {Object.entries(item).map(([k, v]) => (
                    v ? <span key={k}><span className="text-muted-foreground text-xs">{k}:</span> {String(v)}</span> : null
                  ))}
                </div>
              ))}
            </div>
          </div>
        );
      }
      return (
        <div key={key}>
          <p className="text-xs font-semibold text-muted-foreground">{label}</p>
          <p className="text-sm">{value.join(", ")}</p>
        </div>
      );
    }

    if (typeof value === "boolean") {
      return (
        <div key={key}>
          <p className="text-xs font-semibold text-muted-foreground">{label}</p>
          <p className="text-sm">{value ? "✅ Yes" : "❌ No"}</p>
        </div>
      );
    }

    if (typeof value === "object") {
      return (
        <div key={key} className="col-span-full">
          <p className="text-xs font-semibold text-muted-foreground mb-1">{label}</p>
          <FormDataDisplay data={value} />
        </div>
      );
    }

    return (
      <div key={key}>
        <p className="text-xs font-semibold text-muted-foreground">{label}</p>
        <p className="text-sm break-words">{String(value)}</p>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {Object.entries(data).map(([key, value]) => renderValue(key, value))}
    </div>
  );
}

export default function AdminDocuments() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [documents, setDocuments] = useState<StaffDoc[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [docFilter, setDocFilter] = useState<DocFilter>("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDoc, setSelectedDoc] = useState<StaffDoc | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate("/login");
    }
  }, [user, isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (isAdmin) fetchDocuments();
  }, [isAdmin]);

  const fetchDocuments = async () => {
    setLoadingDocs(true);
    const { data, error } = await supabase
      .from("staff_documents")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) setDocuments(data || []);
    else toast.error("Failed to load documents");
    setLoadingDocs(false);
  };

  const handleReview = async (status: "approved" | "rejected") => {
    if (!selectedDoc || !user) return;
    setSaving(true);

    const { error } = await supabase
      .from("staff_documents")
      .update({
        status,
        review_notes: reviewNotes || null,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", selectedDoc.id);

    if (error) {
      toast.error("Failed to update document");
    } else {
      toast.success(`Document ${status === "approved" ? "approved" : "returned for revision"}`);
      setSelectedDoc(null);
      setReviewNotes("");
      fetchDocuments();
    }
    setSaving(false);
  };

  // Filters
  const filtered = documents.filter(doc => {
    if (docFilter !== "all" && doc.document_type !== docFilter) return false;
    if (statusFilter !== "all" && doc.status !== statusFilter) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return doc.title.toLowerCase().includes(term) ||
        JSON.stringify(doc.form_data).toLowerCase().includes(term);
    }
    return true;
  });

  // Stats
  const stats = {
    total: documents.length,
    pending: documents.filter(d => d.status === "submitted").length,
    approved: documents.filter(d => d.status === "approved").length,
    rejected: documents.filter(d => d.status === "rejected").length,
  };

  // CSV Export
  const exportCSV = () => {
    const headers = ["Date", "Type", "Title", "Status", "Submitted By"];
    const rows = filtered.map(doc => [
      format(new Date(doc.created_at), "yyyy-MM-dd HH:mm"),
      doc.document_type,
      `"${doc.title.replace(/"/g, '""')}"`,
      doc.status,
      doc.user_id,
    ]);
    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `documents-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${filtered.length} documents`);
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

  if (!isAdmin) return null;

  return (
    <Layout>
      <div className="section-padding">
        <div className="section-container">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <img src={logoPeMark} alt="PE" className="h-8 w-8 object-contain" />
              </div>
              <div>
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">Document Portal</h1>
                <p className="text-muted-foreground text-sm mt-0.5">
                  Review & manage all staff compliance documents
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => navigate("/admin")}>
                <ArrowLeft className="mr-1.5 h-4 w-4" /> Dashboard
              </Button>
              <Button variant="outline" size="sm" onClick={fetchDocuments}>
                <RefreshCw className="mr-1.5 h-4 w-4" /> Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={exportCSV}>
                <Download className="mr-1.5 h-4 w-4" /> Export
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Documents</CardDescription>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  {stats.total}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card className={stats.pending > 0 ? "border-blue-500/40 bg-blue-500/5" : ""}>
              <CardHeader className="pb-2">
                <CardDescription>Pending Review</CardDescription>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-500" />
                  {stats.pending}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Approved</CardDescription>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  {stats.approved}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Needs Revision</CardDescription>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-destructive" />
                  {stats.rejected}
                </CardTitle>
              </CardHeader>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search documents..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={docFilter} onValueChange={v => setDocFilter(v as DocFilter)}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Doc type" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(DOC_TYPES).map(([key, cfg]) => (
                  <SelectItem key={key} value={key}>
                    {cfg.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="submitted">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Needs Revision</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Documents List */}
          {loadingDocs ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
              <p className="font-medium text-muted-foreground">No documents found</p>
              <p className="text-sm text-muted-foreground mt-1">
                {searchTerm || docFilter !== "all" || statusFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Staff documents will appear here once submitted"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map(doc => {
                const typeKey = doc.document_type as keyof typeof DOC_TYPES;
                const cfg = DOC_TYPES[typeKey] || DOC_TYPES.swms;
                const Icon = cfg.icon;
                const st = STATUS_CONFIG[doc.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.draft;
                const StIcon = st.icon;

                return (
                  <Card
                    key={doc.id}
                    className="hover:border-accent/30 transition-colors cursor-pointer"
                    onClick={() => { setSelectedDoc(doc); setReviewNotes(doc.review_notes || ""); }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`p-2 rounded-lg bg-muted/50 ${cfg.color}`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-sm truncate">{doc.title}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {doc.submitted_at
                                ? `Submitted ${format(new Date(doc.submitted_at), "d MMM yyyy, h:mm a")}`
                                : `Created ${format(new Date(doc.created_at), "d MMM yyyy")}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge variant={st.variant} className="flex items-center gap-1">
                            <StIcon className="h-3 w-3" />
                            {st.label}
                          </Badge>
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Review Dialog */}
      <Dialog open={!!selectedDoc} onOpenChange={open => { if (!open) setSelectedDoc(null); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedDoc && (() => {
            const typeKey = selectedDoc.document_type as keyof typeof DOC_TYPES;
            const cfg = DOC_TYPES[typeKey] || DOC_TYPES.swms;
            const Icon = cfg.icon;
            const st = STATUS_CONFIG[selectedDoc.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.draft;

            return (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Icon className={`h-5 w-5 ${cfg.color}`} />
                    {selectedDoc.title}
                  </DialogTitle>
                  <DialogDescription className="flex items-center gap-2">
                    <Badge variant={st.variant}>{st.label}</Badge>
                    <span>·</span>
                    <span>
                      {selectedDoc.submitted_at
                        ? format(new Date(selectedDoc.submitted_at), "d MMM yyyy, h:mm a")
                        : format(new Date(selectedDoc.created_at), "d MMM yyyy")}
                    </span>
                  </DialogDescription>
                </DialogHeader>

                <div className="border rounded-lg p-4 bg-muted/20">
                  <FormDataDisplay data={selectedDoc.form_data} />
                </div>

                {/* Review section */}
                <div className="space-y-3 pt-2">
                  <label className="text-sm font-semibold">Admin Review Notes</label>
                  <Textarea
                    value={reviewNotes}
                    onChange={e => setReviewNotes(e.target.value)}
                    placeholder="Add review notes, corrections needed, or approval comments..."
                    rows={3}
                  />
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-2">
                  <Button
                    variant="outline"
                    onClick={() => exportDocumentAsPDF(selectedDoc)}
                    className="w-full sm:w-auto"
                  >
                    <Download className="mr-2 h-4 w-4" /> Export PDF
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleReview("rejected")}
                    disabled={saving}
                    className="w-full sm:w-auto"
                  >
                    {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <XCircle className="mr-2 h-4 w-4" />}
                    Return for Revision
                  </Button>
                  <Button
                    onClick={() => handleReview("approved")}
                    disabled={saving}
                    className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white"
                  >
                    {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                    Approve Document
                  </Button>
                </DialogFooter>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
