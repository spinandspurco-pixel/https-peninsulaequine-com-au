# Historical deployment records

These materials preserve the earlier GCP/Cloud Run and application hosting
work. Their deployment commands and readiness claims are superseded. The public
website uses ChatGPT Sites; GitHub Pages publishes a legacy redirect. Follow
[hosting governance](../../HOSTING_GOVERNANCE.md), the
[website runbook](../../RUNBOOK.md) or the separately scoped
[backend runbook](../../BACKEND_RUNBOOK.md) for operations.

This index preserves the useful archive navigation from PR #37 while leaving
the files at their existing paths. It does not relocate executable deployment
files, declare external resources decommissioned, or authorize using a retired
host for production, preview or failover.

| Existing file | Historical purpose |
|---|---|
| [GCP_DEPLOYMENT_GUIDE.md](../../GCP_DEPLOYMENT_GUIDE.md) | GCP / Cloud Run setup |
| [GCP_DEPLOYMENT_READY.md](../../GCP_DEPLOYMENT_READY.md) | GCP readiness snapshot |
| [COMPLETE_DEPLOYMENT_PACKAGE.md](../../COMPLETE_DEPLOYMENT_PACKAGE.md) | Cloud Run deployment package |
| [DEPLOYMENT_NEXT_STEPS.md](../../DEPLOYMENT_NEXT_STEPS.md) | Post-build deployment steps |
| [PRODUCTION_READY_CHECKLIST.md](../../PRODUCTION_READY_CHECKLIST.md) | GCP readiness checklist |
| [FINAL_STATUS.md](../../FINAL_STATUS.md) | July build status |
| [AUTHENTICATION_SETUP.md](../../AUTHENTICATION_SETUP.md) | GCP authentication notes |
| [Dockerfile](../../Dockerfile) | Earlier container build |
| [cloudbuild.yaml](../../cloudbuild.yaml) | Earlier Cloud Build pipeline |
| [k8s/cloud-run-service.yaml](../../k8s/cloud-run-service.yaml) | Earlier Cloud Run service manifest |

Application/HQ guides remain available for source reference. Their historical
hostnames and success claims do not establish live deployment. In particular,
`scripts/pre-deploy.sh` contains obsolete Pages release guidance, and
`supabase_setup_guide.md` predates the current separation. Use
[BACKEND_RUNBOOK.md](../../BACKEND_RUNBOOK.md) to confirm the intended backend
before following any application procedure.

See the [consolidation record](../hosting-consolidation-2026-10-13.md) for the
disposition of the remaining PR #37 file moves and obsolete PR #35 smoke work.
