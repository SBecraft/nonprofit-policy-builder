# Nonprofit Policy Builder

**Plain-English security policies for any small nonprofit, including volunteer-run teams, tailored in about 15 minutes, free, and with nothing you type ever leaving your browser.**

**Live site:** [LIVE SITE URL] · **Version:** 1.0.0 · **[Download the app](#download-the-app)** · **Report a security problem:** [SECURITY.md](SECURITY.md)

> **Not legal advice.** These are starting templates for discussion. Have your board approve them, and ask a lawyer to check your state's breach notification and record retention rules.

## Why it exists

Small nonprofits hold sensitive information: donor names, home addresses, giving history, payment details and records about the people they serve. Most have no IT staff. Work is done by part-time staff and volunteers on their own phones and laptops, logins for social media and event accounts are shared, and people come and go every few months.

Security policy templates online are usually written for corporations, with an IT department, company devices and stable staff. Small nonprofits either skip policies or adopt documents that don't match how they work, so nobody follows them. This app writes policies for how small nonprofits actually operate.

## What it does

A nonprofit answers a short questionnaire about its organization, the systems it uses and how it works. Six policies, an Incident Contact List, onboarding and offboarding checklists, a Policy Acknowledgment Form and an Asset Inventory update instantly as answers change:

| Document | What it covers |
|---|---|
| **Acceptable Use** | How people may use the organization's accounts, devices and information, including device setup, office Wi-Fi and personal devices |
| **Passwords & MFA** | Passphrases, a password manager, MFA on key accounts, shared-account rules, giving and removing access |
| **Data Protection** | Classifying, storing, sharing and destroying information about donors, the people served, staff and volunteers, including card payments |
| **Backup & Recovery** | What gets backed up, the 3-2-1 rule, protecting backups, testing restores and recovering after ransomware |
| **Incident Response Plan** | A one-page plan for what to do when something goes wrong |
| **Security Awareness and Training** | When people are trained, what training covers, who runs it and how it is recorded |
| **Incident Contact List** | A confidential one-page list of who to call, kept separate from the plan and checked every three months |
| **Onboarding** | A one-page checklist for giving access when someone joins, with a record of the access given |
| **Offboarding** | A one-page checklist for removing access when someone leaves |
| **Policy Acknowledgment Form** | A one-page form where each person initials the policies they received and signs |
| **Asset Inventory** | A one-page landscape form listing every account, service and device, reviewed every six months |

**Tailoring.** Answers change the policy text itself, not just names. Personal devices add rules for using them, an office with Wi-Fi adds router and guest network rules, shared logins add shared-account rules, high turnover means same-day access removal, cyber insurance means calling the insurer first, and so on. A "Highlight tailored text" switch marks every sentence that changed because of an answer.

**Getting the policies out:**
- Copy one document, or any combination, into Word or Google Docs with headings and tables intact.
- Print them in a separate tab, so your answers aren't lost. The Incident Response Plan and Incident Contact List each fit on one page.
- Save as PDF from the print dialog.

**Nonprofit-specific content** that corporate templates usually miss: gift-card and bank-change scams that impersonate the executive director, the 501(c)(3) limit on political activity, view-only, time-limited volunteer access, board members kept in scope, calling the cyber insurer before outside help, and reporting to the FBI (ic3.gov) and CISA.

## Framework mappings

Every document is mapped to the **CIS Critical Security Controls v8.1, Implementation Group 1** and the **NIST Cybersecurity Framework 2.0**, and shows its mappings as labels.

| Document | CIS Controls v8.1 | NIST CSF 2.0 |
|---|---|---|
| Acceptable Use | 3 Data Protection · 4 Secure Configuration · 7 Continuous Vulnerability Management · 10 Malware Defenses · 14 Security Awareness | GV.PO · PR.AT · PR.PS |
| Passwords & MFA | 5 Account Management · 6 Access Control Management | PR.AA |
| Data Protection | 3 Data Protection · 15 Service Provider Management | PR.DS · ID.AM |
| Backup & Recovery | 11 Data Recovery | PR.DS · RC.RP |
| Incident Response Plan | 17 Incident Response Management | RS · RC |
| Incident Contact List | 17 Incident Response Management (17.2) | RS.CO |
| Onboarding | 5 Account Management · 6 Access Control Management | PR.AA |
| Offboarding | 5 Account Management · 6 Access Control Management | PR.AA |
| Policy Acknowledgment Form | 14 Security Awareness | GV.PO · PR.AT |
| Asset Inventory | 1 Enterprise Assets · 2 Software Assets · 15 Service Provider Management | ID.AM |
| Security Awareness and Training | 14 Security Awareness | PR.AT · GV.RR |

The mappings show alignment, not certification. The policy wording and mappings are reviewed once a year, and the app shows the date of the last review. When CIS or NIST publishes a new version, the mappings are updated by hand and reviewed by a person. The app never fetches framework data.

## Privacy

- **Nothing is saved.** Answers live only in the open browser tab: no cookies, no local storage, no database. Closing or refreshing the tab erases them, and the browser asks you to confirm first.
- **Nothing is sent.** No server, accounts or logins. The app makes no network calls and loads no outside fonts, analytics or trackers.
- **You can check this yourself.** Open the browser's developer tools and watch the Network tab while filling in the form. No requests appear.

Like every website, the host that delivers the page sees visitors' IP addresses. It never receives anything typed into the app.

## Security

The app is a security tool, so it follows the practices it recommends:

- **Output escaping:** everything typed is shown as plain text and can never run as code.
- **Strict Content Security Policy** (`app/_headers`): only the site's own script files run. Inline and injected scripts are refused, outgoing connections and form submissions are blocked, and the app can't be embedded in another site.
- **No third-party code:** no outside scripts, fonts or libraries, so there's no supply chain to tamper with.
- **Other headers:** HSTS, `nosniff`, `Referrer-Policy: no-referrer` and a restrictive `Permissions-Policy`.

**Testing** (header and HTTPS scans, OWASP ZAP, Semgrep, and manual script-injection tests on every text field) is planned before launch. Results will be summarized here and on the app's help page.

**Found a problem?** Please report it privately. See [SECURITY.md](SECURITY.md).

## Using the app

1. Open the live site ([LIVE SITE URL]). No sign-up, download or login.
2. Open **Before you start** to see what information to gather first.
3. Replace the example organization's answers with your own. Pin the tab so it's harder to close by accident.
4. Review each document, then copy or print them, and finish in one sitting.
5. Edit the documents in Word or Google Docs, have your board approve them, and share them with your team. Keep the Incident Contact List confidential.

## Download the app

You can keep your own copy of the app on your computer. It's free, needs no installation and works without an internet connection.

1. Go to the [latest release](../../releases/latest).
2. Under **Assets**, download **Source code (zip)**.
3. Unzip the file.
4. Open the `app` folder and double-click `index.html`. The app opens in your browser.

A downloaded copy doesn't update itself. To check for a newer version, compare the version number in the app's footer with the [latest release](../../releases/latest).

Your answers are not saved in a downloaded copy either, so finish in one sitting. The site's security settings don't apply to a copy on your computer, because they are sent by the web host. The app still makes no network calls and saves nothing.

## Running it locally

The app needs no build step and no server.

- **Quickest:** open `app/index.html` in a browser.
- **Closer to the live site:** serve the folder locally, then open http://localhost:8000:
  ```
  cd app
  python -m http.server 8000
  ```

The security headers in `app/_headers` are sent by Netlify, so they only apply on the live site. A local copy still makes no network calls and saves nothing.

## Deploying

Upload the **whole `app` folder** to Netlify, either by drag-and-drop or with `netlify deploy --prod`. It contains only the files the site needs. Keep the `_headers` file name exactly as it is, with no file extension. After deploying, re-test the live site. Netlify's deploy history allows an instant rollback.

## Project structure

```
app/                  Everything the live site needs. Deploy this folder only.
  index.html          The page and its styles (no JavaScript inside)
  app.js              All of the app's logic
  frameworks.js       CIS and NIST version names, shared by both pages
  how.html            Help page: framework mappings, privacy, printing and security
  _headers            Netlify security headers (keep this exact name)
assets/               Screenshots of the app
documents/            Project plan and other project notes (not needed to run the app)
README.md             This file
SECURITY.md           How to report a security problem
CLAUDE.md             Standing rules for Claude Code when working on this project
HANDOFF.md            Where the work stands: done, open items and next steps
```

Only `app/` is deployed. Everything else stays in the repository.

## How it was built

The Nonprofit Policy Builder was built as a GRC internship project with **Claude Code**, Anthropic's AI coding assistant. The AI helped generate the questionnaire, the policy templates and the tailoring logic, harden the app, and explain and review code. `CLAUDE.md` gives it standing rules, such as escaping all input, never adding inline scripts and never loading outside resources, so later changes can't quietly undo security decisions.

AI output was treated as a draft. The developer decided the app's purpose, scope and security requirements, reviewed the policy content and framework mappings with a supervisor, and reviewed every change before deployment.

## Limitations

- The policies are templates, not legal advice.
- A policy only works if people know about it and follow it. The app doesn't provide training or track acknowledgments.
- Industry-specific rules such as HIPAA and FERPA are not covered.
- The framework mappings show alignment, not compliance or certification.

## License

[LICENSE: to be decided. See the note in HANDOFF.md. Until a license is added, all rights are reserved by default.]

© 2026 Nonprofit Policy Builder · Free for nonprofits to use · Not legal advice
