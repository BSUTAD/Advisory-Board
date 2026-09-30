#!/usr/bin/env bash
# Run once in your authenticated Google Cloud Shell. Creates no private keys.
set -euo pipefail
project_id='tad-advisory-board'
project_number='759590399835'
pool_id='advisory-github'
service_account="github-hosting@${project_id}.iam.gserviceaccount.com"
actual_number="$(gcloud projects describe "$project_id" --format='value(projectNumber)')"
if [[ "$actual_number" != "$project_number" ]]; then
  echo 'Project identity did not match. Nothing was changed.' >&2
  exit 1
fi
cat <<'NOTICE'
This setup allows only BSUTAD/Advisory-Board's main-branch Firebase workflow
 to publish Hosting files to tad-advisory-board.
It creates a dedicated service account and GitHub identity provider.
It grants Firebase Hosting Admin and Service Usage Consumer, not database or
user-account administration. No private key is created, copied, or stored.
NOTICE
read -r -p 'Set up automatic website publishing? Type yes: ' setup_answer
[[ "$setup_answer" == 'yes' ]] || { echo 'No changes made.'; exit 1; }
gcloud services enable iam.googleapis.com iamcredentials.googleapis.com sts.googleapis.com firebasehosting.googleapis.com --project="$project_id" --quiet
if ! gcloud iam service-accounts describe "$service_account" --project="$project_id" >/dev/null 2>&1; then
  gcloud iam service-accounts create github-hosting --display-name='Advisory Board GitHub Hosting deployment' --project="$project_id" --quiet
fi
if ! gcloud iam workload-identity-pools describe "$pool_id" --location=global --project="$project_id" >/dev/null 2>&1; then
  gcloud iam workload-identity-pools create "$pool_id" --location=global --display-name='Advisory Board GitHub' --project="$project_id" --quiet
fi
provider_condition="assertion.repository_id == '1389756544' && assertion.repository_owner_id == '334309590' && assertion.ref == 'refs/heads/main' && assertion.workflow_ref == 'BSUTAD/Advisory-Board/.github/workflows/firebase-hosting.yml@refs/heads/main'"
provider_args=(--project="$project_id" --location=global --workload-identity-pool="$pool_id" --issuer-uri='https://token.actions.githubusercontent.com' --attribute-mapping='google.subject=assertion.sub,attribute.repository_id=assertion.repository_id' --attribute-condition="$provider_condition" --quiet)
if gcloud iam workload-identity-pools providers describe github --project="$project_id" --location=global --workload-identity-pool="$pool_id" >/dev/null 2>&1; then
  gcloud iam workload-identity-pools providers update-oidc github "${provider_args[@]}"
else
  gcloud iam workload-identity-pools providers create-oidc github "${provider_args[@]}"
fi
for deploy_role in roles/firebasehosting.admin roles/serviceusage.serviceUsageConsumer; do
  gcloud projects add-iam-policy-binding "$project_id" --member="serviceAccount:$service_account" --role="$deploy_role" --condition=None --quiet >/dev/null
done
gcloud iam service-accounts add-iam-policy-binding "$service_account" --project="$project_id" --role=roles/iam.workloadIdentityUser --member="principal://iam.googleapis.com/projects/${project_number}/locations/global/workloadIdentityPools/${pool_id}/subject/repo:BSUTAD/Advisory-Board:ref:refs/heads/main" --quiet >/dev/null
echo 'SETUP COMPLETE. GitHub publishing is authorized. Allow a few minutes for permissions to propagate, then run the Firebase workflow in GitHub Actions.'
