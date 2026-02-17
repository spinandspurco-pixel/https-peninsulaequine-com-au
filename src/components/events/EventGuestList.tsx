import { useEffect, useState } from "react";
import { Users, UserCheck, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface RSVP {
  id: string;
  name: string;
  guests: number;
  created_at: string;
}

interface EventGuestListProps {
  eventId: string;
  totalSpots: number;
  onSpotsChange?: (remaining: number) => void;
}

export function EventGuestList({ eventId, totalSpots, onSpotsChange }: EventGuestListProps) {
  const [rsvps, setRsvps] = useState<RSVP[]>([]);
  const [loading, setLoading] = useState(true);

  const totalGuests = rsvps.reduce((sum, r) => sum + r.guests, 0);
  const remaining = Math.max(0, totalSpots - totalGuests);
  const fillPercent = Math.min(100, (totalGuests / totalSpots) * 100);
  const almostFull = remaining <= Math.ceil(totalSpots * 0.15);
  const soldOut = remaining === 0;

  // Notify parent of remaining spots
  useEffect(() => {
    onSpotsChange?.(remaining);
  }, [remaining, onSpotsChange]);

  // Initial fetch
  useEffect(() => {
    const fetchRsvps = async () => {
      const { data } = await supabase
        .from("event_rsvps_public" as any)
        .select("id, name, guests, created_at")
        .eq("event_id", eventId)
        .order("created_at", { ascending: true });
      if (data) setRsvps(data as unknown as RSVP[]);
      setLoading(false);
    };
    fetchRsvps();
  }, [eventId]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel(`rsvps-${eventId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "event_rsvps",
          filter: `event_id=eq.${eventId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newRow = payload.new as RSVP;
            setRsvps((prev) => [...prev, newRow]);
          } else if (payload.eventType === "DELETE") {
            const oldRow = payload.old as { id: string };
            setRsvps((prev) => prev.filter((r) => r.id !== oldRow.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-2">
        <div className="h-4 bg-muted rounded w-1/3" />
        <div className="h-2 bg-muted rounded w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Capacity bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Users className="h-4 w-4" />
            {totalGuests} / {totalSpots} spots filled
          </span>
          <Badge
            variant={soldOut ? "destructive" : almostFull ? "secondary" : "outline"}
            className={cn(
              "text-xs",
              soldOut && "bg-destructive/10 text-destructive border-destructive/30",
              almostFull && !soldOut && "bg-accent/10 text-accent border-accent/30"
            )}
          >
            {soldOut ? (
              <><AlertTriangle className="h-3 w-3 mr-1" />Sold Out</>
            ) : almostFull ? (
              <><AlertTriangle className="h-3 w-3 mr-1" />{remaining} left</>
            ) : (
              <>{remaining} spots available</>
            )}
          </Badge>
        </div>
        <Progress value={fillPercent} className="h-2" />
      </div>

      {/* Attendee list */}
      {rsvps.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Attendees
          </p>
          <div className="flex flex-wrap gap-2">
            {rsvps.map((rsvp) => (
              <div
                key={rsvp.id}
                className="inline-flex items-center gap-1.5 rounded-full bg-muted/50 border border-border/40 px-3 py-1 text-xs text-foreground"
              >
                <UserCheck className="h-3 w-3 text-accent" />
                <span>{rsvp.name}</span>
                {rsvp.guests > 1 && (
                  <span className="text-muted-foreground">+{rsvp.guests - 1}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
