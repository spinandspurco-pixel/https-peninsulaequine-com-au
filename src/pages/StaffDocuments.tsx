import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  FileText,
  DollarSign,
  HardHat,
  ClipboardCheck,
  Send,
  Loader2,
  AlertCircle,
  Plus,
  ShieldCheck,
  FileWarning,
  ClipboardList,
  AlertTriangle,
  Heart,
} from "lucide-react";
import { format } from "date-fns";
import { DailySiteReportForm } from "@/components/forms/DailySiteReportForm";
import { IncidentReportForm } from "@/components/forms/IncidentReportForm";
import { HorseCareLogForm } from "@/components/forms/HorseCareLogForm";

// Re-export from shared utility for backward compatibility
export { exportDocumentAsPDF, DOC_TYPES } from "@/lib/documentUtils";
import { exportDocumentAsPDF, DOC_TYPES, type DocType } from "@/lib/documentUtils";

// ── SWMS Hazard Presets ──────────────────────────────
const SWMS_HAZARDS = [
  { hazard: "Working at heights", control: "Use scaffolding, harness. Exclusion zones below.", risk: "high" },
  { hazard: "Heavy machinery / plant", control: "Licenced operators only. Spotters in place. Hi-vis required.", risk: "high" },
  { hazard: "Manual handling", control: "Team lifts for >20 kg. Mechanical aids available.", risk: "medium" },
  { hazard: "Electrical hazards", control: "RCDs on all equipment. Lockout/tagout. Licensed electrician.", risk: "high" },
  { hazard: "Excavation / trenching", control: "Locate underground services. Shore trenches >1.5 m.", risk: "high" },
  { hazard: "Dust / airborne particles", control: "P2 masks. Wet-cutting. Dust suppression.", risk: "medium" },
  { hazard: "Hot works (welding/grinding)", control: "Fire extinguisher nearby. Hot work permit. Clear combustibles.", risk: "high" },
  { hazard: "Noise exposure", control: "Hearing protection >85 dB. Signage in noisy areas.", risk: "medium" },
  { hazard: "Slips, trips, falls", control: "Housekeeping. Clear walkways. Non-slip footwear.", risk: "low" },
  { hazard: "Working near horses / livestock", control: "Calm approach. Designated horse-free zones. Experienced handler.", risk: "medium" },
  { hazard: "UV / heat exposure", control: "SPF 50+. Hydration breaks. Shade where possible.", risk: "medium" },
  { hazard: "Confined spaces", control: "Atmosphere testing. Buddy system. Rescue plan.", risk: "high" },
];

