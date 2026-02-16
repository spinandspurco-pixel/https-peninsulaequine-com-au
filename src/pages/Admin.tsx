import { useState, useEffect } from "react";
import { ABTestStatsPanel } from "@/components/ABTestStatsPanel";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { 
  LogOut, 
  Eye, 
  Trash2, 
  RefreshCw, 
  Search,
  Mail,
  Phone,
  Calendar,
  Filter,
  MessageSquare,
  Users,
  Clock,
  CheckCircle,
  Download,
  Settings,
  Zap,
  Save,
  ExternalLink,
  CalendarDays,
  BarChart3,
  UserCog,
} from "lucide-react";
import { format } from "date-fns";
import logoPeMark from "@/assets/logo-pe-mark.png";

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
}

const TIER_COLORS: Record<string, string> = {
  premium: "bg-amber-500 text-white",
  high: "bg-accent text-accent-foreground",
  standard: "bg-muted text-muted-foreground",
  starter: "bg-muted text-muted-foreground",
};

const statusOptions = [
  { value: "new", label: "New", color: "bg-blue-500" },
  { value: "contacted", label: "Contacted", color: "bg-yellow-500" },
  { value: "in_progress", label: "In Progress", color: "bg-purple-500" },
  { value: "quoted", label: "Quoted", color: "bg-orange-500" },
  { value: "won", label: "Won", color: "bg-green-500" },
  { value: "lost", label: "Lost", color: "bg-red-500" },
];

