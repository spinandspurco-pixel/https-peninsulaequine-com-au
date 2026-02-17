import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  BookOpen,
  Mail,
  Phone,
  Search,
  Filter,
  RefreshCw,
  Eye,
  CalendarDays,
  Clock,
  Users,
  MessageSquare,
  CheckCircle,
} from "lucide-react";

interface Booking {
  id: string;
  client_name: string;
  client_email: string;
  client_phone: string | null;
  service_type: string;
  booking_date: string;
  booking_time: string | null;
  duration_minutes: number | null;
  status: string;
  notes: string | null;
}

interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  services: string[];
  status: string;
  created_at: string;
  experience_level: string | null;
  horse_name: string | null;
  notes: string | null;
}

const LESSON_SERVICES = ["riding-lessons", "lesson", "clinic", "clinics-events"];

const bookingStatusOptions = [
  { value: "confirmed", label: "Confirmed" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "no-show", label: "No Show" },
];

const inquiryStatusOptions = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "in_progress", label: "In Progress" },
  { value: "qualified", label: "Qualified" },
  { value: "won", label: "Won" },
  { value: "lost", label: "Lost" },
];

function statusBadgeVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  const map: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    confirmed: "default",
    completed: "secondary",
    cancelled: "destructive",
    "no-show": "destructive",
    new: "default",
    contacted: "secondary",
    in_progress: "outline",
    qualified: "outline",
    won: "secondary",
    lost: "destructive",
  };
  return map[status] || "outline";
}

