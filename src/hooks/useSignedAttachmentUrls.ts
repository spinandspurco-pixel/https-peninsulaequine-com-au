import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SignedUrl {
  path: string | null;
  signedUrl: string;
  error: string | null;
}

export function useSignedAttachmentUrls(paths: string[] | null | undefined) {
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!paths || paths.length === 0) {
      setUrls({});
      return;
    }

    let cancelled = false;

    const fetchUrls = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error: fnError } = await supabase.functions.invoke(
          "get-attachment-url",
          { body: { paths } }
        );

        if (cancelled) return;

        if (fnError) {
          setError("Failed to load attachments");
          console.error("Signed URL fetch error:", fnError);
          return;
        }

        const urlMap: Record<string, string> = {};
        (data.urls as SignedUrl[]).forEach((item) => {
          if (item.path && item.signedUrl) {
            urlMap[item.path] = item.signedUrl;
          }
        });
        setUrls(urlMap);
      } catch (err) {
        if (!cancelled) {
          setError("Failed to load attachments");
          console.error("Signed URL fetch error:", err);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchUrls();

    return () => {
      cancelled = true;
    };
  }, [JSON.stringify(paths)]);

  return { urls, loading, error };
}