function getStatusBadge(status: string) {
  const statusConfig = statusOptions.find((s) => s.value === status) || statusOptions[0];
  return (
    <Badge variant="secondary" className={`${statusConfig.color} text-white`}>
      {statusConfig.label}
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

  // Redirect if not admin
  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate("/login");
    }
  }, [user, isAdmin, loading, navigate]);

  // Fetch CRM settings
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

  // Fetch inquiries + bookings
  const fetchInquiries = async () => {
    setIsLoadingData(true);
    const [inquiryRes, bookingRes] = await Promise.all([
      supabase.from("inquiries").select("*").order("created_at", { ascending: false }),
      supabase.from("bookings").select("*").order("booking_date", { ascending: true }).limit(10),
    ]);

    if (inquiryRes.error) {
      toast.error("Failed to load inquiries");
    } else {
      setInquiries(inquiryRes.data || []);
    }
    setBookings(bookingRes.data || []);
    setIsLoadingData(false);
  };

  useEffect(() => {
    if (isAdmin) {
      fetchInquiries();
    }
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
      .update({ 
        status: editStatus, 
        notes: editNotes,
        updated_at: new Date().toISOString()
      })
      .eq("id", selectedInquiry.id);

    if (error) {
      toast.error("Failed to update inquiry");
    } else {
      toast.success("Inquiry updated");
      setSelectedInquiry(null);
      fetchInquiries();
    }
  };

  const handleDeleteInquiry = async () => {
    if (!deleteInquiry) return;

    const { error } = await supabase
      .from("inquiries")
      .delete()
      .eq("id", deleteInquiry.id);

    if (error) {
      toast.error("Failed to delete inquiry");
    } else {
      toast.success("Inquiry deleted");
      setDeleteInquiry(null);
      fetchInquiries();
    }
  };

  const handleSaveCrmSettings = async () => {
    setIsSavingCrm(true);
    try {
      if (hubspotEnabled && hubspotApiKey.trim()) {
        // Upsert the API key
        const { error } = await supabase
          .from("integration_settings")
          .upsert(
            { key: "hubspot_api_key", value: hubspotApiKey.trim(), description: "HubSpot Private App Access Token" },
            { onConflict: "key" }
          );
        if (error) throw error;
        toast.success("HubSpot CRM integration saved");
      } else {
        // Remove the key
        await supabase
          .from("integration_settings")
          .delete()
          .eq("key", "hubspot_api_key");
        setHubspotApiKey("");
        toast.success("HubSpot CRM integration disabled");
      }
    } catch (error) {
      console.error("Failed to save CRM settings:", error);
      toast.error("Failed to save CRM settings");
    } finally {
      setIsSavingCrm(false);
    }
  };

  // Filter inquiries
  const filteredInquiries = inquiries.filter((inquiry) => {
    const matchesSearch =
      inquiry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inquiry.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    
    const matchesStatus = statusFilter === "all" || inquiry.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Export to CSV
  const exportToCSV = () => {
    const headers = [
      "Date",
      "Name",
      "Email",
      "Phone",
      "Services",
      "Status",
      "Budget Range",
      "Preferred Start",
      "Preferred Contact",
      "Horse Name",
      "Horse Age",
      "Horse Breed",
      "Experience Level",
      "Project Vision",
      "Project Details",
      "Notes"
    ];

    const escapeCSV = (value: string | null | undefined): string => {
      if (value === null || value === undefined) return "";
      const stringValue = String(value);
      if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    };

    const rows = filteredInquiries.map((inquiry) => [
      format(new Date(inquiry.created_at), "yyyy-MM-dd HH:mm"),
      escapeCSV(inquiry.name),
      escapeCSV(inquiry.email),
      escapeCSV(inquiry.phone),
      escapeCSV(inquiry.services.join("; ")),
      escapeCSV(inquiry.status),
      escapeCSV(inquiry.budget_range),
      escapeCSV(inquiry.preferred_start),
      escapeCSV(inquiry.preferred_contact),
      escapeCSV(inquiry.horse_name),
      escapeCSV(inquiry.horse_age),
      escapeCSV(inquiry.horse_breed),
      escapeCSV(inquiry.experience_level),
      escapeCSV(inquiry.project_vision),
      escapeCSV(inquiry.project_details),
      escapeCSV(inquiry.notes)
    ]);

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `inquiries-${format(new Date(), "yyyy-MM-dd")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Exported ${filteredInquiries.length} inquiries to CSV`);
  };

  // Stats
  const stats = {
    total: inquiries.length,
    new: inquiries.filter((i) => i.status === "new").length,
    inProgress: inquiries.filter((i) => ["contacted", "in_progress", "quoted"].includes(i.status)).length,
    completed: inquiries.filter((i) => ["won", "lost"].includes(i.status)).length,
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <Layout>
      <div className="section-padding">
        <div className="section-container">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <img src={logoPeMark} alt="P.E" className="h-8 w-8 object-contain" />
              </div>
              <div>
                <h1 className="font-serif text-3xl font-bold text-foreground">Admin Dashboard</h1>
                <p className="text-muted-foreground text-sm mt-0.5">
                  {user?.email} · {format(new Date(), "EEEE, d MMMM")}
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Inquiries</CardDescription>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  {stats.total}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>New</CardDescription>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-blue-500" />
                  {stats.new}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>In Progress</CardDescription>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Clock className="h-5 w-5 text-yellow-500" />
                  {stats.inProgress}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Completed</CardDescription>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  {stats.completed}
                </CardTitle>
              </CardHeader>
            </Card>
          </div>

          {/* Content Management Quick Links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Link to="/admin/services">
              <Card className="hover:border-accent/40 transition-colors cursor-pointer group">
                <CardHeader className="pb-2">
                  <CardDescription>Content</CardDescription>
                  <CardTitle className="text-lg flex items-center gap-2 group-hover:text-accent transition-colors">
                    <Settings className="h-5 w-5" />
                    Manage Services
                  </CardTitle>
                </CardHeader>
              </Card>
            </Link>
            <Link to="/admin/testimonials">
              <Card className="hover:border-accent/40 transition-colors cursor-pointer group">
                <CardHeader className="pb-2">
                  <CardDescription>Content</CardDescription>
                  <CardTitle className="text-lg flex items-center gap-2 group-hover:text-accent transition-colors">
                    <MessageSquare className="h-5 w-5" />
                    Manage Testimonials
                  </CardTitle>
                </CardHeader>
              </Card>
            </Link>
            <Link to="/admin/events">
              <Card className="hover:border-accent/40 transition-colors cursor-pointer group">
                <CardHeader className="pb-2">
                  <CardDescription>Content</CardDescription>
                  <CardTitle className="text-lg flex items-center gap-2 group-hover:text-accent transition-colors">
                    <Calendar className="h-5 w-5" />
                    Manage Events
                  </CardTitle>
                </CardHeader>
              </Card>
            </Link>
            <Link to="/bookings">
              <Card className="hover:border-accent/40 transition-colors cursor-pointer group">
                <CardHeader className="pb-2">
                  <CardDescription>Operations</CardDescription>
                  <CardTitle className="text-lg flex items-center gap-2 group-hover:text-accent transition-colors">
                    <CalendarDays className="h-5 w-5" />
                    Bookings Calendar
                  </CardTitle>
                </CardHeader>
              </Card>
            </Link>
          </div>

          {/* Upcoming Bookings Preview */}
          {bookings.length > 0 && (
            <Card className="mb-8">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CalendarDays className="h-5 w-5 text-accent" />
                    Upcoming Bookings
                  </CardTitle>
                  <Link to="/bookings">
                    <Button variant="ghost" size="sm" className="text-accent">
                      View All <ExternalLink className="ml-1 h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {bookings.slice(0, 6).map((booking) => (
                    <div key={booking.id} className="p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-sm">{booking.client_name}</p>
                        <Badge variant="outline" className="text-xs">
                          {booking.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(booking.booking_date), "MMM d")}
                        {booking.booking_time && ` · ${booking.booking_time}`}
                      </p>
                      <p className="text-xs text-accent mt-0.5">{booking.service_type}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* A/B Test Stats */}
          <div className="mb-8">
            <ABTestStatsPanel />
          </div>

          {/* CRM Integration Settings */}
          <Card className="mb-8">
            <CardHeader className="cursor-pointer" onClick={() => setShowCrmSettings(!showCrmSettings)}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Zap className="h-5 w-5 text-accent" />
                  <div>
                    <CardTitle className="text-lg">CRM Integration</CardTitle>
                    <CardDescription>
                      {hubspotEnabled ? "HubSpot connected — inquiries sync automatically" : "Connect HubSpot to auto-sync leads"}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {hubspotEnabled && (
                    <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                      Active
                    </Badge>
                  )}
                  <Settings className={`h-4 w-4 text-muted-foreground transition-transform ${showCrmSettings ? "rotate-90" : ""}`} />
                </div>
              </div>
            </CardHeader>
            {showCrmSettings && (
              <CardContent className="space-y-4 border-t pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="hubspot-toggle" className="font-medium">Enable HubSpot Sync</Label>
                    <p className="text-sm text-muted-foreground">Automatically create contacts in HubSpot for every new inquiry</p>
                  </div>
                  <Switch
                    id="hubspot-toggle"
                    checked={hubspotEnabled}
                    onCheckedChange={setHubspotEnabled}
                  />
                </div>
                {hubspotEnabled && (
                  <div className="space-y-2">
                    <Label htmlFor="hubspot-key">HubSpot Private App Access Token</Label>
                    <Input
                      id="hubspot-key"
                      type="password"
                      placeholder="pat-na1-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                      value={hubspotApiKey}
                      onChange={(e) => setHubspotApiKey(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Create a Private App in HubSpot → Settings → Integrations → Private Apps. Required scopes: <code className="text-xs">crm.objects.contacts.write</code>
                    </p>
                  </div>
                )}
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    size="sm"
                    onClick={handleSaveCrmSettings}
                    disabled={isSavingCrm || (hubspotEnabled && !hubspotApiKey.trim())}
                  >
                    {isSavingCrm ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Save
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {statusOptions.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={fetchInquiries} disabled={isLoadingData}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoadingData ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button 
              variant="outline" 
              onClick={exportToCSV} 
              disabled={filteredInquiries.length === 0}
            >
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>

          {/* Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Services</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingData ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <RefreshCw className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                      </TableCell>
                    </TableRow>
                  ) : filteredInquiries.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No inquiries found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredInquiries.map((inquiry) => (
                      <TableRow key={inquiry.id}>
                        <TableCell className="whitespace-nowrap">
                          {format(new Date(inquiry.created_at), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell className="font-medium">{inquiry.name}</TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <span className="flex items-center gap-1 text-sm">
                              <Mail className="h-3 w-3" />
                              {inquiry.email}
                            </span>
                            {inquiry.phone && (
                              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Phone className="h-3 w-3" />
                                {inquiry.phone}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {inquiry.services.slice(0, 2).map((service) => (
                              <Badge key={service} variant="outline" className="text-xs">
                                {service}
                              </Badge>
                            ))}
                            {inquiry.services.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{inquiry.services.length - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={TIER_COLORS[inquiry.lead_tier || "standard"] || TIER_COLORS.standard}>
                            {(inquiry.lead_tier || "standard").charAt(0).toUpperCase() + (inquiry.lead_tier || "standard").slice(1)}
                          </Badge>
                          {inquiry.lead_tags && inquiry.lead_tags.length > 0 && (
                            <div className="flex flex-wrap gap-0.5 mt-1">
                              {inquiry.lead_tags.slice(0, 2).map((tag) => (
                                <span key={tag} className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>{getStatusBadge(inquiry.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleViewInquiry(inquiry)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteInquiry(inquiry)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
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
            <DialogTitle className="font-serif">Inquiry Details</DialogTitle>
            <DialogDescription>
              Submitted on {selectedInquiry && format(new Date(selectedInquiry.created_at), "MMMM d, yyyy 'at' h:mm a")}
            </DialogDescription>
          </DialogHeader>
          
          {selectedInquiry && (
            <div className="space-y-6">
              {/* Contact Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Name</label>
                  <p className="font-medium">{selectedInquiry.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="font-medium">{selectedInquiry.email}</p>
                </div>
                {selectedInquiry.phone && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Phone</label>
                    <p className="font-medium">{selectedInquiry.phone}</p>
                  </div>
                )}
                {selectedInquiry.preferred_contact && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Preferred Contact</label>
                    <p className="font-medium capitalize">{selectedInquiry.preferred_contact}</p>
                  </div>
                )}
              </div>

              {/* Services */}
              <div>
                <label className="text-sm font-medium text-muted-foreground">Services Requested</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {selectedInquiry.services.map((service) => (
                    <Badge key={service} variant="secondary">
                      {service}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Project Details */}
              {selectedInquiry.project_vision && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Project Vision</label>
                  <p className="mt-1 text-foreground">{selectedInquiry.project_vision}</p>
                </div>
              )}
              
              {selectedInquiry.project_details && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Project Details</label>
                  <p className="mt-1 text-foreground">{selectedInquiry.project_details}</p>
                </div>
              )}

              {/* Horse Info */}
              {(selectedInquiry.horse_name || selectedInquiry.horse_breed || selectedInquiry.horse_age) && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Horse Information</label>
                  <div className="grid grid-cols-3 gap-4 mt-1">
                    {selectedInquiry.horse_name && (
                      <div>
                        <span className="text-xs text-muted-foreground">Name</span>
                        <p>{selectedInquiry.horse_name}</p>
                      </div>
                    )}
                    {selectedInquiry.horse_breed && (
                      <div>
                        <span className="text-xs text-muted-foreground">Breed</span>
                        <p>{selectedInquiry.horse_breed}</p>
                      </div>
                    )}
                    {selectedInquiry.horse_age && (
                      <div>
                        <span className="text-xs text-muted-foreground">Age</span>
                        <p>{selectedInquiry.horse_age}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Budget & Timeline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {selectedInquiry.budget_range && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Budget Range</label>
                    <p className="font-medium">{selectedInquiry.budget_range}</p>
                  </div>
                )}
                {selectedInquiry.preferred_start && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Preferred Start</label>
                    <p className="font-medium">{selectedInquiry.preferred_start}</p>
                  </div>
                )}
                {selectedInquiry.experience_level && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Experience Level</label>
                    <p className="font-medium">{selectedInquiry.experience_level}</p>
                  </div>
                )}
              </div>

              {/* Status & Notes (Editable) */}
              <div className="border-t pt-4 space-y-4">
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Select value={editStatus} onValueChange={setEditStatus}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Internal Notes</label>
                  <Textarea
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder="Add notes about this inquiry..."
                    className="mt-1"
                    rows={3}
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedInquiry(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateInquiry}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteInquiry} onOpenChange={() => setDeleteInquiry(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Inquiry</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the inquiry from {deleteInquiry?.name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteInquiry} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}
