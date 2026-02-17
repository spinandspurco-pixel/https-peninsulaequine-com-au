

# Private Attachments for Inquiries with Signed URLs

## Problem
The `inquiry-attachments` storage bucket is currently **public**, meaning anyone with the URL can access uploaded files (site photos, sketches, PDFs). These files may contain sensitive client information and should only be accessible to admins.

## Solution

### 1. Make the storage bucket private
- Run a migration to set the `inquiry-attachments` bucket to `public = false`
- Add RLS policies on `storage.objects` for the bucket:
  - **INSERT (anon/authenticated)**: Allow anyone to upload (needed for the inquiry form)
  - **SELECT (admin only)**: Only admins can download/view files
  - **DELETE (admin only)**: Only admins can delete files

### 2. Create a signed-URL edge function
Since the bucket will be private, the client can no longer use `getPublicUrl()`. Create an edge function `get-attachment-url` that:
- Accepts a file path (or array of paths)
- Validates the caller is an authenticated admin using `has_role()`
- Returns time-limited signed URLs (e.g., 1-hour expiry) using the Supabase service role client
- Returns 403 for non-admin users

### 3. Update FileUploadZone to store paths instead of public URLs
- After uploading, store just the **storage path** (e.g., `abc123.jpg`) in `attachment_urls` instead of the full public URL
- The upload itself still works for anonymous users via the INSERT policy

### 4. Update InquiryForm to use paths
- The `InquiryForm.tsx` already maps `attachments.map(a => a.url)` into `attachment_urls` -- this will now store paths instead of full URLs

### 5. Add admin attachment viewer
- Create a small helper hook `useSignedAttachmentUrls` that takes an array of paths, calls the edge function, and returns signed URLs
- Use this hook wherever admins view inquiry details (the admin pages)

---

## Technical Details

### Migration SQL
```sql
-- Make bucket private
UPDATE storage.buckets SET public = false WHERE id = 'inquiry-attachments';

-- Allow anyone to upload files
CREATE POLICY "Anyone can upload inquiry attachments"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'inquiry-attachments');

-- Only admins can read files
CREATE POLICY "Admins can read inquiry attachments"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'inquiry-attachments'
    AND has_role(auth.uid(), 'admin'::app_role)
  );

-- Only admins can delete files
CREATE POLICY "Admins can delete inquiry attachments"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'inquiry-attachments'
    AND has_role(auth.uid(), 'admin'::app_role)
  );
```

### Edge Function: `get-attachment-url`
- Accepts `{ paths: string[] }` in the request body
- Uses service role Supabase client to call `storage.from('inquiry-attachments').createSignedUrls(paths, 3600)`
- Returns the signed URLs array
- Validates JWT and checks admin role before proceeding

### FileUploadZone Changes
- Replace `getPublicUrl(path)` with storing just the `path` string directly
- The `url` field in `UploadedFile` will now contain the storage path (not a full URL)
- Thumbnail previews during upload can use a temporary object URL (`URL.createObjectURL(file)`) instead

### Files Modified
1. **New migration** -- bucket privacy + storage RLS policies
2. **New file**: `supabase/functions/get-attachment-url/index.ts` -- signed URL generator
3. **Edit**: `src/components/FileUploadZone.tsx` -- store path instead of public URL, use object URLs for preview
4. **New file**: `src/hooks/useSignedAttachmentUrls.ts` -- admin hook to resolve paths to signed URLs
5. **Edit**: `src/components/InquiryForm.tsx` -- minor: `attachment_urls` now stores paths (no functional change needed since it already maps `a.url`)

