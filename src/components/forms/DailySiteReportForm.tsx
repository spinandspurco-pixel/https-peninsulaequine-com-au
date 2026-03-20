import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, Loader2, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { DocumentPhotoUpload } from "./DocumentPhotoUpload";

const STORAGE_KEY = "draft_daily_site_report";

export function DailySiteReportForm({ onSubmit, loading, userId, defaults }: { onSubmit: (data: any) => void; loading: boolean; userId?: string; defaults?: { project_name: string; site_address: string } }) {
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
      date: format(new Date(), "yyyy-MM-dd"),
      reported_by: saved?.reported_by || "",
      weather: saved?.weather || "fine",
      start_time: saved?.start_time || "07:00",
      end_time: saved?.end_time || "15:30",
      workers_on_site: saved?.workers_on_site || "",
      subcontractors_on_site: saved?.subcontractors_on_site || "",
      work_completed: saved?.work_completed || "",
      materials_used: saved?.materials_used || "",
      equipment_used: saved?.equipment_used || "",
      delays_issues: saved?.delays_issues || "",
      safety_incidents: saved?.safety_incidents || "none",
      next_day_plan: saved?.next_day_plan || "",
      sign_off_name: saved?.sign_off_name || "",
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
        <p className="text-lg font-semibold">Daily Site Report Submitted</p>
        <p className="text-sm text-muted-foreground">Your report has been sent for admin review.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Auto-filled from job switcher — read-only look when populated */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs">Project / Job Name *</Label>
          <Input value={form.project_name} onChange={e => setForm(p => ({ ...p, project_name: e.target.value }))} required placeholder="e.g. Arena Build — Red Hill" className="h-9 text-sm" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Site Address *</Label>
          <Input value={form.site_address} onChange={e => setForm(p => ({ ...p, site_address: e.target.value }))} required placeholder="123 Main Rd, Red Hill VIC" className="h-9 text-sm" />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Date *</Label>
          <Input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} required className="h-9 text-sm" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Reported By *</Label>
          <Input value={form.reported_by} onChange={e => setForm(p => ({ ...p, reported_by: e.target.value }))} required placeholder="Your name" className="h-9 text-sm" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Start</Label>
          <Input type="time" value={form.start_time} onChange={e => setForm(p => ({ ...p, start_time: e.target.value }))} className="h-9 text-sm" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">End</Label>
          <Input type="time" value={form.end_time} onChange={e => setForm(p => ({ ...p, end_time: e.target.value }))} className="h-9 text-sm" />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Weather</Label>
          <Select value={form.weather} onValueChange={v => setForm(p => ({ ...p, weather: v }))}>
            <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="fine">Fine / Clear</SelectItem>
              <SelectItem value="overcast">Overcast</SelectItem>
              <SelectItem value="rain">Rain</SelectItem>
              <SelectItem value="windy">Windy</SelectItem>
              <SelectItem value="hot">Extreme Heat</SelectItem>
              <SelectItem value="cold">Cold</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Workers on Site</Label>
          <Select value={form.workers_on_site} onValueChange={v => setForm(p => ({ ...p, workers_on_site: v }))}>
            <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select..." /></SelectTrigger>
            <SelectContent>
              {["1","2","3","4","5","6","7","8","9","10+"].map(n => (
                <SelectItem key={n} value={n}>{n}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Safety Incidents</Label>
          <Select value={form.safety_incidents} onValueChange={v => setForm(p => ({ ...p, safety_incidents: v }))}>
            <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">✅ None</SelectItem>
              <SelectItem value="near_miss">⚠️ Near Miss</SelectItem>
              <SelectItem value="minor">🟡 Minor</SelectItem>
              <SelectItem value="serious">🔴 Serious</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Subcontractors on Site</Label>
        <Input value={form.subcontractors_on_site} onChange={e => setForm(p => ({ ...p, subcontractors_on_site: e.target.value }))} placeholder="e.g. Electrician — ABC Co" className="h-9 text-sm" />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Work Completed Today *</Label>
        <Textarea value={form.work_completed} onChange={e => setForm(p => ({ ...p, work_completed: e.target.value }))} required placeholder="Describe work completed..." rows={3} className="text-sm" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Materials Used</Label>
          <Textarea value={form.materials_used} onChange={e => setForm(p => ({ ...p, materials_used: e.target.value }))} placeholder="List materials..." rows={2} className="text-sm" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Equipment Used</Label>
          <Textarea value={form.equipment_used} onChange={e => setForm(p => ({ ...p, equipment_used: e.target.value }))} placeholder="List equipment..." rows={2} className="text-sm" />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Delays / Issues</Label>
        <Textarea value={form.delays_issues} onChange={e => setForm(p => ({ ...p, delays_issues: e.target.value }))} placeholder="Any delays, issues or concerns..." rows={2} className="text-sm" />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Plan for Tomorrow</Label>
        <Textarea value={form.next_day_plan} onChange={e => setForm(p => ({ ...p, next_day_plan: e.target.value }))} placeholder="Brief plan for next work day..." rows={2} className="text-sm" />
      </div>

      {userId && (
        <DocumentPhotoUpload userId={userId} photos={photos} onPhotosChange={setPhotos} />
      )}

      <div className="p-3 border rounded-lg bg-muted/30 space-y-2">
        <div className="space-y-1.5">
          <Label className="text-xs">Sign-Off Name *</Label>
          <Input value={form.sign_off_name} onChange={e => setForm(p => ({ ...p, sign_off_name: e.target.value }))} required placeholder="Your full name" className="h-9 text-sm" />
        </div>
      </div>

      <Button type="submit" disabled={loading} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground h-11">
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
        Submit Daily Site Report
      </Button>
    </form>
  );
}
