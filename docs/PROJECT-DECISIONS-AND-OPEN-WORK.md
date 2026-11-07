# RandomCandyLand.com — Project decisions, requested features & outstanding verification
**Updated:** 2026-11-07  
**Repository:** `patrickchristianandrews/RandomCandyLand.com`  
**Purpose:** The persistent handoff/checklist for implementation, deployment and real-device proof. Preserve established decisions across future changes. Do **not** mark a feature "live" based only on a GitHub commit or code-level test.

## Status key
- **REQUESTED / OPEN:** Explicit request that has not been demonstrated working in production.
- **CODE PRESENT, UNVERIFIED:** A feature or scaffold is present/previously committed; its real behavior, completeness or deployment is not yet established.
- **VERIFIED LIVE:** Only after checking an actual production URL, interaction/output and relevant device.
- **CANCELED / SUPERSEDED:** Do not reintroduce without a new request.

**Current release truth:** Direct GitHub repository reads and commits have succeeded. Deployment has not been proven end-to-end for the full-report release. GitHub Pages workflow in `.github/workflows/deploy.yml` is set to build, generate fictional PDF examples and deploy; it may be blocked by Pages source configuration, workflow permissions or other build errors. Vercel also reported build-limit failures. **Do not equate these with verified live changes.** Publishing must be assessed using actual workflow logs, site response, release ID and downloadable PDF signatures.


## Progress log — 2026-11-07 (report center code committed; production still unverified)
- **Old samples retired:** Removed the scripted sample-PDF generator and removed links to the three nonexistent completed PDF assets from the public report guide. The guide now explains actual personal PDF, private backup JSON, selectively shared report JSON, one-file partner PDF, and two-file comparison flows.
- **Report access:** The top Reports & Uploads menu and the Unwrapped home report card lead directly to the report center. Personal results include a shortcut to prepare a selectively shareable upload file. One-file partner and two-file combined reports have separate upload actions.
- **Private backup import:** Import now returns an explicit success/failure result so the report center does not falsely claim that an invalid or canceled import succeeded. PDF files are for reading/printing; structured selected-report JSON is required for partner/comparison uploads.
- **Verification pending:** GitHub files/commits confirmed, but no completed push-triggered Pages workflow, actual production render, mobile print/download test or end-to-end imported-person result was obtained. Verify these before describing the feature as live.

## Progress log — 2026-11-05 (source changes, NOT production verification)
- **Committed code:** The release browser generator now completes two fictional 69+32 questionnaires and attempts the actual in-browser private quiz JSON download, clean-browser import, invalid-file rejection, separately selected partner JSON exports, two-file upload, merged comparison and printable PDF. Evidence screenshots and a journey audit are also wired to the GitHub Pages build. **Browser execution and public PDFs remain unverified until the workflow completes.**
- **Committed report sample page:** Added a third, two-person comparison PDF link alongside the Rowan and Ellis personal report links. Links alone do not prove the files exist on the live server.
- **Data preservation fix:** Preference-quiz private backups now include explicitly marked Curiosity Library Interested / Curious / Not for me choices. Import restores those marks. Psychology-only backups deliberately exclude the separately marked intimate library, and selective partner exports do not carry full private backups.
- **Verification obtained:** Read back changed GitHub source and passed **77 static assertions** from Unwrapped's existing coverage check, including private transfer rules. JavaScript syntax checks for the generator and transfer code passed. **Not obtained:** actual headless-browser pass log, valid generated PDF bytes from CI, GitHub Pages deployment run success, final public URL or mobile-device results.
- **Deployment blocker:** The connected GitHub status tool still shows failing Vercel build-limit checks; it does not expose normal push-triggered Pages workflow runs. See repository Actions for detailed run logs and the first failing step. No permission was silently changed.
- **Next acceptance gate:** Attach run logs and screenshots, inspect all three PDFs, confirm both upload types and privacy, then verify real HTTP downloads and release ID on the production domain before checking any related box below.

