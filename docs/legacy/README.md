# Legacy Deployment Archive

> **These files are historical records only.**
> The materials below describe Cloud Run, GCP, Vercel, CloudFront, S3, and Docker-based approaches that have been retired from production, preview, and failover use.
> They are retained here for audit and reference purposes and must not be used to deploy or reconfigure the live site.
> See [HOSTING_GOVERNANCE.md](../../HOSTING_GOVERNANCE.md) for the authoritative hosting policy.

---

## Archived materials in this directory

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

## Additional archived materials at the repository root

The following files remain at the root because they contain mixed content (not
purely deployment instructions) but carry the same "historical record — do not
follow" banner:

| File | Notes |
|---|---|
| `FINAL_STATUS.md` | Historical GCP build status snapshot |
| `AUTHENTICATION_SETUP.md` | Historical GCP authentication notes |

---

The current deployment process is documented in:
- [`/HOSTING_GOVERNANCE.md`](../../HOSTING_GOVERNANCE.md) — authoritative hosting policy
- [`/RUNBOOK.md`](../../RUNBOOK.md) — deploy, rollback, and key-rotation runbook
- [`/DOMAIN_SETUP.md`](../../DOMAIN_SETUP.md) — DNS configuration notes
- [`.github/workflows/deploy-github-pages.yml`](../../.github/workflows/deploy-github-pages.yml) — Pages workflow (publishes redirect page)
