# 🔐 Google Cloud Authentication - Next Steps

## Current Status

✅ **Application:** Production-ready, built, deployed infrastructure configured  
✅ **Code:** 0 TypeScript errors, 0 ESLint errors, build passing  
⚠️ **Local Auth:** Blocked by Python 3.9 (gcloud requires 3.10+)

---

## 🚀 Recommended: GitHub Actions Deployment

**This is the easiest path - no local setup needed!**

### Step 1: Create GCP Service Account

1. Go to **Google Cloud Console**: https://console.cloud.google.com
2. Select your project: `peninsula-equine-prod`
3. Navigate to **IAM & Admin** → **Service Accounts**
4. Click **CREATE SERVICE ACCOUNT**
5. Fill in:
   - **Service Account Name:** `peninsula-equine-deployer`
   - Click **CREATE AND CONTINUE**
6. Grant roles:
   - ✅ `Cloud Run Admin`
   - ✅ `Service Account User`
   - ✅ `Artifact Registry Administrator`
   - Click **CONTINUE** → **DONE**

### Step 2: Create & Download Service Account Key

1. Click the service account you just created
2. Go to **KEYS** tab
3. Click **ADD KEY** → **Create new key**
4. Choose **JSON**
5. Click **CREATE** (file downloads automatically)
6. **Keep this file secure!**

### Step 3: Add GitHub Secrets

1. Go to your **GitHub Repository**
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Create the following secrets:

#### Secret 1: GCP_SA_KEY
- **Name:** `GCP_SA_KEY`
- **Value:** Paste the entire JSON key file content (the file you just downloaded)

#### Secret 2: SUPABASE_URL
- **Name:** `SUPABASE_URL`
- **Value:** Your Supabase URL (from Supabase dashboard → Settings → API)
- Example: `https://your-project.supabase.co`

#### Secret 3: SUPABASE_ANON_KEY
- **Name:** `SUPABASE_ANON_KEY`
- **Value:** Your Supabase public key (from Supabase dashboard → Settings → API)
- Example: `eyJhbGc...` (long string starting with "eyJ")

### Step 4: Create GitHub Actions Workflow

Create a new file: `.github/workflows/deploy-gcp.yml`

```yaml
name: Deploy to Google Cloud Run

on:
  push:
    branches: [main]
  workflow_dispatch:

env:
  PROJECT_ID: peninsula-equine-prod
  REGION: us-central1
  SERVICE: peninsula-equine-web

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      id-token: write

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Set up Cloud SDK
        uses: google-github-actions/setup-gcloud@v1
        with:
          service_account_key: ${{ secrets.GCP_SA_KEY }}
          project_id: ${{ env.PROJECT_ID }}

      - name: Configure Docker authentication
        run: |
          gcloud auth configure-docker gcr.io

      - name: Build Docker image
        run: |
          docker build \
            --tag gcr.io/${{ env.PROJECT_ID }}/${{ env.SERVICE }}:${{ github.sha }} \
            --tag gcr.io/${{ env.PROJECT_ID }}/${{ env.SERVICE }}:latest \
            .

      - name: Push to Container Registry
        run: |
          docker push gcr.io/${{ env.PROJECT_ID }}/${{ env.SERVICE }}:${{ github.sha }}
          docker push gcr.io/${{ env.PROJECT_ID }}/${{ env.SERVICE }}:latest

      - name: Deploy to Cloud Run
        run: |
          gcloud run deploy ${{ env.SERVICE }} \
            --image gcr.io/${{ env.PROJECT_ID }}/${{ env.SERVICE }}:${{ github.sha }} \
            --region ${{ env.REGION }} \
            --platform managed \
            --allow-unauthenticated \
            --memory 512Mi \
            --cpu 1 \
            --timeout 3600 \
            --set-env-vars VITE_SUPABASE_URL=${{ secrets.SUPABASE_URL }},VITE_SUPABASE_ANON_KEY=${{ secrets.SUPABASE_ANON_KEY }}

      - name: Get service URL
        run: |
          gcloud run services describe ${{ env.SERVICE }} \
            --region ${{ env.REGION }} \
            --format='value(status.url)'
```

### Step 5: Deploy!

**Option A: Automatic Deploy**
```bash
git push origin main
```
GitHub Actions will automatically build and deploy!

**Option B: Manual Trigger**
1. Go to GitHub repo
2. Click **Actions** tab
3. Select **Deploy to Google Cloud Run**
4. Click **Run workflow** → **Run workflow**

### Step 6: Monitor Deployment

1. Go to GitHub repo **Actions** tab
2. Watch the workflow run (typically 5-10 minutes)
3. Once green ✅, your app is live!

**Get the service URL:**
```bash
gcloud run services describe peninsula-equine-web \
  --region us-central1 \
  --format='value(status.url)'
```

---

