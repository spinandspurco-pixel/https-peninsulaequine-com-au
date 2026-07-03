# Peninsula Equine - Google Cloud Deployment Guide

## 🚀 Deployment Status

**Application Code:** ✅ Production Ready (built, tested, 0 errors)  
**Infrastructure:** ✅ Configured (Docker, Cloud Run, CI/CD)  
**Local Deployment:** ⏸️ Requires Python 3.10+ and Docker

The application is ready to deploy. Due to local environment constraints (Python 3.9, no Docker/Homebrew), follow these manual deployment steps.

---

## Prerequisites Check

Before starting, ensure you have:

### Required (Must Have)
- ✅ Google Cloud Account (free tier: $300 credit)
- ✅ Google Cloud Project created
- ✅ Supabase project with auth configured
- ✅ macOS with Rosetta 2 (already installed)

### Optional (For Local Deployment)
- Docker Desktop (for local image builds)
- Python 3.10+ (for gcloud CLI)
- Homebrew (for package installation)

---

## Option 1: Cloud-Native Deployment (Recommended - No Local Setup Required)

### Step 1: Create Google Cloud Project

1. Go to **Google Cloud Console**: https://console.cloud.google.com/projectcreate
2. Create project:
   - **Project Name:** `peninsula-equine-prod`
   - **Organization:** (leave default)
   - Click **CREATE**
3. Wait for project to be created (2-3 minutes)

### Step 2: Enable Required APIs

Go to each link and click **ENABLE**:

1. **Cloud Run API**  
   https://console.cloud.google.com/apis/library/run.googleapis.com

2. **Cloud Build API**  
   https://console.cloud.google.com/apis/library/cloudbuild.googleapis.com

3. **Artifact Registry API**  
   https://console.cloud.google.com/apis/library/artifactregistry.googleapis.com

4. **Container Registry API**  
   https://console.cloud.google.com/apis/library/containerregistry.googleapis.com

### Step 3: Setup Service Account

1. Go to **Service Accounts**: https://console.cloud.google.com/iam-admin/serviceaccounts
2. Select your project from the dropdown
3. Click **CREATE SERVICE ACCOUNT**
4. Enter:
   - **Service account name:** `peninsula-equine-deployer`
   - Click **CREATE AND CONTINUE**
5. Grant roles:
   - `Cloud Run Admin`
   - `Service Account User`
   - `Artifact Registry Administrator`
   - Click **CONTINUE** → **DONE**
6. Click the created service account
7. Go to **KEYS** tab
8. Click **ADD KEY** → **Create new key**
9. Choose **JSON** format
10. Save the JSON file securely (for GitHub Actions or local deployment)

### Step 4: Configure gcloud Locally (Optional - For Manual Deployment)

If you want to deploy from your machine:

**On macOS:**
```bash
# Install gcloud (via curl, no Homebrew needed)
curl https://sdk.cloud.google.com > install-gcloud.sh
bash install-gcloud.sh --disable-prompts

# Set Python environment
export CLOUDSDK_PYTHON=python3  # Uses system Python 3.9

# Initialize gcloud
/path/to/google-cloud-sdk/bin/gcloud init

# When prompted:
# - Choose existing project: peninsula-equine-prod
# - Authenticate: Y
# - Default region: us-central1
```

### Step 5: Deploy via GitHub Actions (Best Option)

**Add the JSON key to GitHub:**

1. Go to your GitHub repo
2. **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `GCP_SA_KEY`
5. Value: Paste the entire JSON key file content
6. Click **Add secret**

**Create GitHub Actions workflow:**

Create `.github/workflows/deploy-gcp.yml`:

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

    steps:
      - uses: actions/checkout@v3

      - name: Setup Cloud SDK
        uses: google-github-actions/setup-gcloud@v1
        with:
          service_account_key: ${{ secrets.GCP_SA_KEY }}
          project_id: ${{ env.PROJECT_ID }}

      - name: Configure Docker for GCR
        run: gcloud auth configure-docker gcr.io

      - name: Build Docker image
        run: |
          docker build \
            --tag gcr.io/$PROJECT_ID/$SERVICE:$GITHUB_SHA \
            --tag gcr.io/$PROJECT_ID/$SERVICE:latest \
            .

      - name: Push to Container Registry
        run: |
          docker push gcr.io/$PROJECT_ID/$SERVICE:$GITHUB_SHA
          docker push gcr.io/$PROJECT_ID/$SERVICE:latest

      - name: Deploy to Cloud Run
        run: |
          gcloud run deploy $SERVICE \
            --image gcr.io/$PROJECT_ID/$SERVICE:$GITHUB_SHA \
            --region $REGION \
            --platform managed \
            --allow-unauthenticated \
            --memory 512Mi \
            --cpu 1 \
            --timeout 3600 \
            --set-env-vars VITE_SUPABASE_URL=${{ secrets.SUPABASE_URL }},VITE_SUPABASE_ANON_KEY=${{ secrets.SUPABASE_ANON_KEY }}