function formatTime(time: string | null) {
  if (!time) return "";
  const [h, m] = time.split(":");
  const hour = parseInt(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${m} ${ampm}`;
}

export function AdminTrainerPanel() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingSearch, setBookingSearch] = useState("");
  const [bookingStatusFilter, setBookingStatusFilter] = useState("all");
  const [inquirySearch, setInquirySearch] = useState("");
  const [inquiryStatusFilter, setInquiryStatusFilter] = useState("all");

  // Quick-action dialog state
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [editBookingStatus, setEditBookingStatus] = useState("");
  const [editBookingNotes, setEditBookingNotes] = useState("");
  const [editingInquiry, setEditingInquiry] = useState<Inquiry | null>(null);
  const [editInquiryStatus, setEditInquiryStatus] = useState("");
  const [editInquiryNotes, setEditInquiryNotes] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [bookingsRes, inquiriesRes] = await Promise.all([
      supabase
        .from("bookings")
        .select("*")
        .in("service_type", LESSON_SERVICES)
        .order("booking_date", { ascending: false })
        .limit(100),
      supabase
        .from("inquiries")
        .select("*")
        .overlaps("services", ["riding-lessons", "clinics-events"])
        .order("created_at", { ascending: false })
        .limit(100),
    ]);
    setBookings(bookingsRes.data || []);
    setInquiries(inquiriesRes.data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filtered data
  const filteredBookings = bookings.filter((b) => {
    const matchSearch =
      b.client_name.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.client_email.toLowerCase().includes(bookingSearch.toLowerCase());
    const matchStatus = bookingStatusFilter === "all" || b.status === bookingStatusFilter;
    return matchSearch && matchStatus;
  });

  const filteredInquiries = inquiries.filter((i) => {
    const matchSearch =
      i.name.toLowerCase().includes(inquirySearch.toLowerCase()) ||
      i.email.toLowerCase().includes(inquirySearch.toLowerCase());
    const matchStatus = inquiryStatusFilter === "all" || i.status === inquiryStatusFilter;
    return matchSearch && matchStatus;
  });

  // Stats
  const upcomingBookings = bookings.filter((b) => b.status === "confirmed").length;
  const newInquiries = inquiries.filter((i) => i.status === "new").length;

  // Quick actions
  const openBookingEdit = (booking: Booking) => {
    setEditingBooking(booking);
    setEditBookingStatus(booking.status);
    setEditBookingNotes(booking.notes || "");
  };

  const saveBooking = async () => {
    if (!editingBooking) return;
    const { error } = await supabase
      .from("bookings")
      .update({ status: editBookingStatus, notes: editBookingNotes, updated_at: new Date().toISOString() })
      .eq("id", editingBooking.id);
    if (error) toast.error("Failed to update booking");
    else { toast.success("Booking updated"); setEditingBooking(null); fetchData(); }
  };

  const openInquiryEdit = (inquiry: Inquiry) => {
    setEditingInquiry(inquiry);
    setEditInquiryStatus(inquiry.status);
    setEditInquiryNotes(inquiry.notes || "");
  };

  const saveInquiry = async () => {
    if (!editingInquiry) return;
    const { error } = await supabase
      .from("inquiries")
      .update({ status: editInquiryStatus, notes: editInquiryNotes, updated_at: new Date().toISOString() })
      .eq("id", editingInquiry.id);
    if (error) toast.error("Failed to update inquiry");
    else { toast.success("Inquiry updated"); setEditingInquiry(null); fetchData(); }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-accent" />
              Glenn's Trainer Pipeline
            </CardTitle>
            <CardDescription>Lesson & clinic bookings and inquiries</CardDescription>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-2 text-sm">
              <Badge variant="outline" className="gap-1">
                <CalendarDays className="h-3 w-3" /> {upcomingBookings} confirmed
              </Badge>
              <Badge variant="outline" className="gap-1 border-accent/30 text-accent">
                <MessageSquare className="h-3 w-3" /> {newInquiries} new
              </Badge>
            </div>
            <Button variant="outline" size="icon" onClick={fetchData} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="bookings" className="space-y-4">
          <TabsList>
            <TabsTrigger value="bookings" className="gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" />
              Bookings
              {upcomingBookings > 0 && <Badge variant="secondary" className="ml-1 text-xs">{upcomingBookings}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="inquiries" className="gap-1.5">
              <Mail className="h-3.5 w-3.5" />
              Inquiries
              {newInquiries > 0 && <Badge variant="destructive" className="ml-1 text-xs">{newInquiries}</Badge>}
            </TabsTrigger>
          </TabsList>

          {/* Bookings Tab */}
          <TabsContent value="bookings">
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search client name or email..."
                  value={bookingSearch}
                  onChange={(e) => setBookingSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={bookingStatusFilter} onValueChange={setBookingStatusFilter}>
                <SelectTrigger className="w-full sm:w-[160px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {bookingStatusOptions.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <div className="text-3xl mb-2">📅</div>
                <p className="text-sm">No lesson bookings match your filters.</p>
              </div>
            ) : (
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBookings.map((b) => (
                      <TableRow key={b.id}>
                        <TableCell className="whitespace-nowrap">
                          <div className="text-sm font-medium">{format(new Date(b.booking_date), "MMM d, yyyy")}</div>
                          {b.booking_time && <div className="text-xs text-muted-foreground">{formatTime(b.booking_time)}</div>}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-sm">{b.client_name}</div>
                          <div className="flex gap-2 text-xs text-muted-foreground mt-0.5">
                            <a href={`mailto:${b.client_email}`} className="hover:text-accent flex items-center gap-0.5">
                              <Mail className="h-3 w-3" />{b.client_email}
                            </a>
                            {b.client_phone && (
                              <a href={`tel:${b.client_phone}`} className="hover:text-accent flex items-center gap-0.5">
                                <Phone className="h-3 w-3" />{b.client_phone}
                              </a>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs capitalize">
                            {b.service_type.replace(/-/g, " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusBadgeVariant(b.status)} className="text-xs capitalize">
                            {b.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => openBookingEdit(b)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          {/* Inquiries Tab */}
          <TabsContent value="inquiries">
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search name or email..."
                  value={inquirySearch}
                  onChange={(e) => setInquirySearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={inquiryStatusFilter} onValueChange={setInquiryStatusFilter}>
                <SelectTrigger className="w-full sm:w-[160px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {inquiryStatusOptions.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredInquiries.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <div className="text-3xl mb-2">✉️</div>
                <p className="text-sm">No lesson inquiries match your filters.</p>
              </div>
            ) : (
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Services</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInquiries.map((i) => (
                      <TableRow key={i.id}>
                        <TableCell className="whitespace-nowrap text-sm">
                          {format(new Date(i.created_at), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-sm">{i.name}</div>
                          <div className="flex gap-2 text-xs text-muted-foreground mt-0.5">
                            <a href={`mailto:${i.email}`} className="hover:text-accent flex items-center gap-0.5">
                              <Mail className="h-3 w-3" />{i.email}
                            </a>
                            {i.phone && (
                              <a href={`tel:${i.phone}`} className="hover:text-accent flex items-center gap-0.5">
                                <Phone className="h-3 w-3" />{i.phone}
                              </a>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {i.services.map((s) => (
                              <Badge key={s} variant="outline" className="text-xs capitalize">
                                {s.replace(/-/g, " ")}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs text-muted-foreground space-y-0.5">
                            {i.experience_level && <div>Level: {i.experience_level}</div>}
                            {i.horse_name && <div>🐴 {i.horse_name}</div>}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusBadgeVariant(i.status)} className="text-xs capitalize">
                            {i.status.replace(/_/g, " ")}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => openInquiryEdit(i)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>

      {/* Booking Edit Dialog */}
      <Dialog open={!!editingBooking} onOpenChange={() => setEditingBooking(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif">Booking Details</DialogTitle>
          </DialogHeader>
          {editingBooking && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Client</span><p className="font-medium">{editingBooking.client_name}</p></div>
                <div><span className="text-muted-foreground">Date</span><p className="font-medium">{format(new Date(editingBooking.booking_date), "MMM d, yyyy")}</p></div>
                <div><span className="text-muted-foreground">Email</span><p className="font-medium">{editingBooking.client_email}</p></div>
                <div><span className="text-muted-foreground">Service</span><p className="font-medium capitalize">{editingBooking.service_type.replace(/-/g, " ")}</p></div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={editBookingStatus} onValueChange={setEditBookingStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {bookingStatusOptions.map((s) => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Notes</label>
                <Textarea value={editBookingNotes} onChange={(e) => setEditBookingNotes(e.target.value)} rows={3} placeholder="Internal notes..." />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingBooking(null)}>Cancel</Button>
            <Button onClick={saveBooking}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Inquiry Edit Dialog */}
      <Dialog open={!!editingInquiry} onOpenChange={() => setEditingInquiry(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif">Inquiry Details</DialogTitle>
          </DialogHeader>
          {editingInquiry && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Name</span><p className="font-medium">{editingInquiry.name}</p></div>
                <div><span className="text-muted-foreground">Email</span><p className="font-medium">{editingInquiry.email}</p></div>
                {editingInquiry.phone && <div><span className="text-muted-foreground">Phone</span><p className="font-medium">{editingInquiry.phone}</p></div>}
                {editingInquiry.experience_level && <div><span className="text-muted-foreground">Level</span><p className="font-medium">{editingInquiry.experience_level}</p></div>}
                {editingInquiry.horse_name && <div><span className="text-muted-foreground">Horse</span><p className="font-medium">{editingInquiry.horse_name}</p></div>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={editInquiryStatus} onValueChange={setEditInquiryStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {inquiryStatusOptions.map((s) => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Notes</label>
                <Textarea value={editInquiryNotes} onChange={(e) => setEditInquiryNotes(e.target.value)} rows={3} placeholder="Internal notes..." />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingInquiry(null)}>Cancel</Button>
            <Button onClick={saveInquiry}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
