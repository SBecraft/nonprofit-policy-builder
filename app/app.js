/*
 * Nonprofit Policy Builder
 * Copyright © 2026 SBecraft
 * All Rights Reserved
 */
const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const t = s => `<mark class="t">${s}</mark>`; // tailored passage (s may contain escaped html)

const today = new Date();
const pad = n => String(n).padStart(2,'0');
$('date').value = `${today.getFullYear()}-${pad(today.getMonth()+1)}-${pad(today.getDate())}`; // local date, not UTC

// Forms are in the order an organization uses them: set-up forms, then joining to leaving
const POLICIES = [
  {id:'aup', name:'Acceptable Use', maps:['CIS 3 · Data Protection','CIS 4 · Secure Configuration','CIS 7 · Vulnerability Management','CIS 10 · Malware','CIS 14 · Awareness','NIST GV.PO','NIST PR.AT','NIST PR.PS']},
  {id:'train', name:'Security Awareness and Training', tab:'Security Awareness', maps:['CIS 14 · Awareness','NIST PR.AT','NIST GV.RR']},
  {id:'pw',  name:'Passwords & MFA', maps:['CIS 5 · Accounts','CIS 6 · Access','NIST PR.AA']},
  {id:'data',name:'Data Protection', maps:['CIS 3 · Data Protection','CIS 15 · Service Providers','NIST PR.DS','NIST ID.AM']},
  {id:'backup', name:'Backup & Recovery', maps:['CIS 11 · Data Recovery','NIST PR.DS','NIST RC.RP']},
  {id:'ir',  name:'Incident Response', maps:['CIS 17 · Incident Response','NIST RS','NIST RC']},
  {id:'inventory', name:'Asset Inventory', sheet:true, maps:['CIS 1 · Enterprise Assets','CIS 2 · Software','CIS 15 · Service Providers','NIST ID.AM']}, // a form, not a policy; prints landscape
  {id:'contacts', name:'Incident Contact List', sheet:true, maps:['CIS 17 · Incident Response','NIST RS.CO']}, // not a policy: no head(), checked every 3 months
  {id:'onboard', name:'Onboarding Checklist', tab:'Onboarding', sheet:true, maps:['CIS 5 · Accounts','CIS 6 · Access','NIST PR.AA']}, // a form, not a policy
  {id:'ack', name:'Policy Acknowledgment Form', tab:'Policy Acknowledgment', sheet:true, maps:['CIS 14 · Awareness','NIST GV.PO','NIST PR.AT']}, // a form, not a policy
  {id:'offboard', name:'Offboarding Checklist', tab:'Offboarding', sheet:true, maps:['CIS 5 · Accounts','CIS 6 · Access','NIST PR.AA']}, // a form, not a policy
  {id:'summary', name:'Framework Summary', sheet:true, maps:[]}, // lists the other documents' labels, so it has none of its own
];
// Plain-English key for the Framework Summary. It repeats the "What each label means" table in how.html, so change both together.
const LABEL_KEY = [
  ['CIS 1', 'Inventory and Control of Enterprise Assets', 'Keep a list of your devices, so you know what you need to protect.'],
  ['CIS 2', 'Inventory and Control of Software Assets', 'Keep a list of the software and online services you use.'],
  ['CIS 3', 'Data Protection', 'Know what sensitive information you hold, limit who can see it, encrypt it and delete it safely.'],
  ['CIS 4', 'Secure Configuration', 'Set up devices, accounts and Wi-Fi safely, and change risky default settings.'],
  ['CIS 5', 'Account Management', 'Keep track of who has an account, and use strong, unique passwords.'],
  ['CIS 6', 'Access Control Management', 'Give people only the access they need, use MFA, and remove access when they leave.'],
  ['CIS 7', 'Continuous Vulnerability Management', 'Keep systems and apps updated so known weak spots get fixed.'],
  ['CIS 10', 'Malware Defenses', 'Keep protection against viruses and other harmful software turned on.'],
  ['CIS 11', 'Data Recovery', 'Keep backups, and check that you can restore from them.'],
  ['CIS 14', 'Security Awareness and Skills Training', 'Teach people to spot scams and handle information safely.'],
  ['CIS 15', 'Service Provider Management', 'Know which outside companies hold your data, and agree on how they protect it.'],
  ['CIS 17', 'Incident Response Management', 'Know who does what when something goes wrong, and how to report it.'],
  ['NIST GV.PO', 'Policy', 'Write down your security rules, share them and keep them current.'],
  ['NIST GV.RR', 'Roles, Responsibilities, and Authorities', 'Make sure everyone knows who is responsible for what.'],
  ['NIST ID.AM', 'Asset Management', 'Know what information, devices and services you have.'],
  ['NIST PR.AA', 'Identity Management, Authentication and Access Control', 'Make sure only the right people can log in and reach what they need.'],
  ['NIST PR.AT', 'Awareness and Training', 'Make sure people know the rules and how to stay safe.'],
  ['NIST PR.DS', 'Data Security', 'Keep information private, accurate and available.'],
  ['NIST PR.PS', 'Platform Security', 'Keep devices and software set up safely and up to date.'],
  ['NIST RS', 'Respond', 'Act quickly when a security problem is found.'],
  ['NIST RS.CO', 'Incident Response Reporting and Communication', 'Tell the right people during an incident.'],
  ['NIST RC', 'Recover', 'Get back to normal after an incident.'],
  ['NIST RC.RP', 'Incident Recovery Plan Execution', 'Follow your plan to restore systems and information.'],
];
let current = 'aup';

function read(){
  const v = id => esc($(id).value.trim() || '—');
  const d = $('date').value ? new Date($('date').value + 'T12:00:00') : today;
  const review = new Date(d); review.setFullYear(d.getFullYear()+1);
  const check = new Date(d); check.setMonth(d.getMonth()+3);
  if(check.getDate() !== d.getDate()) check.setDate(0); // Nov 30 + 3 months = Feb 28, not Mar 2
  const fmt = x => x.toLocaleDateString(undefined,{year:'numeric',month:'long',day:'numeric'});
  const p = $('platform').value;
  return {
    org:v('org'), owner:v('owner'), contact:v('contact'),
    backupLead:esc($('backupLead').value.trim()) || v('owner'), // the policy owner stands in if left blank
    printPlace:esc($('printPlace').value.trim()), backupName:esc($('backupName').value.trim()),
    contactPhone:esc($('contactPhone').value.trim()), contactEmail:esc($('contactEmail').value.trim()),
    // phone and email together, for sentences; either one alone if the other is blank
    contactInfo:[$('contactPhone').value.trim(), $('contactEmail').value.trim()].filter(Boolean).map(esc).join(' · ') || '—',
    date:fmt(d), review:fmt(review), check:fmt(check),
    // "Other (type it in)" answers come from the text box under each dropdown
    platform:p, platformName: p==='custom' ? esc($('platformOther').value.trim()) || '—'
      : {m365:'Microsoft 365',google:'Google Workspace',other:'organization email'}[p],
    crmRaw:$('crm').value, crm: $('crm').value==='other' ? esc($('crmOther').value.trim()) || '—' : esc($('crm').value),
    pm: $('pm').value==='other' ? $('pmOther').value.trim() || '—' : $('pm').value, // escaped where used
    volunteers:$('volunteers').checked,
    staff:$('staff').checked, devices:$('devices').checked, itProvider:$('itProvider').checked, server:$('server').checked,
    byod:$('byod').checked || !$('devices').checked, // with no organization devices, work happens on personal ones
    shared:$('shared').checked, turnover:$('turnover').checked,
    online:$('online').checked, cards:$('cards').checked, insurance:$('insurance').checked,
    backup:$('backup').checked, office:$('office').checked,
    clients:$('clients').checked, paper:$('clients').checked && $('paperClients').checked // paper records only count if client records are kept
  };
}

function meta(a, pol){
  return `<div class="docmeta">
    <div>Organization<b>${a.org}</b></div>
    <div>Policy owner<b>${a.owner}</b></div>
    <div>Effective<b>${a.date}</b></div>
    <div>Next review<b>${a.review}</b></div>
  </div>`;
}
const chips = pol => `<div class="maps">${pol.maps.map(m=>`<span class="chip">${m}</span>`).join('')}</div>`;
function head(a, pol, title){
  return `<div class="eyebrow">${a.org}</div>
  <h2>${title}</h2>
  ${chips(pol)}${meta(a,pol)}`;
}
const BLANK = '____________________';
// "Dana Ortiz, Operations Manager" needs a closing comma mid-sentence; a name alone does not
const midSentence = s => s.includes(',') ? s + ',' : s;
const listOf = items => items.length > 1 ? `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}` : items[0];
// Who a policy covers. vol is the volunteer wording, which differs by policy.
const scope = (a, vol) => listOf([a.staff && 'staff', 'board members', 'interns', 'contractors', a.volunteers && t(vol)].filter(Boolean));
const printedAt = a => a.printPlace ? t(a.printPlace) : BLANK;
const offboardWindow = a => a.turnover ? t('the same day') : 'within three business days';
// Shared by the Onboarding and Offboarding forms
const PASSWORD_NOTE = 'Never write passwords on these sheets. They belong in the password manager.';
const checklistParts = a => ({
  donors: t(a.crmRaw==='spreadsheet' ? 'the donor spreadsheets folder' : a.crm),
  noPM: a.pm === 'none',
  who: `${a.staff ? 'staff, ' : ''}${a.volunteers ? t('volunteers') + ', ' : ''}board members, interns or contractors`,
  role: `Role (${a.staff ? 'staff, ' : ''}${a.volunteers ? 'volunteer, ' : ''}board, intern, contractor)`,
  stepCols: ['#', 'Step', 'Done (date, initials)'],
  steps: list => list.filter(Boolean).map((s, i) => [i + 1, s, '']),
});
// Table that becomes stacked cards on narrow screens; each cell carries its column name for that view
const cardTable = (cls, cols, rows) => `<div class="tablewrap"><table class="cards ${cls}">
    <thead><tr>${cols.map(c => `<th>${c}</th>`).join('')}</tr></thead>
    <tbody>${rows.map(r => `<tr>${r.map((c, i) => `<td data-label="${cols[i]}">${c}</td>`).join('')}</tr>`).join('')}</tbody>
  </table></div>`;