// ── Form Components ──────────────────────────────
function SWMSForm({ onSubmit, loading, defaults }: { onSubmit: (data: any) => void; loading: boolean; defaults?: { project_name: string; site_address: string } }) {
  const [form, setForm] = useState({
    project_name: defaults?.project_name || "",
    site_address: defaults?.site_address || "",
    date: format(new Date(), "yyyy-MM-dd"),
    principal_contractor: "Peninsula Equine",
    prepared_by: "",
    work_description: "",
    selected_hazards: [] as number[],
    custom_hazards: [{ hazard: "", control: "", risk: "medium" }],
    ppe_required: ["hard_hat", "hi_vis", "steel_cap_boots"],
    emergency_contact: "000",
    first_aid_location: "",
    sign_off_name: "",
    sign_off_agreed: false,
  });

  const PPE_OPTIONS = [
    { id: "hard_hat", label: "Hard Hat" },
    { id: "hi_vis", label: "Hi-Vis Vest" },
    { id: "steel_cap_boots", label: "Steel Cap Boots" },
    { id: "safety_glasses", label: "Safety Glasses" },
    { id: "hearing_protection", label: "Hearing Protection" },
    { id: "gloves", label: "Gloves" },
    { id: "dust_mask", label: "Dust Mask / P2" },
    { id: "sun_protection", label: "Sun Protection" },
    { id: "harness", label: "Fall Harness" },
  ];

  const toggleHazard = (idx: number) => {
    setForm(prev => ({
      ...prev,
      selected_hazards: prev.selected_hazards.includes(idx)
        ? prev.selected_hazards.filter(i => i !== idx)
        : [...prev.selected_hazards, idx],
    }));
  };

  const togglePPE = (id: string) => {
    setForm(prev => ({
      ...prev,
      ppe_required: prev.ppe_required.includes(id)
        ? prev.ppe_required.filter(p => p !== id)
        : [...prev.ppe_required, id],
    }));
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Project / Job Name *</Label>
          <Input value={form.project_name} onChange={e => setForm(p => ({ ...p, project_name: e.target.value }))} required placeholder="e.g. Arena Build — Red Hill" />
        </div>
        <div className="space-y-2">
          <Label>Site Address *</Label>
          <Input value={form.site_address} onChange={e => setForm(p => ({ ...p, site_address: e.target.value }))} required placeholder="123 Main Rd, Red Hill VIC" />
        </div>
        <div className="space-y-2">
          <Label>Date *</Label>
          <Input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} required />
        </div>
        <div className="space-y-2">
          <Label>Prepared By *</Label>
          <Input value={form.prepared_by} onChange={e => setForm(p => ({ ...p, prepared_by: e.target.value }))} required placeholder="Your name" />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Work Description *</Label>
        <Textarea value={form.work_description} onChange={e => setForm(p => ({ ...p, work_description: e.target.value }))} required placeholder="Describe the scope of work being carried out..." rows={3} />
      </div>

      {/* Hazards */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">Hazard Identification & Controls</Label>
        <p className="text-sm text-muted-foreground">Select all hazards applicable to this job</p>
        <div className="grid grid-cols-1 gap-2">
          {SWMS_HAZARDS.map((h, idx) => (
            <label key={idx} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${form.selected_hazards.includes(idx) ? "bg-accent/10 border-accent/40" : "hover:bg-muted/50"}`}>
              <Checkbox checked={form.selected_hazards.includes(idx)} onCheckedChange={() => toggleHazard(idx)} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{h.hazard}</span>
                  <Badge variant={h.risk === "high" ? "destructive" : h.risk === "medium" ? "secondary" : "outline"} className="text-xs">{h.risk}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{h.control}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* PPE */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">PPE Required</Label>
        <div className="flex flex-wrap gap-2">
          {PPE_OPTIONS.map(ppe => (
            <label key={ppe.id} className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm cursor-pointer transition-colors ${form.ppe_required.includes(ppe.id) ? "bg-accent/20 border-accent/40 text-foreground" : "hover:bg-muted/50 text-muted-foreground"}`}>
              <Checkbox checked={form.ppe_required.includes(ppe.id)} onCheckedChange={() => togglePPE(ppe.id)} className="h-3.5 w-3.5" />
              {ppe.label}
            </label>
          ))}
        </div>
      </div>

      {/* Emergency */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Emergency Contact</Label>
          <Input value={form.emergency_contact} onChange={e => setForm(p => ({ ...p, emergency_contact: e.target.value }))} placeholder="000" />
        </div>
        <div className="space-y-2">
          <Label>First Aid Kit Location</Label>
          <Input value={form.first_aid_location} onChange={e => setForm(p => ({ ...p, first_aid_location: e.target.value }))} placeholder="e.g. Site office / Ute" />
        </div>
      </div>

      {/* Sign-off */}
      <div className="p-4 border rounded-lg bg-muted/30 space-y-3">
        <Label className="text-base font-semibold">Sign-Off Declaration</Label>
        <div className="space-y-2">
          <Label>Full Name *</Label>
          <Input value={form.sign_off_name} onChange={e => setForm(p => ({ ...p, sign_off_name: e.target.value }))} required placeholder="Your full name" />
        </div>
        <label className="flex items-start gap-3 cursor-pointer">
          <Checkbox checked={form.sign_off_agreed} onCheckedChange={(c) => setForm(p => ({ ...p, sign_off_agreed: !!c }))} className="mt-0.5" />
          <span className="text-sm">I confirm that all workers have been briefed on the hazards and controls identified in this SWMS, and agree to follow safe work procedures.</span>
        </label>
      </div>

      <Button type="submit" disabled={loading || !form.sign_off_agreed} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
        Submit SWMS
      </Button>
    </form>
  );
}

