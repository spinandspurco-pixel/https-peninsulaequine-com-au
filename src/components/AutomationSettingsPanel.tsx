import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Settings, Shield, Mail, GitBranch, Zap, RefreshCw } from "lucide-react";

interface AutomationSetting {
  id: string;
  setting_key: string;
  enabled: boolean;
  description: string | null;
  category: string;
  updated_at: string;
}

const CATEGORY_META: Record<string, { label: string; icon: typeof Mail }> = {
  communications: { label: "Communications", icon: Mail },
  pipeline: { label: "Pipeline", icon: GitBranch },
  operations: { label: "Operations", icon: Zap },
  safety: { label: "Safety", icon: Shield },
};

const KEY_LABELS: Record<string, string> = {
  auto_enquiry_confirmations: "Enquiry Confirmations",
  auto_booking_confirmations: "Booking Confirmations",
  auto_assessment_reminders: "Assessment Reminders",
  auto_follow_ups: "Follow-Ups (Day 2/5/10)",
  auto_crm_status_updates: "CRM Status Updates",
  auto_daily_briefing: "Daily Briefing Generation",
  auto_alerts: "Smart Alerts",
  auto_task_assignment: "Task Auto-Assignment",
  approval_required_mode: "Approval Required Mode",
};

export function AutomationSettingsPanel() {
  const [settings, setSettings] = useState<AutomationSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("automation_settings")
      .select("*")
      .order("category");
    if (error) toast.error("Failed to load settings");
    else setSettings((data as AutomationSetting[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchSettings(); }, []);

  const toggleSetting = async (id: string, enabled: boolean) => {
    setSaving(id);
    const { error } = await supabase
      .from("automation_settings")
      .update({ enabled, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) toast.error("Failed to update setting");
    else {
      setSettings(prev => prev.map(s => s.id === id ? { ...s, enabled } : s));
      toast.success("Setting updated");
    }
    setSaving(null);
  };

  const grouped = settings.reduce<Record<string, AutomationSetting[]>>((acc, s) => {
    (acc[s.category] = acc[s.category] || []).push(s);
    return acc;
  }, {});

  const activeCount = settings.filter(s => s.enabled && s.setting_key !== "approval_required_mode").length;
  const totalCount = settings.filter(s => s.setting_key !== "approval_required_mode").length;

  return (
    <Card className="bg-card/60 border-border/30">
      <CardHeader className="cursor-pointer pb-2" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="h-3.5 w-3.5 text-accent/70" />
            <CardTitle className="text-sm font-medium">Automation Settings</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[9px] border-border/30">
              {activeCount}/{totalCount} active
            </Badge>
            <Settings className={`h-3 w-3 text-muted-foreground/40 transition-transform ${expanded ? "rotate-90" : ""}`} />
          </div>
        </div>
      </CardHeader>
      {expanded && (
        <CardContent className="pt-0 space-y-4">
          {loading ? (
            <div className="flex justify-center py-6">
              <RefreshCw className="h-4 w-4 animate-spin text-accent/60" />
            </div>
          ) : (
            Object.entries(grouped).map(([category, items]) => {
              const meta = CATEGORY_META[category] || { label: category, icon: Settings };
              const Icon = meta.icon;
              return (
                <div key={category} className="space-y-2">
                  <div className="flex items-center gap-1.5 pb-1 border-b border-border/10">
                    <Icon className="h-3 w-3 text-muted-foreground/40" />
                    <p className="text-[9px] uppercase tracking-[0.15em] text-muted-foreground/50 font-medium">{meta.label}</p>
                  </div>
                  {items.map(setting => (
                    <div key={setting.id} className="flex items-center justify-between py-1.5">
                      <div className="min-w-0 flex-1">
                        <p className="text-[12px] font-medium text-foreground">
                          {KEY_LABELS[setting.setting_key] || setting.setting_key}
                        </p>
                        {setting.description && (
                          <p className="text-[10px] text-muted-foreground/50">{setting.description}</p>
                        )}
                      </div>
                      <Switch
                        checked={setting.enabled}
                        onCheckedChange={(v) => toggleSetting(setting.id, v)}
                        disabled={saving === setting.id}
                        className="ml-3"
                      />
                    </div>
                  ))}
                </div>
              );
            })
          )}
          <div className="pt-2 border-t border-border/10">
            <p className="text-[9px] text-muted-foreground/30 uppercase tracking-wider">
              Default: all autonomous actions OFF. Enable individually after review.
            </p>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