// Approval block at the end of every policy. The blanks are plain underscores so they survive printing and pasting.
const line = n => '_'.repeat(n);
const approval = () => `
  <hr class="approval-rule">
  <h3>Policy Approval</h3>
  <p class="approval"><span>Approved by: ${line(36)}</span> <span>Title: ${line(26)}</span><br><span>Signature: ${line(36)}</span> <span>Date approved: ${line(22)}</span><br>Board approval date (if applicable): ${line(30)}</p>`;

// Same section in every policy; the Incident Response Plan's sections aren't numbered
const acknowledgment = n => `
  <h3>${n ? n + '. ' : ''}Policy acknowledgment</h3>
  <p>Everyone covered by this policy signs the Policy Acknowledgment Form.</p>`;

const build = {
aup(a, pol){
  const setup = `
    <h3>5. Setting up devices and Wi-Fi</h3>
    <p>These rules apply to every phone and computer used for ${a.org} work${a.byod && a.devices ? t(', whether the organization owns it or you do') : ''}.</p>
    <ul>
      <li>Screens lock automatically after 15 minutes on computers and 2 minutes on phones, and unlock only with a PIN, password, fingerprint or face.</li>
      <li>Automatic updates are turned on for the operating system and apps.</li>
      <li>Device encryption is turned on. On computers, use BitLocker (Windows) or FileVault (Mac). Phones are encrypted once a passcode is set.</li>
      <li>On computers, the built-in firewall and malware protection stay on, such as Microsoft Defender on Windows.</li>
      <li>A lost or stolen device is reported to ${midSentence(a.contact)} within 24 hours.</li>
    </ul>${a.office ? `
    <p>${t(`${midSentence(a.contact)} also makes sure that:`)}</p>
    <ul>
      <li>${t('Default passwords on the Wi-Fi router, printers and other office equipment are changed.')}</li>
      <li>${t('Office Wi-Fi uses WPA2 or WPA3 with a strong password, and visitors and clients use a separate guest network.')}</li>
    </ul>` : ''}${a.server ? `
    <p>${t(`${midSentence(a.contact)} also makes sure that:`)}</p>
    <ul>
      <li>${t('The office server or storage device is kept in a locked space.')}</li>
      <li>${t('Its updates are automatic, or are installed every month.')}</li>
      <li>${t('Its default passwords are changed, and only named people have admin access.')}</li>
    </ul>` : ''}${a.devices ? `
    <p>Each organization device, who it is assigned to, and whether it meets these rules are recorded in the Asset Inventory.</p>` : ''}`;
  const personal = a.byod ? `
    <h3>6. Using your own phone or computer</h3>
    <p>${t(`${a.staff ? (a.volunteers ? 'Staff, board members and volunteers' : 'Staff and board members') : (a.volunteers ? 'Board members and volunteers' : 'Board members')} may use personal devices for ${a.org} work`)} if they follow section 5 and these rules:</p>
    <ul>
      <li>${a.platform==='other' ? 'Work email is opened in the official app or a web browser.' : t(`Work email and files are opened only in the official ${a.platformName} apps or a web browser.`)}</li>
      <li>Donor or client lists are never downloaded or saved to the device.</li>
      ${a.platform==='m365' ? `<li>${t('You agree that ' + a.org + ' may remotely remove its email and files (not your personal data) from the device if the device is managed through Microsoft 365.')}</li>` : ''}
      ${a.platform==='google' ? `<li>${t('You agree that ' + a.org + ' may remotely sign your device out of its Google Workspace account.')}</li>` : ''}
      <li>When you leave, you remove ${a.org} accounts and files from the device.</li>
    </ul>` : `
    <h3>6. Using your own phone or computer</h3>
    <p>${t(`Work for ${a.org} is done only on devices the organization provides.`)} Personal phones and computers may not be used to access organization email, files or donor records.</p>`;
  return head(a,pol,'Acceptable Use Policy') + `
  <h3>1. Purpose</h3>
  <p>This policy explains how people may use ${a.org}'s accounts, devices and information. It protects the people we serve, our donors and our reputation.</p>
  <h3>2. Who it covers</h3>
  <p>Everyone with access to ${a.org} systems: ${scope(a, 'volunteers, including short-term and event volunteers')}.</p>
  <h3>3. Acceptable use</h3>
  <ul>
    <li>Use ${a.org} accounts for organization work.${a.devices ? " Brief personal use of an organization device is fine if it doesn't interfere with work." : ''}</li>
    <li>Keep organization files in ${a.platform==='m365' ? t('OneDrive or SharePoint') : a.platform==='google' ? t('Google Drive') : 'the approved shared storage'}, not in personal cloud accounts.</li>
    <li>Lock your screen when you step away.</li>
    <li>Avoid public Wi-Fi for donor records and online banking. Use your phone's hotspot when you can.</li>
  </ul>
  <h3>4. Not allowed</h3>
  <ul>
    <li>Sharing your personal login with anyone${a.shared ? ' ' + t('(approved shared accounts follow the Passwords &amp; MFA policy)') : ''}.</li>
    <li>Forwarding donor, client or volunteer information to personal email.</li>
    ${a.devices ? `<li>Installing software on organization devices without approval from ${a.contact}.</li>` : ''}
    <li>Using organization accounts to support or oppose political candidates, which can put a 501(c)(3)'s tax-exempt status at risk.</li>
    <li>Harassment, illegal downloads, or anything that would embarrass ${a.org}.</li>
  </ul>
  ${setup}
  ${personal}
  <h3>7. Suspicious emails and payment requests</h3>
  <p>Report suspicious messages to ${midSentence(a.contact)} at ${t(a.contactInfo)}. Never buy gift cards, send money, or change bank details because of an email or text, even one that appears to come from leadership. Confirm by calling the person at a number you already have.</p>
  <h3>8. Privacy</h3>
  <p>Organization accounts${a.devices ? ' and devices' : ''} belong to ${a.org}. They may be reviewed when needed to protect the organization or respond to an incident.</p>
  <h3>9. When you leave</h3>
  <p>${a.devices ? 'Return any organization equipment assigned to you in the Asset Inventory. ' : ''}Your access will be removed ${offboardWindow(a)}. See the Offboarding Checklist for the full list of steps.</p>
  ${acknowledgment(10)}
  ${approval()}`;
},

pw(a, pol){
  const pmText = a.pm === 'none'
    ? `<p class="note"><b>Action needed:</b> ${t(`${a.org} does not yet use a password manager. ${a.contact} will choose one within 60 days.`)} Until then, never store passwords in spreadsheets, documents or email.</p>`
    : `<p>${t(`${a.org} provides ${esc(a.pm)}`)} for storing organization passwords. Use it for every organization account. Never keep passwords in spreadsheets, sticky notes, documents or email.</p>`;
  const sharedText = a.shared ? `
    <h3>5. Shared accounts</h3>
    <p>${t('Some accounts, such as social media or event platforms, are shared by several people.')} They must follow these rules:</p>
    <ul>
      <li>${a.staff ? `Each shared account has a named owner who is a staff member${a.volunteers ? ', not a volunteer' : ''}` : t('Each shared account has a named owner who is a board member')}.</li>
      <li>The password is stored ${a.pm==='none' ? 'in the approved password manager once one is chosen' : t('in a shared ' + esc(a.pm) + ' vault')}. It is never sent by text or email.</li>
      <li>${a.staff ? `MFA codes go to an organization phone number or email, never ${a.volunteers ? "a volunteer's" : 'a'} personal number.` : t("MFA codes go to an email address the organization controls, not one person's personal phone, so the account isn't lost if that person leaves.")}</li>
      <li>${t('The password is changed whenever someone with access leaves.')}</li>
      <li>The owner reviews who has access every three months.</li>
    </ul>
    <p>${t('Each shared account and its owner are listed in the Asset Inventory.')}</p>` : `
    <h3>5. Shared accounts</h3>
    <p>${t('Shared logins are not allowed.')} Every person gets their own account so we can see who did what and remove access cleanly.</p>`;
  return head(a,pol,'Password and Multi-Factor Authentication Policy') + `
  <h3>1. Purpose</h3>
  <p>Stolen passwords are the most common way small organizations are breached. This policy sets simple rules that make stolen passwords much less useful.</p>
  <h3>2. Passwords</h3>
  <ul>
    <li>Use a passphrase of at least 14 characters, such as four unrelated words.</li>
    <li>Use a different password for every account. Never reuse a personal password for work.</li>
    <li>Passwords don't need to be changed on a schedule. Change one right away if it may have been exposed.</li>
  </ul>
  <h3>3. Password manager</h3>
  ${pmText}
  <h3>4. Multi-factor authentication (MFA)</h3>
  <p>MFA is required on these accounts:</p>
  <ul>
    <li>${a.platform==='other' ? 'Organization email' : t(a.platformName) + ' email'}</li>
    <li>${t(a.crmRaw==='spreadsheet' ? 'The cloud account that stores donor spreadsheets' : a.crm + ' donor database')}</li>
    <li>Online banking and payment platforms</li>
    <li>Website administration and hosting</li>
    <li>Social media and cloud storage</li>
  </ul>
  <p>MFA status for every account is recorded in the Asset Inventory.</p>
  <p>Use an authenticator app or a security key. Text message codes are allowed only when nothing else is offered.</p>
  ${sharedText}
  <h3>6. Administrator access</h3>
  <p>No more than two or three people hold administrator rights to email, the donor database or the website. Administrators use a separate admin account for admin work. Administrators for each system are listed in the Asset Inventory.</p>
  <h3>7. Giving and removing access</h3>
  <p>${a.contact} approves every new account and every request for more access. New people get access only after they sign the Policy Acknowledgment Form, using the Onboarding Checklist.</p>
  <p>When anyone leaves, ${t(a.contact)} removes their access ${offboardWindow(a)}, using the Offboarding Checklist.</p>
  <h3>8. If a password is exposed</h3>
  <p>Change it immediately and tell ${a.contact}. If you approved an MFA prompt you didn't start, report it right away. That means someone else has your password.</p>
  ${acknowledgment(9)}
  ${approval()}`;
},

data(a, pol){
  const c = a.clients, v = a.volunteers;
  const store = {m365:'SharePoint', google:'Google Drive'}[a.platform] || 'the approved shared storage';
  const fileStore = t(store);
  const donorPlace = a.crmRaw==='spreadsheet' ? t(`The Donor Records folder in ${store}`) : t(a.crm);
  const cards = a.cards
    ? `<p>${t(`${a.org} takes card details by phone or in person.`)} When you do:</p>
      <ul>
        <li>Enter the card directly into the payment system while the donor is on the line.</li>
        <li>Never write card numbers down, email them, or save them in ${a.crm} or a spreadsheet.</li>
        <li>Never ask for or store the three-digit security code after the payment is processed.</li>
        <li>${a.org} completes the PCI DSS self-assessment questionnaire its payment processor requires each year.</li>
      </ul>`
    : `<p>${t(`${a.org} does not take card details directly.`)} ${a.online ? t('Donors who want to give by card are sent to the online giving page.') + ' ' : ''}If someone reads you a card number, do not write it down.</p>`;
  const people = ['donors', c && t('the people we serve'), a.staff && 'staff', v && t('volunteers')].filter(Boolean).join(', ');
  const trusted = ['Donors', c && t('the people we serve'), a.staff && 'staff', v && t('volunteers')].filter(Boolean).join(', ');
  const noTalk = [v && t('other volunteers'), c && t('clients')].filter(Boolean).join(' and ');
  const staffRecords = v ? `Staff and ${t('volunteer')} records` : 'Staff records';
  const personnel = a.staff ? `${v ? `staff and ${t('volunteer')} records` : 'staff records'} such as Social Security numbers, background checks, payroll and tax details, and emergency contacts; `
    : v ? t('volunteer records such as background checks and emergency contacts') + '; ' : '';
  return head(a,pol,'Data Protection Policy') + `
  <p>We protect personal and confidential information about everyone we work with (${people} and board members), plus our financial and grant records.</p>
  <h3>1. Purpose</h3>
  <p>${trusted} and funders all trust us with their information. This policy explains how that information is classified, stored, shared and destroyed.</p>
  <h3>2. Who it covers</h3>
  <p>Everyone who can see or handle ${t(a.org)} information, on paper or online: ${scope(a, 'volunteers, including short-term and event volunteers')}.</p>
  <h3>3. Types of information</h3>
  ${cardTable('levels', ['Level', 'Examples', 'Who can see it'], [
    ['<b>Confidential</b>', `Donor giving history, home addresses, bank or card details; ${c ? t('client records such as household size, income, eligibility and case notes') + '; ' : ''}${personnel}organization bank account details; confidential board matters`, 'Only people whose role requires it'],
    ['<b>Internal</b>', `${v ? t('Volunteer') : a.staff ? 'Staff' : t('Board')} schedules, internal meeting notes, draft budgets, grant applications and funder reports before they are published`, a.staff ? (v ? `Staff, board and ${t('active volunteers')}` : 'Staff and board members') : (v ? `Board and ${t('active volunteers')}` : 'Board members')],
    ['<b>Public</b>', 'Website content, annual report, published event details, published grant reports', 'Anyone'],
  ])}
  <p>When unsure, treat information as Confidential.</p>
  <h3>4. Where information is kept</h3>
  <p>Each type of information has one approved place. Copies in spreadsheets, email or personal accounts are not allowed except for a specific, short-term task.</p>
  ${cardTable('places', ['Information', 'Approved place', 'Who can see it'], [
    ['Donor records', donorPlace, a.staff ? 'Staff who manage donations and fundraising' : t('People who manage donations and fundraising')],
    c ? [t('Client records'), `The Clients folder in ${fileStore}${a.paper ? ', ' + t('or a locked filing cabinet for paper intake forms') : ''}`, 'People who provide services to those clients'] : null,
    a.staff ? [staffRecords, `The HR folder in ${fileStore}`, 'The executive director and whoever handles HR or payroll']
      : v ? [t('Volunteer records'), `The Volunteers folder in ${fileStore}`, t('Board members who manage volunteers')] : null,
    ['Grant and financial records', `The Finance folder in ${fileStore} and online banking`, a.staff ? 'The executive director, treasurer and bookkeeper' : t('The treasurer and bookkeeper')],
    ['Board records', `The Board folder in ${fileStore}, not personal email`, a.staff ? 'Board members and the executive director' : 'Board members'],
    a.server ? [t('Shared files kept on site'), t('The office server or storage device, in folders limited to the people listed'), t('Only people whose role requires it')] : null,
  ].filter(Boolean))}
  <p>Every system that holds confidential information is listed in the Asset Inventory.</p>
  <p>Folder names and roles are suggestions. Use the names and roles your organization already has, as long as access to each folder is limited to the people listed.</p>
  ${a.crmRaw==='spreadsheet' ? `<p class="note"><b>Risk noted:</b> ${t('Donor records are kept in spreadsheets.')} Limit access to named people and never email copies. Moving to a donor database is recommended.</p>` : ''}
  <h3>5. Who has access</h3>
  <ul>
    <li>People get the least access their role needs.${v ? ' ' + t('Volunteers get view-only access to the specific records their task requires, and only while they are doing it.') : ''}</li>
    <li>Confidential information may not be downloaded, exported or saved on personal devices.</li>
    <li>Access is reviewed every six months. When someone leaves, their access is removed ${offboardWindow(a)}.</li>
  </ul>
  <h3>6. Collecting and using information</h3>
  <ul>
    <li>Collect only the information you need for the task.${c ? ' ' + t("For example, don't ask clients for details the program doesn't require.") : ''}</li>
    <li>Use information only for the reason it was collected.${c ? ' ' + t('Client information is used to provide services, not for fundraising.') : ''}</li>
    <li>Don't discuss ${c ? t('client or donor') : 'donor'} information with people who don't need it${noTalk ? `, including ${noTalk}` : ''}.</li>
  </ul>
  <h3>7. Card payments</h3>
  ${cards}
  <h3>8. Sharing information</h3>
  <ul>
    <li>${t(a.org)} does not sell, rent or trade donor lists or any personal information.</li>
    ${c ? `<li>${t("Client information is shared outside the organization only with the client's consent, or when the law requires it.")}</li>
    <li>${t('Funders receive client information as totals or with names removed, unless the grant agreement requires more and the client has agreed.')}</li>` : ''}
    <li>Vendors that receive personal information (donor database, mail houses, event platforms${a.staff ? ', payroll services' : ''}) must have a written agreement that covers how they protect it. Vendors with written agreements are marked in the Asset Inventory.</li>
    <li>Files sent outside the organization are shared through a protected link, never as an email attachment.</li>
    <li>Never paste confidential information into AI chatbots or other tools the organization hasn't approved.</li>
    <li>Requests from police, lawyers or government agencies go to ${t(midSentence(a.owner))} before anything is shared.</li>
  </ul>
  ${c ? `<p>${t('Some programs and grants have extra legal or contract rules for client information, such as health privacy laws or confidentiality rules for domestic violence services. Check with legal counsel and your grant agreements.')}</p>` : ''}
  <h3>9. Keeping and destroying records</h3>
  ${cardTable('retain', ['Record', 'How long to keep it'], [
    ['Donor gift and financial records', 'As long as tax and audit rules require (commonly seven years)'],
    ['Grant records', 'As long as the grant agreement requires (federal grants commonly require at least three years after the final report)'],
    a.staff ? ['Staff payroll and tax records', 'As long as tax and employment laws require'] : null,
    c ? [t('Client records'), t('Only as long as needed to provide services, or as long as a grant or law requires')] : null,
    v ? [t('Volunteer applications and background checks'), t('While the person is active, then for the period legal counsel recommends')] : null,
    ['Exports and copies made for a task', 'Deleted when the task is done'],
  ].filter(Boolean))}
  <p>Check these periods with your accountant or legal counsel, because requirements vary by state and grant.</p>
  <ul>
    <li>Paper records are cross-cut shredded.</li>
    ${a.devices ? '<li>Computers and phones are wiped before reuse, donation or disposal. Record the date each device is wiped and disposed of in the Asset Inventory.</li>' : ''}
  </ul>
  <h3>10. Reporting a problem</h3>
  <p>Report lost, stolen or misdirected information of any kind to ${t(midSentence(a.contact))} within one hour, following the Incident Response Plan. This includes ${a.paper ? t('a lost paper intake form') + ', ' : ''}a file sent to the wrong person, or a device that held confidential information.</p>
  ${acknowledgment(11)}
  ${approval()}`;
},

backup(a, pol){
  const storage = a.platform==='m365' ? t('OneDrive or SharePoint') : a.platform==='google' ? t('Google Drive') : 'the approved shared storage';
  const platformCopy = a.platform==='other'
    ? `<p>Free email accounts have no organization-wide backup. Important files are kept in ${storage}, and that storage is backed up.</p>`
    : `<p>${t(`${a.platformName} keeps deleted items only for a limited time. It is not a full backup.`)}</p>`;
  const service = a.backup
    ? `<p>${t(`${a.org} uses ${a.backupName ? a.backupName + ', ' : ''}a separate backup service that copies email and files automatically every day.`)}</p>`
    : `<p class="note"><b>Action needed:</b> ${t(`${a.org} does not yet have a separate backup. ${a.contact} will choose a backup service within 60 days.`)} Until then, ${a.contact} saves a copy of key files and donor records to an encrypted drive every week.</p>`;
  const donors = a.crmRaw==='spreadsheet'
    ? t('Donor spreadsheets are backed up with the other files, and a monthly copy is kept offline.')
    : t(`${a.crm} backs up its own systems, but may not restore one organization's records on request. Every month, ${a.contact} exports the donor records and saves the export with the backups.`);
  const records = [
    a.clients && t('Client'),
    a.staff && (a.clients ? 'staff' : 'Staff'),
    a.volunteers && t(a.clients || a.staff ? 'volunteer' : 'Volunteer'),
    a.clients || a.staff || a.volunteers ? 'grant' : 'Grant',
  ].filter(Boolean).join(', ');
  return head(a,pol,'Backup and Recovery Policy') + `
  <h3>1. Purpose</h3>
  <p>Ransomware, a deleted folder or a lost laptop can wipe out years of records. This policy makes sure ${a.org} can get its information back quickly.</p>
  <h3>2. What gets backed up</h3>
  <ul>
    <li>Email and files in ${a.platform==='other' ? 'organization accounts and shared storage' : t(a.platformName)}</li>${a.server ? `
    <li>${t('Files on the office server or storage device')}</li>` : ''}
    <li>Donor records in ${t(a.crmRaw==='spreadsheet' ? 'spreadsheets' : a.crm)}</li>
    <li>${records} and board records, in the places listed in the Data Protection Policy</li>
    <li>Financial and accounting records</li>
    <li>The website, if ${a.org} manages it rather than a host or developer</li>
    ${a.pm==='none' ? '' : `<li>${t(`${esc(a.pm)}: a second administrator has emergency access, so the vault isn't lost if one person leaves.`)}</li>`}
  </ul>
  <p>The Asset Inventory shows which systems are backed up. Check it at each restore test so nothing is missed.</p>
  ${a.paper ? `<p>${t('Paper client records are not covered by these backups. Scan any that would be hard to replace into the Clients folder.')}</p>` : ''}
  <h3>3. The 3-2-1 rule</h3>
  <p>Keep at least three copies of important information, on two different kinds of storage, with one copy kept offline or in a separate account. Ransomware that reaches everyday accounts cannot reach that copy.</p>
  <h3>4. How backups are made</h3>
  ${platformCopy}
  ${service}
  <ul>
    <li>${donors}</li>
    <li>Backups run automatically. Don't rely on someone remembering.</li>${a.server ? `
    <li>${t('The office server or storage device is backed up every day, with one copy kept off-site or in the cloud. A copy kept next to it can be lost to the same fire, theft or ransomware.')}</li>` : ''}
    ${a.byod ? `<li>${t(`Work files are saved in ${storage}, not only on personal devices, so a lost device never loses work.`)}</li>` : ''}
  </ul>
  <h3>5. Protecting the backups</h3>
  <ul>
    <li>No more than two named people can reach the backups. Both use MFA.</li>
    <li>Backups are kept separate from everyday accounts, so one stolen password cannot delete them.</li>
    <li>Backups and donor exports are Confidential under the Data Protection Policy and are stored encrypted.</li>
  </ul>
  <h3>6. Testing restores</h3>
  <p>A backup that has never been restored may not work. Every three months, ${a.contact} restores a sample file and a sample of donor records, and writes down the date and the result.${a.server ? ' ' + t('Each test includes a file from the office server or storage device.') : ''}</p>
  <h3>7. Who is responsible</h3>
  <p>${a.contact} owns the backups. ${a.backupLead} is the second person with access.${a.turnover ? ' ' + t('Backup access is never held by only one person. When someone with access leaves, it moves to another person the same day.') : ''}</p>
  <h3>8. Restoring after an incident</h3>
  <p>Follow the Incident Response Plan. After ransomware, make sure the infection is gone before restoring, or the restored files can be locked again.${a.insurance ? ' ' + t('Tell the cyber insurance carrier before restoring, so evidence is preserved.') : ''}</p>
  ${acknowledgment(9)}
  ${approval()}`;
},

ir(a, pol){
  return '<div class="onepage">' + head(a,pol,'Incident Response Plan') + `
  <p>Keep this page where everyone can find it, including a printed copy. If something seems wrong, report it. Reporting early is never a mistake.</p>
  <h3>Incident lead</h3>
  <p>${t(a.contact)} · ${t(a.contactInfo)}<br>Backup: ${t(a.backupLead)}</p>
  <p>Full contact details${a.insurance ? t(', including the cyber insurance carrier,') : ''} are on the Incident Contact List, kept by ${a.contact} and verified every three months. Printed copies are kept at ${printedAt(a)}.</p>
  <h3>What to report</h3>
  <p>Clicking a suspicious link or entering a password on an unfamiliar page, a lost or stolen device, ransom messages or locked files, unexpected account changes or MFA prompts, confidential information sent to the wrong person, website changes nobody made, or any request to change payment or bank details.</p>
  <h3>Step 1 · Report within one hour</h3>
  <p>Call or message the incident lead. Write down what happened and when. ${a.turnover && a.volunteers ? t('Volunteers report to their coordinator or straight to the incident lead.') : ''}</p>
  <h3>Step 2 · Contain</h3>
  <ul>
    <li>Disconnect the affected device from Wi-Fi and the network. Do not turn it off or delete anything.</li>${a.server ? `
    <li>${t('Do the same with the office server or storage device if it may be affected.')}</li>` : ''}
    <li>Reset the affected password and sign the account out of all sessions in ${t(a.platformName)}.</li>
    <li>Don't use email to discuss the incident if email may be compromised. Use the phone, and confirm any urgent request by calling a number from the Incident Contact List.</li>
    <li>If money was sent, call the bank's fraud line (on the Incident Contact List) immediately. Fast calls give the best chance of recovering funds.</li>
  </ul>
  <h3>Step 3 · Assess</h3>
  <p>The incident lead works out what systems and information were involved, including whether ${t(a.crmRaw==='spreadsheet' ? 'donor spreadsheets' : a.crm)} or donor personal information was exposed. Use the Asset Inventory to identify which accounts, devices and data were affected.</p>
  <h3>Step 4 · Notify</h3>
  <ol>
    ${a.insurance ? `<li>${t('Cyber insurance carrier first, before hiring outside help. Most policies require early notice and approved vendors.')}</li>` : ''}
    <li>${a.owner} and the board chair.</li>
    <li>${a.itProvider ? 'IT provider or website host' : t('Website host')}, if their systems are involved.</li>
    <li>Fraud or ransomware: FBI at ic3.gov. CISA accepts reports at cisa.gov/report.</li>
    <li>If personal information was exposed, legal counsel decides on notices to donors and regulators under state breach notification law.</li>
  </ol>
  <h3>Step 5 · Recover</h3>
  <p>Confirm the problem is gone, restore from backups as set out in the Backup and Recovery Policy, and watch the affected accounts for two weeks. ${a.insurance ? '' : t('Without cyber insurance, decisions about outside help or ransom demands go to the board.')}</p>
  <h3>Step 6 · Learn</h3>
  <p>Within 30 days, hold a short review: what happened, what worked, what to change. Update these policies and the Incident Contact List if needed.</p>
  ${acknowledgment()}
  ${approval()}</div>`;
},

train(a, pol){
  const org = t(a.org), owner = t(a.owner), contact = t(a.contact);
  const logTool = {m365:'an Excel spreadsheet', google:'a Google Sheets spreadsheet'}[a.platform] || 'an Excel or Google Sheets spreadsheet';
  const logHome = {m365:'OneDrive or SharePoint', google:'Google Drive'}[a.platform] || 'the approved shared storage';
  const everyone = scope(a, 'volunteers');
  const covered = scope(a, 'volunteers, including short-term and event volunteers who use organization accounts');
  const roles = [
    [`${owner} (policy owner)`, 'Approves the training plan and any practice phishing emails, makes time for training, and leads the yearly tabletop exercise'],
    [`${contact} (security contact)`, 'Runs or arranges training, sends quarterly reminders, coaches anyone who clicks a practice phishing email, and keeps the training log'],
    a.volunteers ? [t('Volunteer coordinators'), t('Make sure volunteers who use organization accounts are trained before they get access')] : null,
    ['Everyone', 'Completes training on time, follows what they learned and reports problems'],
  ].filter(Boolean);
  return head(a, pol, 'Security Awareness and Training Policy') + `
  <p>Everyone who uses our accounts or handles confidential information gets security training when they join, a full refresher every year and short reminders every quarter, because most breaches at small organizations start with a person being tricked.</p>
  <h3>1. Purpose</h3>
  <p>This policy makes sure everyone knows how to spot scams, protect confidential information and report problems quickly. Training is short and practical, so it fits a small team${a.volunteers ? ' ' + t('that relies on volunteers') : ''}.</p>
  <p><b>Policy statement:</b> ${org} provides cybersecurity awareness training to all ${everyone} when they join and at least once a year after that. Short security reminders, exercises or refresher training happen throughout the year to reinforce safe habits and cover new threats.</p>
  <h3>2. Who it covers</h3>
  <p>Everyone with access to ${org} accounts, devices or confidential information: ${covered}.</p>
  <h3>3. When training happens</h3>
  ${cardTable('schedule', ['Activity', 'When', 'Time'], [
    ['Onboarding training', 'Before first access, as part of the Onboarding Checklist', 'About 15 minutes'],
    ['Full awareness training', 'Every year, for everyone still involved', 'About 30 minutes'],
    ['Security reminders or micro-training', 'Every quarter', '5 to 15 minutes'],
    ['Practice phishing emails (optional)', 'Every quarter, or monthly if resources allow', 'A few minutes'],
    ['Incident response tabletop exercise', 'Every year, for leadership and the incident lead', '30 to 60 minutes'],
    ['Policy update briefing', 'When a policy changes, followed by a new signature on the Policy Acknowledgment Form', '5 to 10 minutes'],
    ['Lessons-learned reminder', 'After an incident or near miss', '5 to 10 minutes'],
  ])}
  <p>Short, frequent reminders work better than a single yearly session, so the quarterly micro-training is the core of this policy.</p>
  <p>People with extra access, such as admin rights, the donor database or online banking, also learn the rules for their role before they get that access.</p>
  <h3>4. What training covers</h3>
  <p>Each topic matches a ${FRAMEWORKS.cis} Implementation Group 1 safeguard.</p>
  ${cardTable('topics', ['Topic', 'What people learn', 'CIS safeguard'], [
    ['Scams and phishing', 'Spotting fake emails, texts and calls, including gift-card requests and messages pretending to be leadership', '14.2'],
    ['Passwords and MFA', "Using passphrases and the password manager, never reusing passwords, and never approving an MFA prompt they didn't start", '14.3'],
    ['Handling confidential information', 'Where confidential information may be kept, who can see it, and never sending it to personal email', '14.4'],
    ['Safe use of AI tools', `Never pasting ${a.staff ? 'donor, client or staff' : t(a.volunteers ? 'donor, client or volunteer' : 'donor or client')} information into AI chatbots or tools the organization hasn't approved`, '14.4'],
    ['Avoiding accidental exposure', 'Sending files to the wrong person, leaving screens unlocked, and saving donor lists on personal devices', '14.5'],
    ['Reporting problems', 'What to report, who to call, and why to report right away', '14.6'],
    ['Keeping devices updated', 'Turning on automatic updates and noticing when a device is out of date', '14.7'],
    ['Remote work and Wi-Fi', 'Securing home Wi-Fi, avoiding public Wi-Fi for donor records and banking, and keeping work private at home', '14.8'],
  ])}
  <p>Onboarding covers every topic briefly, and the yearly training covers them in more depth. Each quarterly reminder picks one or two topics, for example:</p>
  <ul>
    <li>A real phishing email the organization received, and the warning signs</li>
    <li>A recent cyber incident at another nonprofit, and what would have prevented it</li>
    <li>A password or MFA tip</li>
    <li>Safe use of AI tools</li>
    <li>Working securely from home</li>
  </ul>
  <h3>5. How training is delivered</h3>
  <ul>
    <li>Training can be in person, by video call, or through free online material from trusted public sources such as the Cybersecurity and Infrastructure Security Agency (CISA).</li>
    <li>Keep it short and use real examples, such as a scam email the organization actually received.</li>
    <li>Quarterly reminders can be a short email, a newsletter item or five minutes at a team meeting.</li>
    ${a.volunteers ? `<li>${t("Volunteers who only help at events and never use organization accounts get a two-minute reminder instead: don't share personal information about clients or donors, and report anything suspicious to their coordinator.")}</li>` : ''}
  </ul>
  <p><b>If you use practice phishing emails</b></p>
  <ul>
    <li>Send them quarterly, or monthly if resources allow, and only with the policy owner's approval.</li>
    <li>Anyone who clicks gets short, private coaching from the security contact on what to look for next time.</li>
    <li>Results are used to teach, never to punish or embarrass anyone.</li>
  </ul>
  <p><b>Incident response tabletop exercise</b></p>
  <p>Once a year, the policy owner, the incident lead and other key people spend 30 to 60 minutes talking through a realistic scenario, such as ransomware or a hijacked email account. They walk through the Incident Response Plan and Incident Contact List, then fix any gaps they find.</p>
  <h3>6. Roles and responsibilities</h3>
  ${cardTable('roles', ['Who', 'Responsibility'], roles)}
  <h3>7. Reporting mistakes without blame</h3>
  <p>Anyone can click a bad link or send a file to the wrong person. Report it right away to ${t(midSentence(a.contact))} at ${t(a.contactPhone || a.contactInfo)}. Fast reporting limits the damage, and nobody is punished for an honest mistake they report. Hiding a mistake, or repeatedly ignoring the policies, is handled under the Acceptable Use Policy.</p>
  <h3>8. Training records</h3>
  <p>The security contact keeps a training log and records every session in it. Use a simple tool you already have, such as ${t(logTool)}, a shared document or a printed sheet. Model your log on the example below, but keep it separate from this policy. Store a digital log in ${t(logHome)}, not a personal account. The log shows funders, auditors and insurers that training actually happens.</p>
  ${cardTable('fill trainlog', ['Date', 'Name', 'Role', 'Activity (onboarding, yearly, quarterly, phishing test, tabletop, policy update, incident)', 'Given by'], Array(2).fill(['', '', '', '', '']))}
  ${acknowledgment(9)}
  ${approval()}`;
},

contacts(a, pol){
  // cells left empty are write-in spaces; table.fill gives them room on paper
  const row = (...cells) => `<tr>${cells.map(c => `<td>${c}</td>`).join('')}</tr>`;
  const table = (cols, rows, widths) => `<div class="tablewrap"><table class="fill">
    ${widths ? `<colgroup>${widths.map(w => `<col style="width:${w}">`).join('')}</colgroup>` : ''}
    <thead><tr>${cols.map(c => `<th>${c}</th>`).join('')}</tr></thead>
    <tbody>${rows.join('')}</tbody>
  </table></div>`;
  const adminSite = {m365:'admin.microsoft.com', google:'admin.google.com'}[a.platform];
  const donorRecords = a.crmRaw==='spreadsheet'
    ? `Spreadsheets in ${a.platform==='other' ? 'cloud storage' : a.platformName}` : a.crm;
  const processor = a.cards || a.online;
  return `<div class="onepage"><div class="eyebrow">${a.org} · Confidential</div>
  <h2>Incident Contact List</h2>
  ${chips(pol)}
  <div class="docmeta">
    <div>Organization<b>${a.org}</b></div>
    <div>Sheet owner<b>${a.contact}</b></div>
    <div>Last verified<b>${a.date}</b></div>
    <div>Next check<b>${a.check}</b></div>
  </div>
  <p class="note"><b>Confidential:</b> Give this sheet only to people who may need it during an incident. Keep a printed copy at ${printedAt(a)}, in case email or files are locked. <b>Call, don't email:</b> if email may be compromised, the attacker may be reading it.</p>
  <h3>People</h3>
  ${table(['Role','Name','Office phone','After hours','Email'], [
    row('Incident lead', t(a.contact), a.contactPhone ? t(a.contactPhone) : '', '', a.contactEmail ? t(a.contactEmail) : ''),
    row('Backup lead (if the lead is unreachable or compromised)', t(a.backupLead), '', '', ''),
    a.staff ? row('Executive director', '', '', '', '') : '',
    row('Board chair', '', '', '', ''),
    row('Communications contact (donors and media)', '', '', '', ''),
  ])}
  <h3>Systems and providers</h3>
  ${table(['System','Provider','Support phone','Account / admin site'], [
    row('Email and files', a.platform==='other' ? '' : t(a.platformName), '', adminSite ? t(adminSite) : ''),    row('Donor records', t(donorRecords), '', ''),
    processor ? row(t('Payment processor (report possible card data exposure right away)'), '', '', '') : '',
    a.backup ? row(t('Backup service'), a.backupName ? t(a.backupName) : '', '', '') : '',
    row(a.itProvider ? 'Website host or developer, IT provider' : t('Website host or developer'), '', '', ''),
  ])}
  <h3>Money, insurance and legal</h3>
  ${table(['Contact','Name','24/7 phone','Account / policy no.'], [
    row('Bank fraud line', '', '', 'Account ending ____ (last 4 digits only)'),
    a.insurance ? row(t('Cyber insurance carrier (call before hiring outside help)'), '', '', 'Policy no.') : '',
    row('Legal counsel', '', '', ''),
  ])}
  <h3>Outside agencies</h3>
  ${table(['Agency','Phone','When to contact'], [
    row('FBI field office', '', 'Urgent fraud, such as a wire transfer. Also report at ic3.gov.'),
    row('Local police non-emergency line', '', 'Stolen devices, or a police report the insurer requires.'),
    row('State attorney general', '', 'Some data breaches must be reported here. Legal counsel confirms.'),
    row('CISA', 'cisa.gov/report', 'Ransomware and other cyber incidents (optional).'),
  ], ['30%','20%','50%'])}
  <p><b>Keep it current:</b> Check every entry every three months, and whenever someone on this sheet leaves or a provider changes. If the incident lead or backup changes, update the Incident Response Plan too.</p>
  <h3>Verification log</h3>
  <p class="loghead">List owner: ${line(34)} Next check due: ${line(14)}</p>
  <div class="tablewrap"><table class="log">
    <thead><tr><th>Date verified</th><th>Verified by (print name)</th><th>Initials</th><th>Changes made</th></tr></thead>
    <tbody>${'<tr><td></td><td></td><td></td><td></td></tr>'.repeat(3)}</tbody>
  </table></div></div>`;
},

onboard(a, pol){
  const { donors, noPM, who, role, stepCols, steps } = checklistParts(a);
  const list = [
    a.platform==='other' ? `Create ${t('their own organization email account')}. No shared logins for personal work.`
      : `Create their own ${t(a.platformName)} account. No shared logins for personal work.`,
    'Turn on multi-factor authentication (MFA) with an authenticator app.',
    noPM ? t('Give them access to shared passwords only in person, never by email or text, until a password manager is chosen.')
      : `Invite them to ${t(esc(a.pm))}.`,
    `Give ${a.crmRaw==='spreadsheet' ? 'access to ' + donors : donors + ' access'} at the lowest level their role needs${a.volunteers ? ' ' + t('(view-only for volunteers)') : ''}.`,
    'Add them to shared accounts only if their role needs it, and list which ones under Access given.',
    a.devices ? 'If you issue them an organization device, record it in the Asset Inventory.' : '',
    'Give them the policies and collect their signed Policy Acknowledgment Form.',
    'Give onboarding security training (see the Security Awareness and Training Policy): how to spot phishing and gift-card or payment scams, and how to report a problem to the incident lead.',
    a.byod ? t('If they use a personal device: confirm screen lock and automatic updates are on.') : '',
  ];
  return '<div class="onepage">' + head(a, pol, 'Onboarding Checklist') + `
  <p class="note">${PASSWORD_NOTE}</p>
  <p>Use this list for anyone who joins (${who}). Finish it before they start working with organization accounts or donor information.</p>
  ${cardTable('steps', stepCols, steps(list))}
  <h3>Access given (every account and shared login, so it can be removed when they leave)</h3>
  ${cardTable('fill', ['Account or system', 'Access level', 'Date given'], Array(4).fill(['', '', '']))}
  <div class="sig"><div>New person</div><div>${role}</div><div>Start date</div><div>Expected end date (if temporary)</div><div>Completed by (print name)</div><div>Date completed</div></div></div>`;
},

offboard(a, pol){
  const { donors, noPM, who, role, stepCols, steps } = checklistParts(a);
  const list = [
    `Block sign-in to ${a.platform==='other' ? t('their organization email account') : `their ${t(a.platformName)} account`} and sign them out of all sessions.`,
    'Move ownership of their files and shared folders to another person.',
    `Remove their access to ${donors}.`,
    noPM ? t('Note every shared password they knew; step 5 changes them.') : `Remove them from ${t(esc(a.pm))}.`,
    'Change the password on every shared account they could use, and move any MFA codes off their phone.',
    'Remove them from website, social media and online banking admin roles, group chats and email lists.',
    'Remove their access to backups. If they owned the backups, hand ownership to someone else first.',
    a.server ? t('Remove their access to the office server or storage device.') : '',
    a.byod ? t('Person leaving: confirm you removed organization accounts and files from your personal devices.') : '',
    'Confirm they kept no donor lists, exports or copies of confidential information.',
    a.devices ? 'Collect keys, equipment and paper records, using the Asset Inventory to check which devices were assigned to them. Change any door or storage codes they knew.'
      : t('Collect keys and paper records. Change any door or storage codes they knew.'),
    a.devices ? 'Update the Asset Inventory: mark returned devices and remove them as an admin on any system.'
      : t('Update the Asset Inventory: remove them as an admin on any system.'),
  ];
  return '<div class="onepage">' + head(a, pol, 'Offboarding Checklist') + `
  <p class="note">${PASSWORD_NOTE}</p>
  <p>Use this list whenever anyone leaves (${who}). Finish it ${offboardWindow(a)}.</p>
  ${cardTable('steps', stepCols, steps(list))}
  <div class="sig"><div>Person leaving</div><div>${role}</div><div>Last day</div><div>Completed by (print name)</div><div>Date completed</div></div></div>`;
},

ack(a, pol){
  const rows = POLICIES.filter(p => !p.sheet).map(p => [p.name, '', '']); // the date column is filled in by hand
  rows.push(['Other:', '', ''], ['Other:', '', '']);
  return `<div class="onepage"><h2>Policy Acknowledgment Form</h2>
  ${chips(pol)}
  <p>Organization: <b>${t(a.org)}</b></p>
  <p>Each person signs this form when they join and again whenever a policy listed below changes. Check off every policy they received, then keep the signed form in their file.</p>
  <h3>Policies covered</h3>
  <p>The signer initials each policy they received and read. Leave rows blank for policies that don't apply to their role.</p>
  ${cardTable('fill ack', ['Policy', 'Version or effective date', "Signer's initials"], rows)}
  <h3>Acknowledgment</h3>
  <p>By signing below, I confirm that:</p>
  <ol>
    <li>I received and read each policy I initialed above.</li>
    <li>I understand the policies, and I know who to ask if something is unclear.</li>
    <li>I agree to follow them while I work or volunteer with the organization, and after I leave where they say so, such as keeping donor information confidential.</li>
    <li>I will report lost devices, suspicious messages and possible security problems right away, as the policies describe.</li>
    <li>I understand that not following these policies may lead to losing access to organization accounts, or ending my role with the organization.</li>
    <li>I understand the policies may change, and I may be asked to read and sign again.</li>
  </ol>
  <h3>Signer</h3>
  <div class="sig two"><div>Full name (print)</div><div>Role (for example: ${a.staff ? 'staff, ' : ''}${a.volunteers ? t('volunteer') + ', ' : ''}board member, intern, contractor or vendor)</div><div>Signature</div><div>Date</div></div>
  <h3>For the organization</h3>
  <div class="sig two"><div>Received by (print name)</div><div>Title</div><div>Signature</div><div>Date received</div></div>
  <ul>
    <li>File the signed form with the person's onboarding checklist and keep it for as long as they are involved, plus the period your records retention rules require.</li>
    <li>Ask everyone to sign again when a policy listed above changes, or at least once a year.</li>
    <li>A signed copy is evidence for auditors, funders and insurers that people were told the rules.</li>
  </ul></div>`;
},

inventory(a, pol){
  const store = {m365:'SharePoint', google:'Google Drive'}[a.platform] || 'a shared folder with restricted access';
  const email = a.platform==='other' ? 'Organization email' : a.platformName;
  const donors = a.crmRaw==='spreadsheet' ? `Donor spreadsheets in ${store}` : a.crm;
  const account = (service, use) => [service, use, '', '', '', '', ''];
  const blank = (rows, cols) => Array(rows).fill(Array(cols).fill(''));
  return `<div class="onepage inventory"><h2>Asset Inventory</h2>
  ${chips(pol)}
  <p>Organization: <b>${t(a.org)}</b></p>
  <p>This inventory lists every ${a.devices ? 'account, service and device' : t('account and service')} the organization uses, so you know what to protect, what to back up and what to remove when someone leaves. Review it every six months and whenever something is added, replaced or retired.</p>
  <p class="note">Never write passwords on this form. They belong in the password manager.</p>
  <h3>Accounts and services</h3>
  ${cardTable('fill inv accounts', ['Service', "What it's used for", 'Holds confidential data?', 'Admin(s)', 'MFA on?', 'Backed up?', 'Vendor agreement?'], [
    account(t(email), 'Email, files and calendars'),
    account(t(donors), 'Donor records and giving history'),
    a.pm==='none' ? null : account(t(esc(a.pm)), t('Storing organization passwords')),
    a.backup ? account(t(a.backupName || 'Backup service'), t('Backup copies of email and files')) : null,
    a.server ? account(t('Office server or storage device'), t('Shared files kept on site')) : null,
    account('Online banking', 'Organization bank accounts'),
    account('Website and hosting', 'Organization website'),
    account('Social media accounts', 'Public communication'),
    ...blank(4, 7),
  ].filter(Boolean))}
  ${a.devices ? `<h3>Devices</h3>
  ${cardTable('fill inv devices', ['Device (type and label, such as &quot;Front desk laptop&quot;)', 'Assigned to', 'Encrypted?', 'Updates on?', 'Firewall on?', 'Date issued', 'Date returned or disposed'], blank(6, 7))}
  ` : ''}<h3>Review log</h3>
  <p>Inventory owner: ${t(a.contact)}<br>Next review due: ${line(14)} (review every six months)</p>
  ${cardTable('fill inv invlog', ['Date reviewed', 'Reviewed by (print name)', 'Initials', 'Changes made'], blank(4, 4))}</div>`;
},

summary(a, pol){
  const docs = POLICIES.filter(p => p.maps.length);
  const labels = (p, fw) => p.maps.filter(m => m.startsWith(fw)).map(m => m.slice(fw.length + 1).replace(' · ', ' ')).join(', ');
  return `<div class="onepage"><h2>Framework Summary</h2>
  <p>Organization: <b>${t(a.org)}</b> &nbsp;&nbsp; Date: <b>${a.date}</b></p>
  <p>This summary shows which parts of two recognized security frameworks each document supports: the ${FRAMEWORKS.cis} (Implementation Group 1, the starter set for small organizations) and the ${FRAMEWORKS.nist}.</p>
  <p class="note"><b>Alignment, not certification.</b> The labels show which parts of each framework a document supports. Using these documents does not make an organization "compliant" or "certified". Following them in practice is what reduces risk.</p>
  <h3>Documents and their labels</h3>
  ${cardTable('fwmap', ['Document', 'CIS Controls', 'NIST CSF'], docs.map(p => [p.name, labels(p, 'CIS'), labels(p, 'NIST')]))}
  <h3>What each label means</h3>
  ${cardTable('fwkey', ['Label', 'Name', 'In plain English'], LABEL_KEY.filter(([l]) => docs.some(p => p.maps.some(m => m === l || m.startsWith(l + ' ·')))))}</div>`;
}
};

function renderTabs(){
  const kept = [...document.querySelectorAll('.tabgroup-tabs')].map(g => g.scrollLeft); // tabs are rebuilt on every change
  const tab = p => `<button class="tab" role="tab" type="button" id="tab-${p.id}"${p.name.includes(p.tab || p.name) ? ` aria-label="${p.name}"` : ''} aria-selected="${p.id===current}" aria-controls="paper" tabindex="${p.id===current ? 0 : -1}" data-id="${p.id}">${p.tab || p.name}</button>`;
  const group = (label, list) => `<div class="tabgroup" role="presentation"><span class="tabgroup-label" aria-hidden="true">${label}</span><div class="tabgroup-tabs" role="presentation">${list.map(tab).join('')}</div></div>`;
  $('tabs').innerHTML = group('Policies', POLICIES.filter(p=>!p.sheet)) + group('Forms', POLICIES.filter(p=>p.sheet));
  document.querySelectorAll('.tabgroup-tabs').forEach((g, i) => { g.scrollLeft = kept[i] || 0; });
  $('paper').setAttribute('aria-labelledby', 'tab-' + current);
  updateTabFade();
}
// Fades the right edge of a tab row while there are more tabs to scroll to
function updateTabFade(){
  document.querySelectorAll('.tabgroup-tabs').forEach(g => g.classList.toggle('more', g.scrollLeft + g.clientWidth < g.scrollWidth - 2));
}
function syncOther(){ // show each "Other" text box only when its dropdown says Other
  $('platformOther').hidden = $('platform').value !== 'custom';
  $('crmOther').hidden = $('crm').value !== 'other';
  $('pmOther').hidden = $('pm').value !== 'other';
  $('paperClientsRow').hidden = !$('clients').checked; // follows its parent checkbox
  $('backupNameRow').hidden = !$('backup').checked;
  const noDevices = !$('devices').checked; // then everyone must be on personal devices
  if(noDevices) $('byod').checked = true;
  $('byod').disabled = noDevices;
}
function render(){
  syncOther();
  const a = read();
  const pol = POLICIES.find(p=>p.id===current);
  $('paper').innerHTML = build[current](a, pol);
  // Screen only: added here, not in build, so printed and copied documents never contain it
  $('paper').querySelector('.maps')?.insertAdjacentHTML('beforeend', '<a class="maplink" href="how.html#labels" target="_blank" rel="noopener">What do these mean?</a>');
  renderTabs();
}
function selectTab(id){ current = id; render(); $('tab-' + id).focus(); } // tabs are rebuilt, so restore focus
$('tabs').addEventListener('click', e => {
  const b = e.target.closest('.tab'); if(!b) return;
  selectTab(b.dataset.id);
});
$('tabs').addEventListener('keydown', e => {
  const i = POLICIES.findIndex(p=>p.id===current), n = POLICIES.length;
  const next = {ArrowRight:i+1, ArrowLeft:i-1, Home:0, End:n-1}[e.key];
  if(next === undefined) return;
  e.preventDefault();
  selectTab(POLICIES[(next+n)%n].id);
});
$('q').addEventListener('input', render);
$('q').addEventListener('change', render);
$('q').addEventListener('change', e => { // after render() has shown it, move into the new "Other" box
  const box = {platform:'platformOther', crm:'crmOther', pm:'pmOther'}[e.target.id];
  if(box && !$(box).hidden) $(box).focus();
});
$('q').addEventListener('submit', e => e.preventDefault());
// Ask before leaving once anything has been changed: answers are never saved, so closing or refreshing erases them
let edited = false;
$('q').addEventListener('input', () => { edited = true; });
window.addEventListener('beforeunload', e => { if(edited){ e.preventDefault(); e.returnValue = ''; } });
$('showT').addEventListener('change', e => $('paper').classList.toggle('show-tailored', e.target.checked));

function flash(msg){ $('status').textContent = msg; clearTimeout(flash.t); flash.t = setTimeout(()=>$('status').textContent='', 2500); }
// Pasting into Word or Google Docs: the page's CSS doesn't travel with copied HTML, so key styles are inlined.
// Literal colors are needed here because CSS variables don't exist in the pasted document.
const PASTE_STYLES = [
  ['.eyebrow', 'font-family:Consolas,monospace;font-size:8pt;letter-spacing:1px;text-transform:uppercase;color:#1d6b58;margin:0'],
  ['h2', 'font-family:"Segoe UI",Arial,sans-serif;font-size:18pt;margin:4pt 0'],
  ['h3', 'font-family:"Segoe UI",Arial,sans-serif;font-size:13pt;margin:14pt 0 4pt'],
  ['.chip', 'font-family:Consolas,monospace;font-size:8pt;border:1px solid #bbbbbb;padding:1px 4px;margin-right:4px;color:#444444'],
  ['table', 'border-collapse:collapse;width:100%;margin:6pt 0'],
  ['table.fill', 'table-layout:fixed'],
  ['table.fill th:first-child', 'width:30%'],
  ['th,td', 'border:1px solid #bbbbbb;padding:4px 6px;text-align:left;vertical-align:top;font-size:10pt'],
  ['th', 'background:#eef3f1;font-family:"Segoe UI",Arial,sans-serif;font-size:8pt;text-transform:uppercase'],
  ['table.fill td', 'height:22pt;word-wrap:break-word;overflow-wrap:anywhere'],
  ['.note', 'border-left:3px solid #9a5b10;padding:2pt 8pt;margin:8pt 0'],
  ['.note b', 'color:#9a5b10'],
  ['hr.approval-rule', 'border:none;border-top:1px solid #bbbbbb;margin:18pt 0 0'],
  ['table.cards', 'table-layout:fixed'],
  ['table.ack th:first-child', 'width:46%'],
  ['table.levels th:first-child', 'width:16%'],
  ['table.levels th:last-child', 'width:22%'],
  ['table.places th:first-child', 'width:24%'],
  ['table.places th:nth-child(2)', 'width:42%'],
  ['table.retain th:first-child', 'width:38%'],
  ['table.schedule th:nth-child(2)', 'width:50%'],
  ['table.topics th:nth-child(1)', 'width:24%'],
  ['table.topics th:nth-child(2)', 'width:60%'],
  ['table.roles th:first-child', 'width:34%'],
  ['table.trainlog th:first-child', 'width:14%'],
  ['table.trainlog th:nth-child(3)', 'width:14%'],
  ['table.trainlog th:nth-child(4)', 'width:32%'],
  ['table.steps th:first-child', 'width:7%'],
  ['table.steps th:last-child', 'width:26%'],
  ['table.steps td', 'height:24pt'],
  ['table.accounts th:nth-child(1)', 'width:20%'],
  ['table.accounts th:nth-child(2)', 'width:18%'],
  ['table.accounts th:nth-child(3)', 'width:13%'],
  ['table.accounts th:nth-child(4)', 'width:15%'],
  ['table.devices th:nth-child(1)', 'width:26%'],
  ['table.invlog th:nth-child(1)', 'width:15%'],
  ['table.invlog th:nth-child(2)', 'width:25%'],
  ['table.invlog th:nth-child(3)', 'width:10%'],
  ['table.fwmap th:nth-child(1)', 'width:26%'],
  ['table.fwmap th:nth-child(2)', 'width:46%'],
  ['table.fwkey th:nth-child(1)', 'width:13%'],
  ['table.fwkey th:nth-child(2)', 'width:35%'],
  ['table.log', 'table-layout:fixed'],
  ['table.log th,table.log td', 'border:none;border-bottom:1px solid #cccccc;background:none;text-transform:none;font-size:10pt;height:16pt'],
  ['.approval', 'border-left:3px solid #bbbbbb;padding:2pt 8pt;margin:8pt 0;line-height:2;font-size:9pt'], // larger sizes wrap in Word
];
function pasteHTML(html){
  const box = document.createElement('div');
  box.innerHTML = html;
  box.querySelectorAll('mark.t').forEach(m => m.replaceWith(...m.childNodes)); // highlights are for the screen only
  box.querySelectorAll('.tablewrap').forEach(w => w.replaceWith(...w.childNodes));
  PASTE_STYLES.forEach(([sel, css]) => box.querySelectorAll(sel).forEach(el => { el.style.cssText += ';' + css; }));
  box.querySelectorAll('td:empty').forEach(td => { td.innerHTML = '&nbsp;'; }); // Word collapses empty cells
  // CSS grid doesn't survive pasting, so the details strip and signature lines become plain tables
  box.querySelectorAll('.docmeta').forEach(m => {
    m.outerHTML = `<table style="border-collapse:collapse;width:100%;margin:8pt 0;border-top:1px solid #bbbbbb;border-bottom:1px solid #bbbbbb"><tr>${
      [...m.children].map(d => `<td style="padding:4px 6px;vertical-align:top;font-size:10pt"><span style="font-size:8pt;color:#444444">${esc(d.firstChild.textContent)}</span><br><b>${d.querySelector('b').innerHTML}</b></td>`).join('')
    }</tr></table>`;
  });
  box.querySelectorAll('.sig').forEach(s => {
    // Word ignores cell spacing, so empty spacer cells keep the lines apart; the blank top row is the room to sign
    const row = (part, cell) => `<tr>${part.map(cell).join('<td style="width:2%;border:none;padding:0">&nbsp;</td>')}</tr>`;
    const kids = [...s.children], tables = [], size = s.classList.contains('two') ? 2 : 3;
    for(let i = 0; i < kids.length; i += size){
      const part = kids.slice(i, i + size);
      tables.push(`<table style="border-collapse:collapse;border:none;width:100%;margin-top:10pt">${
        row(part, () => '<td style="height:34pt;border:none;border-bottom:1px solid #000000;padding:0">&nbsp;</td>')
      }${
        row(part, d => `<td style="border:none;padding:3pt 0 0;vertical-align:top;font-size:9pt;color:#444444">${esc(d.textContent)}</td>`)
      }</table>`);
    }
    s.outerHTML = tables.join('');
  });
  box.querySelectorAll('hr.split').forEach(h => { h.outerHTML = '<br style="page-break-before:always">'; }); // Word starts each document on a new page
  return `<div style="font-family:Georgia,'Times New Roman',serif;font-size:11pt;line-height:1.4;color:#000000">${box.innerHTML}</div>`;
}
async function copyText(text, html, msg, showAll){
  try {
    if(window.ClipboardItem && navigator.clipboard.write){
      await navigator.clipboard.write([new ClipboardItem({
        'text/html': new Blob([pasteHTML(html)], {type:'text/html'}),
        'text/plain': new Blob([text], {type:'text/plain'}),
      })]);
    } else {
      await navigator.clipboard.writeText(text); // older browsers: plain text only
    }
    flash(msg);
  }
  catch(err){
    // show everything being copied so the selection matches; the next edit or tab click restores the normal view
    if(showAll) $('paper').innerHTML = html;
    $('paper').querySelector('.maplink')?.remove(); // so Ctrl+C doesn't copy it
    const sel = window.getSelection(); const r = document.createRange();
    r.selectNodeContents($('paper')); sel.removeAllRanges(); sel.addRange(r);
    flash(showAll ? 'Copy was blocked. The chosen documents are shown and selected; press Ctrl+C or Cmd+C.'
                       : 'Copy was blocked. The document is selected; press Ctrl+C or Cmd+C.');
  }
}
$('copyOne').addEventListener('click', () => {
  const link = $('paper').querySelector('.maplink'), maps = link?.parentNode;
  link?.remove(); // the help link is for the screen only
  const text = $('paper').innerText, html = $('paper').innerHTML;
  if(link) maps.append(link);
  copyText(text, html, 'Copied this document.');
});

// Print in a new tab so nothing can reload this one (answers are never saved, so a reload erases them).
// Several documents are separated by hr.split, which starts each on a new page.
function printDocs(list){
  render(); // in case the copy fallback is showing
  const w = window.open('', '_blank');
  if(!w){ window.print(); return; } // new tab blocked: print the current document here instead
  const a = read(), d = w.document;
  d.title = `${list.length === 1 ? list[0].name : `${list.length} documents`} · ${$('org').value.trim() || 'Policy'}`;
  if(document.documentElement.dataset.theme) d.documentElement.dataset.theme = document.documentElement.dataset.theme;
  const style = d.createElement('style');
  style.textContent = [...document.querySelectorAll('style')].map(s => s.textContent).join('\n');
  d.head.appendChild(style);
  d.body.innerHTML = `<div class="wrap"><article class="${$('paper').className}">${list.map(p => build[p.id](a,p)).join('<hr class="split">')}</article></div>`;
  w.focus();
  w.print();
}
$('print').addEventListener('click', () => printDocs([POLICIES.find(p=>p.id===current)]));

// "More" menu (print or copy several): pick any of the twelve to print or copy together
$('picks').innerHTML = POLICIES.map(p =>
  `<label class="tg"><input type="checkbox" value="${p.id}" checked><span>${p.name}</span></label>`).join('');
const picked = () => POLICIES.filter(p => $('picks').querySelector(`input[value="${p.id}"]`).checked);
function updatePicks(){ $('printSel').disabled = $('copySel').disabled = !picked().length; }
$('picks').addEventListener('change', updatePicks);
const setAll = on => { $('picks').querySelectorAll('input').forEach(i => { i.checked = on; }); updatePicks(); };
$('pickAll').addEventListener('click', () => setAll(true));
$('pickNone').addEventListener('click', () => setAll(false));
$('printSel').addEventListener('click', () => { $('multi').open = false; printDocs(picked()); });
$('copySel').addEventListener('click', () => {
  const list = picked(), a = read(), box = $('hidden-all');
  $('multi').open = false;
  box.hidden = false;
  const html = list.map(p => build[p.id](a,p));
  const parts = html.map(h => { box.innerHTML = h; return box.innerText; });
  box.hidden = true;
  box.innerHTML = '';
  copyText(parts.join('\n\n————————————————\n\n'), html.join('<hr class="split">'),
    list.length === 1 ? `Copied ${list[0].name}.` : `Copied ${list.length} documents.`, true);
});
// close the dropdown on Escape or a click outside it
document.addEventListener('click', e => { if($('multi').open && !$('multi').contains(e.target)) $('multi').open = false; });
document.addEventListener('keydown', e => { if(e.key === 'Escape' && $('multi').open){ $('multi').open = false; $('multi').querySelector('summary').focus(); } });

// "More questions below": shows while the questionnaire has more to scroll to
// or while its bottom edge is below the window. Wide layout only.
const updateMore = () => {
  const f = $('q'), b = $('moreQ'), r = f.getBoundingClientRect();
  const more = f.scrollTop + f.clientHeight < f.scrollHeight - 4 || r.bottom > window.innerHeight + 4;
  const pinned = getComputedStyle(f).position === 'sticky';
  b.classList.toggle('show', pinned && more && r.top < window.innerHeight - 60);
  b.style.left = `${r.left + r.width / 2}px`;
  b.style.top = `${Math.min(window.innerHeight, r.bottom) - 44}px`;
};
$('moreQ').addEventListener('click', () => {
  const f = $('q'), top = f.getBoundingClientRect().top;
  const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
  if(top > 14) window.scrollBy({ top: top - 12, behavior }); // bring the whole panel into view first
  else f.scrollBy({ top: f.clientHeight * 0.8, behavior });
});
$('q').addEventListener('scroll', updateMore);
$('q').addEventListener('change', updateMore);
window.addEventListener('scroll', updateMore, { passive: true });
window.addEventListener('resize', updateMore);
window.addEventListener('resize', updateTabFade);
$('tabs').addEventListener('scroll', updateTabFade, true);
document.querySelector('details.start').addEventListener('toggle', updateMore);

render();
updateMore();
