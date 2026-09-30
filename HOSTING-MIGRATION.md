# Firebase Hosting migration

Destination: https://tad-advisory-board.web.app/

Status: the first Firebase Hosting deployment was completed on September 30, 2026 and the new site was verified live. GitHub Pages redirects activate after the readiness marker is available.

The existing Firebase project, accounts, passwords and Firestore data remain unchanged. GitHub remains the source repository. The GitHub Pages redirect preserves page paths, query strings and fragments. Members sign in again on the new domain.

## First deployment

Use Node.js 20 or newer and Git. From a terminal:

```
git clone https://github.com/BSUTAD/Advisory-Board.git advisory-board-deploy
cd advisory-board-deploy
npm ci
npx firebase login
npm run deploy:hosting
```

Sign in with the Google account that owns project tad-advisory-board. No passwords, tokens or service-account keys should be sent through chat or committed to the repository.

This deploys Hosting only. It does not deploy database rules, delete accounts or change the billing plan. The build copies an explicit allowlist of public site files into hosting-dist. Never deploy the repository root.

Verified on September 30, 2026: Authentication > Settings > Authorized domains already includes tad-advisory-board.web.app, bsutad.github.io and tad-advisory-board.firebaseapp.com. Keep bsutad.github.io and tad-advisory-board.firebaseapp.com so previously sent email action links continue working. The existing default Firebase email-action handler is retained; new return links and invitations use the current site origin.

## Verification

Open the new home, account and album pages. Check the old GitHub home and account links redirect. Verify password-reset and verification emails with your own account, and ensure existing roles and contact data remain available. Do not create test contact records in production.

## Future releases

The GitHub workflow `.github/workflows/firebase-hosting.yml` publishes every push to main and supports manual runs. It installs locked dependencies, checks high/critical audit findings, runs 27 application/redirect tests, builds only public files, deploys Hosting, and verifies the published commit marker. It does not deploy database rules or change member accounts.

One-time activation is still required: run `bash setup-github-hosting.sh` in authenticated Google Cloud Shell and review its confirmation. The script creates a dedicated service account with Firebase Hosting Admin and Service Usage Consumer. GitHub federation is limited by numeric repository and owner IDs, main branch, and the exact workflow path. No service-account key is created. After activation, run the workflow once from GitHub Actions to confirm authorization.

Until activation succeeds, manual publishing remains available: pull the latest source, run `npm ci`, then `npm run deploy:hosting`. GitHub Pages publishes separately and retains the fallback copy.

Dependency fixes saved September 30: firebase-tools 15.32.0; scoped grpc-js, OpenTelemetry and uuid overrides. Audit returned zero known vulnerabilities. Build, 27 tests and CLI initialization passed. These checks do not replace ongoing dependency review.

Lab Manager was also checked September 30: its existing production workflow succeeded for main commit 608844d. Eight live core page/code/data files matched that commit byte for byte, including maintenance printer-care files. No Lab Manager changes were necessary.
