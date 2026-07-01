import { useCallback, useEffect, useRef, useState } from "react";
import {
  friendlyUploadMessage,
  preflightValidateFile,
  uploadInquiryAttachment,
  UploadValidationError,
  type AttachmentRecord,
} from "@/lib/uploadInquiryAttachment";

export type AttachmentStatus =
  | { state: "pending" }
  | { state: "uploading"; progress: number }
  | { state: "success"; record: AttachmentRecord }
  | { state: "error"; code: string; message: string };

export interface UseAttachmentUploadResult {
  /** Per-file status aligned with the `files` argument passed to uploadAll/syncFiles. */
  statuses: AttachmentStatus[];
  /** True while any file is actively uploading. */
  isUploading: boolean;
  /** True when at least one file finished in the "error" state. */
  hasErrors: boolean;
  /** Number of files currently in the "error" state. */
  errorCount: number;
  /** Concise inline message summarising failed uploads (for use near submit). */
  errorSummary: string | null;
  /**
   * Uploads any file that isn't already `success`. Resolves with the full
   * record set (in file order) on success, throws on the first failure so
   * the caller can halt submission. Successful records are preserved
   * across retries, so a subsequent call only re-attempts the failures.
   */
  uploadAll: (files: File[]) => Promise<AttachmentRecord[]>;
  /** Cancel any in-flight upload and clear state. */
  reset: () => void;
  /** Keep status array length in sync when the caller adds/removes files. */
  syncFiles: (files: File[]) => void;
}

const pending = (): AttachmentStatus => ({ state: "pending" });

function sameFile(a: File | undefined, b: File | undefined): boolean {
  if (!a || !b) return false;
  return (
    a.name === b.name &&
    a.size === b.size &&
    a.lastModified === b.lastModified
  );
}

export function useAttachmentUpload(): UseAttachmentUploadResult {
  const [statuses, setStatuses] = useState<AttachmentStatus[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const statusesRef = useRef<AttachmentStatus[]>([]);
  const filesRef = useRef<File[]>([]);
  const folderRef = useRef<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      abortRef.current?.abort();
    };
  }, []);

  const write = useCallback((next: AttachmentStatus[]) => {
    statusesRef.current = next;
    if (mountedRef.current) setStatuses(next);
  }, []);

  const patch = useCallback(
    (index: number, value: AttachmentStatus) => {
      const next = statusesRef.current.slice();
      next[index] = value;
      write(next);
    },
    [write],
  );

  const syncFiles = useCallback(
    (files: File[]) => {
      // Preserve status for files that are byte-identical at the same slot;
      // treat any change as a fresh pending entry. Run a preflight so
      // obvious size/type failures render inline immediately, without
      // waiting for the user to submit.
      const prevFiles = filesRef.current;
      const prev = statusesRef.current;
      const next: AttachmentStatus[] = files.map((f, i) => {
        if (sameFile(prevFiles[i], f) && prev[i]) return prev[i];
        const issue = preflightValidateFile(f);
        if (issue) {
          return {
            state: "error",
            code: issue.code,
            message: friendlyUploadMessage(issue.code, issue.details, f.name),
          };
        }
        return pending();
      });
      filesRef.current = files.slice();
      write(next);
    },
    [write],
  );

  const reset = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    folderRef.current = null;
    filesRef.current = [];
    write([]);
    setIsUploading(false);
  }, [write]);

  const uploadAll = useCallback(
    async (files: File[]): Promise<AttachmentRecord[]> => {
      // Ensure statuses & filesRef reflect the caller's current list.
      syncFiles(files);
      if (!folderRef.current) folderRef.current = crypto.randomUUID();

      const controller = new AbortController();
      abortRef.current?.abort();
      abortRef.current = controller;

      setIsUploading(true);
      try {
        for (let i = 0; i < files.length; i++) {
          const current = statusesRef.current[i];
          if (current?.state === "success") continue;
          // Preflight already flagged this file — skip the roundtrip and
          // keep the inline error surfaced.
          if (current?.state === "error") {
            const issue = preflightValidateFile(files[i]);
            if (issue) {
              throw new UploadValidationError({
                message: friendlyUploadMessage(issue.code, issue.details, files[i].name),
                code: issue.code,
                details: issue.details,
                fileName: files[i].name,
              });
            }
          }

          patch(i, { state: "uploading", progress: 0 });
          try {
            const uploaded = await uploadInquiryAttachment(
              files[i],
              folderRef.current!,
              {
                signal: controller.signal,
                onProgress: (p) =>
                  patch(i, { state: "uploading", progress: p }),
              },
            );
            const record: AttachmentRecord = {
              id: uploaded.id,
              path: uploaded.path,
              name: uploaded.name,
              size: uploaded.size,
              mime: uploaded.mime,
              uploaded_at: new Date().toISOString(),
            };
            patch(i, { state: "success", record });
          } catch (err) {
            const uve =
              err instanceof UploadValidationError
                ? err
                : new UploadValidationError({
                    message:
                      (err as Error)?.message ??
                      "Upload failed. Please try again.",
                    code: "upload_failed",
                    fileName: files[i].name,
                  });
            patch(i, {
              state: "error",
              code: uve.code,
              message: uve.message,
            });
            throw uve;
          }
        }

        return statusesRef.current
          .map((s) => (s.state === "success" ? s.record : null))
          .filter((r): r is AttachmentRecord => r !== null);
      } finally {
        if (mountedRef.current) setIsUploading(false);
      }
    },
    [patch, syncFiles],
  );

  const errorCount = statuses.reduce((n, s) => (s.state === "error" ? n + 1 : n), 0);
  const hasErrors = errorCount > 0;
  const errorSummary = hasErrors
    ? errorCount === 1
      ? (statuses.find((s) => s.state === "error") as { message: string } | undefined)?.message ?? null
      : `${errorCount} files couldn't be uploaded. Retry them or remove them before submitting.`
    : null;

  return { statuses, isUploading, hasErrors, errorCount, errorSummary, uploadAll, reset, syncFiles };
}