## P0 — Release recovery, evidence and integrity (OPEN)
- [ ] Determine the host actually serving `randomcandyland.com` and `/after-dark/`; distinguish GitHub Pages from Vercel and Cloudflare. Don't change DNS or CNAME without clear reason and authorization.
- [ ] Inspect **the real push-triggered GitHub Actions run** (not only Vercel commit statuses). Fix the first failing step; don't rely on inaccessible pull-request workflow-run queries.
- [ ] Confirm Pages **Settings > Pages > Source = GitHub Actions**; if account permissions prevent modifying it, give the exact setting and error to the owner. Do not pretend a workflow changed it.
- [ ] Rebuild and publish every required route and static resource, preserving existing tools and files. No changes to unrelated games during a release fix.
- [ ] Verify live `/release-id.txt` equals the deployed commit and verify HTTP 200, HTML expected content and PDF header `%PDF-` for `/after-dark/report-samples/complete-rowan-personal-report.pdf` and `...complete-ellis-personal-report.pdf`.
- [ ] Run a full **fictional-user end-to-end browser journey** for every report/transfer option and provide evidence: test case → result → logs → screenshots → actual PDFs → public downloadable URL. Test Android Chrome and iPhone Safari where practical; if not verified, say so.
- [ ] Distinguish **source committed**, **tests passed**, **build succeeded**, **production deploy succeeded**, and **real-device verified** in all status updates. Do not promise asynchronous work without actually scheduling it.
- [ ] Validate that every route/download advertised on the homepage works and downloads directly on phones, not empty browsers/404.
- [ ] Diagnose regressions introduced by old/stale files, service-worker caches, conflicting deployments and build steps. Maintain a repeatable check for fresh vs cached production assets.

## P0 — Unwrapped full-feature experience (OPEN until real user journeys pass)
**Approved branding:** Unwrapped; subtitle/intent: *Understand every layer. Appreciate the whole person.* Name the guide **Mira** (approved after exploration of alternatives). Curiosity Library is the browsing/library feature; preserve internal legacy hooks as needed. Don't scatter unnecessary references to AI throughout Unwrapped editorial content. Remove gratuitous goo / obsolete universe header and avoid clutter.

### Quizzes, state and transfer
- [ ] Preserve the existing **69-question core intimate-preferences quiz** with all prior categories and option details. Do not replace it, shrink it, or create a redundant third quiz.
- [ ] Preserve **32-question non-explicit everyday psychology quiz** and its compatibility/mapping to relevant portions of the intimate quiz. It may work alone but must not claim to predict specific intimate interests from personality.
- [ ] Group related questions to reduce scrolling while storing each original answer distinctly; multi-select where appropriate, diverse adult-media interest multi-select/dropdown, watching/being watched, consensual group and partner-swap scenarios with gender preferences, sensory/body-fluid/bodily-function interests, role differences and boundaries.
- [ ] Every intimate interest answer must distinguish *fantasy only*, *curious*, *interested in exploring*, *No*, or *unsure* as appropriate; prevent contradictions and never override a No. Keep explicit sexual-health safety and informed consent.
- [ ] Save/restore/continue progress locally across quiz sections; reset individually, import/transfer previous answers between devices or saved reports, and handle omissions/partial answers accurately.
- [ ] Verify state and transfer with multiple **distinct fictional people** and full 69/69 + 32/32 completions; no fabricated results, hidden expected answer manipulation, inference of consent, real-person data or sending private answers to analytics.

### Personalized outputs and partner workflows
- [ ] Produce the detailed **personal report** from actual quiz state with readable cover, overview, category grids, visual theme comparisons, answer-linked psychological interpretations, interest/fantasy/boundary distinctions, potential additional interests with uncertainty, original question-answer appendix, communication guidance and methodology explanation. It should speak in the first person where suitable.
- [ ] Show as many grounded **psychology connections and subconnections** as useful: full theme matrix, two-quiz overlap/difference, nested theme pairings, evidence question IDs and selected answer text. Never convert broad correlations to false diagnoses, origins, probabilities or preferences.
- [ ] Include user-controlled **partner report** with per-section opt-ins and personalized introduction, approved interests, context, boundaries and conversation prompts. Private notes and original answers require explicit selection; no automatic transmission.
- [ ] Include **new-partner introductory report** covering nonsexual whole-person context (communication, attachment and affection preferences, personal space, routines, boundaries, values, stress and repair) with optional carefully selected intimate information. Do not assume all content is sexual.
- [ ] Support **upload/import of saved quiz/report data**, combine own two quizzes, combine two consenting people's selected results, compare compatible/contrasting areas and provide a single readable combined/couple report. Test upload validation, missing sections, data format changes, cancellations and privacy controls.
- [ ] Export reliably as polished, appropriately paginated **PDF**, including visual charts, answer linkage, appendix, optional QR back to Unwrapped and final methodology page. Print text must remain legible with long answers and on mobile.
- [ ] Preserve optional sex-toy reading guidance based on **direct interest selections** with distinct male/female/shared anatomy suitability, safety/manufacturer notes and fantasy-only restrictions; **OFF by default in partner-facing exports**. Don't manufacture purchase recommendations from psych-only themes.
- [ ] Reports should help understand the total person and communicate with a partner. Present interpretations as exploratory and non-diagnostic.

