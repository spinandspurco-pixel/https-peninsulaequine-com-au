import { useState, useEffect } from "react";
import { ABTestStatsPanel } from "@/components/ABTestStatsPanel";
import { WebsiteIntelligence } from "@/components/WebsiteIntelligence";
import { AdminStaffOnboarding } from "@/components/AdminStaffOnboarding";
import { SharedCalendarView } from "@/components/SharedCalendarView";
import { AdminTrainerPanel } from "@/components/AdminTrainerPanel";
import { TestEmailPanel } from "@/components/TestEmailPanel";
import { AdminAttachmentViewer } from "@/components/AdminAttachmentViewer";
import { FinancialDashboard } from "@/components/FinancialDashboard";
import { AIOperationsAssistant } from "@/components/AIOperationsAssistant";
import { AssessmentAvailabilityManager } from "@/components/AssessmentAvailabilityManager";
import { TodaysPlan } from "@/components/TodaysPlan";
import { OperationsCommandCentre } from "@/components/OperationsCommandCentre";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  LogOut, Eye, Trash2, RefreshCw, Search, Mail, Phone, Calendar,
  Filter, MessageSquare, Users, Clock, CheckCircle, Download,
  Settings, Zap, Save, ExternalLink, CalendarDays, BarChart3, UserCog,
} from "lucide-react";
import { format } from "date-fns";

interface Inquiry {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  email: string;
  phone: string | null;
  services: string[];
  preferred_service: string | null;
  project_details: string | null;
  project_vision: string | null;
  budget_range: string | null;
  preferred_start: string | null;
  preferred_contact: string | null;
  horse_name: string | null;
  horse_age: string | null;
  horse_breed: string | null;
  experience_level: string | null;
  status: string;
  notes: string | null;
  lead_tier: string | null;
  lead_tags: string[] | null;
  attachment_urls: string[] | null;
}

const TIER_COLORS: Record<string, string> = {
  premium: "bg-accent text-accent-foreground",
  high: "bg-accent/70 text-accent-foreground",
  standard: "bg-muted text-muted-foreground",
  starter: "bg-muted text-muted-foreground",
};

const statusOptions = [
  { value: "new", label: "New", color: "bg-accent/80" },
  { value: "contacted", label: "Contacted", color: "bg-muted-foreground/60" },
  { value: "in_progress", label: "In Progress", color: "bg-accent" },
  { value: "quoted", label: "Quoted", color: "bg-accent/60" },
  { value: "won", label: "Won", color: "bg-emerald-600" },
  { value: "lost", label: "Lost", color: "bg-destructive" },
];

function getStatusBadge(status: string) {
  const cfg = statusOptions.find((s) => s.value === status) || statusOptions[0];
  return (
    <Badge variant="secondary" className={`${cfg.color} text-white text-[10px] uppercase tracking-wider font-medium`}>
      {cfg.label}
    </Badge>
  );
}

