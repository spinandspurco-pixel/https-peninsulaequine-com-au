# Peninsula Equine - Google Cloud Deployment Guide

Complete infrastructure setup for deploying Peninsula Equine website and HQ to Google Cloud Platform with enterprise-grade security, scalability, and monitoring.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Setup Process](#setup-process)
3. [Configuration](#configuration)
4. [Deployment](#deployment)
5. [Monitoring & Maintenance](#monitoring--maintenance)
6. [Disaster Recovery](#disaster-recovery)
7. [Cost Optimization](#cost-optimization)

---

## Prerequisites

### Required Accounts & Services
- ✅ Google Cloud Platform account with billing enabled
- ✅ Docker installed locally (`docker --version`)
- ✅ Google Cloud SDK (`gcloud --version`)
- ✅ Git configured with GitHub access
- ✅ Supabase project with credentials

### Required Permissions
- Cloud Run Admin
- Service Account Admin
- Container Registry Service Agent
- Cloud Build Editor

### Environment Variables
```bash
export GCP_PROJECT_ID="peninsula-equine-prod"
export GCP_REGION="us-central1"
export VITE_SUPABASE_URL="your-supabase-url"
export VITE_SUPABASE_ANON_KEY="your-supabase-key"
```

---

## Setup Process

### Step 1: Install Google Cloud SDK

#### macOS (using curl)
```bash
curl https://sdk.cloud.google.com > install-gcloud.sh
bash install-gcloud.sh --disable-prompts --path-update=true
source ~/.bashrc  # or ~/.zshrc
```

#### Linux/Windows
Visit: https://cloud.google.com/sdk/docs/install

### Step 2: Authenticate with Google Cloud

```bash
# Initialize gcloud
gcloud init

# Authenticate with Application Default Credentials
gcloud auth application-default login

# Set default project
gcloud config set project peninsula-equine-prod
gcloud config set compute/region us-central1
```

### Step 3: Enable Required APIs

```bash
gcloud services enable \
    run.googleapis.com \
    containerregistry.googleapis.com \
    cloudbuild.googleapis.com \
    compute.googleapis.com \
    cloudresourcemanager.googleapis.com \
    iam.googleapis.com \
    monitoring.googleapis.com \
    logging.googleapis.com \
    --quiet
```

### Step 4: Configure Service Account

```bash
# Create service account
gcloud iam service-accounts create peninsula-equine-deployer \
    --display-name="Peninsula Equine Deployment Service Account"

# Grant necessary roles
gcloud projects add-iam-policy-binding peninsula-equine-prod \
    --member="serviceAccount:peninsula-equine-deployer@peninsula-equine-prod.iam.gserviceaccount.com" \
    --role="roles/run.admin"

gcloud projects add-iam-policy-binding peninsula-equine-prod \
    --member="serviceAccount:peninsula-equine-deployer@peninsula-equine-prod.iam.gserviceaccount.com" \
    --role="roles/container.developer"
```

---

## Configuration

### Dockerfile

The `Dockerfile` uses multi-stage build for optimal image size:

```dockerfile
# Build stage - compiles TypeScript and bundles React
FROM node:24-alpine AS builder

# Production stage - minimal runtime
FROM node:24-alpine
# Runs application with proper signal handling
```

**Key Features:**
- ✅ Multi-stage build (reduces image size)
- ✅ Non-root user for security
- ✅ Health checks for reliability
- ✅ dumb-init for proper signal handling
- ✅ Alpine Linux for minimal footprint

### Cloud Build Configuration

`cloudbuild.yaml` automates:
1. Build Docker image
2. Push to Container Registry
3. Deploy to Cloud Run
4. Run smoke tests

**Environment Variables:**
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase public key

### Cloud Run Service

Configuration in `k8s/cloud-run-service.yaml`:

```yaml
Specifications:
  Memory: 512 MB
  CPU: 1 vCPU
  Min Instances: 2 (always running)
  Max Instances: 10 (auto-scale)
  Timeout: 3600 seconds
  Concurrency: 80 requests per instance
```

---

## Deployment

### Automated Deployment (Recommended)

```bash
# Make script executable
chmod +x scripts/deploy-gcp.sh

# Run deployment
./scripts/deploy-gcp.sh

# Or with environment variables
GCP_PROJECT_ID=peninsula-equine-prod \
GCP_REGION=us-central1 \
./scripts/deploy-gcp.sh
```

### Manual Deployment

#### 1. Build & Push Docker Image
```bash
# Build image
docker build -t gcr.io/peninsula-equine-prod/peninsula-equine:latest .

# Configure Docker auth
gcloud auth configure-docker

# Push to Container Registry
docker push gcr.io/peninsula-equine-prod/peninsula-equine:latest
```

#### 2. Deploy to Cloud Run
```bash
gcloud run deploy peninsula-equine-web \
    --image gcr.io/peninsula-equine-prod/peninsula-equine:latest \
    --platform managed \
    --region us-central1 \
    --memory 512Mi \
    --cpu 1 \
    --timeout 3600 \
    --max-instances 10 \
    --allow-unauthenticated \
    --set-env-vars \
    VITE_SUPABASE_URL=${VITE_SUPABASE_URL},\
    VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}
```

#### 3. Get Service URL
```bash
gcloud run services describe peninsula-equine-web \
    --region us-central1 \
    --format='value(status.url)'
```

### GitHub Actions Integration

Create `.github/workflows/deploy-gcp.yml`:

```yaml
name: Deploy to Google Cloud Run

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Authenticate to Google Cloud
        uses: google-github-actions/auth@v1
        with:
          credentials_json: ${{ secrets.GCP_CREDENTIALS }}
      
      - name: Set up Cloud SDK
        uses: google-github-actions/setup-gcloud@v1
      
      - name: Build and Deploy
        run: |
          gcloud builds submit \
            --config cloudbuild.yaml \
            --substitutions _VITE_SUPABASE_URL=${{ secrets.VITE_SUPABASE_URL }} \
            _VITE_SUPABASE_ANON_KEY=${{ secrets.VITE_SUPABASE_ANON_KEY }}
```

---

## Monitoring & Maintenance

### View Logs

```bash
# Real-time logs
gcloud run services logs read peninsula-equine-web --region us-central1 --limit 50 --follow

# Filter by severity
gcloud run services logs read peninsula-equine-web \
    --region us-central1 \
    --limit 100 \
    --format='table(timestamp,severity,textPayload)'
```

### Monitor Metrics

```bash
# View service metrics
gcloud monitoring dashboards create --config-from-file=- <<EOF
{
  "displayName": "Peninsula Equine - Web Metrics",
  "dashboardFilters": [],
  "gridLayout": {
    "widgets": [
      {
        "title": "Request Count",
        "xyChart": {
          "dataSets": [{
            "timeSeriesQuery": {
              "timeSeriesFilter": {
                "filter": "metric.type=\"run.googleapis.com/request_count\" resource.type=\"cloud_run_revision\" resource.label.service_name=\"peninsula-equine-web\""
              }
            }
          }]
        }
      },
      {
        "title": "Error Rate",
        "xyChart": {
          "dataSets": [{
            "timeSeriesQuery": {
              "timeSeriesFilter": {
                "filter": "metric.type=\"run.googleapis.com/request_latencies\" resource.type=\"cloud_run_revision\" resource.label.service_name=\"peninsula-equine-web\""
              }
            }
          }]
        }
      }
    ]
  }
}
EOF
```

### Health Checks

```bash
# Test service endpoint
SERVICE_URL=$(gcloud run services describe peninsula-equine-web \
    --region us-central1 --format='value(status.url)')

# Check homepage
curl -I $SERVICE_URL/

# Check HQ login
curl -I $SERVICE_URL/hq/login

# Check client portal
curl -I $SERVICE_URL/client/portal
```

---

## Disaster Recovery

### Backup Configuration

```bash
# Export service configuration
gcloud run services describe peninsula-equine-web \
    --region us-central1 \
    --format=json > service-backup.json

# Export traffic routing
gcloud run services update-traffic peninsula-equine-web \
    --region us-central1 \
    --to-revisions LATEST=100
```

### Rollback Procedure

```bash
# List all revisions
gcloud run revisions list --service peninsula-equine-web \
    --region us-central1

# Rollback to previous revision
gcloud run services update-traffic peninsula-equine-web \
    --region us-central1 \
    --to-revisions <REVISION_ID>=100

# Verify rollback
gcloud run services describe peninsula-equine-web \
    --region us-central1
```

### Database Backup

Supabase handles automated backups. To manually backup:

```bash
# Export database
pg_dump postgresql://user:password@db.supabase.co:5432/postgres > backup.sql

# Restore database
psql postgresql://user:password@db.supabase.co:5432/postgres < backup.sql
```

---

## Cost Optimization

### Cloud Run Pricing Optimization

| Setting | Current | Optimized |
|---------|---------|-----------|
| Min Instances | 2 | 1 (for lower traffic) |
| CPU | 1 vCPU | 0.5 vCPU (sufficient for SPA) |
| Memory | 512 MB | 256 MB (starter tier) |
| Max Instances | 10 | 5-10 based on traffic |

**Recommendations:**
```bash
# For development/staging (lower cost)
gcloud run deploy peninsula-equine-web \
    --memory 256Mi \
    --cpu 0.5 \
    --max-instances 3
```

### Setup Budget Alerts

```bash
gcloud billing budgets create \
    --billing-account=BILLING_ACCOUNT_ID \
    --display-name="Peninsula Equine Monthly" \
    --budget-amount=100 \
    --threshold-rule=percent=50 \
    --threshold-rule=percent=90 \
    --threshold-rule=percent=100
```

### Use Reserved Capacity

For sustained traffic, reserved capacity provides 25-30% cost savings:

```bash
gcloud compute reservations create peninsula-equine-reserved \
    --vm-count=1 \
    --machine-type=e2-medium
```

---

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| 403 Unauthorized | Check service account permissions and credentials |
| Image pull errors | Verify Container Registry access and image exists |
| Service timeout | Increase timeout or check application logs |
| High memory usage | Reduce instance size or check for memory leaks |
| Build failures | Check `cloudbuild.yaml` syntax and gcloud logs |

### Getting Help

```bash
# View detailed error logs
gcloud builds log <BUILD_ID> --limit=50

# Check service status
gcloud run services describe peninsula-equine-web --region us-central1

# View IAM roles
gcloud projects get-iam-policy peninsula-equine-prod

# Open Google Cloud Console
gcloud beta run dashboard
```

---

## Security Best Practices

✅ **Implemented:**
- Non-root container user
- Service account for deployments
- Environment variable separation
- Health checks
- Automatic SSL/TLS

**Additional Recommendations:**
1. Enable Cloud Armor for DDoS protection
2. Set up VPC Service Controls
3. Enable Binary Authorization
4. Use Secret Manager for sensitive data
5. Enable audit logging

---

## Performance Optimization

### CDN Configuration

```bash
# Create Cloud CDN policy
gcloud compute backend-services create peninsula-equine-cdn \
    --global \
    --protocol=HTTPS \
    --cache-mode=CACHE_ALL_STATIC \
    --default-ttl=3600
```

### Compression

Enabled by default in Cloud Run. Verify:

```bash
curl -I -H "Accept-Encoding: gzip" https://peninsula-equine-web.run.app/
# Should show: Content-Encoding: gzip
```

---

## Next Steps

1. ✅ Deploy application to Google Cloud Run
2. ✅ Set up custom domain (peninsulaequine.systems)
3. ✅ Configure Cloud CDN for global distribution
4. ✅ Enable Cloud Armor for security
5. ✅ Set up monitoring and alerting
6. ✅ Create backup and disaster recovery plan

---

## Useful Links

- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Cloud Build Documentation](https://cloud.google.com/build/docs)
- [Container Registry](https://cloud.google.com/container-registry/docs)
- [gcloud CLI Reference](https://cloud.google.com/sdk/gcloud/reference)
- [Pricing Calculator](https://cloud.google.com/products/calculator)

---

**Last Updated:** July 3, 2026  
**Status:** ✅ Production Ready
