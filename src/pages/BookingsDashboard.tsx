import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Layout } from "@/components/layout/Layout";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  RefreshCw, Search, Filter, Calendar, Clock, CheckCircle, AlertTriangle,
  Plus, Eye, Trash2, Bell, BellRing, Users, ArrowRight, CalendarDays,
} from "lucide-react";
import { format, isAfter, isBefore, addDays, startOfToday, parseISO } from "date-fns";

// ── Types ───────────────────────────────────────────

interface Inquiry {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string | null;
  services: string[];
  status: string;
  notes: string | null;
  budget_range: string | null;
  preferred_start: string | null;
}

interface Booking {
  id: string;
  inquiry_id: string | null;
  client_name: string;
  client_email: string;
  client_phone: string | null;
  service_type: string;
  booking_date: string;
  booking_time: string | null;
  duration_minutes: number;
  status: string;
  assigned_to: string | null;
  notes: string | null;
  reminder_sent: boolean;
  reminder_at: string | null;
  created_at: string;
  updated_at: string;
}

// ── Status configs ──────────────────────────────────

const inquiryStatuses = [
  { value: "new", label: "New", color: "bg-blue-500" },
  { value: "contacted", label: "Contacted", color: "bg-yellow-500" },
  { value: "in_progress", label: "In Progress", color: "bg-purple-500" },
  { value: "quoted", label: "Quoted", color: "bg-orange-500" },
  { value: "won", label: "Won", color: "bg-green-500" },
  { value: "lost", label: "Lost", color: "bg-red-500" },
];

const bookingStatuses = [
  { value: "confirmed", label: "Confirmed", color: "bg-green-500" },
  { value: "pending", label: "Pending", color: "bg-yellow-500" },
  { value: "completed", label: "Completed", color: "bg-blue-500" },
  { value: "cancelled", label: "Cancelled", color: "bg-red-500" },
  { value: "no_show", label: "No Show", color: "bg-gray-500" },
];

function StatusBadge({ status, configs }: { status: string; configs: typeof inquiryStatuses }) {
  const cfg = configs.find((s) => s.value === status) || configs[0];
  return (
    <Badge variant="secondary" className={`${cfg.color} text-white text-xs`}>
      {cfg.label}
    </Badge>
  );
}

// ── Booking Form Dialog ─────────────────────────────

interface BookingFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  initial?: Partial<Booking>;
  inquiry?: Inquiry | null;
}

