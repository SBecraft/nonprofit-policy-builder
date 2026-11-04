/*
 * Nonprofit Policy Builder
 * Copyright © 2026 SBecraft
 * All Rights Reserved
 */
// Framework versions: change them only here (see "When a framework version changes" in CLAUDE.md).
// Loaded by index.html and how.html. Any element with data-fw="cis", "nist" or "csf" shows the version name.
const NIST_CSF = 'Cybersecurity Framework 2.0';
// The addresses are shown as plain text on the Framework Summary, never as links (the app links to no other sites).
const FRAMEWORKS = {cis:'CIS Controls v8.1', nist:`NIST ${NIST_CSF}`, csf:NIST_CSF,
  cisUrl:'cisecurity.org/controls/v8-1', nistUrl:'nist.gov/cyberframework'};
document.querySelectorAll('[data-fw]').forEach(el => { el.textContent = FRAMEWORKS[el.dataset.fw]; });
