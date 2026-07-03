#!/bin/bash
#
# Peninsula Equine - Google Cloud Infrastructure Setup
# Deploys website and HQ to Google Cloud Run with optimal configuration
# Date: July 3, 2026
#

set -e

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Peninsula Equine - Google Cloud Deployment Setup          ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Configuration
PROJECT_ID="${GCP_PROJECT_ID:-peninsula-equine-prod}"
REGION="${GCP_REGION:-us-central1}"
SERVICE_NAME="peninsula-equine-web"
IMAGE_NAME="peninsula-equine"
CONTAINER_REGISTRY="gcr.io"

echo -e "${YELLOW}Configuration:${NC}"
echo "  Project ID: $PROJECT_ID"
echo "  Region: $REGION"
echo "  Service: $SERVICE_NAME"
echo ""

# Step 1: Set up Google Cloud authentication
echo -e "${BLUE}[1/3] Setting up Google Cloud Authentication...${NC}"
echo ""
echo "To authenticate with Google Cloud, visit:"
echo -e "${GREEN}https://cloud.google.com/docs/authentication/provide-credentials-adc${NC}"
echo ""

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${YELLOW}Installing Google Cloud SDK...${NC}"
    # Download and install Google Cloud SDK
    if [ "$(uname)" == "Darwin" ]; then
        echo "Detected macOS - downloading Google Cloud SDK..."
        curl https://sdk.cloud.google.com > /tmp/install-gcloud.sh
        bash /tmp/install-gcloud.sh --disable-prompts --path-update=true
        # Refresh path
        export PATH=$PATH:~/google-cloud-sdk/bin
    else
        echo "Please install Google Cloud SDK from: https://cloud.google.com/sdk/docs/install"
        exit 1
    fi
else
    echo -e "${GREEN}✓ Google Cloud SDK already installed${NC}"
    gcloud --version | head -1
fi

echo ""
echo "Initializing gcloud..."
gcloud init --no-launch-browser --project=$PROJECT_ID 2>/dev/null || true

# Authenticate with Application Default Credentials
echo ""
echo -e "${YELLOW}Setting up Application Default Credentials (ADC)...${NC}"
gcloud auth application-default login

echo -e "${GREEN}✓ Authentication complete${NC}"
echo ""

# Step 2: Configure Google Cloud Project
echo -e "${BLUE}[2/3] Configuring Google Cloud Project...${NC}"
echo ""

# Set project
gcloud config set project $PROJECT_ID
gcloud config set compute/region $REGION

# Enable required APIs
echo -e "${YELLOW}Enabling required Google Cloud APIs...${NC}"
gcloud services enable \
    run.googleapis.com \
    containerregistry.googleapis.com \
    cloudbuild.googleapis.com \
    compute.googleapis.com \
    cloudresourcemanager.googleapis.com \
    iam.googleapis.com \
    --quiet

echo -e "${GREEN}✓ APIs enabled${NC}"
echo ""

# Create service account for deployment
echo -e "${YELLOW}Setting up service account...${NC}"
SERVICE_ACCOUNT="peninsula-equine-deployer"
SERVICE_ACCOUNT_EMAIL="${SERVICE_ACCOUNT}@${PROJECT_ID}.iam.gserviceaccount.com"

# Check if service account exists
if ! gcloud iam service-accounts describe $SERVICE_ACCOUNT_EMAIL &>/dev/null; then
    echo "Creating service account: $SERVICE_ACCOUNT"
    gcloud iam service-accounts create $SERVICE_ACCOUNT \
        --display-name="Peninsula Equine Deployment Service Account" \
        --quiet
else
    echo "Service account already exists: $SERVICE_ACCOUNT"
fi

# Grant necessary roles
echo "Granting IAM roles to service account..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:${SERVICE_ACCOUNT_EMAIL}" \
    --role="roles/run.admin" \
    --quiet

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:${SERVICE_ACCOUNT_EMAIL}" \
    --role="roles/storage.admin" \
    --quiet

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:${SERVICE_ACCOUNT_EMAIL}" \
    --role="roles/container.developer" \
    --quiet

echo -e "${GREEN}✓ Service account configured${NC}"
echo ""

# Step 3: Build and Deploy to Google Cloud Run
echo -e "${BLUE}[3/3] Building and Deploying Application...${NC}"
echo ""

# Check for Dockerfile
if [ ! -f "Dockerfile" ]; then
    echo -e "${YELLOW}Creating Dockerfile...${NC}"
    cat > Dockerfile << 'EOF'
# Build stage
FROM node:24-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:24-alpine

WORKDIR /app

# Install serve to run the SPA
RUN npm install -g serve

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start the application
CMD ["serve", "-s", "dist", "-l", "3000"]
EOF
    echo -e "${GREEN}✓ Dockerfile created${NC}"
fi

# Check for .dockerignore
if [ ! -f ".dockerignore" ]; then
    echo -e "${YELLOW}Creating .dockerignore...${NC}"
    cat > .dockerignore << 'EOF'
node_modules
npm-debug.log
.git
.gitignore
.env.local
.env.*.local
dist
.vercel
.vercelignore
EOF
    echo -e "${GREEN}✓ .dockerignore created${NC}"
fi

# Build Docker image
echo -e "${YELLOW}Building Docker image...${NC}"
IMAGE_URL="${CONTAINER_REGISTRY}/${PROJECT_ID}/${IMAGE_NAME}"
docker build -t ${IMAGE_URL}:latest .

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Docker image built successfully${NC}"
else
    echo -e "${RED}✗ Docker build failed${NC}"
    exit 1
fi

echo ""

# Push to Container Registry
echo -e "${YELLOW}Pushing image to Google Container Registry...${NC}"
docker push ${IMAGE_URL}:latest

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Image pushed successfully${NC}"
else
    echo -e "${RED}✗ Docker push failed${NC}"
    exit 1
fi

echo ""

# Deploy to Cloud Run
echo -e "${YELLOW}Deploying to Google Cloud Run...${NC}"
gcloud run deploy $SERVICE_NAME \
    --image ${IMAGE_URL}:latest \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --memory 512Mi \
    --cpu 1 \
    --timeout 3600 \
    --max-instances 10 \
    --service-account ${SERVICE_ACCOUNT_EMAIL} \
    --set-env-vars "NODE_ENV=production" \
    --quiet

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Deployment successful${NC}"
else
    echo -e "${RED}✗ Deployment failed${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Deployment Complete!                                     ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Get the service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region $REGION --format='value(status.url)')

echo -e "${GREEN}✓ Application deployed successfully!${NC}"
echo ""
echo "Service Details:"
echo "  Project ID: $PROJECT_ID"
echo "  Service Name: $SERVICE_NAME"
echo "  Region: $REGION"
echo "  Image: ${IMAGE_URL}:latest"
echo "  Service URL: $SERVICE_URL"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "  1. Configure custom domain:"
echo "     gcloud run services update-traffic $SERVICE_NAME --region $REGION --to-revisions LATEST=100"
echo ""
echo "  2. Set up Cloud Load Balancer for global traffic:"
echo "     gcloud compute backend-services create peninsula-equine-backend --global --protocol=HTTPS"
echo ""
echo "  3. Monitor application:"
echo "     gcloud run services describe $SERVICE_NAME --region $REGION"
echo ""
echo -e "${BLUE}Documentation: https://cloud.google.com/run/docs${NC}"
