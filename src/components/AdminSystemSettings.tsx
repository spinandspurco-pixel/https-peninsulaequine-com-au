import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Settings, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";

interface SystemSettings {
  monthly_revenue_target: number;
  margin_on_track: number;
  margin_watch: number;
  margin_at_risk: number;
  margin_critical: number;
}

const DEFAULTS: SystemSettings = {
  monthly_revenue_target: 150000,
  margin_on_track: 25,
  margin_watch: 15,
  margin_at_risk: 5,
  margin_critical: 0,
};

const SETTING_KEYS = Object.keys(DEFAULTS) as (keyof SystemSettings)[];

export function AdminSystemSettings() {
  const [settings, setSettings] = useState<SystemSettings>(DEFAULTS);
  const [expanded, setExpanded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data } = await supabase
        .from("integration_settings")
        .select("key, value")
        .in("key", SETTING_KEYS);

      if (data) {
        const parsed = { ...DEFAULTS };
        data.forEach((row) => {
          const k = row.key as keyof SystemSettings;
          if (k in parsed) parsed[k] = parseFloat(row.value) || DEFAULTS[k];
        });
        setSettings(parsed);
      }
    } catch (err) {
      console.error("Failed to load system settings:", err);
    }
    setLoaded(true);
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const upserts = SETTING_KEYS.map((key) =>
        supabase.from("integration_settings").upsert(
          { key, value: String(settings[key]), updated_at: new Date().toISOString() },
          { onConflict: "key" }
        )
      );
      await Promise.all(upserts);
      toast.success("System settings saved");
    } catch {
      toast.error("Failed to save settings");
    }
    setSaving(false);
  };

  if (!loaded) return null;

  return (
    <Card className="bg-card/60 border-border/30">
      <CardHeader className="cursor-pointer pb-2" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4 text-muted-foreground/50" />
            <CardTitle className="text-sm font-medium">System Settings</CardTitle>
          </div>
          {expanded ? <ChevronUp className="h-3 w-3 text-muted-foreground/40" /> : <ChevronDown className="h-3 w-3 text-muted-foreground/40" />}
        </div>
      </CardHeader>
      {expanded && (
        <CardContent className="pt-0 space-y-4">
          {/* Revenue Target */}
          <div className="space-y-2">
            <p className="text-[9px] uppercase tracking-[0.15em] text-muted-foreground/50 font-medium border-b border-border/10 pb-1">Revenue</p>
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-foreground">Monthly Target</span>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-muted-foreground/40">$</span>
                <Input
                  type="number"
                  min={0}
                  step={5000}
                  value={settings.monthly_revenue_target}
                  onChange={(e) => setSettings(prev => ({ ...prev, monthly_revenue_target: parseInt(e.target.value, 10) || 0 }))}
                  className="w-24 h-7 text-center text-sm bg-background/50 border-border/30"
                />
              </div>
            </div>
          </div>

          {/* Margin Thresholds */}
          <div className="space-y-2">
            <p className="text-[9px] uppercase tracking-[0.15em] text-muted-foreground/50 font-medium border-b border-border/10 pb-1">Margin Thresholds (%)</p>
            {[
              { key: "margin_on_track" as const, label: "On Track ≥", color: "text-emerald-500" },
              { key: "margin_watch" as const, label: "Watch ≥", color: "text-amber-500" },
              { key: "margin_at_risk" as const, label: "At Risk ≥", color: "text-orange-500" },
              { key: "margin_critical" as const, label: "Critical <", color: "text-destructive" },
            ].map((row) => (
              <div key={row.key} className="flex items-center justify-between">
                <span className={`text-[12px] ${row.color}`}>{row.label}</span>
                <div className="flex items-center gap-1.5">
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={settings[row.key]}
                    onChange={(e) => setSettings(prev => ({ ...prev, [row.key]: parseInt(e.target.value, 10) || 0 }))}
                    className="w-16 h-7 text-center text-sm bg-background/50 border-border/30"
                  />
                  <span className="text-[10px] text-muted-foreground/40">%</span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-2 border-t border-border/10">
            <Button size="sm" variant="gold" className="h-7 text-[9px]" disabled={saving} onClick={saveSettings}>
              {saving ? <RefreshCw className="h-3 w-3 animate-spin mr-1" /> : null}
              Save Settings
            </Button>
          </div>

          <p className="text-[9px] text-muted-foreground/30">
            Revenue target feeds the Revenue Strip. Margin thresholds control job profit status colours.
          </p>
        </CardContent>
      )}
    </Card>
  );
}
