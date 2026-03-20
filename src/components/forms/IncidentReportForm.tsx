import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Send, Loader2, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { DocumentPhotoUpload } from "./DocumentPhotoUpload";

const STORAGE_KEY = "draft_incident_report";

export function IncidentReportForm({ onSubmit, loading, userId, defaults }: { onSubmit: (data: any) => void; loading: boolean; userId?: string; defaults?: { project_name: string; site_address: string } }) {
  const [photos, setPhotos] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const getInitial = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  };

  const [form, setForm] = useState(() => {
    const saved = getInitial();
    return {
      project_name: defaults?.project_name || saved?.project_name || "",
      site_address: defaults?.site_address || saved?.site_address || "",
      incident_date: format(new Date(), "yyyy-MM-dd"),
      incident_time: format(new Date(), "HH:mm"),
      reported_by: saved?.reported_by || "",
      severity: saved?.severity || "minor",
      incident_type: saved?.incident_type || "injury",
      persons_involved: saved?.persons_involved || "",
      description: saved?.description || "",
      immediate_actions: saved?.immediate_actions || "",
      injuries_sustained: saved?.injuries_sustained || "",
      medical_treatment: saved?.medical_treatment || "none",
      witnesses: saved?.witnesses || "",
      root_cause: saved?.root_cause || "",
      corrective_actions: saved?.corrective_actions || "",
      work_stopped: saved?.work_stopped || false,
      authorities_notified: saved?.authorities_notified || false,
      sign_off_name: saved?.sign_off_name || "",
      sign_off_agreed: false,
    };
  });

  useEffect(() => {
    if (defaults) {
      setForm(prev => ({ ...prev, project_name: defaults.project_name || "", site_address: defaults.site_address || "" }));
    }
  }, [defaults?.project_name, defaults?.site_address]);

  // Auto-save draft
  const saveDraft = useCallback(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(form)); } catch {}
  }, [form]);

  useEffect(() => {
    const t = setTimeout(saveDraft, 800);
    return () => clearTimeout(t);
  }, [saveDraft]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...form, photo_urls: photos });
    localStorage.removeItem(STORAGE_KEY);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
        <CheckCircle2 className="h-12 w-12 text-green-500" />
        <p className="text-lg font-semibold">Incident Report Submitted</p>
        <p className="text-sm text-muted-foreground">Your report has been sent for admin review.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Project / Job Name *</Label>
          <Input value={form.project_name} onChange={e => setForm(p => ({ ...p, project_name: e.target.value }))} required placeholder="e.g. Arena Build — Red Hill" className="h-9 text-sm" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Site Address *</Label>
          <Input value={form.site_address} onChange={e => setForm(p => ({ ...p, site_address: e.target.value }))} required className="h-9 text-sm" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Incident Date *</Label>
          <Input type="date" value={form.incident_date} onChange={e => setForm(p => ({ ...p, incident_date: e.target.value }))} required className="h-9 text-sm" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Incident Time *</Label>
          <Input type="time" value={form.incident_time} onChange={e => setForm(p => ({ ...p, incident_time: e.target.value }))} required className="h-9 text-sm" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Reported By *</Label>
          <Input value={form.reported_by} onChange={e => setForm(p => ({ ...p, reported_by: e.target.value }))} required placeholder="Your name" className="h-9 text-sm" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Severity *</Label>
          <Select value={form.severity} onValueChange={v => setForm(p => ({ ...p, severity: v }))}>
            <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="near_miss">⚠️ Near Miss</SelectItem>
              <SelectItem value="minor">🟡 Minor</SelectItem>
              <SelectItem value="moderate">🟠 Moderate</SelectItem>
              <SelectItem value="serious">🔴 Serious</SelectItem>
              <SelectItem value="critical">⛔ Critical / Notifiable</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Incident Type *</Label>
          <Select value={form.incident_type} onValueChange={v => setForm(p => ({ ...p, incident_type: v }))}>
            <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="injury">🤕 Personal Injury</SelectItem>
              <SelectItem value="property_damage">🏚️ Property Damage</SelectItem>
              <SelectItem value="environmental">🌿 Environmental</SelectItem>
              <SelectItem value="equipment_failure">⚙️ Equipment Failure</SelectItem>
              <SelectItem value="horse_incident">🐴 Horse / Animal</SelectItem>
              <SelectItem value="vehicle">🚗 Vehicle</SelectItem>
              <SelectItem value="other">📋 Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Medical Treatment</Label>
          <Select value={form.medical_treatment} onValueChange={v => setForm(p => ({ ...p, medical_treatment: v }))}>
            <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None Required</SelectItem>
              <SelectItem value="first_aid">First Aid On Site</SelectItem>
              <SelectItem value="doctor">Doctor / GP Visit</SelectItem>
              <SelectItem value="hospital">Hospital / Emergency</SelectItem>
              <SelectItem value="ambulance">Ambulance Called</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Persons Involved</Label>
        <Input value={form.persons_involved} onChange={e => setForm(p => ({ ...p, persons_involved: e.target.value }))} placeholder="Names of all involved" className="h-9 text-sm" />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Description of Incident *</Label>
        <Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} required placeholder="Describe exactly what happened..." rows={3} className="text-sm" />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Immediate Actions Taken *</Label>
        <Textarea value={form.immediate_actions} onChange={e => setForm(p => ({ ...p, immediate_actions: e.target.value }))} required placeholder="What was done immediately..." rows={2} className="text-sm" />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Injuries Sustained</Label>
        <Textarea value={form.injuries_sustained} onChange={e => setForm(p => ({ ...p, injuries_sustained: e.target.value }))} placeholder="Describe any injuries..." rows={2} className="text-sm" />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Witnesses</Label>
        <Input value={form.witnesses} onChange={e => setForm(p => ({ ...p, witnesses: e.target.value }))} placeholder="Names and contact details" className="h-9 text-sm" />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Root Cause / Corrective Actions</Label>
        <Textarea value={form.corrective_actions} onChange={e => setForm(p => ({ ...p, corrective_actions: e.target.value }))} placeholder="What contributed and steps to prevent recurrence..." rows={3} className="text-sm" />
      </div>

      {userId && (
        <DocumentPhotoUpload userId={userId} photos={photos} onPhotosChange={setPhotos} maxPhotos={10} />
      )}

      <div className="flex flex-wrap gap-x-6 gap-y-2">
        <label className="flex items-center gap-2 cursor-pointer text-sm">
          <Checkbox checked={form.work_stopped} onCheckedChange={(c) => setForm(p => ({ ...p, work_stopped: !!c }))} />
          Work stopped
        </label>
        <label className="flex items-center gap-2 cursor-pointer text-sm">
          <Checkbox checked={form.authorities_notified} onCheckedChange={(c) => setForm(p => ({ ...p, authorities_notified: !!c }))} />
          Authorities notified
        </label>
      </div>

      <div className="p-3 border rounded-lg bg-muted/30 space-y-2">
        <div className="space-y-1.5">
          <Label className="text-xs">Full Name *</Label>
          <Input value={form.sign_off_name} onChange={e => setForm(p => ({ ...p, sign_off_name: e.target.value }))} required placeholder="Your full name" className="h-9 text-sm" />
        </div>
        <label className="flex items-start gap-2 cursor-pointer">
          <Checkbox checked={form.sign_off_agreed} onCheckedChange={(c) => setForm(p => ({ ...p, sign_off_agreed: !!c }))} className="mt-0.5" />
          <span className="text-xs text-muted-foreground">I confirm this report is accurate and complete.</span>
        </label>
      </div>

      <Button type="submit" disabled={loading || !form.sign_off_agreed} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground h-11">
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
        Submit Incident Report
      </Button>
    </form>
  );
}