### Required fictional demonstrators (OPEN until PDF confirmed)
- [ ] **Rowan** and **Ellis** are fictional, deterministic completed respondents defined at `public/after-dark/fictional-respondents.js`; both are intended to answer **all 69 + 32 real questions**, then pass through the **actual canonical app engine** and its live report renderer. Their differing answers, explicit boundaries and fantasy-only status must be preserved.
- [ ] Generate genuine full-length test PDFs with complete evidence charts and appendices, **publish the actual PDF bytes**, verify the downloads, and reintroduce example links ONLY once the files pass real production/download checks. The retired legacy gallery must not return.
- [ ] Produce additional fictional cross-person tests: own-quiz import, psychology import, report export, selective partner PDF, new-partner PDF, file upload, partner compare, combined report, saving/reloading and privacy. Confirm each output contains correct source evidence and not another person's unapproved notes. Provide reproducible test artifacts and screenshots/renders.
- [ ] Check real sample, real participant, and merged result schemas produce consistent presentation with no missing features.
- [ ] Note: previous source-level fixture/test assertions passed, but **the actual browser-to-PDF-to-public-download chain was not verified**. Do not state those samples are live without independent proof.

### Content, navigation and editorial
- [ ] Make Unwrapped entrance feel like a concise homepage showing *what quizzes generate* and why the output is useful, with a top ribbon and small explainer panels/illustrations; avoid overwhelming scrolling.
- [ ] Curiosity Library should explain themes and interests; personal shelf/save/bookmark; related psychology; partner-friendly plain-language Q&A. Expand guides for specific anatomy, pleasure techniques, wellness, origins pathways and practical education with illustrations, appropriate limitations and consent.
- [ ] **Mira** should understand typos, slang, short keyword searches and questions about results, privacy, relationships, individual topics and how to discuss them; no fabricated access to nonexistent results.
- [ ] Idea Lab should deliver concrete, personalized, safely framed suggestions with boundaries/preferences respected.
- [ ] Do not restore outdated or dead sample report links. If current fictional examples are eventually published, link only verified, current outputs generated from the same live reporting engine and keep the report upload workflow more prominent than demonstrations.
- [ ] Book/manuscript about the whole-person psychological background of preferences: direct, sophisticated conversational writing, illustrative material, nuanced possible origins (not deterministic), discreet/cute title, sale-ready formatting and no unnecessary AI branding. Separately verify completeness; do not treat a draft as final.

## P1 — RandomCandyLand.com homepage, navigation, publishing, PWA (OPEN or UNVERIFIED)
- [ ] Clean, visually coherent homepage: icon-and-name strip for every tool at top, organized concise categories (*Explore & Understand*, research/tools, quick games, ongoing experiences, longer stories/courses); short useful descriptions of each tool and actual outputs. Reduce excess scrolling and crowded cards.
- [ ] Use a site-wide ribbon/menu, consistent outer-page shell, prominent home icon/logo; preserve custom circular icon artwork and planetary background where approved. No unnecessary old page variants, goo overlay, extra circles or redundant headers. Preserve tool names and links.
- [ ] Site **and each sub-app** installable as PWA as supported on Android, iOS and desktop; hide install control if already installed; consistent save/return-to-position/back-to-top toolbar and sharing for individual guides/topics.
- [ ] Push notifications on installed ongoing games when appropriate, with explicit permission controls.
- [ ] Repair Google Analytics measurement without collecting sensitive quiz answers or invitation URLs; verify collection rather than merely inserting a tracking ID.
- [ ] Keep GitHub and Cloudflare connected to intended tools, and preserve Vercel/GitHub Pages deployment ownership with a single clear production source. Public site must not regress when fresh commits arrive.
- [ ] Professional American-style fictional-news headline/ticker: slim continuous stream, click for full story, next story controls, no obsolete 'Gazette', 'dispatch', 'Rubbish Daily' or other rejected labels.

## P1 — Random AI, Academy and Identity Lab (OPEN or UNVERIFIED)
- [ ] **Random AI** is a distinct product from Unwrapped. Present as approachable, private, clearly explain real local vs hosted usage limits; do not falsely promise unlimited hosted generation. Show active model(s) by chat input.
- [ ] Simplify chat for nontechnical users: obvious start/chat/send buttons, guided install/download options, stacks/workflows, easy model import/removal, available downloaded models retained until deleted or technically incompatible, and clearly explained optional infusion/combining of models. Fix broken controls and modal/toolbar behavior.
- [ ] Professional image, video and coding creation workflows including GitHub integration, with honest capacity/provider and API/billing limits. BRIA Fibo Studio should remain in its separate repository subfolder and not overwrite existing files or expose unrestricted paid endpoints.
- [ ] **AI Academy**: comprehensive prompting education, many specific domains and advanced use cases, but a compact guided step-by-step UI instead of a long wall of scrolling.
- [ ] **TRACE / Identity Lab**: all personal fields optional; powerful clear user-controlled research/evidence organization, downloadable useful reports, guided process and polished visual design. Prevent unsafe identity disclosure and unsupported personal claims.
- [ ] **TRACE OSINT Academy**: engaging investigator workstation, integrated command-style research tools, plain-language navigation and staged cases. Use consent/public-source limits and don't imply unlawful access.

