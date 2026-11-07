/* TRACE OSINT Academy — self-contained, fictional professional research training.
 * No real-person searches, image uploads, network lookups, or personal data harvesting.
 * User progress and optional training notes are kept in browser localStorage.
 */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const q=(prompt,options,correct,why)=>({prompt,options,correct,why});
const caseFile=(title,field,brief,items,questions)=>({title,field,brief,items,questions});
const missions=[
caseFile('Define the mandate','FOUNDATIONS','You are asked to review public announcements from the fictional municipality of Amber Point. The request is vague. Write a research scope before gathering anything.',[['📄','Public brief','An unclear research request'],['⚖️','Boundaries','Legitimate purpose required'],['🗓️','Timeline','Dates to be verified']],[
q('What should come first?',['Collect every resident’s phone number.','Define a precise research question, timeframe and lawful sources.','Try to access staff inboxes.'],1,'A written mandate protects the subject, the analyst, and the quality of the result. Scope should define what you may collect and why.'),
q('You encounter a private address unrelated to the project.',['Redact or omit it from reports.','Share it as a useful lead.','Use it to research the family.'],0,'Data minimization matters even if a sensitive detail is available on a public site.'),
q('A lead offers a restricted database password.',['Accept just to validate it.','Pass it to a colleague.','Decline and pursue authorized public records.'],2,'OSINT is not authentication bypass. Legitimate access, purpose, and terms still apply.')]),
caseFile('Build a secure workstation','OPSEC','A new analyst must prepare a research laptop without exposing personal accounts or losing evidence.',[['🖥️','Browser','Separate profile'],['🔐','Accounts','MFA and updates'],['📂','Cases','Standard folders']],[
q('What is a defensible baseline?',['Use personal accounts for all cases.','Updated software, MFA, a separate profile and backups.','Turn off security settings during research.'],1,'Separate research contexts and use current security controls; no workstation is risk-free.'),
q('Which folder structure helps evidence quality?',['Unsorted downloads.','Only a presentation file.','Case ID, source log, captures, analysis and final report.'],2,'A standard folder and naming convention supports audits and reproducibility.'),
q('A stranger sends a compressed file.',['Open it immediately.','Assess provenance and open only with appropriate precautions.','Forward it to everyone.'],1,'Unknown downloads can be dangerous; inspect provenance and risk before handling.')]),
caseFile('Search beyond the headline','DISCOVERY','A fictional vendor says a transit station opened last spring. Find the actual claim and distinguish sources.',[['🔎','Queries','Exact phrase and site'],['🏛️','Records','Primary public source'],['📰','News','Secondary source']],[
q('Which first search is strongest?',['Specific quotation, site restriction and relevant date.','Search “stuff.”','Trust the top search snippet.'],0,'Search operators help narrow findings; the underlying result must still be opened.'),
q('Three blogs copied one press release.',['Three independent confirmations.','Potentially one original source.','Proof the press release is false.'],1,'Source independence matters more than how often a claim is repeated.'),
q('An official notice conflicts with a news article.',['Immediately pick the official site.','Delete the other record.','Compare dates, milestones and primary documents.'],2,'The two sources may refer to different events. Establish what each actually describes.')]),
caseFile('Reconstruct deleted pages','ARCHIVES','Amber Point quietly changes a publicly posted project timeline. You have an older archive capture and the current page.',[['🕒','Archive','Older snapshot'],['🌐','Live page','New wording'],['📝','Log','Capture dates']],[
q('Which tool helps show the earlier page?',['A password checker.','Wayback Machine or comparable public web archive.','A location tracker.'],1,'Web archives can preserve older page versions, though individual snapshots may be incomplete.'),
q('What should your comparison include?',['Exact differences and capture dates.','Only the most inflammatory quotation.','An assumption that changes prove misconduct.'],0,'Documented differences are facts; the reason behind them requires separate evidence.'),
q('An archived image fails to load.',['Invent the missing content.','Assume no image existed.','Report the missing capture as a limitation.'],2,'Archived pages can lose assets. Mark gaps rather than filling them with conjecture.')]),
caseFile('Source reliability under pressure','EVALUATION','You have a quoted statement, an official report, and an anonymous repost. Build a confidence assessment.',[['📚','Provenance','Origin of each claim'],['🔁','Corroboration','Independent origin'],['⚠️','Unknowns','Unresolved issues']],[
q('Which is independent corroboration?',['Four accounts sharing one screenshot.','A separate primary document that supports the same fact.','Two copies of one article.'],1,'Find independent evidence paths rather than duplicated stories.'),
q('A primary document contains a factual error.',['Primary sources never contain errors.','Ignore all sources.','Check the claim against other primary records and corrections.'],2,'Primary sources may also be wrong or incomplete.'),
q('How should uncertainty be presented?',['State confidence and what would change your view.','Declare certainty for impact.','Hide contrary information.'],0,'Calibrated confidence is essential to defensible professional reporting.')]),
caseFile('Verify a social claim','SOCIAL VERIFICATION','A fictional city account posts that a bridge is closed. Reposts spread with altered captions.',[['📱','Posts','Different accounts'],['🏢','Agency','Official notice'],['⏰','Times','Posting and event dates']],[
q('How do you check whether a post is authentic?',['Verify the primary source and associated official channels.','Use the avatar alone.','Assume high engagement means accuracy.'],0,'Identify the publishing source, not merely the platform presentation.'),
q('A screenshot lacks its original URL.',['Treat it as definitive.','Search for the original content and preserve uncertainty.','Infer the identity of its sender.'],1,'Screenshots are easy to edit and lack reliable context without provenance.'),
q('The post has an old timestamp.',['Retiming is impossible.','The story is automatically false.','Check whether it describes an earlier event.'],2,'Time and context are fundamental to verification.')]),
caseFile('Reverse-image investigation','IMAGE VERIFICATION','A fictional news photo purports to show a recently opened venue. Its origin is unclear.',[['🖼️','Photo','Unverified attribution'],['🔍','Matches','Previous appearances'],['📌','Context','Location and time']],[
q('What should you do first?',['Find earlier public appearances and compare the scene.','Guess the photographer by facial features.','Assume the caption is true.'],0,'Image-matching tools help uncover earlier publication and altered captions.'),
q('The image was cropped.',['A crop proves deception.','Check whether the full image changes the context.','Discard all visual evidence.'],1,'Cropping can omit important cues, whether accidental or deliberate.'),
q('The metadata is missing.',['It proves the image is fabricated.','It proves the location.','Draw no location conclusion from absence alone.'],2,'Publishing platforms often remove image metadata.')]),
caseFile('Faces, identity and false matches','FACE-IMAGE METHODS','A fictional investigative team receives two consented training portraits of simulated staff members. The goal is to understand facial comparison limitations—not identify strangers.',[['🙂','Portrait A','Consented simulation'],['🧩','Portrait B','Similar appearance'],['🛡️','Safeguard','No live identification']],[
q('Two photographs appear to show the same face. What can you conclude?',['They are definitely the same individual.','A visual similarity is a lead, not proof of identity.','All similar faces share a name.'],1,'Lighting, aging, image quality, viewpoint and resemblance can create false matches. Human review does not create certainty.'),
q('When is face matching appropriate in this training?',['For any stranger found online.','For identifying a person at a private address.','With appropriate consent/authority, minimization and human verification.'],2,'Biometric data can be sensitive. Use authorized, proportionate methods; never automatically publish an identity.'),
q('An automated similarity score is high.',['Assess error rates and corroborate using independent, non-biometric evidence.','Declare the person identified and publish.','Ignore demographic performance differences.'],0,'A similarity score is not an identity determination; systems can have disparate error rates and false positives.')]),
caseFile('Video authenticity','VIDEO VERIFICATION','A ten-second clip shows a fictional public hearing. You must determine if the clip actually represents the quoted statement.',[['🎞️','Clip','10 seconds'],['📺','Full recording','Official meeting feed'],['🔊','Audio','Context needed']],[
q('How do you assess the clip?',['Find the full original recording and compare timestamps.','Judge by the number of shares.','Assume edits make it false.'],0,'Uncut primary footage can restore missing context.'),
q('The subtitles differ from the audio.',['Treat subtitles as primary evidence.','Listen and compare with a reliable transcript, noting ambiguity.','Discard the audio.'],1,'Captions can contain errors or be edited.'),
q('Video compression artifacts resemble alterations.',['Declare malicious editing.','Ignore the differences.','Report the uncertainty and seek higher-quality source footage.'],2,'Re-encoding can produce misleading artifacts; interpretation needs corroboration.')]),
caseFile('Map the landscape','GEOLOCATION','A fictional infrastructure image includes a distinctive road bend, ridge and bridge.',[['🛣️','Road','Curved junction'],['🏔️','Terrain','Ridge line'],['🌉','Bridge','Visible landmark']],[
q('What makes a strong geolocation?',['One tree that looks familiar.','Multiple matching landmarks with no unexplained contradictions.','A guess from the caption.'],1,'Cross-reference several independent visual features.'),
q('One building is on the wrong side of the street.',['Note the contradiction and reconsider the hypothesis.','Move it on your map.','Ignore it as unimportant.'],0,'Contradictory geometry can disprove a candidate location.'),
q('Which data can help?',['Private phone records.','Login credentials.','Open maps, terrain, public imagery and date-aware sources.'],2,'Geolocation can rely on lawfully accessible map and imagery sources.')]),
caseFile('Establish when it happened','CHRONOLOCATION','Two fictional photos were supposedly taken at the same time. The lighting and signage differ.',[['🌤️','Shadows','Sun position'],['🗓️','Schedule','Public dated notices'],['🧱','Changes','Construction phases']],[
q('Which clue may help estimate time?',['Shadow geometry plus verified location and date range.','A random weather guess.','Image size in pixels.'],0,'Sun angle can support a time window, but assumptions and seasonal variation matter.'),
q('A sign shown in the photo was installed later.',['It is irrelevant.','Check installation records and earliest possible date.','Automatically accuse the photographer of fraud.'],1,'Dated changes can set time bounds.'),
q('Conflicting time indicators remain.',['Invent a precise timestamp.','Delete contradictory clues.','Provide a range and explain limitations.'],2,'Chronolocation findings should not be more precise than their evidence.')]),
caseFile('Public phone number analysis','CONTACT DATA','A fictional company publishes its helpdesk number as +1 202-555-0146. Investigate the business contact without attempting to identify private people.',[['☎️','Example number','+1 202-555-0146'],['🏢','Public listing','Company helpdesk'],['📑','Metadata','Format and range']],[
q('What can a phone parsing library establish?',['The current owner’s home address.','Number format, possible region and numbering-plan validity.','Every call made by the user.'],1,'Parsing metadata does not prove who currently owns or uses a number; ranges and carrier assignments can change.'),
q('How should you verify a published business telephone number?',['Cross-check the organization’s own official channels and dated listings.','Run private-person tracing on every caller.','Assume a search-result snippet is sufficient.'],0,'Verify the organizational attribution using direct and independent public sources.'),
q('A reverse lookup suggests a named private individual.',['Publish the address with the number.','Treat the result as definitive.','Do not expose unrelated identity data; verify relevance and lawful purpose first.'],2,'Number recycling, stale listings and false associations make reverse lookups unreliable and potentially invasive.')]),
caseFile('Trace an email claim','EMAIL FORENSICS','A fictional vendor message appears to come from procurement@northstar.example. Your task is to check whether its organization attribution can be trusted.',[['✉️','Displayed From','May be spoofed'],['🧾','Headers','Routing details'],['🌐','Domain','Example-only hostname']],[
q('What should you analyze first when permitted access to a received message?',['Full headers and authentication results (SPF, DKIM, DMARC).','The profile picture alone.','The sender’s social contacts.'],0,'Authentication checks and actual sending paths help assess domain claims; even a pass is not proof the content is honest.'),
q('The display name is “Finance Director.”',['That proves the sender is the director.','Display names are editable and not authentication.','The email is automatically fraudulent.'],1,'A display name alone establishes neither identity nor intent.'),
q('A domain has a public MX record.',['You now know every employee’s inbox.','That reveals every recipient’s private messages.','It indicates mail routing infrastructure, not mailbox ownership.'],2,'DNS records describe technical configuration, not the identities of private mailbox users.')]),
caseFile('Domains and public infrastructure','DOMAIN INTELLIGENCE','A fictional nonprofit’s site has multiple similar domain names. Your goal is to document infrastructure and avoid confusing lookalikes.',[['🌐','Domain','Official site'],['🧾','RDAP','Registration data'],['🔏','TLS','Certificate details']],[
q('What is the modern default for public gTLD registration data?',['RDAP lookup through ICANN/registries.','A leaked password list.','Every private registrant address.'],0,'RDAP replaced mandatory WHOIS for most generic top-level domains. Privacy redactions limit available details.'),
q('Two websites share a hosting IP.',['Their owners must be the same.','Shared hosting alone does not prove common ownership.','Both are fraudulent.'],1,'One infrastructure address may host many unrelated customers.'),
q('An HTTPS certificate is valid.',['All content on the website is true.','The business is registered in the jurisdiction.','The connection may be authenticated, not the claims on the page.'],2,'Transport encryption is not a guarantee of editorial reliability.')]),
caseFile('Public records and transparency','PUBLIC RECORDS','You need to establish whether a fictional city council approved a project through its recorded process.',[['📄','Meeting minutes','Official record'],['🧑‍⚖️','Vote log','Adoption status'],['💰','Budget','Financial authorization']],[
q('Which evidence is strongest for a vote?',['A rumor in a comment section.','Dated official minutes and recorded vote.','An unsourced infographic.'],1,'Official records identify motions and procedural outcomes, subject to corrections.'),
q('A press statement calls an item “approved.”',['Check whether it refers to a recommendation, authorization, or final enactment.','Assume all approvals are the same.','Ignore procedure entirely.'],0,'Government processes have stages with different legal effects.'),
q('An official record is exempt or unavailable.',['Bypass the access controls.','Publish guesses.','Document the gap and explore lawful disclosure and appeal procedures.'],2,'Access varies by jurisdiction; withheld records should not be fabricated or illegally accessed.')]),
caseFile('Corporate registrations and filings','COMPANY RECORDS','A fictional corporation claims to be the parent of several brands. You need to document the relationship.',[['🏛️','EDGAR','Public-company records'],['📋','Registry','Entity registration'],['🔗','Parent link','Requires evidence']],[
q('For a US public company, what is a useful original source?',['SEC EDGAR filings.','A casual forum assertion.','An advertising slogan.'],0,'Financial and corporate filings provide dated records with defined scope.'),
q('Two entities list the same mailing address.',['They definitely share an owner.','Treat as a lead and seek actual ownership documentation.','That is proof of an illegal scheme.'],1,'Shared services and registered agents can create common addresses.'),
q('A company changed its name.',['Assume the prior entity ceased to exist.','Erase all historical references.','Trace identifiers, dates, mergers and predecessor filings.'],2,'Names can change while legal identities or obligations persist.')]),
caseFile('Procurement trails','CONTRACTS','A fictional infrastructure bid is awarded after multiple amendments. Investigate the official procurement record.',[['📑','RFP','Original criteria'],['📃','Addenda','Changed terms'],['🧮','Award','Published result']],[
q('The award value differs from the original estimate.',['Compare scope, amendments, options and timelines.','Assume wrongdoing immediately.','Ignore all appendices.'],0,'Contract value differences can have multiple explanations.'),
q('One bidder has a similar name to another firm.',['They must be coordinated.','Resolve legal entity identity before drawing links.','Assume the names are aliases.'],1,'Reliable entity resolution requires identifiers and documents.'),
q('You suspect a conflict of interest.',['Publish an allegation before checking.','Try to access employee messages.','Review relevant disclosure rules, records and seek corroboration.'],2,'Distinguish evidence of a conflict from a suggestive coincidence.')]),
caseFile('Interpreting financial signals','FINANCIAL ANALYSIS','A fictional company reports a large increase in contract revenue, and social media claims it must mean fraud.',[['📊','Figures','Reported amounts'],['📆','Periods','Not always comparable'],['🧾','Notes','Accounting methods']],[
q('What should be checked first?',['Whether periods, definitions and accounting methods are comparable.','Who has the most followers.','Whether a graph is colorful.'],0,'Financial context and normalization prevent false comparisons.'),
q('A cash-flow figure differs from revenue.',['This proves falsification.','Cash receipts and recognized revenue follow different concepts.','Cash flow always equals profit.'],1,'Accounting measures are not interchangeable.'),
q('An unexplained change remains.',['Call it criminal.','Ignore it.','Flag it as unexplained, identify missing evidence and avoid imputing intent.'],2,'An anomaly is a research lead, not automatically evidence of illegality.')]),
caseFile('Relationship mapping','LINK ANALYSIS','Three fictional organizations share some names and funding sources. Draw a supported relationship graph.',[['◉','Entities','Identify reliably'],['↔','Connections','Source every edge'],['❔','Unknown','Do not assume']],[
q('What should each graph edge contain?',['A documented relationship type, source and date.','A confident visual style only.','An assumption based on color.'],0,'A network graph is useful only when relationships have provenance.'),
q('A board member serves two unrelated groups.',['That proves collusion.','Show the documented overlap without assigning intent.','Hide the overlap.'],1,'A shared affiliation is a fact; motive and coordination require separate evidence.'),
q('How should unverified connections be shown?',['Exactly like verified ones.','As established misconduct.','Marked as hypotheses or omitted until sourced.'],2,'Visualizations can create false certainty if unknown links look confirmed.')]),
caseFile('File metadata and integrity','METADATA','An investigator receives a copied PDF of a fictional public report. Can its metadata establish when the report was originally written?',[['💾','Document','Copied file'],['🧷','Metadata','May change'],['#️⃣','Hash','Integrity check']],[
q('What does a file hash support?',['Confirmation two byte-for-byte files match.','Proof the author is truthful.','The legal identity of its creator.'],0,'A matching cryptographic hash demonstrates content identity, not the truth of a document.'),
q('A PDF “created” date appears recent.',['It proves the document was only written then.','Exporting or editing may change metadata; cross-check provenance.','It proves malicious tampering.'],1,'Metadata is informative but often editable or automatically rewritten.'),
q('How should you preserve a source file?',['Change it before saving.','Keep only a screenshot of the title.','Keep an original copy, record provenance and avoid modifying the evidence.'],2,'Preservation and a chain of custody support reproducibility.')]),
caseFile('Defensive exposure review','CYBER CONTEXT','A fictional charity authorizes a review of its own public website and published infrastructure.',[['🛡️','Authorization','Defined assets'],['🌐','Footprint','Public DNS'],['📣','Report','Responsible disclosure']],[
q('Which scope is acceptable?',['Inventory the organization’s explicitly authorized public assets.','Probe every neighboring system on the hosting network.','Seek exposed employee passwords.'],0,'Scope and authorization govern technical research and any active validation.'),
q('You encounter an exposed personal record.',['Republish it to prove impact.','Stop unnecessary access, minimize retention and notify through proper channels.','Look for more records to collect.'],1,'Exposure does not grant permission for bulk access or redistribution.'),
q('A third-party system appears vulnerable.',['Attempt to exploit it.','Use it to obtain a list of users.','Do not test without authorization; follow appropriate disclosure routes.'],2,'Passive observation and active testing have different legal and operational implications.')]),
caseFile('Preserve the source trail','EVIDENCE HANDLING','A report will be reviewed months later. You need to preserve enough material to re-check every claim.',[['🧾','Source log','URLs and dates'],['🗃️','Copies','Preserved files'],['🔐','Storage','Limited access']],[
q('What belongs in a source register?',['URLs, publishers, timestamps, captures, relevance and access limitations.','Only a hyperlink labeled “source”.','An untracked folder of screenshots.'],0,'Good source metadata enables independent review.'),
q('A page disappears after your capture.',['Erase its citation.','Keep the preserved record and explain that the live page is unavailable.','Assume your copy is original proof of intent.'],1,'Archived and preserved evidence requires context and provenance.'),
q('A report includes unrelated personal information.',['Share the unredacted version broadly.','Keep all data forever.','Minimize/redact and apply a defined retention policy.'],2,'Ethical evidence management protects unrelated people.')]),
caseFile('Challenge your hypothesis','ANALYSIS','A fictional analyst believes two companies are secretly connected. The visible evidence supports several explanations.',[['🧠','Hypotheses','Multiple possibilities'],['⚖️','Disproof','Seek contrary evidence'],['📏','Confidence','Calibrated claim']],[
q('Which analysis method is most defensible?',['List plausible explanations and test distinctive evidence.','Seek only confirming sources.','Assume a pattern must be purposeful.'],0,'Competing hypotheses reduce confirmation bias.'),
q('New records contradict your preferred conclusion.',['Hide them as distractions.','Update your assessment and explain the change.','Score the records as less reliable automatically.'],1,'Professional work is evidence-led, not theory-led.'),
q('What does low confidence mean?',['You should invent a definite answer.','The topic is unimportant.','The evidence is insufficiently discriminating; more research is needed.'],2,'Confidence describes strength of support, not personal conviction.')]),
caseFile('Conduct a defensible briefing','REPORTING','You are presenting a public-record review to a fictional editor and a legal reviewer.',[['📋','Executive brief','Concise finding'],['🔗','Footnotes','Trace to source'],['⚠️','Caveats','Visible uncertainty']],[
q('Which opening statement is professional?',['“Two dated public records show X; Y remains unconfirmed.”','“Everyone knows the secret truth.”','“The chart proves an entire conspiracy.”'],0,'Distinguish established fact from analysis and uncertainty.'),
q('How should evidence links be presented?',['Only at the very end without claim context.','Close to the claims they support, with meaningful source descriptions.','Avoid links because they look messy.'],1,'A reader should be able to audit your reasoning.'),
q('Your reviewer identifies an error.',['Defend the error for consistency.','Remove the reviewer from the team.','Correct it transparently and update downstream conclusions.'],2,'Corrections preserve credibility and reduce harm.')]),
caseFile('Capstone: Amber Point dossier','FINAL ASSESSMENT','Integrate the fictional city notice, a copied press claim, a changing webpage, a business registration and a disputed image into one final judgment.',[['🗂️','Mixed sources','Different quality'],['⏳','Timeline','Several milestones'],['✅','Deliverable','Qualified findings']],[
q('What is the strongest investigative approach?',['Build a dated claim-evidence matrix and test each assertion.','Combine all clues into one unverified accusation.','Ignore conflicting primary records.'],0,'A structured evidence matrix preserves distinctions among sources and claims.'),
q('The image does not conclusively match the claimed site.',['Call the location certain.','Label the geolocation unconfirmed and describe the conflict.','Discard all other documents.'],1,'One uncertain visual artifact does not invalidate the rest of a carefully separated dossier.'),
q('Which report is ready for responsible publication?',['One with no citations but a dramatic headline.','One that reveals private third-party addresses.','One that documents methods, sources, confidence, limits and possible corrections.'],2,'A publishable OSINT report is transparent, proportionate, and reproducible.')])
];
const toolbox=[
['LEARNING','Bellingcat Toolkit','A curated index of mapping, research, verification and archiving tools.','https://bellingcat.gitbook.io/toolkit'],
['PRACTICE','Bellingcat Challenge','Independent public-source verification exercises for further practice.','https://challenge.bellingcat.com/'],
['HISTORICAL WEB','Wayback Machine','Compare archived public webpages across time.','https://web.archive.org/'],
['IMAGE MATCHING','Google Lens','Find visually similar content and previous image appearances.','https://lens.google/'],
['MAPS','OpenStreetMap','Check public mapped features for geolocation exercises.','https://www.openstreetmap.org/'],
['GIS','QGIS','Build and inspect geographic data layers on a desktop.','https://qgis.org/'],
['PUBLIC FILINGS','SEC EDGAR','Check public-company filings, dates, entities and disclosures.','https://www.sec.gov/search-filings'],
['DOMAIN RESEARCH','ICANN Lookup / RDAP','View publicly available domain registration data, subject to privacy protections.','https://lookup.icann.org/en'],
['PHONE FORMATS','libphonenumber','Learn number-format validation and numbering plan metadata, not private-owner tracing.','https://github.com/google/libphonenumber'],
['EMAIL AUTHENTICATION','Google Admin Toolbox','Learn to interpret message headers from email you are authorized to review.','https://toolbox.googleapps.com/apps/messageheader/'],
['METADATA','ExifTool','Inspect metadata in files you lawfully possess.','https://exiftool.org/'],
['WEB CAPTURE','ArchiveWeb.page','Preserve evidence from public web pages for reproducible analysis.','https://archiveweb.page/'],
['PUBLIC DATA','Data.gov','Find public US government datasets and metadata.','https://data.gov/'],
['CYBER DEFENSE','Mozilla Observatory','Learn security posture review on assets you control or are authorized to assess.','https://developer.mozilla.org/en-US/observatory'],
['FACE-IMAGE SCIENCE','NIST Face Recognition','Understand comparison evaluation and false-match risks; not an identity lookup service.','https://www.nist.gov/programs-projects/face-recognition-vendor-test-frvt'],
['GRAPH RESEARCH','Maltego','Learn documented entity and relationship graphs; licensing varies.','https://www.maltego.com/']
];
const setup=[
 ['Ethics and mandate','Write the case question, legitimate purpose, authorized sources, geographic reach and data boundaries.','Without a lawful scope, research can become intrusive and findings become unusable.','Write one question, define what is in/out of scope, and record permission for any nonpublic material.','A written mandate someone else could follow without guessing.'],
 ['Research identity separation','Use a dedicated browser profile and keep your personal accounts out of cases.','An accidental personal sign-in can expose you, contaminate results or mix unrelated information.','Create a separate profile, turn on MFA for research accounts, and document site access limitations.','An isolated, labeled profile and an access log.'],
 ['Baseline security','Keep operating systems, browsers and extensions updated; secure accounts and devices.','Malicious links, downloads and account takeovers can compromise both you and case material.','Use automatic updates, a password manager, MFA, device encryption, and backups.','A protected device with a tested recovery plan.'],
 ['Repeatable case folders','Organize originals, screenshots, source logs, working notes and output by case ID.','Unsorted evidence is easy to misattribute or lose.','Create folders: 01_scope, 02_sources, 03_captures, 04_analysis, 05_report.','One sample case folder containing a dated source register.'],
 ['Collection protocol','Preserve links, publication and access dates, author/publisher, claims and context.','A screenshot or bare URL without context can mislead the next reviewer.','For each source log an identifier, origin, when accessed, what it supports, and known limitations.','Three sample entries that another person can revisit.'],
 ['File integrity','Preserve originals separately from edited working copies and document relevant hashes.','Later modifications can weaken the reliability of an investigative record.','Save an original and a copy; record origin and SHA-256 for significant files.','A source with an unchanged original and a reproducible hash.'],
 ['Verification workflow','Challenge leads using source independence, contradictory evidence and provenance.','Repeated claims are not necessarily independent corroboration.','Make a claim-evidence matrix with primary sources, secondary reports, and disconfirming facts.','A claim supported or limited by clearly documented sources.'],
 ['Location and time tools','Choose public map layers, historical imagery and reverse-image research appropriately.','Locations and dates are frequently mislabeled or inferred too confidently.','Compare several landmarks and time cues, note contradictions, and report ranges when precision is limited.','A geolocation reasoning trail that distinguishes evidence from guesses.'],
 ['Phone and email boundaries','Analyze only authorized correspondence and publicly listed organizational contact details.','Number ownership is uncertain, message display names can be forged, and personal data is sensitive.','Use offline format checks first; use public company listings and received message headers for corroboration.','A report that explains what metadata can and cannot establish.'],
 ['Face-image safeguards','Learn the error rates, consent requirements and limitations of facial comparison.','Visual resemblance and algorithm scores can produce mistaken identities and privacy harm.','Use consented training portraits only; validate any permitted findings with independent nonbiometric records.','Documented uncertainty without unauthorized identity claims.'],
 ['Reporting template','Separate fact, inference, confidence, alternatives and privacy review in each finding.','A useful report must survive critical reading by someone who did not do the research.','Write an executive summary, sourced findings, limitations, and a reproducible method section.','A draft brief with evidence immediately adjacent to claims.'],
 ['Portfolio and independent review','Practice on simulated cases and receive feedback from other analysts.','Passing a game alone does not demonstrate professional competence.','Export a case brief, ask someone to reproduce one finding, and log any corrections.','A revised portfolio piece with transparent methodology.']
];
const setupGroups=[
 {title:'01 · Scope & protection',why:'Know exactly why you are investigating and protect the research environment.',steps:[0,1,2]},
 {title:'02 · Collect & preserve',why:'Create a source trail another analyst can inspect.',steps:[3,4,5]},
 {title:'03 · Verify responsibly',why:'Understand the power and limits of imagery, public contact data and independent sources.',steps:[6,7,8,9]},
 {title:'04 · Explain & defend',why:'Transform research into a clear, accountable professional report.',steps:[10,11]}
];
const atlasGroups=[
 {id:'starter',label:'Start here',tags:['LEARNING','PRACTICE','HISTORICAL WEB','IMAGE MATCHING']},
 {id:'images',label:'Images & maps',tags:['IMAGE MATCHING','MAPS','GIS','FACE-IMAGE SCIENCE','METADATA']},
 {id:'contacts',label:'Contacts & domains',tags:['PHONE FORMATS','EMAIL AUTHENTICATION','DOMAIN RESEARCH']},
 {id:'records',label:'Records & networks',tags:['PUBLIC FILINGS','PUBLIC DATA','GRAPH RESEARCH']},
 {id:'evidence',label:'Evidence & security',tags:['WEB CAPTURE','METADATA','CYBER DEFENSE']},
 {id:'all',label:'All tools',tags:[]}
];
const toolAliases=['bellingcat','challenge','wayback','lens','osm','qgis','edgar','rdap','phone-meta','headers','exiftool','webcapture','data','observatory','nist-face','maltego'];
let atlasFilter='starter';
let atlasSearch='';
const esc=v=>String(v).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const KEY='trace-osint-professional-v1';
let state={answers:{},finished:[],setup:[],notes:{}};
try{let data=JSON.parse(localStorage.getItem(KEY)||'null');if(data&&typeof data==='object'){state={...state,...data};state.answers=state.answers||{};state.finished=Array.isArray(state.finished)?state.finished:[];state.setup=Array.isArray(state.setup)?state.setup:[];state.notes=state.notes||{};}}catch{}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(state))}catch{}};
let active=0,step=0,currentTab='missions';
const unlocked=()=>Math.min(missions.length-1,state.finished.length);
const firstQuestion=idx=>{
 for(let j=0;j<3;j++)if(!(idx+'-'+j in state.answers))return j;
 return state.finished.includes(idx)?0:2; // Return to the final decision if ready to finish.
};
const isFinished=idx=>state.finished.includes(idx);
const caseIndex=()=>String(active+1).padStart(2,'0');
const focusCase=(selector='.question-block')=>{
 const target=$('mission-stage')?.querySelector(selector)||$('mission-stage');
 if(target)target.scrollIntoView({block:'start',behavior:'smooth'});
};
function updateStats(){
 const answers=Object.values(state.answers);
 const right=answers.filter(x=>x.correct).length;
 const xp=right*20+state.finished.length*40;
 const level=state.finished.length>=25?'Academy Graduate':state.finished.length>=19?'Senior Analyst':state.finished.length>=12?'Investigator':state.finished.length>=6?'Research Associate':'Trainee';
 $('stat-rank').textContent=level;$('stat-xp').textContent=xp;$('stat-cleared').textContent=state.finished.length+' / 25';
 $('stat-accuracy').textContent=answers.length?Math.round(right/answers.length*100)+'%':'—';
 const continueBtn=$('continue-training');
 if(continueBtn)continueBtn.textContent=state.finished.length===25?'✓ Review your completed cases':'▶ '+(state.finished.length?'Resume':'Start')+' Case '+caseIndex();
 const hint=$('training-next-hint');
 if(hint)hint.textContent=state.finished.length===25?'Great work! Your complete training record is in My reports.':(state.finished.length+' of 25 cases completed · '+Object.keys(state.answers).length+' of 75 decisions made · auto-saved');
 document.dispatchEvent(new CustomEvent('trace:progress'));
}
function renderList(){
 $('mission-counter').textContent=caseIndex()+' / 25';
 const groups=[['CORE SKILLS',0],['IMAGES & GEOLOCATION',6],['CONTACTS & DOMAINS',11],['RECORDS & CONNECTIONS',14],['ANALYSIS & REPORTING',19]];
 $('mission-list').innerHTML=missions.map((m,i)=>{
  const done=isFinished(i),lock=i>unlocked(),selected=active===i;
  const group=groups.find(g=>g[1]===i);
  const heading=group?'<div class="mission-group-heading">'+esc(group[0])+'</div>':'';
  const status=done?'✓ Done':selected?'▶ Current':lock?'🔒 Locked':'● Ready';
  return heading+'<button type="button" class="mission-option'+(selected?' active':'')+'" data-mission="'+i+'" '+(lock?'disabled':'')+' aria-current="'+(selected?'step':'false')+'"><span class="mission-num">'+String(i+1).padStart(2,'0')+'</span><span><b>'+esc(m.title)+'</b><small>'+esc(m.field)+'</small></span><span class="done">'+status+'</span></button>';
 }).join('');
 $('mission-list').querySelectorAll('[data-mission]').forEach(b=>b.onclick=()=>{
   active=Number(b.dataset.mission);step=firstQuestion(active);renderList();renderCase();updateStats();
   $('case-directory').open=false;focusCase('.case-header');
 });
}
function renderCase(){
 const m=missions[active];
 const item=m.questions[step],key=active+'-'+step,record=state.answers[key];
 const last=step===2;
 let html='<div class="mission-content">';
 html+='<div class="case-navigation"><div><span class="case-navigation-tag">CURRENT CASE · '+caseIndex()+' OF 25</span><strong>'+esc(m.title)+'</strong></div><span class="case-navigation-progress">'+(step+1)+' / 3 DECISIONS</span></div>';
 html+='<div class="case-steps" aria-label="Progress through this case">';
 for(let i=0;i<3;i++)html+='<span class="'+(i<step?'completed':i===step?'now':'')+'"><b>'+(i<step?'✓':i+1)+'</b><span>Decision '+(i+1)+'</span></span>';
 html+='</div>';
 html+='<header class="case-header"><div><span class="case-kicker">'+esc(m.field)+' · TRAINING SIMULATION</span><h2 tabindex="-1">'+esc(m.title)+'</h2></div><span class="case-badge">'+(isFinished(active)?'✓ REVIEWING CLEARED CASE':'▶ IN PROGRESS')+'</span></header>';
 html+='<div class="case-direction"><strong>YOUR NEXT MOVE</strong><p>'+(record?'Read why this answer works or does not, then press the green button to continue.':'Read the short case and clues below, then choose one answer. You cannot get stuck: every choice teaches you something.')+'</p></div>';
 html+='<p class="case-brief"><strong>THE SITUATION</strong><br>'+esc(m.brief)+'</p>';
 html+='<section class="case-evidence" aria-label="Available evidence"><h3>◈ Clues to consider</h3><div class="evidence-board">'+m.items.map(x=>'<div class="evidence-tile"><i aria-hidden="true">'+x[0]+'</i><strong>'+esc(x[1])+'</strong><span>'+esc(x[2])+'</span></div>').join('')+'</div></section>';
 html+='<section class="question-block" id="current-decision"><span class="question-counter">YOUR DECISION · QUESTION '+(step+1)+' / 3</span><h3>'+esc(item.prompt)+'</h3>';
 html+='<div class="question-choices">'+item.options.map((answer,i)=>'<button type="button" data-choice="'+i+'" '+(record?'disabled':'')+' class="'+(record&&i===item.correct?'good':record&&i===record.selected&&!record.correct?'bad':'')+'">'+String.fromCharCode(65+i)+'. '+esc(answer)+'</button>').join('')+'</div>';
 if(record)html+='<div class="question-feedback'+(record.correct?'':' incorrect')+'" role="status"><strong>'+(record.correct?'✓ Correct decision':'▣ Learning moment — review the evidence')+'</strong>'+esc(item.why)+'</div>';
 html+='<div class="mission-actions">';
 if(step>0)html+='<button type="button" class="outline" id="previous-decision">← Previous</button>';
 if(record)html+='<button type="button" class="cta next-decision" id="next-decision">'+(last?(active===missions.length-1?'✓ Finish academy →':'✓ Complete case & start next →'):'Continue to question '+(step+2)+' →')+'</button>';
 else html+='<span class="decision-nudge">↑ Choose an answer above to unlock the next step.</span>';
 html+='</div></section>';
 html+='<div class="case-progress"><div style="width:'+((step+(record?1:0))/3*100)+'%"></div></div><div class="case-footer"><span>'+(record?'✓ Decision recorded':'Awaiting your answer')+'</span><span>Automatically saved on this device</span></div>';
 if(isFinished(active))html+='<div class="case-takeaway"><strong>✓ You already cleared this case.</strong> Review the lesson above or open Browse cases to revisit a different one.</div>';
 html+='</div>';$('mission-stage').innerHTML=html;
 document.dispatchEvent(new CustomEvent('trace:case-rendered'));
 $('mission-stage').querySelectorAll('[data-choice]').forEach(b=>b.onclick=()=>{
   if(key in state.answers)return;
   const selected=Number(b.dataset.choice);
   state.answers[key]={selected,correct:selected===item.correct};
   save();updateStats();renderCase();focusCase('.question-feedback');
 });
 const prev=$('previous-decision');
 if(prev)prev.onclick=()=>{step=Math.max(0,step-1);renderCase();focusCase('#current-decision')};
 const next=$('next-decision');
 if(next)next.onclick=()=>{
   if(step<2){step++;renderCase();focusCase('#current-decision');return;}
   if(!state.finished.includes(active)){state.finished.push(active);state.finished.sort((a,b)=>a-b);save();}
   updateStats();
   if(active<missions.length-1){active++;step=firstQuestion(active);renderList();renderCase();updateStats();focusCase('.case-navigation');}
   else{renderList();$('mission-stage').innerHTML='<div class="mission-content"><div class="case-finished"><span aria-hidden="true">🏅</span><h2>Academy cases complete!</h2><p>You have reached the end of all 25 training cases. Your choices are saved. Write or export your investigation portfolio to practice professional reporting.</p><button type="button" class="cta" data-switch="report">Open My reports →</button><button type="button" class="outline" id="review-training">Review the cases</button></div></div>';
     $('mission-stage').querySelector('[data-switch]').onclick=()=>switchTab('report');
     $('review-training').onclick=()=>{active=0;step=0;renderList();renderCase();updateStats();focusCase('.case-navigation')};
     focusCase('.case-finished');
   }
 };
}
function switchTab(tab){
 if(!['missions','identity','terminal','scope','setup','tools','report'].includes(tab))return;
 currentTab=tab;
 for(const b of document.querySelectorAll('[data-switch]'))if(b.getAttribute('role')==='tab')b.setAttribute('aria-selected',String(b.dataset.switch===tab));
 for(const id of ['missions','identity','terminal','scope','setup','tools','report']){const panel=$('view-'+id);if(panel)panel.hidden=id!==tab;}
 if(tab==='missions'){renderList();renderCase();}
 if(tab==='scope')refreshScope();
 if(tab==='missions')focusCase('.case-navigation'); else document.querySelector('.trace-tabs').scrollIntoView({block:'start',behavior:'auto'});
}
document.querySelectorAll('[data-switch]').forEach(b=>b.addEventListener('click',()=>switchTab(b.dataset.switch)));
// On the landing page, this is the single obvious path into the current lesson.
$('continue-training').addEventListener('click',()=>focusCase('.case-navigation'));
function updateSetupProgress(){
 const done=state.setup.filter(i=>Number.isInteger(i)&&i>=0&&i<setup.length).length;
 $('setup-progress-label').textContent=done+' of '+setup.length+' steps ready';
 $('setup-progress-fill').style.width=(done/setup.length*100)+'%';
 const next=setup.find((step,i)=>!state.setup.includes(i));
 $('setup-next-action').textContent=next?'Next: '+next[0]+' — '+next[1]:'All steps marked ready. Review and maintain your workstation as your case needs change.';
}
$('setup-grid').innerHTML=setupGroups.map(group=>'<section class="workstation-stage"><header><strong>'+esc(group.title)+'</strong><span>'+esc(group.why)+'</span></header><div class="workstation-step-list">'+group.steps.map(i=>{const t=setup[i],ready=state.setup.includes(i);return '<details class="setup-card" '+(i===0?'open':'')+'><summary><span class="setup-step-num">'+String(i+1).padStart(2,'0')+'</span><span>'+esc(t[0])+'</span><span class="setup-step-ready">'+(ready?'✓ Ready':'Learn & prepare')+'</span></summary><div class="setup-card-content"><p>'+esc(t[1])+'</p><dl><dt>WHY IT MATTERS</dt><dd>'+esc(t[2])+'</dd><dt>HOW TO SET IT UP</dt><dd>'+esc(t[3])+'</dd><dt>WHAT READY LOOKS LIKE</dt><dd>'+esc(t[4])+'</dd></dl><label><input type="checkbox" data-setup="'+i+'" '+(ready?'checked':'')+'><span>I can demonstrate this step</span></label></div></details>';}).join('')+'</div></section>').join('');
$('setup-grid').querySelectorAll('[data-setup]').forEach(b=>b.onchange=()=>{const i=Number(b.dataset.setup);state.setup=state.setup.filter(x=>x!==i);if(b.checked)state.setup.push(i);save();const mark=b.closest('.setup-card').querySelector('.setup-step-ready');if(mark)mark.textContent=b.checked?'✓ Ready':'Learn & prepare';updateSetupProgress()});
updateSetupProgress();
function renderAtlas(){
 const query=atlasSearch.trim().toLowerCase();
 const group=atlasGroups.find(g=>g.id===atlasFilter)||atlasGroups[0];
 const found=toolbox.map((t,i)=>({t,i})).filter(({t})=>(group.id==='all'||group.tags.includes(t[0]))&&(!query||t.join(' ').toLowerCase().includes(query)));
 $('atlas-categories').innerHTML=atlasGroups.map(g=>'<button type="button" data-atlas="'+g.id+'" aria-pressed="'+String(atlasFilter===g.id)+'">'+esc(g.label)+'</button>').join('');
 $('atlas-categories').querySelectorAll('[data-atlas]').forEach(b=>b.onclick=()=>{atlasFilter=b.dataset.atlas;renderAtlas()});
 $('atlas-result-count').textContent=found.length+' of '+toolbox.length+' tools';
 $('tools-grid').innerHTML=found.length?found.map(({t,i})=>'<article class="tool-card" data-tool-alias="'+esc(toolAliases[i])+'"><div><small>'+esc(t[0])+'</small><h3>'+esc(t[1])+'</h3><p>'+esc(t[2])+'</p></div><a href="'+esc(t[3])+'" target="_blank" rel="noopener noreferrer" aria-label="Open official '+esc(t[1])+' resource">Official site ↗</a></article>').join(''):'<p class="atlas-empty">No tools match. Try another category or search term.</p>';
}
$('atlas-search').addEventListener('input',e=>{atlasSearch=e.target.value; if(atlasSearch.trim())atlasFilter='all';renderAtlas()});
renderAtlas();
const consoleOut=$('command-output');
const consoleLinks=$('command-links');
const validDomain=value=>/^(?=.{4,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i.test(value);
const toolMatches=term=>toolbox.map((t,i)=>({t,i})).filter(({t,i})=>(toolAliases[i]+' '+t.join(' ')).toLowerCase().includes(term.toLowerCase()));
async function runCommand(raw){
 const command=String(raw||'').trim().slice(0,300);
 consoleLinks.replaceChildren();
 if(!command){consoleOut.textContent='Enter help to see available commands.';return;}
 const m=command.match(/^(\S+)(?:\s+([\s\S]*))?$/);
 const action=m[1].toLowerCase(),arg=(m[2]||'').trim();
 const result={text:'',links:[]};
 if(action==='help'){
   result.text='TRACE BROWSER COMMANDS\nhelp — show these instructions\ntools [topic] — browse official OSINT tools by specialty\nopen <alias> — get a direct official resource link\nphone <number> — local number-format check (not an ownership lookup)\nemail <address> — local syntax check (not mailbox verification)\ndomain <name> — local domain syntax check + RDAP resource\nhash <text> — calculate local SHA-256 of supplied text\nscope — what a research mandate needs\ncase — show current fictional mission\nsetup — workstation readiness\nreport — open your case portfolio\nclear — clear this output\n\nExamples: tools maps | open wayback | domain example.org';
 }else if(action==='tools'){
   const found=toolMatches(arg);
   result.text=found.length?found.map(({t,i})=>toolAliases[i]+'  ·  '+t[1]+'  ('+t[0].toLowerCase()+')').join('\n'):'No matching tools. Use tools without a filter to list every available resource.';
   result.links=found.slice(0,8).map(({t,i})=>({label:toolAliases[i]+' ↗',url:t[3]}));
 }else if(action==='open'){
   const idx=toolAliases.findIndex(alias=>alias===arg.toLowerCase());
   if(idx<0){result.text='Unknown alias. Run tools to see the allowed tool names.';}
   else{const t=toolbox[idx];result.text=t[1]+' — '+t[2]+'\nSelect the official link below; no software is installed or run inside TRACE.';result.links=[{label:'Open '+t[1]+' ↗',url:t[3]}];}
 }else if(action==='phone'){
   const digits=arg.replace(/[^0-9]/g,'');
   result.text=arg&&/^[+0-9() .-]+$/.test(arg)&&digits.length>=7&&digits.length<=15
   ?'Phone-number FORMAT only: '+digits.length+' digits supplied. International formats often use a + and country code. This does not establish validity, carrier, present owner, location or identity. Compare public business numbers with the organization’s own listings.'
   :'Provide a number containing 7–15 digits with optional +, spaces or punctuation. Example: phone +1 202-555-0146';
   result.links=[{label:'Number format reference ↗',url:toolbox[8][3]}];
 }else if(action==='email'){
   const ok=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(arg);
   result.text=ok?'Syntax is plausible for '+arg.split('@')[1]+'. Syntax alone cannot establish a live mailbox, sender identity or message authenticity. When authorized, inspect the full headers and authentication results.':'Enter an email address to assess its format. Example: email team@example.org';
   result.links=[{label:'Message-header tool ↗',url:toolbox[9][3]}];
 }else if(action==='domain'){
   result.text=validDomain(arg)?'Domain syntax looks plausible. To learn who publishes a site, compare its official pages, independent records and domain registration data where available. An RDAP listing may redact personal information.':'Enter a public domain name like example.org. This is an offline syntax check, not an ownership or DNS lookup.';
   result.links=[{label:'ICANN RDAP lookup ↗',url:toolbox[7][3]}];
 }else if(action==='hash'){
   if(!arg){result.text='Usage: hash <ordinary non-sensitive text>. Hashing runs locally in this browser.';}
   else if(!globalThis.crypto?.subtle){result.text='SHA-256 is unavailable in this browser context.';}
   else{const bytes=new TextEncoder().encode(arg), digest=await crypto.subtle.digest('SHA-256',bytes);result.text='SHA-256 (local text input):\n'+[...new Uint8Array(digest)].map(x=>x.toString(16).padStart(2,'0')).join('')+'\nA hash confirms byte-for-byte integrity, not whether a claim is true.';}
 }else if(action==='scope'){result.text='A proper mandate names the research question, legitimate purpose, client/authority, public sources, jurisdiction, time range, privacy exclusions, retention plan and reporting audience.';}
 else if(action==='case'){result.text='Current case: '+missions[active].title+'. '+missions[active].brief;}
 else if(action==='setup'){result.text=state.setup.length+' of '+setup.length+' steps marked ready. Open the four-stage checklist below to see WHY, HOW and what evidence proves readiness.';}
 else if(action==='report'){switchTab('report');result.text='Opened your case portfolio. Write your methodology and export the brief when you are ready.';}
 else if(action==='clear'){result.text='Console cleared. Type help when you need guidance.';}
 else{result.text='Command not recognized. Type help. This browser console only supports the listed commands; it does not execute shell programs, scrape websites or access private data.';}
 consoleOut.textContent=result.text;
 for(const link of result.links){const a=document.createElement('a');a.href=link.url;a.target='_blank';a.rel='noopener noreferrer';a.textContent=link.label;consoleLinks.append(a);}
}
$('command-form').addEventListener('submit',event=>{event.preventDefault();const input=$('command-input');runCommand(input.value).catch(()=>consoleOut.textContent='Command could not complete. Check the input and try again.');});
document.querySelectorAll('[data-command]').forEach(b=>b.addEventListener('click',()=>{$('command-input').value=b.dataset.command;runCommand(b.dataset.command).catch(()=>consoleOut.textContent='Command could not complete.');}));
const notes=['mandate','sources','verification','alternatives','findings','ethics'];
for(const id of notes){const elem=$('note-'+id);elem.value=typeof state.notes[id]==='string'?state.notes[id]:'';elem.addEventListener('input',()=>{state.notes[id]=elem.value.slice(0,20000);save()});}
const download=(name,content)=>{const file=new Blob([content],{type:'text/markdown;charset=utf-8'}),url=URL.createObjectURL(file),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000)};
$('export-brief').onclick=()=>{const fields=['Investigation mandate','Source register','Evidence and verification','Alternative explanations','Findings and confidence','Ethics and privacy review'];download('trace-osint-training-brief.md','# TRACE | Training Investigation Brief\n\n**Date:** '+new Date().toISOString().slice(0,10)+'\n\n**Training-only:** Do not substitute this for a verified professional report.\n\n'+notes.map((n,i)=>'## '+fields[i]+'\n\n'+(state.notes[n]||'Not completed')+'\n').join('\n'));$('report-status').textContent='Case brief exported.'};
$('export-transcript').onclick=()=>{const completed=state.finished.map(i=>'- '+String(i+1).padStart(2,'0')+' '+missions[i].title).join('\n');const answers=Object.values(state.answers),correct=answers.filter(a=>a.correct).length;download('trace-osint-training-transcript.md','# TRACE | Training Transcript\n\n**Date:** '+new Date().toISOString().slice(0,10)+'\n\n**Modules cleared:** '+state.finished.length+'/'+missions.length+'\n\n**First-attempt decisions:** '+correct+'/'+answers.length+'\n\n**This is an educational game transcript, not a professional credential or certification.**\n\n'+completed);$('report-status').textContent='Training transcript exported.'};
$('reset-progress').onclick=()=>{if(!confirm('Reset mission scores and workstation checklist? Your case notebook will be preserved.'))return;state.answers={};state.finished=[];state.setup=[];save();active=0;step=0;updateStats();renderList();renderCase();$('setup-grid').querySelectorAll('input').forEach(x=>x.checked=false);$('report-status').textContent='Training progress was reset; your portfolio remains saved.'};

/* SCOPE is TRACE's independent, case-aware field guide. It does not search
   the web, obtain identities, or reveal quiz answers. */
const scopeSpecialties={
 'FOUNDATIONS':['Document the exact mandate and authorized boundaries.','A written case charter, source log and the official primary source.','Ask whether each recorded fact directly answers the defined question.','Minimize unrelated personal data and do not use access credentials you were not authorized to use.'],
 'OPSEC':['Separate research and personal browsing, then create a reproducible case folder.','A dedicated browser profile, current security updates, MFA and backups.','Check that a second analyst could reconstruct the source trail.','Do not open untrusted attachments without proper safeguards.'],
 'DISCOVERY':['Break the public claim into specific, testable subclaims.','Search operators, official websites and dated public records.','Trace citations back to their originating documents.','Avoid intrusive searches outside the mandate.'],
 'ARCHIVES':['Build a dated comparison between snapshots and live pages.','Wayback Machine and web capture tools.','Confirm dates, differences and missing captures before inferring significance.','Do not assume a change proves a hidden motive.'],
 'EVALUATION':['Compare source provenance, independence and possible limitations.','Source registers, original documents and verification matrices.','Find independent corroboration and record counterevidence.','Never suppress contrary facts.'],
 'SOCIAL VERIFICATION':['Identify the original account, first publication and date.','Official agency channels and searchable public posts.','Compare independent announcements and actual event dates.','Do not equate reposts, popularity or a profile photo with authenticity.'],
 'IMAGE VERIFICATION':['Identify the earliest image appearances and original context.','Google Lens and public image archives.','Check visual details against dated independent evidence.','Do not identify private people from unconsented images.'],
 'FACE-IMAGE METHODS':['Learn the false-positive risk and authorization requirements before considering a comparison.','NIST face recognition evaluation materials and consented training examples.','Require corroboration beyond appearance; measure uncertainty and bias.','Do not perform nonconsensual stranger identification or publish sensitive biometrics.'],
 'VIDEO VERIFICATION':['Locate full-length source footage and original captions.','Official video archives, timestamps and related public documents.','Compare dialogue against the full recording and verified transcript.','Do not assume editing alone proves deception.'],
 'GEOLOCATION':['List independent landmarks to test candidate areas.','OpenStreetMap, available public imagery and QGIS.','Seek multiple matching features without unexplained contradictions.','Avoid pinpointing private homes or protected personal locations.'],
 'CHRONOLOCATION':['Establish the geographic context before estimating a time interval.','Dated public images, sun position and archival records.','Compare timing clues and express a justified date range.','Avoid presenting exact times that cannot be supported.'],
 'CONTACT DATA':['Limit inquiries to authorized public organizational contact details.','Numbering-plan metadata and official business listings.','Recheck official sources; formatting never establishes current owner.','Do not trace private individuals or expose recycled-number associations.'],
 'EMAIL FORENSICS':['Analyze a message you are entitled to inspect and identify the domain claim.','Full headers, SPF, DKIM, DMARC and public DNS resources.','Check authentication and compare official organizational channels.','A matching display name or domain alone does not establish sender identity.'],
 'DOMAIN INTELLIGENCE':['Separate domain ownership claims from hosting infrastructure clues.','ICANN RDAP, public DNS and certificate information.','Compare records across dates and note redactions.','Shared IP addresses do not prove common ownership.'],
 'PUBLIC RECORDS':['Document which decision stage the public record establishes.','Government meeting minutes, agency notices and public datasets.','Compare official records, amendments and effective dates.','Do not bypass restrictions to withheld records.'],
 'COMPANY RECORDS':['Resolve legal entity names and identifiers before drawing connections.','SEC EDGAR and appropriate public business registries.','Match filing dates, entity identifiers and relationship documentation.','Avoid treating similar names or shared addresses as proof of collusion.'],
 'CONTRACTS':['Separate original procurement criteria, amendments and final award.','Public procurement portals, addenda and award documents.','Reconcile scope changes and quoted amounts.','A surprising award or common name is not proof of corruption.'],
 'FINANCIAL ANALYSIS':['Ensure compared figures refer to the same periods and definitions.','Primary financial filings, notes and spreadsheet calculations.','Recalculate the claim and check accounting treatment.','An anomaly alone is not fraud evidence.'],
 'LINK ANALYSIS':['Assign source-backed relationship types to each graph edge.','Corporate records, source logs and public graph tools.','Audit every relationship independently; label hypotheses separately.','Do not imply intent or guilt through visual proximity alone.'],
 'METADATA':['Keep the original file, document its provenance, then inspect a copy.','ExifTool and SHA-256 checksums.','Corroborate embedded dates with external originals.','Editable metadata is not definitive proof of authorship or intent.'],
 'CYBER CONTEXT':['Define authorized systems before any technical observations.','Public domain records and passive security documentation.','Confirm which asset is in scope and note false positives.','Never scan, exploit or collect exposed personal data without authorization.'],
 'EVIDENCE HANDLING':['Create a source register that another analyst can audit.','ArchiveWeb.page, file hashes and secure case folders.','Preserve versions, capture dates and citations.','Apply minimization, retention and access controls.'],
 'ANALYSIS':['Write at least two plausible competing explanations.','Hypothesis matrices and a structured source log.','Seek evidence that could disprove the preferred conclusion.','Do not mistake confidence for independent evidence.'],
 'REPORTING':['Present findings, uncertainty and source citations together.','Report templates, dated source logs and quality review.','Verify each sentence has the support it claims.','Correct errors transparently and redact unrelated private information.'],
 'FINAL ASSESSMENT':['Organize the fictional case as a claim-by-claim evidence matrix.','The complete source log, archived copies and mapping tools.','Distinguish verified facts, reasonable inferences and unresolved claims.','Never publish accusations or personal data beyond the evidence and mandate.']
};
function refreshScope(){
 const mission=missions[active],head=$('scope-case-label');
 if(head)head.textContent='CASE '+String(active+1).padStart(2,'0')+' · '+mission.title.toUpperCase();
 const box=$('scope-answer');
 if(box){box.replaceChildren();const h=document.createElement('strong');h.textContent='Select a research question above.';box.append(h);}
}
document.querySelectorAll('[data-scope-prompt]').forEach(b=>b.addEventListener('click',()=>{
 const m=missions[active],p=scopeSpecialties[m.field]||scopeSpecialties.FOUNDATIONS;
 const idx={plan:0,tools:1,verify:2,ethics:3}[b.dataset.scopePrompt];
 if(idx===undefined)return;
 const answer=$('scope-answer'),strong=document.createElement('strong'),paragraph=document.createElement('p');
 strong.textContent=['Plan the inquiry','Tools that fit','Verify your finding','Safety and ethics'][idx];
 paragraph.textContent=p[idx];
 answer.replaceChildren(strong,paragraph);
 document.querySelectorAll('[data-scope-prompt]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));
}));
active=unlocked();step=firstQuestion(active);updateStats();renderList();renderCase();
window.TraceAcademyDebug=Object.freeze({missionCount:missions.length,toolCount:toolbox.length,getProgress:()=>({completed:state.finished.length,questionsAnswered:Object.keys(state.answers).length,active,step,tab:currentTab}),version:'mission-command-20261107'});
// Mission-command interface uses the real lesson data and progress; no second save system.
window.TraceAcademyGame=Object.freeze({
 missions:missions.map((m,i)=>({id:i,title:m.title,field:m.field,brief:m.brief,clues:m.items.length})),
 progress:()=>({completed:state.finished.slice(),answered:Object.keys(state.answers).length,
 correct:Object.values(state.answers).filter(x=>x.correct).length,active,step,unlocked:unlocked(),rank:$('stat-rank')?.textContent||'Trainee',xp:Number($('stat-xp')?.textContent||0)}),
 openCase:(index)=>{
  const id=Number(index);
  if(!Number.isInteger(id)||id<0||id>=missions.length||id>unlocked())return false;
  active=id;step=firstQuestion(active);switchTab('missions');renderList();renderCase();updateStats();focusCase('.case-navigation');return true;
 }
});
document.body.dataset.traceReady='true';
})();