export default function Admin() {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [deleteInquiry, setDeleteInquiry] = useState<Inquiry | null>(null);
  const [editNotes, setEditNotes] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [hubspotApiKey, setHubspotApiKey] = useState("");
  const [hubspotEnabled, setHubspotEnabled] = useState(false);
  const [isSavingCrm, setIsSavingCrm] = useState(false);
  const [showCrmSettings, setShowCrmSettings] = useState(false);

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

  const fetchInquiries = async () => {
    setIsLoadingData(true);
    const [inquiryRes, bookingRes] = await Promise.all([
      supabase.from("inquiries").select("*").order("created_at", { ascending: false }),
      supabase.from("bookings").select("*").order("booking_date", { ascending: true }).limit(10),
    ]);
    if (inquiryRes.error) toast.error("Failed to load inquiries");
    else setInquiries(inquiryRes.data || []);
    setBookings(bookingRes.data || []);
    setIsLoadingData(false);
  };

  useEffect(() => {
    if (isAdmin) fetchInquiries();
  }, [isAdmin]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleViewInquiry = (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry);
    setEditNotes(inquiry.notes || "");
    setEditStatus(inquiry.status);
  };

  const handleUpdateInquiry = async () => {
    if (!selectedInquiry) return;
    const { error } = await supabase
      .from("inquiries")
      .update({ status: editStatus, notes: editNotes, updated_at: new Date().toISOString() })
      .eq("id", selectedInquiry.id);
    if (error) toast.error("Failed to update inquiry");
    else { toast.success("Inquiry updated"); setSelectedInquiry(null); fetchInquiries(); }
  };

  const handleDeleteInquiry = async () => {
    if (!deleteInquiry) return;
    const { error } = await supabase.from("inquiries").delete().eq("id", deleteInquiry.id);
    if (error) toast.error("Failed to delete inquiry");
    else { toast.success("Inquiry deleted"); setDeleteInquiry(null); fetchInquiries(); }
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

  const filteredInquiries = inquiries.filter((inquiry) => {
    const matchesSearch =
      inquiry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inquiry.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    const matchesStatus = statusFilter === "all" || inquiry.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const exportToCSV = () => {
    const headers = ["Date", "Name", "Email", "Phone", "Services", "Status", "Budget Range", "Preferred Start", "Notes"];
    const escapeCSV = (v: string | null | undefined): string => {
      if (!v) return "";
      const s = String(v);
      return s.includes(",") || s.includes('"') || s.includes("\n") ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const rows = filteredInquiries.map((i) => [
      format(new Date(i.created_at), "yyyy-MM-dd HH:mm"), escapeCSV(i.name), escapeCSV(i.email),
      escapeCSV(i.phone), escapeCSV(i.services.join("; ")), escapeCSV(i.status),
      escapeCSV(i.budget_range), escapeCSV(i.preferred_start), escapeCSV(i.notes),
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `inquiries-${format(new Date(), "yyyy-MM-dd")}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Exported ${filteredInquiries.length} inquiries`);
  };

  const stats = {
    total: inquiries.length,
    new: inquiries.filter((i) => i.status === "new").length,
    inProgress: inquiries.filter((i) => ["contacted", "in_progress", "quoted"].includes(i.status)).length,
    completed: inquiries.filter((i) => ["won", "lost"].includes(i.status)).length,
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
            <Button variant="outline" size="sm" onClick={handleSignOut} className="text-[11px] uppercase tracking-wider border-border/50 hover:border-accent/30">
              <LogOut className="mr-2 h-3.5 w-3.5" />
              Sign Out
            </Button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total Inquiries", value: stats.total, icon: Users },
              { label: "New", value: stats.new, icon: MessageSquare },
              { label: "In Progress", value: stats.inProgress, icon: Clock },
              { label: "Completed", value: stats.completed, icon: CheckCircle },
            ].map((stat) => (
              <Card key={stat.label} className="bg-card/80 border-border/40">
                <CardHeader className="pb-1 pt-4 px-4">
                  <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">{stat.label}</p>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-serif font-semibold text-foreground">{stat.value}</span>
                    <stat.icon className="h-4 w-4 text-accent/60" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {[
              { to: "/admin/services", label: "Services", desc: "Content", icon: Settings },
              { to: "/admin/testimonials", label: "Testimonials", desc: "Content", icon: MessageSquare },
              { to: "/admin/events", label: "Events", desc: "Content", icon: Calendar },
              { to: "/bookings", label: "Bookings", desc: "Operations", icon: CalendarDays },
              { to: "/admin/documents", label: "Documents", desc: "Compliance", icon: Download },
            ].map((link) => (
              <Link key={link.to} to={link.to}>
                <Card className="bg-card/60 border-border/30 hover:border-accent/30 transition-all duration-200 cursor-pointer group h-full">
                  <CardHeader className="p-4">
                    <p className="text-[9px] uppercase tracking-[0.15em] text-muted-foreground/60">{link.desc}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <link.icon className="h-4 w-4 text-muted-foreground group-hover:text-accent transition-colors" />
                      <span className="text-sm font-medium text-foreground group-hover:text-accent transition-colors">{link.label}</span>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>

          {/* Operations Command Centre — Daily Hub */}
          <OperationsCommandCentre />

          {/* Today's Plan — Detailed AI Plan */}
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

          {/* Calendar */}
          <SharedCalendarView isAdmin={true} />

          {/* Trainer Pipeline */}
          <AdminTrainerPanel />

          {/* Staff & Onboarding */}
          <AdminStaffOnboarding />

          {/* AI Operations Assistant */}
          <AIOperationsAssistant inquiries={inquiries} />

          {/* Site Assessment Manager */}
          <AssessmentAvailabilityManager />

          {/* Financial Control */}
          <FinancialDashboard />

          {/* Website Intelligence */}
          <WebsiteIntelligence />

          {/* A/B Tests */}
          <ABTestStatsPanel />

          {/* CRM Settings */}
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
                    <Badge variant="secondary" className="bg-emerald-600/15 text-emerald-600 text-[9px] uppercase tracking-wider">
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

          {/* Email Test */}
          <TestEmailPanel />

          {/* Inquiry Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50" />
              <Input
                placeholder="Search by name, email, or phone…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-10 bg-card/60 border-border/40 rounded-sm text-sm"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[160px] h-10 bg-card/60 border-border/40 rounded-sm text-sm">
                <Filter className="mr-2 h-3.5 w-3.5 text-muted-foreground/50" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {statusOptions.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={fetchInquiries} disabled={isLoadingData} className="h-10 border-border/40 text-[11px] uppercase tracking-wider">
              <RefreshCw className={`mr-2 h-3.5 w-3.5 ${isLoadingData ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={exportToCSV} disabled={filteredInquiries.length === 0} className="h-10 border-border/40 text-[11px] uppercase tracking-wider">
              <Download className="mr-2 h-3.5 w-3.5" />
              Export
            </Button>
          </div>

          {/* Inquiry Table */}
          <Card className="bg-card/80 border-border/40 overflow-hidden">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/30 hover:bg-transparent">
                    <TableHead className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60 font-medium h-10">Date</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60 font-medium h-10">Name</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60 font-medium h-10">Contact</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60 font-medium h-10">Services</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60 font-medium h-10">Tier</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60 font-medium h-10">Status</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60 font-medium h-10 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingData ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12">
                        <RefreshCw className="h-5 w-5 animate-spin mx-auto text-accent/60" />
                      </TableCell>
                    </TableRow>
                  ) : filteredInquiries.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12 text-muted-foreground text-sm">
                        No inquiries found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredInquiries.map((inquiry) => (
                      <TableRow key={inquiry.id} className="border-border/20 hover:bg-accent/[0.03]">
                        <TableCell className="text-[11px] text-muted-foreground whitespace-nowrap">
                          {format(new Date(inquiry.created_at), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell className="text-sm font-medium">{inquiry.name}</TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-0.5">
                            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                              <Mail className="h-3 w-3" />{inquiry.email}
                            </span>
                            {inquiry.phone && (
                              <span className="flex items-center gap-1 text-[11px] text-muted-foreground/60">
                                <Phone className="h-3 w-3" />{inquiry.phone}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {inquiry.services.slice(0, 2).map((s) => (
                              <Badge key={s} variant="outline" className="text-[9px] uppercase tracking-wider border-border/40 text-muted-foreground">{s}</Badge>
                            ))}
                            {inquiry.services.length > 2 && (
                              <Badge variant="outline" className="text-[9px] border-border/40 text-muted-foreground">+{inquiry.services.length - 2}</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={`${TIER_COLORS[inquiry.lead_tier || "standard"]} text-[9px] uppercase tracking-wider`}>
                            {(inquiry.lead_tier || "standard")}
                          </Badge>
                        </TableCell>
                        <TableCell>{getStatusBadge(inquiry.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-accent" onClick={() => handleViewInquiry(inquiry)}>
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive/60 hover:text-destructive" onClick={() => setDeleteInquiry(inquiry)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* View/Edit Dialog */}
      <Dialog open={!!selectedInquiry} onOpenChange={() => setSelectedInquiry(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg">Inquiry Details</DialogTitle>
            <DialogDescription className="text-[11px]">
              Submitted {selectedInquiry && format(new Date(selectedInquiry.created_at), "MMMM d, yyyy 'at' h:mm a")}
            </DialogDescription>
          </DialogHeader>
          {selectedInquiry && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: "Name", value: selectedInquiry.name },
                  { label: "Email", value: selectedInquiry.email },
                  selectedInquiry.phone ? { label: "Phone", value: selectedInquiry.phone } : null,
                  selectedInquiry.preferred_contact ? { label: "Preferred Contact", value: selectedInquiry.preferred_contact } : null,
                ].filter(Boolean).map((item) => (
                  <div key={item!.label}>
                    <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60 mb-0.5">{item!.label}</p>
                    <p className="text-sm font-medium">{item!.value}</p>
                  </div>
                ))}
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60 mb-1">Services</p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedInquiry.services.map((s) => (
                    <Badge key={s} variant="secondary" className="text-[10px]">{s}</Badge>
                  ))}
                </div>
              </div>

              {selectedInquiry.project_vision && (
                <div>
                  <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60 mb-1">Project Vision</p>
                  <p className="text-sm text-foreground/90">{selectedInquiry.project_vision}</p>
                </div>
              )}

              {selectedInquiry.project_details && (
                <div>
                  <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60 mb-1">Project Details</p>
                  <p className="text-sm text-foreground/90">{selectedInquiry.project_details}</p>
                </div>
              )}

              {(selectedInquiry.horse_name || selectedInquiry.horse_breed || selectedInquiry.horse_age) && (
                <div>
                  <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60 mb-1">Horse Information</p>
                  <div className="grid grid-cols-3 gap-4">
                    {selectedInquiry.horse_name && <div><span className="text-[10px] text-muted-foreground">Name</span><p className="text-sm">{selectedInquiry.horse_name}</p></div>}
                    {selectedInquiry.horse_breed && <div><span className="text-[10px] text-muted-foreground">Breed</span><p className="text-sm">{selectedInquiry.horse_breed}</p></div>}
                    {selectedInquiry.horse_age && <div><span className="text-[10px] text-muted-foreground">Age</span><p className="text-sm">{selectedInquiry.horse_age}</p></div>}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {selectedInquiry.budget_range && (
                  <div><p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60 mb-0.5">Budget</p><p className="text-sm font-medium">{selectedInquiry.budget_range}</p></div>
                )}
                {selectedInquiry.preferred_start && (
                  <div><p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60 mb-0.5">Timeline</p><p className="text-sm font-medium">{selectedInquiry.preferred_start}</p></div>
                )}
                {selectedInquiry.experience_level && (
                  <div><p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60 mb-0.5">Experience</p><p className="text-sm font-medium">{selectedInquiry.experience_level}</p></div>
                )}
              </div>

              <AdminAttachmentViewer attachmentUrls={selectedInquiry.attachment_urls} />

              <div className="border-t border-border/30 pt-4 space-y-4">
                <div>
                  <Label className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60">Status</Label>
                  <Select value={editStatus} onValueChange={setEditStatus}>
                    <SelectTrigger className="mt-1 h-10 bg-background/60 border-border/50 rounded-sm text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((s) => (
                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60">Internal Notes</Label>
                  <Textarea
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder="Add notes…"
                    className="mt-1 bg-background/60 border-border/50 rounded-sm text-sm"
                    rows={3}
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedInquiry(null)} className="text-[11px] uppercase tracking-wider">Cancel</Button>
            <Button onClick={handleUpdateInquiry} className="text-[11px] uppercase tracking-wider">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteInquiry} onOpenChange={() => setDeleteInquiry(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif">Delete Inquiry</AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              Delete the inquiry from {deleteInquiry?.name}? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-[11px] uppercase tracking-wider">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteInquiry} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 text-[11px] uppercase tracking-wider">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}
