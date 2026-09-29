# Status override fix

Released September 29, 2026. Firebase rules published at 2:58 PM Central; this commit activates the matching portal bundle.

Cause: faculty/admin role forced effective status to Ineligible, disabled the edit dropdown, and replaced submitted statuses with Ineligible on save.

Fix: keep Ineligible as the default unless an admin explicitly saves a status override. Store statusOverride=true in private memberAdmin metadata (writable only by admins). Directory and email-list filtering honor the saved override. Existing staff records remain Ineligible until an admin saves. Roles/access permissions remain separate and unchanged. Status descriptions explain the new default.

Validation: 19 model/UI tests and 19 Firestore emulator rules tests passed. No actual profiles or roles changed.

Release: firestore.rules published in Firebase project tad-advisory-board before uploading the built portal.js to GitHub Pages. Source, rules and tests are committed. No homepage, page markup or stylesheet changes.
