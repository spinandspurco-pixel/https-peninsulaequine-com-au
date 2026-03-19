import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Send, Loader2 } from "lucide-react";
import { format } from "date-fns";

export function HorseCareLogForm({ onSubmit, loading }: { onSubmit: (data: any) => void; loading: boolean }) {
  const [form, setForm] = useState({
    horse_name: "",
    date: format(new Date(), "yyyy-MM-dd"),
    handler_name: "",
    log_type: "training",
    location: "",
    duration_minutes: "60",
    condition_score: "good",
    feed_given: "",
    water_access: true,
    health_observations: "",
    training_summary: "",
    exercises_performed: "",
    behaviour_notes: "",
    farrier_vet_notes: "",
    injuries_observed: "",
    medications_given: "",
    turnout_hours: "",
    next_session_plan: "",
    sign_off_name: "",
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Horse Name *</Label>
          <Input value={form.horse_name} onChange={e => setForm(p => ({ ...p, horse_name: e.target.value }))} required placeholder="e.g. Whiskey" />
        </div>
        <div className="space-y-2">
          <Label>Date *</Label>
          <Input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} required />
        </div>
        <div className="space-y-2">
          <Label>Handler / Trainer *</Label>
          <Input value={form.handler_name} onChange={e => setForm(p => ({ ...p, handler_name: e.target.value }))} required placeholder="Your name" />
        </div>
        <div className="space-y-2">
          <Label>Log Type *</Label>
          <Select value={form.log_type} onValueChange={v => setForm(p => ({ ...p, log_type: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="training">🏇 Training Session</SelectItem>
              <SelectItem value="care">🩺 General Care</SelectItem>
              <SelectItem value="health_check">❤️ Health Check</SelectItem>
              <SelectItem value="farrier">🔨 Farrier Visit</SelectItem>
              <SelectItem value="vet">🏥 Vet Visit</SelectItem>
              <SelectItem value="turnout">🌿 Paddock / Turnout</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Location</Label>
          <Input value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} placeholder="e.g. Main arena, Round pen, Paddock 3" />
        </div>
        <div className="space-y-2">
          <Label>Duration (minutes)</Label>
          <Input type="number" value={form.duration_minutes} onChange={e => setForm(p => ({ ...p, duration_minutes: e.target.value }))} placeholder="60" />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Condition Score</Label>
        <Select value={form.condition_score} onValueChange={v => setForm(p => ({ ...p, condition_score: v }))}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="excellent">🟢 Excellent</SelectItem>
            <SelectItem value="good">🔵 Good</SelectItem>
            <SelectItem value="fair">🟡 Fair — Monitor</SelectItem>
            <SelectItem value="poor">🟠 Poor — Attention Needed</SelectItem>
            <SelectItem value="concern">🔴 Concern — Vet Required</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Feed Given</Label>
          <Input value={form.feed_given} onChange={e => setForm(p => ({ ...p, feed_given: e.target.value }))} placeholder="e.g. 2 biscuits hay, 1 scoop chaff" />
        </div>
        <div className="space-y-2">
          <Label>Turnout Hours</Label>
          <Input value={form.turnout_hours} onChange={e => setForm(p => ({ ...p, turnout_hours: e.target.value }))} placeholder="e.g. 6hrs paddock" />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Health Observations</Label>
        <Textarea value={form.health_observations} onChange={e => setForm(p => ({ ...p, health_observations: e.target.value }))} placeholder="Any health observations — lameness, appetite, coat, hooves..." rows={2} />
      </div>

      <div className="space-y-2">
        <Label>Training Summary</Label>
        <Textarea value={form.training_summary} onChange={e => setForm(p => ({ ...p, training_summary: e.target.value }))} placeholder="What was worked on today..." rows={3} />
      </div>

      <div className="space-y-2">
        <Label>Behaviour Notes</Label>
        <Textarea value={form.behaviour_notes} onChange={e => setForm(p => ({ ...p, behaviour_notes: e.target.value }))} placeholder="Mood, responsiveness, any issues..." rows={2} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Injuries Observed</Label>
          <Textarea value={form.injuries_observed} onChange={e => setForm(p => ({ ...p, injuries_observed: e.target.value }))} placeholder="Any cuts, swelling, heat..." rows={2} />
        </div>
        <div className="space-y-2">
          <Label>Medications Given</Label>
          <Textarea value={form.medications_given} onChange={e => setForm(p => ({ ...p, medications_given: e.target.value }))} placeholder="Type, dosage, time..." rows={2} />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Farrier / Vet Notes</Label>
        <Textarea value={form.farrier_vet_notes} onChange={e => setForm(p => ({ ...p, farrier_vet_notes: e.target.value }))} placeholder="Relevant notes from farrier or vet visits..." rows={2} />
      </div>

      <div className="space-y-2">
        <Label>Next Session Plan</Label>
        <Textarea value={form.next_session_plan} onChange={e => setForm(p => ({ ...p, next_session_plan: e.target.value }))} placeholder="Goals or plan for next session..." rows={2} />
      </div>

      <div className="p-4 border rounded-lg bg-muted/30 space-y-3">
        <div className="space-y-2">
          <Label>Sign-Off Name *</Label>
          <Input value={form.sign_off_name} onChange={e => setForm(p => ({ ...p, sign_off_name: e.target.value }))} required placeholder="Your full name" />
        </div>
      </div>

      <Button type="submit" disabled={loading} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
        Submit Horse Care Log
      </Button>
    </form>
  );
}
