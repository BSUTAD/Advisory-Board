# Admin invitations

Status: released September 28, 2026. Firebase rules published at 4:38 PM Central; generated portal files included in the activation commit.

Admin workflow: Contact directory > Add contact / Create invitation. Enter login email, contact details and pathways, save, and copy the prepared invitation into Outlook. Nothing is sent automatically. Only the existing administrator role can manage invitations. They expire after 30 days and can be canceled. For corrections, cancel and replace the invitation.

Recipient workflow: open link, register with invited email and their own password (or sign into an existing login), verify email, review the prefilled information, explicitly choose newsletter consent, and save. Claiming atomically creates their own profile and removes the pending invitation. Existing contact profiles are never overwritten. A login can be changed after claiming through the existing verified email-change workflow.

Free-plan design: existing Firebase Auth email/password and Firestore; no Cloud Functions, billing upgrade, shared passwords, or mail provider. Invitation email is sent manually through faculty Outlook. Pending invitations are separate from newsletter recipient lists. The login is created by the recipient; this is a prefilled invitation rather than an admin-created password.

Verification: 17 model/UI tests and 18 Firestore emulator tests pass, including admin-only creation/listing, verified email matching, atomic one-time claim, expiry/cancellation, no implicit newsletter subscription, no staff role grant, and existing profile protection.

Release: publish firestore.rules to tad-advisory-board, then run npm run build and publish account.html, directory.html and portal.js. Homepage and all CSS remain unchanged.
