import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { Camera, X, Loader2, ImagePlus } from "lucide-react";
import { toast } from "sonner";

interface DocumentPhotoUploadProps {
  userId: string;
  onPhotosChange: (urls: string[]) => void;
  photos: string[];
  maxPhotos?: number;
}

export function DocumentPhotoUpload({ userId, onPhotosChange, photos, maxPhotos = 5 }: DocumentPhotoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (photos.length + files.length > maxPhotos) {
      toast.error(`Maximum ${maxPhotos} photos allowed`);
      return;
    }

    setUploading(true);
    const newUrls: string[] = [];

    try {
      for (const file of Array.from(files)) {
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`${file.name} exceeds 10MB limit`);
          continue;
        }

        const ext = file.name.split(".").pop();
        const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

        const { error } = await supabase.storage
          .from("staff-document-photos")
          .upload(path, file, { upsert: false });

        if (error) {
          toast.error(`Upload failed: ${error.message}`);
          continue;
        }

        newUrls.push(path);
      }

      if (newUrls.length > 0) {
        onPhotosChange([...photos, ...newUrls]);
        toast.success(`${newUrls.length} photo(s) uploaded`);
      }
    } catch (err) {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const removePhoto = async (path: string) => {
    await supabase.storage.from("staff-document-photos").remove([path]);
    onPhotosChange(photos.filter((p) => p !== path));
  };

  const getPublicUrl = (path: string) => {
    const { data } = supabase.storage.from("staff-document-photos").getPublicUrl(path);
    return data.publicUrl;
  };

  return (
    <div className="space-y-3">
      <Label className="flex items-center gap-2">
        <Camera className="h-4 w-4" />
        Site Photos ({photos.length}/{maxPhotos})
      </Label>

      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {photos.map((path) => (
            <div key={path} className="relative group rounded-lg overflow-hidden border border-border bg-muted aspect-square">
              <img
                src={getPublicUrl(path)}
                alt="Site photo"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => removePhoto(path)}
                className="absolute top-1 right-1 bg-background/80 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {photos.length < maxPhotos && (
        <div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            capture="environment"
            onChange={handleUpload}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
            className="w-full border-dashed"
          >
            {uploading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <ImagePlus className="mr-2 h-4 w-4" />
            )}
            {uploading ? "Uploading…" : "Add Photos"}
          </Button>
        </div>
      )}
    </div>
  );
}
