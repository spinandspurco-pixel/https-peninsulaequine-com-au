import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  melbourneGreeting,
  melbourneOvernightStart,
  melbourneTodayStart,
} from "@/lib/commandCentre/time";

/**
 * Builds the one-sentence "Morning Brief" headline.
 *
 * The shape is intentionally first-person when a display name is known, and
 * falls back to institutional tone when not. The hook only *reads* — it
 * composes a sentence from the same cheap counts the Priority cards use.
 */
export interface MorningBrief {
  greeting: string;
  displayName: string | null;
  sentence: string;
}

async function fetchBriefCounts(userId: string | null) {
  const overnight = melbourneOvernightStart();
  const today = melbourneTodayStart();

  const [enquiriesOvernight, followUpsToday, staffProfile] = await Promise.all([
    supabase
      .from("inquiries")
      .select("id", { count: "exact", head: true })
      .eq("is_demo", false)
      .gte("created_at", overnight),
    supabase
      .from("inquiries")
      .select("id", { count: "exact", head: true })
      .eq("is_demo", false)
      .not("next_follow_up_at", "is", null)
      .lt("next_follow_up_at", new Date().toISOString()),
    userId
      ? supabase
          .from("staff_profiles")
          .select("display_name")
          .eq("user_id", userId)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  return {
    enquiriesOvernight: enquiriesOvernight.count ?? 0,
    followUpsDue: followUpsToday.count ?? 0,
    displayName:
      (staffProfile.data as { display_name?: string | null } | null)?.display_name ?? null,
    today,
    overnight,
  };
}

function composeSentence(
  greeting: string,
  displayName: string | null,
  data: { enquiriesOvernight: number; followUpsDue: number },
): string {
  const fragments: string[] = [];
  if (data.enquiriesOvernight > 0) {
    fragments.push(
      data.enquiriesOvernight === 1
        ? "1 new enquiry arrived overnight"
        : `${data.enquiriesOvernight} new enquiries arrived overnight`,
    );
  }
  if (data.followUpsDue > 0) {
    fragments.push(
      data.followUpsDue === 1
        ? "1 follow-up is due"
        : `${data.followUpsDue} follow-ups are due`,
    );
  }

  if (fragments.length === 0) {
    fragments.push("nothing is waiting on you");
  }

  const body = fragments.join(" · ");
  if (displayName) {
    const first = displayName.trim().split(/\s+/)[0];
    return `${greeting}, ${first} — ${body}.`;
  }
  // Institutional fallback: drop the greeting, keep it factual.
  const capitalised = body.charAt(0).toUpperCase() + body.slice(1);
  return `${capitalised}.`;
}

export function useMorningBrief(userId: string | null | undefined) {
  const greeting = useMemo(() => melbourneGreeting(), []);
  const query = useQuery({
    queryKey: ["command-centre", "morning-brief", userId ?? "anon"],
    queryFn: () => fetchBriefCounts(userId ?? null),
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: true,
  });

  const brief: MorningBrief | null = query.data
    ? {
        greeting,
        displayName: query.data.displayName,
        sentence: composeSentence(greeting, query.data.displayName, query.data),
      }
    : null;

  return { brief, isLoading: query.isLoading, error: query.error };
}