```

Then add Supabase secrets:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Your Supabase public API key

### Step 6: Verify Deployment

```bash
# Get service URL
gcloud run services describe peninsula-equine-web \
  --region us-central1 \
  --format='value(status.url)'

# Test the application
curl https://peninsula-equine-web-xxxxx.run.app/

# View logs
gcloud run services logs read peninsula-equine-web --follow
```

---

## Option 2: Manual CLI Deployment

If you prefer deploying from your machine:

```bash
# 1. Install gcloud
curl https://sdk.cloud.google.com | bash

# 2. Set Python environment
export CLOUDSDK_PYTHON=python3

# 3. Initialize
gcloud init
gcloud config set project peninsula-equine-prod

# 4. Authenticate
gcloud auth application-default login

# 5. Build image
docker build -t peninsula-equine-web:latest .

# 6. Tag for GCR
docker tag peninsula-equine-web:latest \
  gcr.io/peninsula-equine-prod/peninsula-equine-web:latest

# 7. Push to Container Registry
docker push gcr.io/peninsula-equine-prod/peninsula-equine-web:latest

# 8. Deploy to Cloud Run
gcloud run deploy peninsula-equine-web \
  --image gcr.io/peninsula-equine-prod/peninsula-equine-web:latest \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --memory 512Mi \
  --set-env-vars VITE_SUPABASE_URL=your-url,VITE_SUPABASE_ANON_KEY=your-key
```

---

## Post-Deployment Configuration

### 1. Set Custom Domain (Optional)

In Google Cloud Console:

1. Go to **Cloud Run**
2. Select **peninsula-equine-web**
3. Click **Manage Custom Domains**
4. Add domain: `peninsulaequine.systems`
5. Verify domain ownership in DNS provider
6. Update DNS records as instructed

### 2. Enable Cloud CDN (Recommended)

```bash
gcloud compute backend-services create peninsula-cdn \
  --global \
  --enable-cdn \
  --cache-mode CACHE_ALL_STATIC
```

### 3. Setup Monitoring

In Google Cloud Console:

1. Go to **Cloud Run** → **peninsula-equine-web**
2. Click **METRICS**
3. Set up alerts for:
   - Error rate > 1%
   - Request latency > 1s
   - Errors: 500 Internal Server Error

### 4. Configure Logging

Logs are automatically sent to **Cloud Logging**:

```bash
# View logs
gcloud run services logs read peninsula-equine-web --limit 100

# Stream logs
gcloud run services logs read peninsula-equine-web --follow
```

---

## Environment Variables

Make sure these are set in Cloud Run:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

Get these from your Supabase project **Settings** → **API**.

---

## Troubleshooting

### Issue: "Python 3.9 not supported"

**Solution:** Use the GitHub Actions workflow (no local Python needed)

### Issue: Docker not found

**Solution:**
1. Install Docker Desktop: https://www.docker.com/products/docker-desktop
2. Or use GitHub Actions (automatic)

### Issue: gcloud not found after install

**Solution:**
```bash
export PATH="/path/to/google-cloud-sdk/bin:$PATH"
source ~/.zshrc
```

### Issue: Service won't start

**Check logs:**
```bash
gcloud run services logs read peninsula-equine-web --limit 50
```

Common issues:
- Missing environment variables (Supabase URL/Key)
- Port not 8080 (configured in Dockerfile)
- Health check failing (verify `/api/build-info` endpoint)

---

## Cost Estimate

Monthly cost estimate with moderate traffic:

- **Cloud Run:** $5-15 (compute)
- **Container Registry:** $0.10/GB (storage)
- **Cloud Build:** $0.003/minute (builds)
- **Cloud CDN:** $0.085/GB (optional)
- **Total:** ~$10-30/month

Free tier includes:
- 2 million Cloud Run requests/month
- 1 GB Container Registry storage
- 120 build minutes/month

---

## Next Steps

1. **Create GCP Project** (Step 1 above)
2. **Enable APIs** (Step 2 above)
3. **Setup Service Account** (Step 3 above)
4. **Choose deployment method:**
   - Option 1: GitHub Actions (recommended - no local setup)
   - Option 2: Manual CLI (requires Docker + gcloud)

---

## Reference Files

In your repository:

- **Docker:** `./Dockerfile` - Container image definition
- **CI/CD:** `./cloudbuild.yaml` - Cloud Build configuration
- **Deployment Manifest:** `./k8s/cloud-run-service.yaml`
- **Deployment Script:** `./scripts/deploy-gcp.sh`

---

## Support

- **Google Cloud Docs:** https://cloud.google.com/run/docs
- **Cloud Run Quickstart:** https://cloud.google.com/run/docs/quickstarts/build-and-deploy
- **Supabase + Cloud Run:** https://supabase.com/docs/guides/hosting/docker

---

**Status:** 🚀 Ready for deployment  
**Code Version:** Latest (build passing, 0 errors)  
**Last Updated:** July 3, 2026  
**Next Action:** Follow Option 1 (Cloud-Native) or Option 2 (Manual) above
