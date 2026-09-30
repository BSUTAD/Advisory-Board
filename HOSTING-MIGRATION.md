# Firebase Hosting migration

Destination: https://tad-advisory-board.web.app/

Status: prepared and tested; Firebase Hosting deployment still requires an authenticated Firebase CLI. The browser deployment terminal (Google Cloud Shell) was unavailable. The old GitHub address stays functional until the new host serves the readiness marker.

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

Pull the latest source, run npm ci, then npm run deploy:hosting. GitHub Pages publishes separately and retains the fallback copy. Tests: npm test and npm run test:migration.