## P1 — Games, multiplayer and immersive features (OPEN or UNVERIFIED)
- [ ] **Moodropolis:** substantially improved high-quality interactive visuals, compelling mechanics, replay value and clearer progression.
- [ ] **The Corridors:** choices have immediate and long-term second-order consequences (economics, politics, ethics, trade-offs and opportunity costs); varied ambiguous decisions, non-partisan nuance and replayability; compelling visuals.
- [ ] **The Docket:** immersive court/legal-system game, well-designed case mechanics and strong visual appeal.
- [ ] **TRACE OSINT:** above; do not silently remove it when categories change.
- [ ] **Casino / play a friend:** multiplayer poker and other games, room creation/joining and copy/share invite links using straightforward numbered steps; Cloudflare relay should connect real Android Chrome and iPhone Safari clients. Troubleshoot actual 'host unavailable'/ICE/unstable handshake using real-device evidence; optional bots; winner overlay, reason for win, visible score counter and concise poker hand guide.
- [ ] **Trumpagotchi OG** should be first; preserve second pet game with correct identity, playful interactions, original audio/phrases and polished status/controls. Restore working TV sit, keyboard/bongo/melody, how-to-play dropdown, age gate and consistent shell; remove golf mini-game, white boxes, undesired FM-1 disclaimers/old labels. Install on supported devices; investigate Pixel Watch app/APK claims separately.
- [ ] **FM-1 Pastel/Liquid custom firmware:** separate from the web game; actual compatible downloadable installable firmware/build and foolproof loading instructions, functional preset browser, attractive pastel/liquid graphics, best usable presets inspired by compatible sources, animal sequencer animations and working animal sounds. Do not claim a firmware file exists based on a preview.
- [ ] **Music visualizer / Pulse:** reliable audio-reactive Winamp-style hypnotic geometric 2D/3D visualization, usable smooth performance, clear casting pathways and honest device limitations (including HomePod).
- [ ] Keep all previously requested games/tools available in site grouping; no unrelated content should disappear as part of another feature's redesign.

## Release acceptance test matrix: proof required, not screenshots of code
| Journey | Minimum automated/interactive evidence | Acceptance |
|---|---|---|
| New visitor → intimate quiz | Answer all 69, save/reload, each option/intention/No retained | Original responses and privacy intact |
| New visitor → everyday quiz | Answer all 32, save/reload, compare with direct quiz | Coded overlaps consistent and non-diagnostic |
| Solo PDF | Export complete personal report in browser | Legible PDF, graphs, connections, all 101 exact answers, methodology |
| Saved quiz / report transfer | Export/import a saved file in clean browser / second profile | No missing answers, safe schema validation, user control |
| Two fictional people | Rowan and Ellis complete both quizzes separately | Clearly distinct outputs, negative boundaries honored |
| Selective partner PDF | Choose sections; export, inspect | Unselected intimate facts/notes/toys absent |
| New-partner PDF | Export default and opted-in variants | Defaults non-intimate, no accidental disclosure |
| Partner comparison | Upload/import two distinct permitted profiles; merge | Correct person/answer separation, useful paired report, no false certainty |
| Sample report files | Produce fictional files in actual report code, inspect via screenshots | PDFs fully rendered and valid, downloadable |
| Production and devices | Browser visit live URL + download on Android/iOS if available | Exact commit published; phone downloads work |
| Other apps | Game, AI, install, analytics, casting, connection and restart workflows | Actual behaviors tested; failure logs retained |

## Tracking discipline / do-not-regress constraints
1. Before changing a feature, inspect the corresponding current source, this checklist and relevant prior decisions; preserve other tools/files. Never overwrite unrelated content to make one test pass.
2. Update this tracker when a requested feature changes, is canceled, or is demonstrably verified; record commit SHA, release SHA, test evidence, device and date. Treat owner-visible confirmations as the final source of accepted names.
3. **Approved:** Unwrapped, Mira, separate Random AI, streamlined homepage, no goo, 69 + 32 quiz structure. Keep these unless explicitly changed.
4. **Superseded:** The brief proposal to rename Mira was reversed; Mira approved. Experimental dense/universe navigation was reverted; do not reintroduce. No golf mini-game; don't restore rejected clutter.
5. Never use actual visitor intimate answers as demo fixtures; fictional people, local private processing and explicit opt-in sharing are essential.
6. If blocked by a provider/account setting, name the specific setting and link directly to it. Show work completed in GitHub separately from site deployment, and never claim a broken download works.

**Reference:** Earlier conversation requests spanning 2026-10-25 to 2026-11-05. This tracker captures the identified scope and constraints; it is not proof that each item is implemented or live.
