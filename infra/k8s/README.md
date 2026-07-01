# Infra/K8s README

This folder contains Kubernetes manifests and helper configs for running the scanner worker and cleanup CronJob.

Steps to deploy

1. Build and push the scanner image:
   ```bash
   # from repo root
   docker build -t gcr.io/<your-project>/pe-scanner:latest -f workers/scanner/Dockerfile workers/scanner
   docker push gcr.io/<your-project>/pe-scanner:latest
   ```

2. Create the `supabase-credentials` secret in the cluster (DO NOT commit the secret to git):
   ```bash
   kubectl create secret generic supabase-credentials \
     --from-literal=SUPABASE_URL="https://<your-supabase>.co" \
     --from-literal=SUPABASE_SERVICE_ROLE_KEY="<service-role-key>"
   ```

3. Apply the resources:
   ```bash
   kubectl apply -f infra/k8s/supabase-worker-resources.yaml
   kubectl apply -f infra/k8s/scanner-deployment.yaml
   kubectl apply -f infra/k8s/cleanup-cronjob.yaml
   ```

4. Monitor logs:
   ```bash
   kubectl logs -l app=pe-scanner -f
   kubectl get cronjob pe-cleanup-orphans
   ```

Notes
- The scanner image requires ClamAV; the Dockerfile installs ClamAV and updates virus DB on container start.
- Tune resources (cpu/memory) and replica count depending on workload.
- For production, run at least 1-2 replicas behind a proper orchestration and add Prometheus metrics and alerts for failures.
