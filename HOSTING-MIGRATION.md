# Firebase Hosting migration

Permanent main address: https://tad-advisory.web.app/

Firebase project: tad-advisory-board (unchanged). Hosting targets in .firebaserc map primary to tad-advisory and legacy to tad-advisory-board.

The shorter main address was configured October 1, 2026. Both the former Firebase address and GitHub Pages forward to it after its readiness marker is available. The paired tad-advisory.firebaseapp.com address also forwards to the main address. The old sites retain a working fallback if the main host is unavailable. Reserved Firebase authentication handler paths are excluded from redirects.

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

Verified October 1, 2026: Authentication > Settings > Authorized domains includes tad-advisory.web.app, tad-advisory-board.web.app, bsutad.github.io and tad-advisory-board.firebaseapp.com. Keep bsutad.github.io and tad-advisory-board.firebaseapp.com so previously sent email action links continue working. The existing default Firebase email-action handler is retained; new return links and invitations use the current site origin.

## Verification

Open the new home, account and album pages. Check the old GitHub home and account links redirect. Verify password-reset and verification emails with your own account, and ensure existing roles and contact data remain available. Do not create test contact records in production.

## Future releases

The GitHub workflow `.github/workflows/firebase-hosting.yml` publishes every push to main and supports manual runs. It installs locked dependencies, checks high/critical audit findings, runs 28 application/redirect tests, builds only public files, deploys the primary Hosting target, verifies its published commit marker, and then publishes the legacy forwarding target. It does not deploy database rules or change member accounts.

Automatic publishing is active. GitHub uses a dedicated service account with Firebase Hosting Admin and Service Usage Consumer. Federation is limited by numeric repository and owner IDs, main branch, and the exact workflow path. No service-account key is stored. The setup script is retained for disaster recovery; it does not need to be rerun for releases.

Manual recovery publishing remains available: pull the latest source, run `npm ci`, then `npm run deploy:hosting`. GitHub Pages publishes separately and retains the fallback copy. Keep both Hosting targets configured so old links continue to forward. Members may need to sign in once at the new origin; accounts and passwords remain unchanged.

Dependency fixes saved September 30: firebase-tools 15.32.0; scoped grpc-js, OpenTelemetry and uuid overrides. Audit returned zero known vulnerabilities. Build, 27 tests and CLI initialization passed. These checks do not replace ongoing dependency review.

Lab Manager was also checked September 30: its existing production workflow succeeded for main commit 608844d. Eight live core page/code/data files matched that commit byte for byte, including maintenance printer-care files. No Lab Manager changes were necessary.

October 1: scoped get-uri/basic-ftp override to 6.2.1 addresses GHSA-c475-qrg2-pj4r in deployment tooling.
