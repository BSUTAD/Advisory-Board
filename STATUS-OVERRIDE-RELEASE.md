# Status override fix

Prepared September 29, 2026. Not activated yet; Firebase publishing requires Google sign-in, which automatic browser approval review blocked.

Cause: faculty/admin role forced effective status to Ineligible, disabled the edit dropdown, and replaced submitted statuses with Ineligible on save.

Fix: keep Ineligible as the default unless an admin explicitly saves a status override. Store statusOverride=true in private memberAdmin metadata (writable only by admins). Directory and email-list filtering honor the saved override. Existing staff records remain Ineligible until an admin saves. Roles/access permissions remain separate and unchanged. Status descriptions explain the new default.

Validation: 19 model/UI tests and 19 Firestore emulator rules tests passed. No actual profiles or roles changed.

Release: publish firestore.rules in Firebase project tad-advisory-board, then run npm run build and publish portal.js to GitHub Pages. Source, rules and tests are committed; the old live portal.js remains until rules publish. No homepage, page markup or stylesheet changes.
