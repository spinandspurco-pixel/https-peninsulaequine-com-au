import { useState, useRef, useCallback } from "react";
import { Upload, X, FileText, Image as ImageIcon, Film, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const MAX_FILES = 5;
const MAX_SIZE_MB = 10;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

const ACCEPTED_TYPES = [
  "image/jpeg", "image/png", "image/webp", "image/heic",
  "application/pdf", "video/mp4", "video/quicktime",
];

const ACCEPT_STRING = ACCEPTED_TYPES.join(",");

export type UploadedFile = {
  name: string;
  url: string;
  type: string;
  size: number;
};

interface FileUploadZoneProps {
  files: UploadedFile[];
  onFilesChange: (files: UploadedFile[]) => void;
  className?: string;
}

function getFileIcon(type: string) {
  if (type.startsWith("image/")) return <ImageIcon className="h-4 w-4 text-accent" />;
  if (type.startsWith("video/")) return <Film className="h-4 w-4 text-accent" />;
  return <FileText className="h-4 w-4 text-accent" />;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FileUploadZone({ files, onFilesChange, className }: FileUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFiles = useCallback(async (fileList: FileList | File[]) => {
    setError(null);
    const toUpload = Array.from(fileList);

    // Validate count
    if (files.length + toUpload.length > MAX_FILES) {
      setError(`Maximum ${MAX_FILES} files allowed`);
      return;
    }

    // Validate each file
    for (const file of toUpload) {
      if (file.size > MAX_SIZE_BYTES) {
        setError(`"${file.name}" exceeds ${MAX_SIZE_MB}MB limit`);
        return;
      }
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError(`"${file.name}" is not a supported file type`);
        return;
      }
    }

    setUploading(true);

    try {
      const uploaded: UploadedFile[] = [];

      for (const file of toUpload) {
        const ext = file.name.split(".").pop() || "bin";
        const path = `${crypto.randomUUID()}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("inquiry-attachments")
          .upload(path, file, { contentType: file.type });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("inquiry-attachments")
          .getPublicUrl(path);

        uploaded.push({
          name: file.name,
          url: urlData.publicUrl,
          type: file.type,
          size: file.size,
        });
      }

      onFilesChange([...files, ...uploaded]);
    } catch (err) {
      console.error("Upload failed:", err);
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }, [files, onFilesChange]);

  const removeFile = (index: number) => {
    onFilesChange(files.filter((_, i) => i !== index));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length) {
      uploadFiles(e.dataTransfer.files);
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Drop zone */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        disabled={uploading || files.length >= MAX_FILES}
        className={cn(
          "w-full flex flex-col items-center justify-center gap-2 p-6 rounded-lg border-2 border-dashed transition-all duration-200",
          isDragging
            ? "border-accent bg-accent/5"
            : "border-border hover:border-accent/40 hover:bg-muted/30",
          (uploading || files.length >= MAX_FILES) && "opacity-50 cursor-not-allowed"
        )}
      >
        {uploading ? (
          <Loader2 className="h-6 w-6 text-accent animate-spin" />
        ) : (
          <Upload className="h-6 w-6 text-muted-foreground" />
        )}
        <span className="text-sm text-muted-foreground text-center">
          {uploading
            ? "Uploading..."
            : files.length >= MAX_FILES
            ? "Maximum files reached"
            : "Drop files here or click to browse"}
        </span>
        <span className="text-xs text-muted-foreground/60">
          Images, PDFs, or videos · Max {MAX_SIZE_MB}MB each · Up to {MAX_FILES} files
        </span>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT_STRING}
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) {
            uploadFiles(e.target.files);
            e.target.value = "";
          }
        }}
      />

      {/* Error message */}
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {/* Uploaded file list */}
      {files.length > 0 && (
        <ul className="space-y-2">
          {files.map((file, i) => (
            <li
              key={i}
              className="flex items-center gap-3 px-3 py-2 rounded-lg bg-muted/40 border border-border text-sm"
            >
              {getFileIcon(file.type)}
              <span className="flex-1 truncate text-foreground">{file.name}</span>
              <span className="text-xs text-muted-foreground shrink-0">{formatSize(file.size)}</span>
              <button
                type="button"
                onClick={() => removeFile(i)}
                className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                aria-label={`Remove ${file.name}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
