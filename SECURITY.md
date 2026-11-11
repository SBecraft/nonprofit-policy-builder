# Security Policy

Thank you for helping keep the Nonprofit Policy Builder safe for the small nonprofits that use it.

## Supported versions

Only the latest release is supported. Fixes go into a new release rather than into older versions.

| Version | Supported |
|---|---|
| 1.0.x (latest) | Yes |
| Older | No |

The version number is shown at the bottom of the app.

## How to report a problem

**Please report security problems privately. Do not open a public issue.**

Use GitHub's private reporting: go to this repository's **Security** tab and choose **Report a vulnerability**. Only the maintainer can see the report. You'll need a free GitHub account.

Please include:

- what the problem is and why it matters
- the steps to reproduce it, such as the exact text typed into which field, and the browser and version you used
- whether it affects the live site, a downloaded copy, or both
- any proof-of-concept you have. Keep it harmless: show that a script could run (for example, a visible message on the page). Don't show that it could cause damage.

## What to expect

- **Acknowledgment within 7 days** of your report.
- **An initial assessment within 14 days**: whether it's confirmed, how serious it is, and what happens next.
- **A fix as quickly as the severity requires**, released as a new version. Serious problems take priority.
- **Fixes are announced** in the release notes and, for serious problems, as a GitHub security advisory in this repository's **Security** tab.
- **Credit** in the release notes if you'd like it. Tell us the name or handle to use, or say if you'd rather stay anonymous.

Please give us a reasonable chance to fix a problem before you discuss it publicly. We'll keep you updated and agree on a disclosure date with you.

## What's in scope

The app is a static web page: `index.html`, `app.js`, `frameworks.js`, `how.html` and the `_headers` security settings. Examples of problems we want to hear about:

- **Script injection (cross-site scripting).** Text typed into the questionnaire runs as code instead of being shown as plain text, in the page, the print tab or copied output.
- **Data leaving the browser.** Any way answers could be sent, stored or exposed. The app is designed to make no network calls and save nothing.
- **Security settings that can be bypassed or are weaker than described.** This covers the Content Security Policy, framing protection and the other headers in `_headers`.
- **Third-party code or requests.** Anything that loads from another site.
- **Policy content that gives unsafe security advice.** For example, guidance that would leave a nonprofit more exposed if followed.

## What's out of scope

- The hosting provider's own infrastructure, which should be reported to the host directly.
- Problems that need an already-compromised device, such as malware or a malicious browser extension. These can read any web page.
- Missing security headers on a copy opened from your own computer. The headers are sent by the web host, so they only apply on the live site, as the app's help page explains.
- Denial-of-service, load testing or spam.
- Social engineering or phishing of the maintainer or users.
- Reports from automated scanners with no demonstrated impact.

## Testing guidelines

- **Test a copy you control whenever you can.** Download the files and run them locally, for example with `python -m http.server`. You don't need the live site to test most of the app.
- If you do test the live site (https://nonprofit-policy-builder.pages.dev), keep it light: no heavy automated scanning, no load testing, and nothing that could affect other visitors.
- Never access, change or delete anyone else's data. The app doesn't collect any, so a test that seems to reach someone's data is itself worth reporting.
- Stop and report as soon as you've confirmed a problem.

We won't pursue or support legal action against anyone who reports a problem in good faith and follows these guidelines.

## How the app is designed to be safe

For background, see the app's help page ("How this app works") or `how.html` in this repository:

- Everything typed is escaped and shown as plain text.
- A strict Content Security Policy allows only the site's own scripts, blocks outgoing connections and form submissions, and prevents the app from being embedded in other sites.
- There is no server, database, login or browser storage, and no third-party code.
- This repository has GitHub code scanning (CodeQL), Dependabot alerts and secret scanning with push protection switched on.