function PaymentSlipForm({ onSubmit, loading }: { onSubmit: (data: any) => void; loading: boolean }) {
  const weekEnd = new Date();
  // Find next Wednesday or current if today is Wednesday
  const dayOfWeek = weekEnd.getDay();
  const daysUntilWed = (3 - dayOfWeek + 7) % 7;
  weekEnd.setDate(weekEnd.getDate() + daysUntilWed);

  const [form, setForm] = useState({
    week_ending: format(weekEnd, "yyyy-MM-dd"),
    employee_name: "",
    days: [
      { day: "Monday", hours: "", description: "" },
      { day: "Tuesday", hours: "", description: "" },
      { day: "Wednesday", hours: "", description: "" },
      { day: "Thursday", hours: "", description: "" },
      { day: "Friday", hours: "", description: "" },
      { day: "Saturday", hours: "", description: "" },
    ],
    total_hours: 0,
    hourly_rate: "",
    bank_bsb: "",
    bank_account: "",
    notes: "",
  });

  const totalHours = form.days.reduce((sum, d) => sum + (parseFloat(d.hours) || 0), 0);

  const updateDay = (idx: number, field: string, value: string) => {
    setForm(prev => {
      const days = [...prev.days];
      days[idx] = { ...days[idx], [field]: value };
      return { ...prev, days };
    });
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit({ ...form, total_hours: totalHours }); }} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Employee Name *</Label>
          <Input value={form.employee_name} onChange={e => setForm(p => ({ ...p, employee_name: e.target.value }))} required placeholder="Your full name" />
        </div>
        <div className="space-y-2">
          <Label>Week Ending (Wednesday) *</Label>
          <Input type="date" value={form.week_ending} onChange={e => setForm(p => ({ ...p, week_ending: e.target.value }))} required />
        </div>
      </div>

      {/* Daily hours */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">Daily Hours</Label>
        <div className="space-y-2">
          {form.days.map((day, idx) => (
            <div key={day.day} className="grid grid-cols-[100px_80px_1fr] gap-2 items-center">
              <span className="text-sm font-medium">{day.day}</span>
              <Input type="number" step="0.5" min="0" max="24" placeholder="Hrs" value={day.hours} onChange={e => updateDay(idx, "hours", e.target.value)} className="text-center" />
              <Input placeholder="Work description" value={day.description} onChange={e => updateDay(idx, "description", e.target.value)} className="text-sm" />
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center pt-2 border-t">
          <span className="font-semibold">Total Hours</span>
          <span className="text-xl font-bold text-accent">{totalHours}</span>
        </div>
      </div>

      {/* Payment details */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Hourly Rate ($AUD)</Label>
          <Input type="number" step="0.01" value={form.hourly_rate} onChange={e => setForm(p => ({ ...p, hourly_rate: e.target.value }))} placeholder="35.00" />
        </div>
        <div className="space-y-2">
          <Label>BSB</Label>
          <Input value={form.bank_bsb} onChange={e => setForm(p => ({ ...p, bank_bsb: e.target.value }))} placeholder="000-000" maxLength={7} />
        </div>
        <div className="space-y-2">
          <Label>Account Number</Label>
          <Input value={form.bank_account} onChange={e => setForm(p => ({ ...p, bank_account: e.target.value }))} placeholder="12345678" />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Notes</Label>
        <Textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Any additional notes for admin..." rows={2} />
      </div>

      <Button type="submit" disabled={loading} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
        Submit Payment Slip
      </Button>
    </form>
  );
}

function SiteInspectionForm({ onSubmit, loading, defaults }: { onSubmit: (data: any) => void; loading: boolean; defaults?: { project_name: string; site_address: string } }) {
  const [form, setForm] = useState({
    site_name: defaults?.project_name || "",
    site_address: defaults?.site_address || "",
    date: format(new Date(), "yyyy-MM-dd"),
    inspector_name: "",
    weather_conditions: "fine",
    checklist: [
      { item: "Site access and egress clear", status: "pass", notes: "" },
      { item: "Excavation/trenches shored or barricaded", status: "na", notes: "" },
      { item: "Scaffolding secure and tagged", status: "na", notes: "" },
      { item: "Electrical leads/RCDs tested", status: "pass", notes: "" },
      { item: "PPE being worn correctly", status: "pass", notes: "" },
      { item: "First aid kit accessible and stocked", status: "pass", notes: "" },
      { item: "Fire extinguisher available", status: "pass", notes: "" },
      { item: "Materials stored safely", status: "pass", notes: "" },
      { item: "Housekeeping satisfactory", status: "pass", notes: "" },
      { item: "Horse/livestock exclusion zones in place", status: "na", notes: "" },
      { item: "Signage posted (danger/warning)", status: "pass", notes: "" },
      { item: "SWMS on site and current", status: "pass", notes: "" },
    ],
    overall_rating: "satisfactory",
    corrective_actions: "",
    sign_off_name: "",
  });

  const updateCheck = (idx: number, field: string, value: string) => {
    setForm(prev => {
      const checklist = [...prev.checklist];
      checklist[idx] = { ...checklist[idx], [field]: value };
      return { ...prev, checklist };
    });
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Site / Project Name *</Label>
          <Input value={form.site_name} onChange={e => setForm(p => ({ ...p, site_name: e.target.value }))} required placeholder="e.g. Barn Build — Balnarring" />
        </div>
        <div className="space-y-2">
          <Label>Site Address *</Label>
          <Input value={form.site_address} onChange={e => setForm(p => ({ ...p, site_address: e.target.value }))} required />
        </div>
        <div className="space-y-2">
          <Label>Date *</Label>
          <Input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} required />
        </div>
        <div className="space-y-2">
          <Label>Inspector Name *</Label>
          <Input value={form.inspector_name} onChange={e => setForm(p => ({ ...p, inspector_name: e.target.value }))} required />
        </div>
        <div className="space-y-2">
          <Label>Weather</Label>
          <Select value={form.weather_conditions} onValueChange={v => setForm(p => ({ ...p, weather_conditions: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="fine">Fine / Clear</SelectItem>
              <SelectItem value="overcast">Overcast</SelectItem>
              <SelectItem value="rain">Rain</SelectItem>
              <SelectItem value="windy">Windy</SelectItem>
              <SelectItem value="hot">Extreme Heat</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Checklist */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">Inspection Checklist</Label>
        <div className="space-y-2">
          {form.checklist.map((item, idx) => (
            <div key={idx} className="grid grid-cols-[1fr_100px_1fr] gap-2 items-center p-2 rounded border">
              <span className="text-sm">{item.item}</span>
              <Select value={item.status} onValueChange={v => updateCheck(idx, "status", v)}>
                <SelectTrigger className="text-xs h-8"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pass">✅ Pass</SelectItem>
                  <SelectItem value="fail">❌ Fail</SelectItem>
                  <SelectItem value="na">➖ N/A</SelectItem>
                </SelectContent>
              </Select>
              <Input placeholder="Notes" value={item.notes} onChange={e => updateCheck(idx, "notes", e.target.value)} className="text-xs h-8" />
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Overall Rating</Label>
        <Select value={form.overall_rating} onValueChange={v => setForm(p => ({ ...p, overall_rating: v }))}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="satisfactory">Satisfactory</SelectItem>
            <SelectItem value="needs_improvement">Needs Improvement</SelectItem>
            <SelectItem value="unsatisfactory">Unsatisfactory — Stop Work</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Corrective Actions Required</Label>
        <Textarea value={form.corrective_actions} onChange={e => setForm(p => ({ ...p, corrective_actions: e.target.value }))} placeholder="Describe any corrective actions needed..." rows={3} />
      </div>

      <div className="space-y-2">
        <Label>Inspector Sign-Off *</Label>
        <Input value={form.sign_off_name} onChange={e => setForm(p => ({ ...p, sign_off_name: e.target.value }))} required placeholder="Your full name" />
      </div>

      <Button type="submit" disabled={loading} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
        Submit Inspection Report
      </Button>
    </form>
  );
}

function EventChecklistForm({ onSubmit, loading }: { onSubmit: (data: any) => void; loading: boolean }) {
  const [form, setForm] = useState({
    event_name: "",
    event_date: format(new Date(), "yyyy-MM-dd"),
    venue: "",
    organiser_name: "",
    expected_attendees: "",
    checklist: [
      { item: "Public liability insurance confirmed", checked: false },
      { item: "First aid officer on site", checked: false },
      { item: "Emergency plan communicated to staff", checked: false },
      { item: "Horse handling protocol briefed", checked: false },
      { item: "Spectator barriers / exclusion zones set up", checked: false },
      { item: "Vehicle parking separated from event area", checked: false },
      { item: "All arena surfaces inspected & safe", checked: false },
      { item: "PA / communication system working", checked: false },
      { item: "Toilet facilities available", checked: false },
      { item: "Weather contingency plan in place", checked: false },
      { item: "SWMS reviewed for any construction activities", checked: false },
      { item: "Waiver / sign-in sheet ready for participants", checked: false },
    ],
    additional_notes: "",
    sign_off_name: "",
    sign_off_agreed: false,
  });

  const toggleItem = (idx: number) => {
    setForm(prev => {
      const checklist = [...prev.checklist];
      checklist[idx] = { ...checklist[idx], checked: !checklist[idx].checked };
      return { ...prev, checklist };
    });
  };

  const allChecked = form.checklist.every(c => c.checked);

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Event Name *</Label>
          <Input value={form.event_name} onChange={e => setForm(p => ({ ...p, event_name: e.target.value }))} required placeholder="e.g. Open Day Clinic" />
        </div>
        <div className="space-y-2">
          <Label>Event Date *</Label>
          <Input type="date" value={form.event_date} onChange={e => setForm(p => ({ ...p, event_date: e.target.value }))} required />
        </div>
        <div className="space-y-2">
          <Label>Venue *</Label>
          <Input value={form.venue} onChange={e => setForm(p => ({ ...p, venue: e.target.value }))} required placeholder="59 Tubbarubba Rd, Merricks North" />
        </div>
        <div className="space-y-2">
          <Label>Organiser Name *</Label>
          <Input value={form.organiser_name} onChange={e => setForm(p => ({ ...p, organiser_name: e.target.value }))} required />
        </div>
        <div className="space-y-2">
          <Label>Expected Attendees</Label>
          <Input type="number" value={form.expected_attendees} onChange={e => setForm(p => ({ ...p, expected_attendees: e.target.value }))} placeholder="e.g. 30" />
        </div>
      </div>

      {/* Checklist */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">Safety Checklist</Label>
        <div className="space-y-2">
          {form.checklist.map((item, idx) => (
            <label key={idx} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${item.checked ? "bg-green-500/10 border-green-500/30" : "hover:bg-muted/50"}`}>
              <Checkbox checked={item.checked} onCheckedChange={() => toggleItem(idx)} />
              <span className="text-sm">{item.item}</span>
            </label>
          ))}
        </div>
        {!allChecked && (
          <p className="text-xs text-destructive flex items-center gap-1">
            <AlertCircle className="h-3 w-3" /> All items must be checked before submission
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Additional Notes</Label>
        <Textarea value={form.additional_notes} onChange={e => setForm(p => ({ ...p, additional_notes: e.target.value }))} rows={2} />
      </div>

      <div className="p-4 border rounded-lg bg-muted/30 space-y-3">
        <div className="space-y-2">
          <Label>Sign-Off Name *</Label>
          <Input value={form.sign_off_name} onChange={e => setForm(p => ({ ...p, sign_off_name: e.target.value }))} required />
        </div>
        <label className="flex items-start gap-3 cursor-pointer">
          <Checkbox checked={form.sign_off_agreed} onCheckedChange={(c) => setForm(p => ({ ...p, sign_off_agreed: !!c }))} className="mt-0.5" />
          <span className="text-sm">I confirm this event meets all safety requirements and the venue is ready for public attendance.</span>
        </label>
      </div>

      <Button type="submit" disabled={loading || !allChecked || !form.sign_off_agreed} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
        Submit Event Safety Checklist
      </Button>
    </form>
  );
}

// ── Work Permit Form ──────────────────────────────
function WorkPermitForm({ onSubmit, loading }: { onSubmit: (data: any) => void; loading: boolean }) {
  const [form, setForm] = useState({
    permit_type: "hot_work",
    project_name: "",
    site_address: "",
    date: format(new Date(), "yyyy-MM-dd"),
    valid_until: "",
    requested_by: "",
    approved_by: "",
    work_description: "",
    precautions: [
      { item: "Area cleared of combustibles / hazards", checked: false },
      { item: "Fire extinguisher within 10m", checked: false },
      { item: "Gas testing completed (if confined space)", checked: false },
      { item: "Ventilation adequate", checked: false },
      { item: "All workers briefed on emergency procedures", checked: false },
      { item: "Barricades / signage in place", checked: false },
      { item: "Rescue equipment available (if confined space)", checked: false },
      { item: "Services (gas, water, electrical) identified and isolated", checked: false },
    ],
    additional_conditions: "",
    sign_off_name: "",
    sign_off_agreed: false,
  });

  const toggleItem = (idx: number) => {
    setForm(prev => {
      const precautions = [...prev.precautions];
      precautions[idx] = { ...precautions[idx], checked: !precautions[idx].checked };
      return { ...prev, precautions };
    });
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Permit Type *</Label>
          <Select value={form.permit_type} onValueChange={v => setForm(p => ({ ...p, permit_type: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="hot_work">🔥 Hot Work (Welding/Grinding)</SelectItem>
              <SelectItem value="confined_space">🕳️ Confined Space Entry</SelectItem>
              <SelectItem value="excavation">🚧 Excavation</SelectItem>
              <SelectItem value="electrical">⚡ Electrical Isolation</SelectItem>
              <SelectItem value="crane_lift">🏗️ Crane / Heavy Lift</SelectItem>
              <SelectItem value="general">📋 General Work Permit</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Project / Job Name *</Label>
          <Input value={form.project_name} onChange={e => setForm(p => ({ ...p, project_name: e.target.value }))} required placeholder="e.g. Arena Roof Welding — Balnarring" />
        </div>
        <div className="space-y-2">
          <Label>Site Address *</Label>
          <Input value={form.site_address} onChange={e => setForm(p => ({ ...p, site_address: e.target.value }))} required />
        </div>
        <div className="space-y-2">
          <Label>Date *</Label>
          <Input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} required />
        </div>
        <div className="space-y-2">
          <Label>Valid Until</Label>
          <Input type="date" value={form.valid_until} onChange={e => setForm(p => ({ ...p, valid_until: e.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label>Requested By *</Label>
          <Input value={form.requested_by} onChange={e => setForm(p => ({ ...p, requested_by: e.target.value }))} required placeholder="Your name" />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Work Description *</Label>
        <Textarea value={form.work_description} onChange={e => setForm(p => ({ ...p, work_description: e.target.value }))} required placeholder="Describe the specific work to be carried out under this permit..." rows={3} />
      </div>

      <div className="space-y-3">
        <Label className="text-base font-semibold">Safety Precautions Checklist</Label>
        <div className="space-y-2">
          {form.precautions.map((item, idx) => (
            <label key={idx} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${item.checked ? "bg-accent/10 border-accent/30" : "hover:bg-muted/50"}`}>
              <Checkbox checked={item.checked} onCheckedChange={() => toggleItem(idx)} />
              <span className="text-sm">{item.item}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Additional Conditions</Label>
        <Textarea value={form.additional_conditions} onChange={e => setForm(p => ({ ...p, additional_conditions: e.target.value }))} placeholder="Any special conditions or restrictions..." rows={2} />
      </div>

      <div className="p-4 border rounded-lg bg-muted/30 space-y-3">
        <Label className="text-base font-semibold">Sign-Off Declaration</Label>
        <div className="space-y-2">
          <Label>Full Name *</Label>
          <Input value={form.sign_off_name} onChange={e => setForm(p => ({ ...p, sign_off_name: e.target.value }))} required />
        </div>
        <label className="flex items-start gap-3 cursor-pointer">
          <Checkbox checked={form.sign_off_agreed} onCheckedChange={(c) => setForm(p => ({ ...p, sign_off_agreed: !!c }))} className="mt-0.5" />
          <span className="text-sm">I confirm that all safety precautions have been implemented and the work area is safe to proceed.</span>
        </label>
      </div>

      <Button type="submit" disabled={loading || !form.sign_off_agreed} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
        Submit Work Permit
      </Button>
    </form>
  );
}

// ── Risk Assessment Form ──────────────────────────────
function RiskAssessmentForm({ onSubmit, loading }: { onSubmit: (data: any) => void; loading: boolean }) {
  const [form, setForm] = useState({
    project_name: "",
    site_address: "",
    date: format(new Date(), "yyyy-MM-dd"),
    assessor_name: "",
    task_description: "",
    risks: [
      { hazard: "", consequence: "", likelihood: "possible", severity: "moderate", existing_controls: "", additional_controls: "" },
    ],
    overall_risk_rating: "medium",
    review_date: "",
    sign_off_name: "",
    sign_off_agreed: false,
  });

  const addRisk = () => {
    setForm(prev => ({
      ...prev,
      risks: [...prev.risks, { hazard: "", consequence: "", likelihood: "possible", severity: "moderate", existing_controls: "", additional_controls: "" }],
    }));
  };

  const updateRisk = (idx: number, field: string, value: string) => {
    setForm(prev => {
      const risks = [...prev.risks];
      risks[idx] = { ...risks[idx], [field]: value };
      return { ...prev, risks };
    });
  };

  const removeRisk = (idx: number) => {
    if (form.risks.length <= 1) return;
    setForm(prev => ({ ...prev, risks: prev.risks.filter((_, i) => i !== idx) }));
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Project / Task Name *</Label>
          <Input value={form.project_name} onChange={e => setForm(p => ({ ...p, project_name: e.target.value }))} required placeholder="e.g. Post Hole Drilling — Red Hill" />
        </div>
        <div className="space-y-2">
          <Label>Site Address *</Label>
          <Input value={form.site_address} onChange={e => setForm(p => ({ ...p, site_address: e.target.value }))} required />
        </div>
        <div className="space-y-2">
          <Label>Assessment Date *</Label>
          <Input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} required />
        </div>
        <div className="space-y-2">
          <Label>Assessor Name *</Label>
          <Input value={form.assessor_name} onChange={e => setForm(p => ({ ...p, assessor_name: e.target.value }))} required />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Task / Activity Description *</Label>
        <Textarea value={form.task_description} onChange={e => setForm(p => ({ ...p, task_description: e.target.value }))} required placeholder="Describe the task or activity being assessed..." rows={3} />
      </div>

      {/* Risk Register */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold">Risk Register</Label>
          <Button type="button" variant="outline" size="sm" onClick={addRisk}>
            <Plus className="mr-1 h-3 w-3" /> Add Risk
          </Button>
        </div>
        {form.risks.map((risk, idx) => (
          <Card key={idx} className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-muted-foreground">Risk #{idx + 1}</span>
              {form.risks.length > 1 && (
                <Button type="button" variant="ghost" size="sm" onClick={() => removeRisk(idx)} className="text-destructive text-xs h-6">Remove</Button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Hazard *</Label>
                <Input value={risk.hazard} onChange={e => updateRisk(idx, "hazard", e.target.value)} placeholder="e.g. Excavation collapse" className="text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Consequence</Label>
                <Input value={risk.consequence} onChange={e => updateRisk(idx, "consequence", e.target.value)} placeholder="e.g. Burial, serious injury" className="text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Likelihood</Label>
                <Select value={risk.likelihood} onValueChange={v => updateRisk(idx, "likelihood", v)}>
                  <SelectTrigger className="text-sm h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rare">Rare</SelectItem>
                    <SelectItem value="unlikely">Unlikely</SelectItem>
                    <SelectItem value="possible">Possible</SelectItem>
                    <SelectItem value="likely">Likely</SelectItem>
                    <SelectItem value="almost_certain">Almost Certain</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Severity</Label>
                <Select value={risk.severity} onValueChange={v => updateRisk(idx, "severity", v)}>
                  <SelectTrigger className="text-sm h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="insignificant">Insignificant</SelectItem>
                    <SelectItem value="minor">Minor</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="major">Major</SelectItem>
                    <SelectItem value="catastrophic">Catastrophic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5 col-span-full">
                <Label className="text-xs">Existing Controls</Label>
                <Input value={risk.existing_controls} onChange={e => updateRisk(idx, "existing_controls", e.target.value)} placeholder="Current measures in place" className="text-sm" />
              </div>
              <div className="space-y-1.5 col-span-full">
                <Label className="text-xs">Additional Controls Required</Label>
                <Input value={risk.additional_controls} onChange={e => updateRisk(idx, "additional_controls", e.target.value)} placeholder="Further actions needed" className="text-sm" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Overall Risk Rating</Label>
          <Select value={form.overall_risk_rating} onValueChange={v => setForm(p => ({ ...p, overall_risk_rating: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low — Acceptable</SelectItem>
              <SelectItem value="medium">Medium — Monitor</SelectItem>
              <SelectItem value="high">High — Action Required</SelectItem>
              <SelectItem value="extreme">Extreme — Stop Work</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Review Date</Label>
          <Input type="date" value={form.review_date} onChange={e => setForm(p => ({ ...p, review_date: e.target.value }))} />
        </div>
      </div>

      <div className="p-4 border rounded-lg bg-muted/30 space-y-3">
        <div className="space-y-2">
          <Label>Assessor Sign-Off *</Label>
          <Input value={form.sign_off_name} onChange={e => setForm(p => ({ ...p, sign_off_name: e.target.value }))} required />
        </div>
        <label className="flex items-start gap-3 cursor-pointer">
          <Checkbox checked={form.sign_off_agreed} onCheckedChange={(c) => setForm(p => ({ ...p, sign_off_agreed: !!c }))} className="mt-0.5" />
          <span className="text-sm">I confirm this risk assessment accurately reflects the hazards and controls for this task, and all workers will be briefed before work commences.</span>
        </label>
      </div>

      <Button type="submit" disabled={loading || !form.sign_off_agreed} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
        Submit Risk Assessment
      </Button>
    </form>
  );
}



// ── Main Page ──────────────────────────────────────
export default function StaffDocuments() {
  const { user, loading: authLoading, isAdmin, isEmployee, isTrainer } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<DocType>("swms");
  const [showForm, setShowForm] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [jobDefaults, setJobDefaults] = useState<{ project_name: string; site_address: string }>({ project_name: "", site_address: "" });
  const [availableJobs, setAvailableJobs] = useState<{ id: string; project_name: string; site_address: string }[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>("");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/hq");
    }
  }, [user, authLoading, navigate]);

  // Fetch all available jobs for the worker
  useEffect(() => {
    if (!user) return;
    const fetchJobs = async () => {
      const allJobs: { id: string; project_name: string; site_address: string }[] = [];

      // 1. Employee tasks assigned for today
      const today = format(new Date(), "yyyy-MM-dd");
      const { data: tasks } = await supabase
        .from("employee_tasks")
        .select("id, title, description")
        .eq("assigned_to", user.id)
        .eq("scheduled_date", today)
        .neq("status", "completed")
        .order("created_at", { ascending: false });

      if (tasks) {
        for (const task of tasks) {
          const parts = task.title?.split("—").map((s: string) => s.trim()) || [];
          allJobs.push({
            id: `task-${task.id}`,
            project_name: parts[0] || task.title || "",
            site_address: parts[1] || task.description || "",
          });
        }
      }

      // 2. Active jobs
      const { data: jobs } = await supabase
        .from("jobs")
        .select("id, job_name, location")
        .eq("status", "active")
        .order("updated_at", { ascending: false });

      if (jobs) {
        for (const job of jobs) {
          allJobs.push({
            id: `job-${job.id}`,
            project_name: job.job_name || "",
            site_address: job.location || "",
          });
        }
      }

      setAvailableJobs(allJobs);

      // Auto-select the first one
      if (allJobs.length > 0) {
        setSelectedJobId(allJobs[0].id);
        setJobDefaults({ project_name: allJobs[0].project_name, site_address: allJobs[0].site_address });
      }
    };
    fetchJobs();
  }, [user]);

  const handleJobSwitch = (jobId: string) => {
    setSelectedJobId(jobId);
    if (jobId === "manual") {
      setJobDefaults({ project_name: "", site_address: "" });
      return;
    }
    const job = availableJobs.find(j => j.id === jobId);
    if (job) {
      setJobDefaults({ project_name: job.project_name, site_address: job.site_address });
    }
  };


  const handleSubmit = async (docType: DocType, formData: any) => {
    if (!user) return;
    setSubmitting(true);

    const title = `${DOC_TYPES[docType].label} — ${formData.project_name || formData.employee_name || formData.site_name || formData.event_name || format(new Date(), "d MMM yyyy")}`;

    const { error } = await supabase
      .from("staff_documents")
      .insert({
        user_id: user.id,
        document_type: docType,
        title,
        form_data: formData,
        status: "submitted",
        submitted_at: new Date().toISOString(),
      });

    if (error) {
      toast.error("Failed to submit document");
      console.error(error);
    } else {
      toast.success(`${DOC_TYPES[docType].label} submitted successfully! Admin has been notified.`);

      // Trigger email notification (non-blocking)
      supabase.functions.invoke("send-document-notification", {
        body: { document_type: docType, title, form_data: formData, submitted_by: user.email },
      }).catch(e => console.warn("Email notification failed:", e));

      // Redirect to appropriate document portal
      setTimeout(() => {
        navigate(isTrainer ? "/trainer/documents" : "/staff/documents");
      }, 1200);
    }
    setSubmitting(false);
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


  return (
    <Layout>
      <div className="section-padding">
        <div className="section-container max-w-4xl">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">New Document</h1>
              <p className="text-muted-foreground text-sm mt-1">
                Create and submit SWMS, permits, risk assessments, timesheets & safety records
              </p>
            </div>
            <Button variant="outline" onClick={() => navigate(isTrainer ? "/trainer/documents" : "/staff/documents")}>
              ← Back to Repository
            </Button>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={v => { setActiveTab(v as DocType); setShowForm(true); }}>
            <TabsList className="grid grid-cols-3 sm:grid-cols-9 mb-6">
              {(Object.entries(DOC_TYPES) as [DocType, typeof DOC_TYPES[DocType]][]).map(([key, cfg]) => {
                const TabIcon = cfg.icon;
                return (
                  <TabsTrigger key={key} value={key} className="flex items-center gap-1.5 text-xs sm:text-sm">
                    <TabIcon className={`h-4 w-4 ${cfg.color}`} />
                    <span className="hidden sm:inline">{cfg.label}</span>
                    <span className="sm:hidden">{cfg.label.split(" ")[0]}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {/* Form */}
            {showForm && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {(() => { const FormIcon = DOC_TYPES[activeTab].icon; return <FormIcon className={`h-5 w-5 ${DOC_TYPES[activeTab].color}`} />; })()}
                    New {DOC_TYPES[activeTab].label}
                  </CardTitle>
                  <CardDescription>{DOC_TYPES[activeTab].description}</CardDescription>
                </CardHeader>
                <CardContent>
                  {activeTab === "swms" && <SWMSForm onSubmit={d => handleSubmit("swms", d)} loading={submitting} defaults={jobDefaults} />}
                  {activeTab === "work_permit" && <WorkPermitForm onSubmit={d => handleSubmit("work_permit", d)} loading={submitting} />}
                  {activeTab === "risk_assessment" && <RiskAssessmentForm onSubmit={d => handleSubmit("risk_assessment", d)} loading={submitting} />}
                  {activeTab === "payment_slip" && <PaymentSlipForm onSubmit={d => handleSubmit("payment_slip", d)} loading={submitting} />}
                  {activeTab === "site_inspection" && <SiteInspectionForm onSubmit={d => handleSubmit("site_inspection", d)} loading={submitting} defaults={jobDefaults} />}
                  {activeTab === "event_checklist" && <EventChecklistForm onSubmit={d => handleSubmit("event_checklist", d)} loading={submitting} />}
                  {activeTab === "daily_site_report" && <DailySiteReportForm onSubmit={d => handleSubmit("daily_site_report", d)} loading={submitting} userId={user?.id} defaults={jobDefaults} />}
                  {activeTab === "incident_report" && <IncidentReportForm onSubmit={d => handleSubmit("incident_report", d)} loading={submitting} userId={user?.id} defaults={jobDefaults} />}
                  {activeTab === "horse_care_log" && <HorseCareLogForm onSubmit={d => handleSubmit("horse_care_log", d)} loading={submitting} />}
                </CardContent>
              </Card>
            )}

            {/* Link to portal for viewing history */}
            {!showForm && (
              <div className="text-center py-12">
                <FileText className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
                <p className="font-medium text-muted-foreground">Select a document type above and click "New Document" to create one.</p>
                <p className="text-sm text-muted-foreground mt-2">
                  View your submitted documents in your{" "}
                  <Button variant="link" className="p-0 h-auto" onClick={() => navigate(isTrainer ? "/trainer/documents" : "/staff/documents")}>
                    Document Repository →
                  </Button>
                </p>
              </div>
            )}
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}
