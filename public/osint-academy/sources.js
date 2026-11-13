const SOURCES = [
  [
    "Elections and political money",
    "Check your voter registration by state",
    "https://www.eac.gov/voters/register-and-vote-in-your-state",
    "Find your state’s official voter registration status check and local election office.",
    "A self-service status check is different from access to a voter list. Check the state’s instructions before submitting personal details.",
    "Choose your state, then use its official registration status link to check your own record."
  ],
  [
    "Elections and political money",
    "Virginia voter registration and voting history",
    "https://vote.elections.virginia.gov/VoterInformation",
    "Check your Virginia voter registration, polling place, districts, absentee ballot status, and participation history.",
    "Participation history can show elections you voted in. It does not show who you voted for.",
    "Open the Citizen Portal and follow the instructions to look up your own voter record."
  ],
  [
    "Elections and political money",
    "Voter registration lists by state",
    "https://www.ncsl.org/elections-and-campaigns/access-to-and-use-of-voter-registration-lists",
    "Compare state rules for access to voter rolls, available fields, and permitted uses.",
    "Eligibility, access, and permitted use vary. The guide explains the rules and does not supply voter records.",
    "Find the state in the table, then check the linked law and contact the state or local election office for its current process."
  ],
  [
    "Elections and political money",
    "Virginia voter list requests",
    "https://law.lis.virginia.gov/vacode/title24.2/chapter4/section24.2-405/",
    "See which applicants and purposes qualify for Virginia registered voter lists.",
    "Access to voter lists is restricted. A public records request is a separate process.",
    "Read the eligibility and purpose rules, then contact the Virginia Department of Elections for its current request form and fees."
  ],
  [
    "Elections and political money",
    "Virginia election participation lists",
    "https://law.lis.virginia.gov/vacode/title24.2/chapter4/section24.2-406/",
    "See the rules for requesting Virginia lists of people who participated in specified elections.",
    "An appearance on a participation list cannot reveal anyone’s ballot choices.",
    "Identify the election and read the applicant and purpose rules before contacting the Department of Elections."
  ],
  [
    "Elections and political money",
    "Virginia voter registration statistics",
    "https://www.elections.virginia.gov/resultsreports/registration-statistics/",
    "Find aggregate voter registration counts for Virginia.",
    "These are counts. Use the report’s definitions before comparing active and inactive registrations.",
    "Choose a report date or year. Compare matching geography and reporting periods when measuring change."
  ],
  [
    "Elections and political money",
    "Virginia election results",
    "https://www.elections.virginia.gov/resultsreports/election-results/",
    "Find Virginia election returns by contest and locality.",
    "Election-night totals can change. Look for certified results when citing a final count.",
    "Choose the election date and office. Open locality or precinct detail when available."
  ],
  [
    "Elections and political money",
    "Federal individual campaign donations",
    "https://www.fec.gov/data/receipts/individual-contributions/",
    "Find disclosed individual donations to federal political committees, with amounts, dates, and recipient committees.",
    "Same-name matches and amended reports need checking. Disclosure rules affect which donations appear. FEC contributor data has solicitation and commercial-use restrictions.",
    "Search the donor name, then narrow by state, employer, recipient committee, and election cycle."
  ],
  [
    "Elections and political money",
    "Federal campaign and PAC filings",
    "https://www.fec.gov/data/",
    "Find candidate committees, political action committees, receipts, disbursements, and reports filed with the FEC.",
    "Totals and transaction lines answer different questions. Check filing dates, amendments, refunds, and transfers before adding amounts.",
    "Find the committee by name or ID. Open the latest filing or amendment and look at the schedules for individual transactions."
  ],
  [
    "Elections and political money",
    "Federal independent expenditures",
    "https://www.fec.gov/data/independent-expenditures/",
    "Find disclosed outside spending that supports or opposes federal candidates.",
    "Independent spending is reported separately from donations to the candidate’s campaign.",
    "Filter by candidate, spender, election cycle, and support or opposition. Open the original filing for context."
  ],
  [
    "Elections and political money",
    "Virginia campaign donations and filings",
    "https://www.elections.virginia.gov/candidatepac-info/campaign-finance/",
    "Find the state’s disclosure resources for Virginia campaign and political committee reports.",
    "For a local race, confirm which office holds the filing. Federal races use FEC records.",
    "Follow the campaign finance disclosure link, then search by candidate or committee. Check the contribution schedule and latest amendment."
  ],
  [
    "Elections and political money",
    "Virginia Public Access Project donor research",
    "https://www.vpap.org/",
    "Find Virginia political donation summaries and donor profiles compiled from disclosure records.",
    "VPAP is a research index. Verify identity, amounts, and amendments against the filed report.",
    "Open Money, then Donor Search. Narrow by locality or recipient and compare the original report for important findings."
  ],
  [
    "Elections and political money",
    "IRS Section 527 political organization filings",
    "https://www.irs.gov/charities-non-profits/political-organizations/political-organization-filing-and-disclosure",
    "Find public forms filed by covered political organizations, including certain contribution and spending disclosures.",
    "Coverage depends on the organization and its filing obligations. Check FEC and state sources separately.",
    "Use the IRS political organization disclosure search and look up the organization. Start with Form 8872 for periodic contribution and spending reports where available."
  ],
  [
    "Elections and political money",
    "Federal candidates’ financial disclosures",
    "https://www.fec.gov/help-candidates-and-committees/filing-reports/financial-disclosure/",
    "Find guidance on where federal candidates file personal financial disclosures.",
    "These disclosures describe reportable financial interests. Campaign receipts are filed separately.",
    "Identify the office sought and follow the filing office listed for that office. Compare report years and amendments."
  ],
  [
    "Elections and political money",
    "Political advertising files",
    "https://publicfiles.fcc.gov/",
    "Find political ad documents filed in public inspection files by covered broadcasters and other regulated outlets.",
    "An order or request can differ from what aired. Compare invoices or later records when available.",
    "Search by station call sign, open the political file, and choose the year and race or issue."
  ],
  [
    "Public oversight and safety",
    "OFAC sanctions list search",
    "https://sanctionssearch.ofac.treas.gov/",
    "Find possible matches on U.S. Treasury sanctions lists.",
    "A similar name alone cannot establish a match. Record the list and search date.",
    "Search the name, then compare aliases, entity type, and other identifiers in the official listing."
  ],
  [
    "Public oversight and safety",
    "FDA warning letters",
    "https://www.fda.gov/inspections-compliance-enforcement-and-criminal-investigations/compliance-actions-and-activities/warning-letters",
    "Find published FDA warning letters about regulatory concerns.",
    "A warning letter reflects concerns at the time it was issued. Check subsequent actions.",
    "Search by company name or product and open the letter. Look for follow-up correspondence or closeout information."
  ],
  [
    "Public oversight and safety",
    "Federal rulemaking comments and dockets",
    "https://www.regulations.gov/",
    "Find proposed rules, supporting documents, and public comments for participating agencies.",
    "Public comments are submissions. Check the final rule or agency response to see what the agency adopted.",
    "Search the docket ID or agency and topic. Open the docket and filter by document type."
  ],
  [
    "Public oversight and safety",
    "FCC Electronic Comment Filing System",
    "https://www.fcc.gov/ecfs/",
    "Find filings in FCC proceedings, including comments, petitions, and correspondence.",
    "A filer’s position is distinct from an FCC decision. Find the final order separately.",
    "Use the proceeding number or filer name, then open the dated filing in the relevant docket."
  ],
  [
    "Public oversight and safety",
    "HHS health care exclusions",
    "https://exclusions.oig.hhs.gov/",
    "Search the federal list of people and entities excluded from certain health care programs.",
    "Similar names can produce false matches. Verify identity and current status with the official system.",
    "Search the individual or organization and use the official verification process when a possible match appears."
  ],
  [
    "Public oversight and safety",
    "CMS provider data",
    "https://data.cms.gov/provider-data/",
    "Find public datasets on hospitals, nursing homes, and other providers, including quality or inspection data by provider type.",
    "Measures and update dates vary by dataset. Compare the same metric and period.",
    "Choose the provider category and search by facility name or identifier. Read the dataset description and reporting period."
  ],
  [
    "Public oversight and safety",
    "FEMA disaster declarations",
    "https://www.fema.gov/disaster/declarations",
    "Find federal disaster declarations, affected areas, dates, and assistance designations.",
    "A declaration’s geography and programs can change. Verify against the latest designation.",
    "Filter by state, incident type, or date. Open the declaration and check designated areas and amendments."
  ],
  [
    "Public oversight and safety",
    "NOAA Storm Events Database",
    "https://www.ncei.noaa.gov/stormevents/",
    "Find documented U.S. severe weather events, including event narratives where available.",
    "Reporting coverage varies over time and by event type. Compare nearby observations for a specific location.",
    "Filter by state or county, date range, and event type. Open the record and read the description."
  ],
  [
    "Public oversight and safety",
    "Public company insider transactions",
    "https://www.sec.gov/edgar/search/",
    "Find SEC Form 4 reports of certain transactions by public-company insiders.",
    "Grants, option exercises, gifts, and open-market purchases have different meanings.",
    "Search by company ticker or name, filter for Form 4, then read the transaction codes and footnotes."
  ],
  [
    "Elections and political money",
    "State and local campaign donations",
    "State election agency or local filing office",
    "Find disclosed donations to candidates and committees in state or local races.",
    "Coverage, filing offices, and disclosure rules vary. Verify totals against the latest filed report.",
    "Identify the office and election year. Open the state election agency’s campaign finance page or contact the local clerk."
  ],
  [
    "Identity and provenance",
    "Official biographies",
    "Employer, university, or agency staff pages",
    "Role, affiliation, and dates published by the institution",
    "Titles can lag changes; compare dated announcements and public filings.",
    "Search the organization’s staff page by name. Compare it with a dated announcement if you need to know when the role began."
  ],
  [
    "Identity and provenance",
    "Public testimony",
    "Committee hearing pages and meeting minutes",
    "Statements attributed to a named speaker and role",
    "Read the agenda, transcript, and date together.",
    "Search the committee name and hearing date. In the transcript, find the speaker’s name and read the exchange around the statement."
  ],
  [
    "Identity and provenance",
    "ORCID",
    "https://orcid.org/orcid-search/search",
    "Researcher IDs, works, and claimed affiliations",
    "Some entries are self-reported; verify against publishers.",
    "Search the researcher’s name or 16-digit ORCID. Open their record and check which organizations supplied the work or affiliation."
  ],
  [
    "Identity and provenance",
    "Crossref",
    "https://search.crossref.org/",
    "DOIs, publication dates, coauthors, and corrections",
    "Author names can collide; verify affiliations and ORCID.",
    "Start with the published name, organization, and approximate date. Look for a role or identifier that distinguishes people with the same name."
  ],
  [
    "Identity and provenance",
    "OpenAlex",
    "https://openalex.org/",
    "Research output, affiliations, and citation trails",
    "Algorithmic author matches can merge unrelated people.",
    "Start with the published name, organization, and approximate date. Look for a role or identifier that distinguishes people with the same name."
  ],
  [
    "Identity and provenance",
    "Public awards and fellowships",
    "Issuing organization’s announcements and annual reports",
    "Award recipients, dates, and professional context",
    "Confirm the award and year with the issuer.",
    "Start with the published name, organization, and approximate date. Look for a role or identifier that distinguishes people with the same name."
  ],
  [
    "Identity and provenance",
    "Conference programs",
    "Conference organizer or proceedings archive",
    "Talk title, presenter, employer, and event date",
    "A scheduled appearance does not establish attendance.",
    "Start with the published name, organization, and approximate date. Look for a role or identifier that distinguishes people with the same name."
  ],
  [
    "Identity and provenance",
    "Obituaries and historical notices",
    "Library newspaper archives or publisher",
    "Historical dates and biographical leads",
    "Cross-check before treating relationships or dates as established.",
    "Start with the published name, organization, and approximate date. Look for a role or identifier that distinguishes people with the same name."
  ],
  [
    "Courts and enforcement",
    "Federal court records",
    "https://pacer.uscourts.gov/",
    "Federal dockets and available filings",
    "Account and fees may apply. Allegations and outcomes are distinct.",
    "Use the nationwide case locator or the known court. Open the docket by case number and look for the latest order or judgment."
  ],
  [
    "Courts and enforcement",
    "CourtListener RECAP",
    "https://www.courtlistener.com/recap/",
    "Copies of federal dockets and selected documents",
    "Coverage is incomplete. Confirm against the official docket.",
    "Find the court or agency first. Search by case number if you have it, or use a party name and date range. Open the docket to see what happened next."
  ],
  [
    "Courts and enforcement",
    "State and local court portals",
    "State judiciary and county clerk",
    "Civil, criminal, probate, and other public docket indexes",
    "Coverage, identifiers, and access vary; distinguish filing and disposition.",
    "Find the court or agency first. Search by case number if you have it, or use a party name and date range. Open the docket to see what happened next."
  ],
  [
    "Courts and enforcement",
    "Published opinions",
    "https://www.govinfo.gov/app/collection/USCOURTS",
    "Published opinions from participating federal courts",
    "An opinion is only one part of the docket.",
    "Find the court or agency first. Search by case number if you have it, or use a party name and date range. Open the docket to see what happened next."
  ],
  [
    "Courts and enforcement",
    "Administrative decisions",
    "Issuing regulator or agency adjudication archive",
    "Findings, orders, and sanctions",
    "Check appeals, amendments, and whether an order is final.",
    "Find the court or agency first. Search by case number if you have it, or use a party name and date range. Open the docket to see what happened next."
  ],
  [
    "Courts and enforcement",
    "DOJ releases",
    "https://www.justice.gov/news",
    "Public announcements of federal enforcement actions",
    "An announcement can describe an allegation. Check docket outcomes.",
    "Find the court or agency first. Search by case number if you have it, or use a party name and date range. Open the docket to see what happened next."
  ],
  [
    "Courts and enforcement",
    "FTC case library",
    "https://www.ftc.gov/legal-library/browse/cases-proceedings",
    "Public complaints, settlements, and enforcement orders",
    "Compare complaint, order, and current case status.",
    "Find the court or agency first. Search by case number if you have it, or use a party name and date range. Open the docket to see what happened next."
  ],
  [
    "Courts and enforcement",
    "SEC enforcement",
    "https://www.sec.gov/enforcement-litigation",
    "Public securities enforcement actions and orders",
    "Confirm role, date, and whether a finding was contested.",
    "Find the court or agency first. Search by case number if you have it, or use a party name and date range. Open the docket to see what happened next."
  ],
  [
    "Courts and enforcement",
    "Bankruptcy notices and dockets",
    "https://pacer.uscourts.gov/",
    "Case numbers, filings, and case status",
    "Verify legal entity and jurisdiction; filing and discharge are separate.",
    "Find the court or agency first. Search by case number if you have it, or use a party name and date range. Open the docket to see what happened next."
  ],
  [
    "Courts and enforcement",
    "Inspector general reports",
    "https://www.oversight.gov/",
    "Audits and investigations made public by federal inspectors general",
    "Read methodology, agency response, and publication date.",
    "Find the court or agency first. Search by case number if you have it, or use a party name and date range. Open the docket to see what happened next."
  ],
  [
    "Businesses and money",
    "State corporation registries",
    "Secretary of State business entity search",
    "Entity names, status, filing dates, and public roles",
    "Registered agent, officer, and owner are different roles.",
    "Use the registered name or an ID if available. Check the filing period and compare amended reports with the original."
  ],
  [
    "Businesses and money",
    "SEC EDGAR",
    "https://www.sec.gov/edgar/search/",
    "Public-company filings, officers, ownership disclosures, and exhibits",
    "Match entity using CIK, then compare original and amended filings.",
    "Search the company name, ticker, or CIK. Try a 10-K for the annual report or a proxy statement for board members and executive pay."
  ],
  [
    "Businesses and money",
    "IRS exempt organizations",
    "https://www.irs.gov/charities-non-profits/tax-exempt-organization-search",
    "Tax-exempt status and available Form 990 filings",
    "Use EIN and tax year; posting may lag.",
    "Use the registered name or an ID if available. Check the filing period and compare amended reports with the original."
  ],
  [
    "Businesses and money",
    "USAspending",
    "https://www.usaspending.gov/",
    "Federal awards, recipients, and spending records",
    "Obligation, award ceiling, and actual spending differ.",
    "Use the registered name or an ID if available. Check the filing period and compare amended reports with the original."
  ],
  [
    "Businesses and money",
    "SAM.gov",
    "https://sam.gov/",
    "Contract opportunities, entity information, and exclusions",
    "Use identifiers and effective dates; review access conditions.",
    "Use the registered name or an ID if available. Check the filing period and compare amended reports with the original."
  ],
  [
    "Businesses and money",
    "Federal lobbying disclosures",
    "https://lda.senate.gov/",
    "Lobbying registrations and periodic reports",
    "A listed issue or client does not show a meeting occurred.",
    "Use the registered name or an ID if available. Check the filing period and compare amended reports with the original."
  ],
  [
    "Businesses and money",
    "Local contracting",
    "County procurement portal or city clerk",
    "Solicitations, awards, bid tabs, and change orders",
    "Compare bid, signed contract, and later amendments.",
    "Use the registered name or an ID if available. Check the filing period and compare amended reports with the original."
  ],
  [
    "Businesses and money",
    "Public audits",
    "State auditor, local auditor, or agency financial reports",
    "Audit findings, findings responses, and public financial statements",
    "Check period and whether the agency resolved the finding.",
    "Use the registered name or an ID if available. Check the filing period and compare amended reports with the original."
  ],
  [
    "Businesses and money",
    "UCC filings",
    "State filing office",
    "Public financing statements and filing history",
    "A filing alone does not establish debt amount or current balance.",
    "Use the registered name or an ID if available. Check the filing period and compare amended reports with the original."
  ],
  [
    "Businesses and money",
    "GLEIF entity search",
    "https://search.gleif.org/",
    "Legal Entity Identifiers and reference data",
    "Coverage depends on registration; check entity and renewal status.",
    "Use the registered name or an ID if available. Check the filing period and compare amended reports with the original."
  ],
  [
    "Licenses and credentials",
    "State occupational boards",
    "State licensing board or umbrella lookup",
    "License status, credential number, and public discipline",
    "Compare profession, jurisdiction, dates, and status.",
    "Search by credential number when available. If you use a name, confirm the profession and jurisdiction. Check the status and effective date."
  ],
  [
    "Licenses and credentials",
    "NPI Registry",
    "https://npiregistry.cms.hhs.gov/",
    "Healthcare provider identifiers and listed taxonomy",
    "An NPI is an identifier, not proof of active licensure.",
    "Enter the provider name and state or the 10-digit NPI. Compare the listed specialty and use the state board to verify licensure."
  ],
  [
    "Licenses and credentials",
    "FINRA BrokerCheck",
    "https://brokercheck.finra.org/",
    "Broker registration and disclosures",
    "Distinguish reported allegations from final dispositions.",
    "Search by credential number when available. If you use a name, confirm the profession and jurisdiction. Check the status and effective date."
  ],
  [
    "Licenses and credentials",
    "Investment adviser disclosures",
    "https://adviserinfo.sec.gov/",
    "Adviser and firm registrations and available disclosures",
    "Check registration history and filing dates.",
    "Search by credential number when available. If you use a name, confirm the profession and jurisdiction. Check the status and effective date."
  ],
  [
    "Licenses and credentials",
    "FCC Universal Licensing System",
    "https://www.fcc.gov/wireless/universal-licensing-system",
    "Public radio licenses, call signs, and applications",
    "Licenses can expire or change holders.",
    "Search by credential number when available. If you use a name, confirm the profession and jurisdiction. Check the status and effective date."
  ],
  [
    "Licenses and credentials",
    "State bar directories",
    "State bar association or licensing authority",
    "Admission, status, and available discipline records",
    "Confirm names and separate court admission from bar status.",
    "Search by credential number when available. If you use a name, confirm the profession and jurisdiction. Check the status and effective date."
  ],
  [
    "Licenses and credentials",
    "USPTO patent search",
    "https://ppubs.uspto.gov/pubwebapp/",
    "Patent publications, inventors, and assignees",
    "Inventorship and current ownership are different.",
    "Search by credential number when available. If you use a name, confirm the profession and jurisdiction. Check the status and effective date."
  ],
  [
    "Licenses and credentials",
    "USPTO trademark search",
    "https://tmsearch.uspto.gov/",
    "Trademark filings, owners listed at filing, and status",
    "Application does not establish registration or current ownership.",
    "Search by credential number when available. If you use a name, confirm the profession and jurisdiction. Check the status and effective date."
  ],
  [
    "Property and civic records",
    "Assessor parcel records",
    "County assessor or GIS portal",
    "Parcel characteristics, assessed value, and tax-year data",
    "Use for parcel research. Assessment data can lag deeds.",
    "Identify the city or county that holds the record. Use a parcel, permit, agenda item, or project number to narrow the search."
  ],
  [
    "Property and civic records",
    "Recorded deeds",
    "County recorder or land records office",
    "Recorded instruments and transfers",
    "Indexes may omit details; consult the recorded instrument.",
    "Use the county recorder’s index. Look for a document number, then open the deed and check the recording date and legal description."
  ],
  [
    "Property and civic records",
    "Building permits",
    "City or county permitting portal",
    "Applications, approved work, and inspection milestones",
    "Permit issuance does not prove completion.",
    "Identify the city or county that holds the record. Use a parcel, permit, agenda item, or project number to narrow the search."
  ],
  [
    "Property and civic records",
    "Planning and zoning files",
    "Local planning commission and zoning board",
    "Staff reports, rezoning, hearings, and conditions",
    "Check the adopted action and effective date.",
    "Identify the city or county that holds the record. Use a parcel, permit, agenda item, or project number to narrow the search."
  ],
  [
    "Property and civic records",
    "Public meeting packets",
    "City council, school board, or agency clerk",
    "Agendas, exhibits, votes, and minutes",
    "Draft agendas and approved minutes are different records.",
    "Identify the city or county that holds the record. Use a parcel, permit, agenda item, or project number to narrow the search."
  ],
  [
    "Property and civic records",
    "EPA ECHO",
    "https://echo.epa.gov/",
    "Facility compliance and enforcement records",
    "Check reporting date and program coverage.",
    "Identify the city or county that holds the record. Use a parcel, permit, agenda item, or project number to narrow the search."
  ],
  [
    "Property and civic records",
    "FEMA flood maps",
    "https://msc.fema.gov/portal/home",
    "Official flood hazard map products",
    "Use effective map date and local revisions.",
    "Identify the city or county that holds the record. Use a parcel, permit, agenda item, or project number to narrow the search."
  ],
  [
    "Property and civic records",
    "USGS maps",
    "https://www.usgs.gov/programs/national-geospatial-program",
    "Topographic maps and geographic data products",
    "Check scale, survey date, and coordinate reference system.",
    "Identify the city or county that holds the record. Use a parcel, permit, agenda item, or project number to narrow the search."
  ],
  [
    "Web and media",
    "Wayback Machine",
    "https://web.archive.org/",
    "Historical captures of public websites",
    "Missing captures do not prove a page did not exist.",
    "Paste the exact page URL. Select a date on the calendar and check the timestamp on the captured page."
  ],
  [
    "Web and media",
    "Common Crawl Index",
    "https://index.commoncrawl.org/",
    "Indexes of archived public web crawl captures",
    "Coverage and capture dates vary.",
    "Start with the original URL, domain, title, or file. Write down the date of the result and follow it back to the earliest available source."
  ],
  [
    "Web and media",
    "ICANN Registration Data Lookup",
    "https://lookup.icann.org/",
    "Public domain registration data",
    "Privacy services and redaction limit attribution.",
    "Start with the original URL, domain, title, or file. Write down the date of the result and follow it back to the earliest available source."
  ],
  [
    "Web and media",
    "Certificate Transparency",
    "https://crt.sh/",
    "Historical public TLS certificate names",
    "A certificate does not establish current control of a host.",
    "Start with the original URL, domain, title, or file. Write down the date of the result and follow it back to the earliest available source."
  ],
  [
    "Web and media",
    "DNS records",
    "https://dns.google/",
    "Published records for domains",
    "Records change. Save record type, timestamp, and resolver.",
    "Start with the original URL, domain, title, or file. Write down the date of the result and follow it back to the earliest available source."
  ],
  [
    "Web and media",
    "GitHub public search",
    "https://github.com/search",
    "Public project history, commits, and releases",
    "Usernames and commit author strings alone do not prove identity.",
    "Start with the original URL, domain, title, or file. Write down the date of the result and follow it back to the earliest available source."
  ],
  [
    "Web and media",
    "Google Lens",
    "https://lens.google/",
    "Visually similar images and pages where they appear",
    "Use earliest documented publication and verify image context.",
    "Start with the original URL, domain, title, or file. Write down the date of the result and follow it back to the earliest available source."
  ],
  [
    "Web and media",
    "ExifTool",
    "https://exiftool.org/",
    "Metadata from files you possess",
    "Metadata can be removed, edited, or copied between files.",
    "Start with the original URL, domain, title, or file. Write down the date of the result and follow it back to the earliest available source."
  ],
  [
    "Web and media",
    "Content Credentials",
    "https://contentcredentials.org/verify",
    "Available signed media provenance information",
    "A missing credential does not determine authenticity.",
    "Start with the original URL, domain, title, or file. Write down the date of the result and follow it back to the earliest available source."
  ],
  [
    "Web and media",
    "OpenStreetMap",
    "https://www.openstreetmap.org/",
    "Community map data and feature edit history",
    "Verify against authoritative maps where precision matters.",
    "Start with the original URL, domain, title, or file. Write down the date of the result and follow it back to the earliest available source."
  ],
  [
    "Web and media",
    "Library of Congress newspapers",
    "https://www.loc.gov/chronicling-america/",
    "Digitized historical U.S. newspaper pages",
    "OCR misses names; inspect the original scan.",
    "Start with the original URL, domain, title, or file. Write down the date of the result and follow it back to the earliest available source."
  ],
  [
    "Web and media",
    "Google Fact Check Explorer",
    "https://toolbox.google.com/factcheck/explorer",
    "Published fact checks indexed by Google",
    "Check the underlying claim and original evidence.",
    "Start with the original URL, domain, title, or file. Write down the date of the result and follow it back to the earliest available source."
  ],
  [
    "Archives and requests",
    "National Archives Catalog",
    "https://catalog.archives.gov/",
    "Descriptions and digitized U.S. federal archival records",
    "An index entry may require a separate request for the record.",
    "Start with the agency, collection, and date range. Try alternate spellings. Save the catalog or document identifier so you can find it again."
  ],
  [
    "Archives and requests",
    "FOIA.gov",
    "https://www.foia.gov/",
    "Federal agency FOIA contacts and request paths",
    "Check the agency’s reading room and scope; exemptions may apply.",
    "Look for the relevant agency’s reading room first. If the record is missing, identify the agency and describe the specific document and date range."
  ],
  [
    "Archives and requests",
    "State public records requests",
    "Agency records officer or state information portal",
    "Requestable state and local records",
    "Procedures vary. Name the record, date range, and agency.",
    "Start with the agency, collection, and date range. Try alternate spellings. Save the catalog or document identifier so you can find it again."
  ],
  [
    "Archives and requests",
    "Federal Register",
    "https://www.federalregister.gov/",
    "Federal notices, proposed rules, and published actions",
    "A proposed rule and final rule have different effects.",
    "Start with the agency, collection, and date range. Try alternate spellings. Save the catalog or document identifier so you can find it again."
  ],
  [
    "Archives and requests",
    "GovInfo",
    "https://www.govinfo.gov/",
    "Official federal publications and congressional material",
    "Record the edition, publication date, and page citation.",
    "Start with the agency, collection, and date range. Try alternate spellings. Save the catalog or document identifier so you can find it again."
  ],
  [
    "Archives and requests",
    "Congress.gov",
    "https://www.congress.gov/",
    "Bills, legislative history, members, and congressional records",
    "Introduced legislation is different from enacted law.",
    "Start with the agency, collection, and date range. Try alternate spellings. Save the catalog or document identifier so you can find it again."
  ],
  [
    "Archives and requests",
    "Data.gov",
    "https://data.gov/",
    "Federal open datasets and agency metadata",
    "Read field definitions, licensing, and update dates.",
    "Start with the agency, collection, and date range. Try alternate spellings. Save the catalog or document identifier so you can find it again."
  ],
  [
    "Archives and requests",
    "Local history collections",
    "Public libraries, state archives, and university special collections",
    "City directories, newspaper microfilm, photographs, and finding aids",
    "Catalog descriptions may be incomplete; inspect the original item.",
    "Start with the agency, collection, and date range. Try alternate spellings. Save the catalog or document identifier so you can find it again."
  ],
  [
    "International",
    "UK Companies House",
    "https://find-and-update.company-information.service.gov.uk/",
    "UK company filings, officers, and status",
    "Check company number and filings; names alone are ambiguous.",
    "Confirm the country and responsible registry. Use a registration number if you can, then check the filing date and local terminology."
  ],
  [
    "International",
    "UK Charity Commission",
    "https://register-of-charities.charitycommission.gov.uk/",
    "Charity registration and public filings for England and Wales",
    "Check jurisdiction and registered charity number.",
    "Confirm the country and responsible registry. Use a registration number if you can, then check the filing date and local terminology."
  ],
  [
    "International",
    "European business registers",
    "https://e-justice.europa.eu/",
    "Access points for participating national business registers",
    "Available fields and fees vary by country.",
    "Confirm the country and responsible registry. Use a registration number if you can, then check the filing date and local terminology."
  ],
  [
    "International",
    "EU procurement TED",
    "https://ted.europa.eu/",
    "Published European procurement notices and awards",
    "Match procurement identifiers and amendments.",
    "Confirm the country and responsible registry. Use a registration number if you can, then check the filing date and local terminology."
  ],
  [
    "International",
    "Canada federal corporations",
    "https://ised-isde.canada.ca/site/corporations-canada/en",
    "Federally incorporated entities and public records",
    "Provincial corporations may need a separate registry.",
    "Confirm the country and responsible registry. Use a registration number if you can, then check the filing date and local terminology."
  ],
  [
    "International",
    "Australian ABN Lookup",
    "https://abr.business.gov.au/",
    "Australian Business Number public information",
    "ABN status and corporate registration are different.",
    "Confirm the country and responsible registry. Use a registration number if you can, then check the filing date and local terminology."
  ],
  [
    "International",
    "OpenCorporates",
    "https://opencorporates.com/",
    "Cross-jurisdiction company index",
    "Use as a lead and confirm with the original registry.",
    "Confirm the country and responsible registry. Use a registration number if you can, then check the filing date and local terminology."
  ],
  [
    "International",
    "OpenSanctions",
    "https://www.opensanctions.org/",
    "Aggregated sanctions and public-interest datasets",
    "Verify the official listing and use multiple matching identifiers.",
    "Confirm the country and responsible registry. Use a registration number if you can, then check the filing date and local terminology."
  ],
  [
    "Live cameras",
    "Virginia 511 traffic cameras",
    "https://www.511virginia.org/",
    "Official Virginia roadway camera map, including Richmond-area highways",
    "Use to check roadway conditions. Feed refresh and coverage vary.",
    "Open the operator’s page and find the webcam list or turn on the camera layer. Choose a place or route and check when the image was updated."
  ],
  [
    "Live cameras",
    "NYC DOT traffic cameras",
    "https://webcams.nyctmc.org/",
    "New York City traffic camera map",
    "Coverage and availability vary. Follow the operator’s camera links.",
    "Open the operator’s page and find the webcam list or turn on the camera layer. Choose a place or route and check when the image was updated."
  ],
  [
    "Live cameras",
    "Caltrans QuickMap",
    "https://quickmap.dot.ca.gov/",
    "California highway camera and traffic layers",
    "Enable the camera layer. A still image may lag current conditions.",
    "Open the operator’s page and find the webcam list or turn on the camera layer. Choose a place or route and check when the image was updated."
  ],
  [
    "Live cameras",
    "WSDOT real-time travel map",
    "https://wsdot.com/Travel/Real-time/Map/",
    "Washington highway cameras and travel conditions",
    "Check camera timestamps and the operator’s incident information.",
    "Open the operator’s page and find the webcam list or turn on the camera layer. Choose a place or route and check when the image was updated."
  ],
  [
    "Live cameras",
    "Oregon TripCheck",
    "https://www.tripcheck.com/",
    "Oregon road and weather camera map",
    "Mountain pass and roadway coverage varies by location.",
    "Open the operator’s page and find the webcam list or turn on the camera layer. Choose a place or route and check when the image was updated."
  ],
  [
    "Live cameras",
    "Utah Traffic",
    "https://www.udottraffic.utah.gov/",
    "Utah road conditions and traffic cameras",
    "Cameras are subject to outages and maintenance.",
    "Open the operator’s page and find the webcam list or turn on the camera layer. Choose a place or route and check when the image was updated."
  ],
  [
    "Live cameras",
    "Colorado COtrip",
    "https://www.cotrip.org/",
    "Colorado highway and mountain pass camera map",
    "Check the camera timestamp before relying on an image.",
    "Open the operator’s page and find the webcam list or turn on the camera layer. Choose a place or route and check when the image was updated."
  ],
  [
    "Live cameras",
    "Texas DriveTexas",
    "https://drivetexas.org/",
    "Official Texas roadway condition map and available camera information",
    "Some locations have no camera view.",
    "Open the operator’s page and find the webcam list or turn on the camera layer. Choose a place or route and check when the image was updated."
  ],
  [
    "Live cameras",
    "Florida 511",
    "https://fl511.com/",
    "Florida highway camera and traffic map",
    "Availability can change during storms or outages.",
    "Open the operator’s page and find the webcam list or turn on the camera layer. Choose a place or route and check when the image was updated."
  ],
  [
    "Live cameras",
    "Pennsylvania 511PA",
    "https://www.511pa.com/",
    "Pennsylvania traffic camera and travel map",
    "Select the camera layer.",
    "Open the operator’s page and find the webcam list or turn on the camera layer. Choose a place or route and check when the image was updated."
  ],
  [
    "Live cameras",
    "New England 511",
    "https://newengland511.org/",
    "Regional road information and cameras for participating states",
    "Camera availability varies across the region.",
    "Open the operator’s page and find the webcam list or turn on the camera layer. Choose a place or route and check when the image was updated."
  ],
  [
    "Live cameras",
    "Mass511",
    "https://mass511.com/",
    "Massachusetts traffic cameras and travel map",
    "Use the map controls to show cameras.",
    "Open the operator’s page and find the webcam list or turn on the camera layer. Choose a place or route and check when the image was updated."
  ],
  [
    "Live cameras",
    "Alaska 511",
    "https://511.alaska.gov/",
    "Alaska road cameras and highway conditions",
    "Verify the last image update during severe weather.",
    "Open the operator’s page and find the webcam list or turn on the camera layer. Choose a place or route and check when the image was updated."
  ],
  [
    "Live cameras",
    "DriveBC webcams",
    "https://www.drivebc.ca/mobile/pub/webcams/",
    "British Columbia highway webcam index",
    "Images and refresh intervals differ by camera.",
    "Open the operator’s page and find the webcam list or turn on the camera layer. Choose a place or route and check when the image was updated."
  ],
  [
    "Live cameras",
    "NPS webcams",
    "https://www.nps.gov/subjects/parksandwebcams/webcams.htm",
    "National Park Service park and scenic webcam collection",
    "Some are live video and others are periodically refreshed images.",
    "Open the operator’s page and find the webcam list or turn on the camera layer. Choose a place or route and check when the image was updated."
  ],
  [
    "Live cameras",
    "Yellowstone webcams",
    "https://www.nps.gov/yell/learn/photosmultimedia/webcams.htm",
    "Official Yellowstone geyser and park views",
    "Temporary outages and seasonal availability apply.",
    "Open the operator’s page and find the webcam list or turn on the camera layer. Choose a place or route and check when the image was updated."
  ],
  [
    "Live cameras",
    "Yosemite webcams",
    "https://www.nps.gov/yose/learn/photosmultimedia/webcams.htm",
    "Official Yosemite scenic webcam links",
    "Weather, visibility, and refresh rates vary.",
    "Open the operator’s page and find the webcam list or turn on the camera layer. Choose a place or route and check when the image was updated."
  ],
  [
    "Live cameras",
    "USGS volcano webcams",
    "https://www.usgs.gov/programs/VHP/volcano-webcams",
    "Volcano monitoring camera directories",
    "View alongside official monitoring updates and image timestamps.",
    "Open the operator’s page and find the webcam list or turn on the camera layer. Choose a place or route and check when the image was updated."
  ],
  [
    "Live cameras",
    "Explore live nature cameras",
    "https://explore.org/livecams",
    "Operator-published wildlife and conservation streams",
    "Streams may switch to highlights or recorded footage.",
    "Open the operator’s page and find the webcam list or turn on the camera layer. Choose a place or route and check when the image was updated."
  ],
  [
    "Overlooked records",
    "OSHA workplace inspections",
    "https://www.osha.gov/ords/imis/establishment.html",
    "Find safety inspections and any citations for a specific workplace.",
    "An inspection is a snapshot. Open the citation and check whether its status or penalty changed.",
    "Enter the employer’s legal name, state, and inspection dates. Open an Activity Number to see the inspection and any citation details."
  ],
  [
    "Overlooked records",
    "USDA animal care inspections",
    "https://www.aphis.usda.gov/animal-care/awa-services/usda-animal-care-public-search-tool",
    "Find inspection reports for federally regulated animal exhibitors, dealers, and research facilities.",
    "A facility outside this federal program may have state or local records instead.",
    "Search by facility or certificate number. Read the inspection report and note the inspection date and any listed findings."
  ],
  [
    "Overlooked records",
    "Federal Audit Clearinghouse",
    "https://www.fac.gov/search-resources/",
    "Find audits showing how organizations handled federal grant money, including reported compliance problems.",
    "Check the year, federal program, and the organization’s response before drawing a conclusion.",
    "Start with the recipient name and audit year. Look for findings and the corrective action plan."
  ],
  [
    "Overlooked records",
    "NTSB investigation search",
    "https://my.ntsb.gov/basic",
    "Find public transportation accident investigations, reports, and supporting documents where available.",
    "An initial report can change. Look for a final report and probable-cause finding.",
    "Search by date, location, or accident number. Open the investigation and check its status."
  ],
  [
    "Overlooked records",
    "FCC broadcast public files",
    "https://publicfiles.fcc.gov/",
    "Find documents a broadcast station files about its operations, including some political advertising records.",
    "A request to buy airtime does not tell you whether an ad aired. Check later documents.",
    "Look up the station by call sign. Open its public file and browse the folder for the subject and year."
  ],
  [
    "Overlooked records",
    "NLRB case search",
    "https://www.nlrb.gov/search/case",
    "Find labor board case records, including representation cases and unfair labor practice proceedings.",
    "A charge begins a process. Read later decisions or closure records for the outcome.",
    "Search for the employer, union, or case number. Open the docket and read the latest activity."
  ],
  [
    "Overlooked records",
    "Labor union financial disclosures",
    "https://www.dol.gov/agencies/olms/public-disclosure-room",
    "Find covered unions’ public financial reports and certain related filings.",
    "Read the form instructions and reporting year. Some unions or filings may fall outside federal coverage.",
    "Search by union name, local number, or file number. Check the fiscal year and any amended report."
  ],
  [
    "Overlooked records",
    "GAO bid protest decisions",
    "https://www.gao.gov/legal/bid-protests/search",
    "Find published decisions on disputes about federal contract awards and solicitations.",
    "Published decisions cover individual protests. Some material may be redacted.",
    "Search the contractor, agency, solicitation number, or decision number. Read the decision’s result and reasoning."
  ],
  [
    "Overlooked records",
    "CFPB complaint database",
    "https://www.consumerfinance.gov/data-research/consumer-complaints/",
    "Find published consumer complaints and the company response categories for covered financial products.",
    "Complaints describe consumers’ experiences. Compare patterns with other evidence and consider company size.",
    "Filter by company, product, issue, and date. Check the complaint and response fields before comparing counts."
  ],
  [
    "Overlooked records",
    "Motor carrier safety records",
    "https://www.fmcsa.dot.gov/safety/company-safety-records",
    "Find public identification and safety information for regulated trucking and bus companies.",
    "Use the company’s USDOT number to distinguish similar names. Check the data’s reporting window.",
    "Search by USDOT number or legal name and open the company snapshot. Review the inspection and crash summary."
  ],
  [
    "Overlooked records",
    "EPA Toxics Release Inventory",
    "https://www.epa.gov/toxics-release-inventory-tri-program/tri-data-and-tools",
    "Find reported chemical releases and waste management activity at covered facilities.",
    "Reported quantities alone do not measure a person’s exposure or health risk.",
    "Search by facility, ZIP code, chemical, and year. Check which release or waste category the number belongs to."
  ],
  [
    "Overlooked records",
    "CPSC recalls",
    "https://www.cpsc.gov/Recalls",
    "Find consumer product recalls, affected models, hazards, and remedies.",
    "Similar products may have different model numbers or date codes.",
    "Search the product and manufacturer, then compare your exact model and date code to the notice."
  ]
];
