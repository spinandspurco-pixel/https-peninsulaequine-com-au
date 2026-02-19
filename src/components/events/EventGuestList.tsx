import { useEffect, useState, useCallback } from "react";
import { Users, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface EventGuestListProps {
  eventId: string;
  totalSpots: number;
  onSpotsChange?: (remaining: number) => void;
}

interface RsvpCounts {
  total_guests: number;
  confirmed_guests: number;
  waitlisted_guests: number;
  rsvp_count: number;
}

export function EventGuestList({ eventId, totalSpots, onSpotsChange }: EventGuestListProps) {
  const [counts, setCounts] = useState<RsvpCounts>({ total_guests: 0, confirmed_guests: 0, waitlisted_guests: 0, rsvp_count: 0 });
  const [loading, setLoading] = useState(true);

  const totalGuests = counts.total_guests;
  const remaining = Math.max(0, totalSpots - totalGuests);
  const fillPercent = totalSpots > 0 ? Math.min(100, (totalGuests / totalSpots) * 100) : 0;
  const almostFull = remaining <= Math.ceil(totalSpots * 0.15);
  const soldOut = remaining === 0;

  useEffect(() => {
    onSpotsChange?.(remaining);
  }, [remaining, onSpotsChange]);

  const fetchCounts = useCallback(async () => {
    const { data } = await supabase
      .rpc("get_event_rsvp_counts", { p_event_id: eventId });
    if (data && data.length > 0) {
      const row = data[0];
      setCounts({
        total_guests: Number(row.total_guests) || 0,
        confirmed_guests: Number(row.confirmed_guests) || 0,
        waitlisted_guests: Number(row.waitlisted_guests) || 0,
        rsvp_count: Number(row.rsvp_count) || 0,
      });
    }
    setLoading(false);
  }, [eventId]);

  // Initial fetch
  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  // Realtime: re-fetch counts on any change to event_rsvps for this event
  useEffect(() => {
    const channel = supabase
      .channel(`rsvp-counts-${eventId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "event_rsvps",
          filter: `event_id=eq.${eventId}`,
        },
        () => {
          fetchCounts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId, fetchCounts]);

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
    </div>
  );
}
