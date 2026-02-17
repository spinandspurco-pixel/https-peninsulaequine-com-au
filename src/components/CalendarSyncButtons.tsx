import { CalendarPlus, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildGoogleCalendarUrl, downloadICSFile, type CalendarEvent } from "@/lib/calendarSync";

interface CalendarSyncButtonsProps {
  event: CalendarEvent;
  /** Compact renders smaller inline buttons */
  compact?: boolean;
  className?: string;
}

/**
 * Pair of calendar sync buttons: Google Calendar link + .ics download.
 * Works with Apple Calendar, Outlook, Google Calendar, and any standards-compliant app.
 */
export function CalendarSyncButtons({ event, compact, className }: CalendarSyncButtonsProps) {
  const googleUrl = buildGoogleCalendarUrl(event);

  if (compact) {
    return (
      <div className={`flex flex-wrap gap-2 ${className || ""}`}>
        <a
          href={googleUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-accent transition-colors"
        >
          <ExternalLink className="h-3.5 w-3.5" /> Google Cal
        </a>
        <button
          onClick={() => downloadICSFile(event)}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-accent transition-colors"
        >
          <CalendarPlus className="h-3.5 w-3.5" /> .ics (Apple/Outlook)
        </button>
      </div>
    );
  }

  return (
    <div className={`flex flex-wrap justify-center gap-3 ${className || ""}`}>
      <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
        <a href={googleUrl} target="_blank" rel="noopener noreferrer">
          <ExternalLink className="mr-2 h-4 w-4" />
          Add to Google Calendar
        </a>
      </Button>
      <Button variant="outline" onClick={() => downloadICSFile(event)}>
        <CalendarPlus className="mr-2 h-4 w-4" />
        Download .ics
      </Button>
    </div>
  );
}
