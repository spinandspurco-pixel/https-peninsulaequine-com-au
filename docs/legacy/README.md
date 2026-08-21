# Legacy Deployment Archive

> **These files are historical records only.**
> GitHub Pages is the sole canonical production hosting route for `peninsulaequine.com.au`.
> The materials below describe Cloud Run, GCP, Vercel, CloudFront, S3, and Docker-based approaches that have been retired from production, preview, and failover use.
> They are retained here for audit and reference purposes and must not be used to deploy or reconfigure the live site.

---

## Archived materials

| File | Former purpose |
|---|---|
| `GCP_DEPLOYMENT_GUIDE.md` | Step-by-step GCP / Cloud Run setup |
| `GCP_DEPLOYMENT_READY.md` | Pre-launch GCP readiness snapshot |
| `COMPLETE_DEPLOYMENT_PACKAGE.md` | GCP deployment package summary |
| `DEPLOYMENT_NEXT_STEPS.md` | GCP post-build action items |
| `PRODUCTION_READY_CHECKLIST.md` | GCP production readiness checklist |
| `Dockerfile` | Multi-stage container image (Cloud Run) |
| `cloudbuild.yaml` | Google Cloud Build pipeline |
| `cloud-run-service.yaml` | Cloud Run Kubernetes-style service spec |

---

The current deployment process is documented in:
- [`/RUNBOOK.md`](../../RUNBOOK.md) — authoritative deploy, rollback, and key-rotation runbook
- [`/DOMAIN_SETUP.md`](../../DOMAIN_SETUP.md) — DNS cutover to GitHub Pages
- [`.github/workflows/deploy-github-pages.yml`](../../.github/workflows/deploy-github-pages.yml) — Pages workflow
