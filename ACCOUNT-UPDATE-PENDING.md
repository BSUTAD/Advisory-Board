# Account update awaiting Firebase deployment

Source implements current active board member, applying to join, and newsletters-only choices, preserving legacy board service without claiming current membership. Newsletter-only contacts are excluded from board coordination exports. Members can delete their own contact profile, administrative record, role and authentication account after password reauthentication and explicit confirmation.

Validation: 14 model/UI tests and 14 Firestore emulator permission tests pass. No production accounts were deleted.

Release order:
1. Publish firestore.rules to Firebase project tad-advisory-board. The new rules permit only the recently authenticated owner to delete their own records, and accept the active connection value.
2. Run npm run build and publish account.html, directory.html and portal.js to GitHub Pages.

The generated live files have deliberately not been updated yet: Google sign-in was blocked by automatic browser approval review. Source-only commits do not activate these controls on the current static site.

Account cleanup commits Firestore deletions before deleting Firebase Authentication. A failure removing contact records prevents login deletion; a later Auth failure explicitly reports partial completion and asks the user to retry. Public stories, event photos, and previously exported contact copies are outside account deletion.