## ⚙️ Alternative: Local Deployment (Requires Python 3.10+)

If you want to deploy from your machine instead of GitHub Actions:

### Option A: Install Python 3.11 (macOS)

1. Download Python 3.11 from: https://www.python.org/downloads/
2. Install it
3. Find the path:
   ```bash
   which python3.11
   # Output: /usr/local/bin/python3.11
   ```

4. Set environment variable:
   ```bash
   export CLOUDSDK_PYTHON=/usr/local/bin/python3.11
   echo 'export CLOUDSDK_PYTHON=/usr/local/bin/python3.11' >> ~/.zshrc
   ```

5. Verify gcloud works:
   ```bash
   gcloud --version
   ```

6. Initialize gcloud:
   ```bash
   gcloud init
   gcloud config set project peninsula-equine-prod
   gcloud auth application-default login
   ```

7. Deploy:
   ```bash
   ./scripts/deploy-gcp.sh
   ```

### Option B: Use Docker

If you have Docker installed:

```bash
# Build image
docker build -t peninsula-equine-web:latest .

# Tag for GCR
docker tag peninsula-equine-web:latest \
  gcr.io/peninsula-equine-prod/peninsula-equine-web:latest

# Push to Container Registry
docker push gcr.io/peninsula-equine-prod/peninsula-equine-web:latest

# Deploy to Cloud Run
gcloud run deploy peninsula-equine-web \
  --image gcr.io/peninsula-equine-prod/peninsula-equine-web:latest \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --memory 512Mi \
  --set-env-vars VITE_SUPABASE_URL=your-url,VITE_SUPABASE_ANON_KEY=your-key
```

---

## 🌐 Manual Web Console Deployment

If you don't want to use CLI or GitHub Actions:

1. Go to **Google Cloud Console**: https://console.cloud.google.com/run
2. Click **CREATE SERVICE**
3. Choose **Deploy one revision from an image**
4. Build image:
   - Go to **Artifact Registry** → **Create repository**
   - Name: `peninsula-equine`
   - Location: `us-central1`
5. Push your Docker image to Artifact Registry
6. Create Cloud Run service pointing to the image

---

## ✅ Post-Deployment Checklist

After deployment completes:

- [ ] Get service URL from Cloud Run console
- [ ] Test homepage: `curl https://peninsula-equine-web-xxxxx.run.app/`
- [ ] Test HQ login: Visit `/hq/login`
- [ ] Check logs: `gcloud run services logs read peninsula-equine-web`
- [ ] Setup monitoring: Cloud Run console → Metrics tab
- [ ] Configure custom domain (optional): Cloud Run → Manage custom domains

---

## 🔗 Useful Links

- **Google Cloud Console:** https://console.cloud.google.com
- **Cloud Run Services:** https://console.cloud.google.com/run
- **Container Registry:** https://console.cloud.google.com/artifacts
- **Service Accounts:** https://console.cloud.google.com/iam-admin/serviceaccounts
- **Deployment Guide:** `GCP_DEPLOYMENT_READY.md`
- **HQ Login Guide:** `HQ_LOGIN_GUIDE.md`

---

## 🆘 Troubleshooting

### GitHub Actions Deployment Failed

**Check logs:**
1. Go to GitHub repo → **Actions** tab
2. Click the failed workflow
3. Check step output for errors

**Common issues:**
- ❌ `Invalid JSON key` → Ensure you copied the entire JSON key
- ❌ `403 Permission denied` → Service account lacks required roles
- ❌ `Secret not found` → Verify secret names exactly match (case-sensitive)

### Gcloud Python Error

**Error:** `gcloud failed to load. Python 3.9 not supported`

**Solutions:**
1. Upgrade to Python 3.10+
2. Use GitHub Actions (recommended - no local setup needed)
3. Use Google Cloud Console UI

### Service won't start

**Check logs:**
```bash
gcloud run services logs read peninsula-equine-web --limit 50
```

**Common causes:**
- Missing `VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY` environment variables
- Port mismatch (app must listen on 8080)
- Health check endpoint not responding

---

## 📊 Deployment Timeline

- **GitHub Actions:** 5-10 minutes (automatic)
- **Manual CLI:** 10-15 minutes (with Python 3.10+)
- **Web Console:** 15-20 minutes (manual steps)

---

## 🎯 Recommended Path

1. **Create GCP project** ✅
2. **Create service account** ✅
3. **Add GitHub secrets** ← You are here
4. **Create workflow file** ← Next
5. **Push to main** ← Deploy!

**Estimated time:** 15 minutes to live production

---

**Status:** 🚀 Ready to deploy  
**Code:** Production-ready (build passing, 0 errors)  
**Next Action:** Follow GitHub Actions steps above

Need help? Check `GCP_DEPLOYMENT_READY.md` for detailed instructions.