function BookingFormDialog({ open, onClose, onSaved, initial, inquiry }: BookingFormProps) {
  const [form, setForm] = useState({
    client_name: initial?.client_name || inquiry?.name || "",
    client_email: initial?.client_email || inquiry?.email || "",
    client_phone: initial?.client_phone || inquiry?.phone || "",
    service_type: initial?.service_type || inquiry?.services?.[0] || "",
    booking_date: initial?.booking_date || format(addDays(new Date(), 1), "yyyy-MM-dd"),
    booking_time: initial?.booking_time || "09:00",
    duration_minutes: initial?.duration_minutes || 60,
    status: initial?.status || "confirmed",
    notes: initial?.notes || "",
    reminder_at: initial?.reminder_at
      ? format(parseISO(initial.reminder_at), "yyyy-MM-dd'T'HH:mm")
      : "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm({
        client_name: initial?.client_name || inquiry?.name || "",
        client_email: initial?.client_email || inquiry?.email || "",
        client_phone: initial?.client_phone || inquiry?.phone || "",
        service_type: initial?.service_type || inquiry?.services?.[0] || "",
        booking_date: initial?.booking_date || format(addDays(new Date(), 1), "yyyy-MM-dd"),
        booking_time: initial?.booking_time || "09:00",
        duration_minutes: initial?.duration_minutes || 60,
        status: initial?.status || "confirmed",
        notes: initial?.notes || "",
        reminder_at: initial?.reminder_at
          ? format(parseISO(initial.reminder_at), "yyyy-MM-dd'T'HH:mm")
          : "",
      });
    }
  }, [open, initial, inquiry]);

  const handleSave = async () => {
    if (!form.client_name || !form.client_email || !form.service_type || !form.booking_date) {
      toast.error("Please fill in all required fields");
      return;
    }
    setSaving(true);
    const payload = {
      client_name: form.client_name,
      client_email: form.client_email,
      client_phone: form.client_phone || null,
      service_type: form.service_type,
      booking_date: form.booking_date,
      booking_time: form.booking_time || null,
      duration_minutes: form.duration_minutes,
      status: form.status,
      notes: form.notes || null,
      reminder_at: form.reminder_at ? new Date(form.reminder_at).toISOString() : null,
      inquiry_id: inquiry?.id || initial?.inquiry_id || null,
    };

    let error;
    if (initial?.id) {
      ({ error } = await supabase.from("bookings").update(payload).eq("id", initial.id));
    } else {
      ({ error } = await supabase.from("bookings").insert(payload));
    }

    if (error) {
      toast.error("Failed to save booking");
      console.error(error);
    } else {
      toast.success(initial?.id ? "Booking updated" : "Booking created");
      onSaved();
      onClose();
    }
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initial?.id ? "Edit Booking" : "New Booking"}</DialogTitle>
          <DialogDescription>
            {inquiry ? `Converting inquiry from ${inquiry.name}` : "Create a new confirmed booking"}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Client Name *</Label>
              <Input value={form.client_name} onChange={(e) => setForm({ ...form, client_name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input type="email" value={form.client_email} onChange={(e) => setForm({ ...form, client_email: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={form.client_phone || ""} onChange={(e) => setForm({ ...form, client_phone: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Service Type *</Label>
              <Input placeholder="e.g. Private Lesson" value={form.service_type} onChange={(e) => setForm({ ...form, service_type: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Date *</Label>
              <Input type="date" value={form.booking_date} onChange={(e) => setForm({ ...form, booking_date: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Time</Label>
              <Input type="time" value={form.booking_time} onChange={(e) => setForm({ ...form, booking_time: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Duration (min)</Label>
              <Input type="number" value={form.duration_minutes} onChange={(e) => setForm({ ...form, duration_minutes: parseInt(e.target.value) || 60 })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {bookingStatuses.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Reminder At</Label>
              <Input
                type="datetime-local"
                value={form.reminder_at}
                onChange={(e) => setForm({ ...form, reminder_at: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea rows={3} value={form.notes || ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
            {initial?.id ? "Update" : "Create"} Booking
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Main Dashboard ──────────────────────────────────

export default function BookingsDashboard() {
  const { user, isAdmin, isEmployee, loading } = useAuth();
  const navigate = useNavigate();

  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [bookingStatusFilter, setBookingStatusFilter] = useState("all");

  // Dialogs
  const [bookingForm, setBookingForm] = useState<{ open: boolean; booking?: Booking; inquiry?: Inquiry | null }>({ open: false });
  const [viewInquiry, setViewInquiry] = useState<Inquiry | null>(null);
  const [deleteBooking, setDeleteBooking] = useState<Booking | null>(null);

  useEffect(() => {
    if (!loading && !user) navigate("/login");
    if (!loading && user && !isAdmin && !isEmployee) navigate("/login");
  }, [user, isAdmin, isEmployee, loading, navigate]);

  const fetchData = useCallback(async () => {
    setLoadingData(true);
    const [inquiryRes, bookingRes] = await Promise.all([
      isAdmin
        ? supabase.from("inquiries").select("id, created_at, name, email, phone, services, status, notes, budget_range, preferred_start").order("created_at", { ascending: false })
        : Promise.resolve({ data: [], error: null }),
      supabase.from("bookings").select("*").order("booking_date", { ascending: true }),
    ]);

    if (inquiryRes.error) console.error("Inquiries:", inquiryRes.error);
    if (bookingRes.error) console.error("Bookings:", bookingRes.error);

    setInquiries((inquiryRes.data as Inquiry[]) || []);
    setBookings((bookingRes.data as Booking[]) || []);
    setLoadingData(false);
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin || isEmployee) fetchData();
  }, [isAdmin, isEmployee, fetchData]);

  // Realtime for bookings
  useEffect(() => {
    const channel = supabase
      .channel("bookings-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, () => {
        fetchData();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchData]);

  const handleDeleteBooking = async () => {
    if (!deleteBooking) return;
    const { error } = await supabase.from("bookings").delete().eq("id", deleteBooking.id);
    if (error) toast.error("Failed to delete booking");
    else { toast.success("Booking deleted"); setDeleteBooking(null); fetchData(); }
  };

  const handleConvertInquiry = (inquiry: Inquiry) => {
    setBookingForm({ open: true, inquiry });
  };

  // ── Computed ──────────────────────────────────────

  const today = startOfToday();

  const filteredInquiries = inquiries.filter((i) => {
    const matchSearch = i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || i.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const filteredBookings = bookings.filter((b) => {
    const matchSearch = b.client_name.toLowerCase().includes(search.toLowerCase()) ||
      b.client_email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = bookingStatusFilter === "all" || b.status === bookingStatusFilter;
    return matchSearch && matchStatus;
  });

  const upcomingBookings = bookings.filter(
    (b) => b.status === "confirmed" && isAfter(parseISO(b.booking_date), addDays(today, -1))
  );
  const overdueReminders = bookings.filter(
    (b) => b.reminder_at && !b.reminder_sent && isBefore(parseISO(b.reminder_at), new Date())
  );
  const todayBookings = bookings.filter(
    (b) => b.booking_date === format(today, "yyyy-MM-dd") && b.status !== "cancelled"
  );

  const stats = {
    totalInquiries: inquiries.length,
    newInquiries: inquiries.filter((i) => i.status === "new").length,
    totalBookings: bookings.length,
    upcomingCount: upcomingBookings.length,
    todayCount: todayBookings.length,
    overdueReminders: overdueReminders.length,
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

  if (!isAdmin && !isEmployee) return null;

  return (
    <Layout>
      <PageHeader
        title="Bookings Dashboard"
        description="Track inquiries, manage bookings, and stay on top of reminders."
        dividerVariant="grid"
      />

      <section className="section-padding">
        <div className="section-container">
          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            {isAdmin && (
              <>
                <Card>
                  <CardHeader className="pb-2 pt-4 px-4">
                    <CardDescription className="text-xs">Inquiries</CardDescription>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      {stats.totalInquiries}
                    </CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-2 pt-4 px-4">
                    <CardDescription className="text-xs">New Leads</CardDescription>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-blue-500" />
                      {stats.newInquiries}
                    </CardTitle>
                  </CardHeader>
                </Card>
              </>
            )}
            <Card>
              <CardHeader className="pb-2 pt-4 px-4">
                <CardDescription className="text-xs">Total Bookings</CardDescription>
                <CardTitle className="text-xl flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-accent" />
                  {stats.totalBookings}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2 pt-4 px-4">
                <CardDescription className="text-xs">Today</CardDescription>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-green-500" />
                  {stats.todayCount}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2 pt-4 px-4">
                <CardDescription className="text-xs">Upcoming</CardDescription>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Clock className="h-4 w-4 text-purple-500" />
                  {stats.upcomingCount}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card className={stats.overdueReminders > 0 ? "border-destructive/50" : ""}>
              <CardHeader className="pb-2 pt-4 px-4">
                <CardDescription className="text-xs">Due Reminders</CardDescription>
                <CardTitle className="text-xl flex items-center gap-2">
                  <BellRing className={`h-4 w-4 ${stats.overdueReminders > 0 ? "text-destructive" : "text-muted-foreground"}`} />
                  {stats.overdueReminders}
                </CardTitle>
              </CardHeader>
            </Card>
          </div>

          {/* Search + Actions */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            {isAdmin && (
              <Button onClick={() => setBookingForm({ open: true })}>
                <Plus className="mr-2 h-4 w-4" />
                New Booking
              </Button>
            )}
            <Button variant="outline" onClick={fetchData} disabled={loadingData}>
              <RefreshCw className={`mr-2 h-4 w-4 ${loadingData ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>

          {/* Tabs */}
          <Tabs defaultValue={isAdmin ? "inquiries" : "bookings"} className="space-y-6">
            <TabsList>
              {isAdmin && <TabsTrigger value="inquiries">Inquiry Pipeline</TabsTrigger>}
              <TabsTrigger value="bookings">Confirmed Bookings</TabsTrigger>
              <TabsTrigger value="reminders">
                Reminders
                {stats.overdueReminders > 0 && (
                  <span className="ml-1.5 bg-destructive text-destructive-foreground text-[10px] px-1.5 py-0.5 rounded-full">
                    {stats.overdueReminders}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            {/* ── Inquiry Pipeline ──────────────────── */}
            {isAdmin && (
              <TabsContent value="inquiries" className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      {inquiryStatuses.map((s) => (
                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="rounded-lg border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Services</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredInquiries.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                            No inquiries found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredInquiries.map((inq) => (
                          <TableRow key={inq.id}>
                            <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                              {format(new Date(inq.created_at), "MMM d, yyyy")}
                            </TableCell>
                            <TableCell>
                              <div className="font-medium text-sm">{inq.name}</div>
                              <div className="text-xs text-muted-foreground">{inq.email}</div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {inq.services.slice(0, 2).map((s) => (
                                  <Badge key={s} variant="outline" className="text-[10px]">{s}</Badge>
                                ))}
                                {inq.services.length > 2 && (
                                  <Badge variant="outline" className="text-[10px]">+{inq.services.length - 2}</Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <StatusBadge status={inq.status} configs={inquiryStatuses} />
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center gap-1 justify-end">
                                <Button size="sm" variant="ghost" onClick={() => setViewInquiry(inq)}>
                                  <Eye className="h-3.5 w-3.5" />
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => handleConvertInquiry(inq)} title="Convert to booking">
                                  <ArrowRight className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            )}

            {/* ── Confirmed Bookings ────────────────── */}
            <TabsContent value="bookings" className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={bookingStatusFilter} onValueChange={setBookingStatusFilter}>
                  <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    {bookingStatuses.map((s) => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-lg border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date / Time</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Reminder</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBookings.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No bookings found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredBookings.map((bk) => {
                        const isPast = isBefore(parseISO(bk.booking_date), today);
                        return (
                          <TableRow key={bk.id} className={isPast && bk.status === "confirmed" ? "opacity-60" : ""}>
                            <TableCell className="whitespace-nowrap">
                              <div className="text-sm font-medium">
                                {format(parseISO(bk.booking_date), "MMM d, yyyy")}
                              </div>
                              {bk.booking_time && (
                                <div className="text-xs text-muted-foreground">{bk.booking_time} · {bk.duration_minutes}min</div>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="font-medium text-sm">{bk.client_name}</div>
                              <div className="text-xs text-muted-foreground">{bk.client_email}</div>
                            </TableCell>
                            <TableCell className="text-sm">{bk.service_type}</TableCell>
                            <TableCell>
                              <StatusBadge status={bk.status} configs={bookingStatuses} />
                            </TableCell>
                            <TableCell>
                              {bk.reminder_sent ? (
                                <Badge variant="outline" className="text-[10px] text-green-600">
                                  <CheckCircle className="h-3 w-3 mr-1" /> Sent
                                </Badge>
                              ) : bk.reminder_at ? (
                                <Badge variant="outline" className="text-[10px]">
                                  <Bell className="h-3 w-3 mr-1" />
                                  {format(parseISO(bk.reminder_at), "MMM d")}
                                </Badge>
                              ) : (
                                <span className="text-xs text-muted-foreground">—</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center gap-1 justify-end">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setBookingForm({ open: true, booking: bk })}
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                </Button>
                                {isAdmin && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-destructive"
                                    onClick={() => setDeleteBooking(bk)}
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* ── Reminders ─────────────────────────── */}
            <TabsContent value="reminders" className="space-y-4">
              {overdueReminders.length > 0 && (
                <Card className="border-destructive/40 bg-destructive/5">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2 text-destructive">
                      <BellRing className="h-4 w-4" />
                      Overdue Reminders
                    </CardTitle>
                    <CardDescription>These reminders are past due and haven't been sent yet.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {overdueReminders.map((bk) => (
                      <div key={bk.id} className="flex items-center justify-between rounded-md bg-background p-3 border">
                        <div>
                          <span className="font-medium text-sm">{bk.client_name}</span>
                          <span className="text-muted-foreground text-sm"> — {bk.service_type}</span>
                          <div className="text-xs text-muted-foreground">
                            Booking: {format(parseISO(bk.booking_date), "MMM d, yyyy")}
                            {bk.reminder_at && ` · Reminder due: ${format(parseISO(bk.reminder_at), "MMM d, h:mm a")}`}
                          </div>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => setBookingForm({ open: true, booking: bk })}>
                          View
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Upcoming reminders */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Bell className="h-4 w-4 text-accent" />
                    Upcoming Reminders
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {bookings.filter((b) => b.reminder_at && !b.reminder_sent && isAfter(parseISO(b.reminder_at), new Date())).length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">No upcoming reminders scheduled.</p>
                  ) : (
                    <div className="space-y-2">
                      {bookings
                        .filter((b) => b.reminder_at && !b.reminder_sent && isAfter(parseISO(b.reminder_at), new Date()))
                        .sort((a, b) => new Date(a.reminder_at!).getTime() - new Date(b.reminder_at!).getTime())
                        .map((bk) => (
                          <div key={bk.id} className="flex items-center justify-between rounded-md p-3 border">
                            <div>
                              <span className="font-medium text-sm">{bk.client_name}</span>
                              <span className="text-muted-foreground text-sm"> — {bk.service_type}</span>
                              <div className="text-xs text-muted-foreground">
                                {format(parseISO(bk.reminder_at!), "MMM d, yyyy 'at' h:mm a")}
                              </div>
                            </div>
                            <Badge variant="outline" className="text-[10px]">Scheduled</Badge>
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Booking Form Dialog */}
      <BookingFormDialog
        open={bookingForm.open}
        onClose={() => setBookingForm({ open: false })}
        onSaved={fetchData}
        initial={bookingForm.booking}
        inquiry={bookingForm.inquiry}
      />

      {/* View Inquiry Dialog */}
      <Dialog open={!!viewInquiry} onOpenChange={(v) => !v && setViewInquiry(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{viewInquiry?.name}</DialogTitle>
            <DialogDescription>{viewInquiry?.email}</DialogDescription>
          </DialogHeader>
          {viewInquiry && (
            <div className="space-y-3 text-sm">
              {viewInquiry.phone && <div><strong>Phone:</strong> {viewInquiry.phone}</div>}
              <div><strong>Services:</strong> {viewInquiry.services.join(", ")}</div>
              <div><strong>Status:</strong> <StatusBadge status={viewInquiry.status} configs={inquiryStatuses} /></div>
              {viewInquiry.budget_range && <div><strong>Budget:</strong> {viewInquiry.budget_range}</div>}
              {viewInquiry.preferred_start && <div><strong>Preferred Start:</strong> {viewInquiry.preferred_start}</div>}
              {viewInquiry.notes && <div><strong>Notes:</strong> {viewInquiry.notes}</div>}
              <div className="text-xs text-muted-foreground">
                Submitted {format(new Date(viewInquiry.created_at), "MMM d, yyyy 'at' h:mm a")}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewInquiry(null)}>Close</Button>
            <Button onClick={() => { handleConvertInquiry(viewInquiry!); setViewInquiry(null); }}>
              <ArrowRight className="mr-2 h-4 w-4" />
              Convert to Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteBooking} onOpenChange={(v) => !v && setDeleteBooking(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Booking?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the booking for {deleteBooking?.client_name}. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteBooking} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}
