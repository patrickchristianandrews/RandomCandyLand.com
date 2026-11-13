const SOURCES = [
  [
    "Identity and provenance",
    "Official biographies",
    "Employer, university, or agency staff pages",
    "Role, affiliation, and dates published by the institution",
    "Titles can lag changes; compare dated announcements and public filings."
  ],
  [
    "Identity and provenance",
    "Public testimony",
    "Committee hearing pages and meeting minutes",
    "Statements attributed to a named speaker and role",
    "Read the agenda, transcript, and date together."
  ],
  [
    "Identity and provenance",
    "ORCID",
    "https://orcid.org/orcid-search/search",
    "Researcher IDs, works, and claimed affiliations",
    "Some entries are self-reported; verify against publishers."
  ],
  [
    "Identity and provenance",
    "Crossref",
    "https://search.crossref.org/",
    "DOIs, publication dates, coauthors, and corrections",
    "Author names can collide; verify affiliations and ORCID."
  ],
  [
    "Identity and provenance",
    "OpenAlex",
    "https://openalex.org/",
    "Research output, affiliations, and citation trails",
    "Algorithmic author matches can merge unrelated people."
  ],
  [
    "Identity and provenance",
    "Public awards and fellowships",
    "Issuing organization’s announcements and annual reports",
    "Award recipients, dates, and professional context",
    "Confirm the award and year with the issuer."
  ],
  [
    "Identity and provenance",
    "Conference programs",
    "Conference organizer or proceedings archive",
    "Talk title, presenter, employer, and event date",
    "A scheduled appearance does not establish attendance."
  ],
  [
    "Identity and provenance",
    "Obituaries and historical notices",
    "Library newspaper archives or publisher",
    "Historical dates and biographical leads",
    "Cross-check before treating relationships or dates as established."
  ],
  [
    "Courts and enforcement",
    "Federal court records",
    "https://pacer.uscourts.gov/",
    "Federal dockets and available filings",
    "Account and fees may apply. Allegations and outcomes are distinct."
  ],
  [
    "Courts and enforcement",
    "CourtListener RECAP",
    "https://www.courtlistener.com/recap/",
    "Copies of federal dockets and selected documents",
    "Coverage is incomplete. Confirm against the official docket."
  ],
  [
    "Courts and enforcement",
    "State and local court portals",
    "State judiciary and county clerk",
    "Civil, criminal, probate, and other public docket indexes",
    "Coverage, identifiers, and access vary; distinguish filing and disposition."
  ],
  [
    "Courts and enforcement",
    "Published opinions",
    "https://www.govinfo.gov/app/collection/USCOURTS",
    "Published opinions from participating federal courts",
    "An opinion is only one part of the docket."
  ],
  [
    "Courts and enforcement",
    "Administrative decisions",
    "Issuing regulator or agency adjudication archive",
    "Findings, orders, and sanctions",
    "Check appeals, amendments, and whether an order is final."
  ],
  [
    "Courts and enforcement",
    "DOJ releases",
    "https://www.justice.gov/news",
    "Public announcements of federal enforcement actions",
    "An announcement can describe an allegation. Check docket outcomes."
  ],
  [
    "Courts and enforcement",
    "FTC case library",
    "https://www.ftc.gov/legal-library/browse/cases-proceedings",
    "Public complaints, settlements, and enforcement orders",
    "Compare complaint, order, and current case status."
  ],
  [
    "Courts and enforcement",
    "SEC enforcement",
    "https://www.sec.gov/enforcement-litigation",
    "Public securities enforcement actions and orders",
    "Confirm role, date, and whether a finding was contested."
  ],
  [
    "Courts and enforcement",
    "Bankruptcy notices and dockets",
    "https://pacer.uscourts.gov/",
    "Case numbers, filings, and case status",
    "Verify legal entity and jurisdiction; filing and discharge are separate."
  ],
  [
    "Courts and enforcement",
    "Inspector general reports",
    "https://www.oversight.gov/",
    "Audits and investigations made public by federal inspectors general",
    "Read methodology, agency response, and publication date."
  ],
  [
    "Businesses and money",
    "State corporation registries",
    "Secretary of State business entity search",
    "Entity names, status, filing dates, and public roles",
    "Registered agent, officer, and owner are different roles."
  ],
  [
    "Businesses and money",
    "SEC EDGAR",
    "https://www.sec.gov/edgar/search/",
    "Public-company filings, officers, ownership disclosures, and exhibits",
    "Match entity using CIK, then compare original and amended filings."
  ],
  [
    "Businesses and money",
    "IRS exempt organizations",
    "https://www.irs.gov/charities-non-profits/tax-exempt-organization-search",
    "Tax-exempt status and available Form 990 filings",
    "Use EIN and tax year; posting may lag."
  ],
  [
    "Businesses and money",
    "USAspending",
    "https://www.usaspending.gov/",
    "Federal awards, recipients, and spending records",
    "Obligation, award ceiling, and actual spending differ."
  ],
  [
    "Businesses and money",
    "SAM.gov",
    "https://sam.gov/",
    "Contract opportunities, entity information, and exclusions",
    "Use identifiers and effective dates; review access conditions."
  ],
  [
    "Businesses and money",
    "Federal lobbying disclosures",
    "https://lda.senate.gov/",
    "Lobbying registrations and periodic reports",
    "A listed issue or client does not show a meeting occurred."
  ],
  [
    "Businesses and money",
    "FEC campaign finance",
    "https://www.fec.gov/data/",
    "Federal committee filings and campaign finance records",
    "Review amendments; protect unnecessary personal details."
  ],
  [
    "Businesses and money",
    "State campaign finance",
    "State election or ethics agency",
    "State candidate and committee filings",
    "Reporting thresholds and coverage vary."
  ],
  [
    "Businesses and money",
    "Local contracting",
    "County procurement portal or city clerk",
    "Solicitations, awards, bid tabs, and change orders",
    "Compare bid, signed contract, and later amendments."
  ],
  [
    "Businesses and money",
    "Public audits",
    "State auditor, local auditor, or agency financial reports",
    "Audit findings, findings responses, and public financial statements",
    "Check period and whether the agency resolved the finding."
  ],
  [
    "Businesses and money",
    "UCC filings",
    "State filing office",
    "Public financing statements and filing history",
    "A filing alone does not establish debt amount or current balance."
  ],
  [
    "Businesses and money",
    "GLEIF entity search",
    "https://search.gleif.org/",
    "Legal Entity Identifiers and reference data",
    "Coverage depends on registration; check entity and renewal status."
  ],
  [
    "Licenses and credentials",
    "State occupational boards",
    "State licensing board or umbrella lookup",
    "License status, credential number, and public discipline",
    "Compare profession, jurisdiction, dates, and status."
  ],
  [
    "Licenses and credentials",
    "NPI Registry",
    "https://npiregistry.cms.hhs.gov/",
    "Healthcare provider identifiers and listed taxonomy",
    "An NPI is an identifier, not proof of active licensure."
  ],
  [
    "Licenses and credentials",
    "FINRA BrokerCheck",
    "https://brokercheck.finra.org/",
    "Broker registration and disclosures",
    "Distinguish reported allegations from final dispositions."
  ],
  [
    "Licenses and credentials",
    "Investment adviser disclosures",
    "https://adviserinfo.sec.gov/",
    "Adviser and firm registrations and available disclosures",
    "Check registration history and filing dates."
  ],
  [
    "Licenses and credentials",
    "FCC Universal Licensing System",
    "https://www.fcc.gov/wireless/universal-licensing-system",
    "Public radio licenses, call signs, and applications",
    "Licenses can expire or change holders."
  ],
  [
    "Licenses and credentials",
    "State bar directories",
    "State bar association or licensing authority",
    "Admission, status, and available discipline records",
    "Confirm names and separate court admission from bar status."
  ],
  [
    "Licenses and credentials",
    "USPTO patent search",
    "https://ppubs.uspto.gov/pubwebapp/",
    "Patent publications, inventors, and assignees",
    "Inventorship and current ownership are different."
  ],
  [
    "Licenses and credentials",
    "USPTO trademark search",
    "https://tmsearch.uspto.gov/",
    "Trademark filings, owners listed at filing, and status",
    "Application does not establish registration or current ownership."
  ],
  [
    "Property and civic records",
    "Assessor parcel records",
    "County assessor or GIS portal",
    "Parcel characteristics, assessed value, and tax-year data",
    "Use for parcel research. Assessment data can lag deeds."
  ],
  [
    "Property and civic records",
    "Recorded deeds",
    "County recorder or land records office",
    "Recorded instruments and transfers",
    "Indexes may omit details; consult the recorded instrument."
  ],
  [
    "Property and civic records",
    "Building permits",
    "City or county permitting portal",
    "Applications, approved work, and inspection milestones",
    "Permit issuance does not prove completion."
  ],
  [
    "Property and civic records",
    "Planning and zoning files",
    "Local planning commission and zoning board",
    "Staff reports, rezoning, hearings, and conditions",
    "Check the adopted action and effective date."
  ],
  [
    "Property and civic records",
    "Public meeting packets",
    "City council, school board, or agency clerk",
    "Agendas, exhibits, votes, and minutes",
    "Draft agendas and approved minutes are different records."
  ],
  [
    "Property and civic records",
    "EPA ECHO",
    "https://echo.epa.gov/",
    "Facility compliance and enforcement records",
    "Check reporting date and program coverage."
  ],
  [
    "Property and civic records",
    "FEMA flood maps",
    "https://msc.fema.gov/portal/home",
    "Official flood hazard map products",
    "Use effective map date and local revisions."
  ],
  [
    "Property and civic records",
    "USGS maps",
    "https://www.usgs.gov/programs/national-geospatial-program",
    "Topographic maps and geographic data products",
    "Check scale, survey date, and coordinate reference system."
  ],
  [
    "Web and media",
    "Wayback Machine",
    "https://web.archive.org/",
    "Historical captures of public websites",
    "Missing captures do not prove a page did not exist."
  ],
  [
    "Web and media",
    "Common Crawl Index",
    "https://index.commoncrawl.org/",
    "Indexes of archived public web crawl captures",
    "Coverage and capture dates vary."
  ],
  [
    "Web and media",
    "ICANN Registration Data Lookup",
    "https://lookup.icann.org/",
    "Public domain registration data",
    "Privacy services and redaction limit attribution."
  ],
  [
    "Web and media",
    "Certificate Transparency",
    "https://crt.sh/",
    "Historical public TLS certificate names",
    "A certificate does not establish current control of a host."
  ],
  [
    "Web and media",
    "DNS records",
    "https://dns.google/",
    "Published records for domains",
    "Records change. Save record type, timestamp, and resolver."
  ],
  [
    "Web and media",
    "GitHub public search",
    "https://github.com/search",
    "Public project history, commits, and releases",
    "Usernames and commit author strings alone do not prove identity."
  ],
  [
    "Web and media",
    "Google Lens",
    "https://lens.google/",
    "Visually similar images and pages where they appear",
    "Use earliest documented publication and verify image context."
  ],
  [
    "Web and media",
    "ExifTool",
    "https://exiftool.org/",
    "Metadata from files you possess",
    "Metadata can be removed, edited, or copied between files."
  ],
  [
    "Web and media",
    "Content Credentials",
    "https://contentcredentials.org/verify",
    "Available signed media provenance information",
    "A missing credential does not determine authenticity."
  ],
  [
    "Web and media",
    "OpenStreetMap",
    "https://www.openstreetmap.org/",
    "Community map data and feature edit history",
    "Verify against authoritative maps where precision matters."
  ],
  [
    "Web and media",
    "Library of Congress newspapers",
    "https://www.loc.gov/chronicling-america/",
    "Digitized historical U.S. newspaper pages",
    "OCR misses names; inspect the original scan."
  ],
  [
    "Web and media",
    "Google Fact Check Explorer",
    "https://toolbox.google.com/factcheck/explorer",
    "Published fact checks indexed by Google",
    "Check the underlying claim and original evidence."
  ],
  [
    "Archives and requests",
    "National Archives Catalog",
    "https://catalog.archives.gov/",
    "Descriptions and digitized U.S. federal archival records",
    "An index entry may require a separate request for the record."
  ],
  [
    "Archives and requests",
    "FOIA.gov",
    "https://www.foia.gov/",
    "Federal agency FOIA contacts and request paths",
    "Check the agency’s reading room and scope; exemptions may apply."
  ],
  [
    "Archives and requests",
    "State public records requests",
    "Agency records officer or state information portal",
    "Requestable state and local records",
    "Procedures vary. Name the record, date range, and agency."
  ],
  [
    "Archives and requests",
    "Federal Register",
    "https://www.federalregister.gov/",
    "Federal notices, proposed rules, and published actions",
    "A proposed rule and final rule have different effects."
  ],
  [
    "Archives and requests",
    "GovInfo",
    "https://www.govinfo.gov/",
    "Official federal publications and congressional material",
    "Record the edition, publication date, and page citation."
  ],
  [
    "Archives and requests",
    "Congress.gov",
    "https://www.congress.gov/",
    "Bills, legislative history, members, and congressional records",
    "Introduced legislation is different from enacted law."
  ],
  [
    "Archives and requests",
    "Data.gov",
    "https://data.gov/",
    "Federal open datasets and agency metadata",
    "Read field definitions, licensing, and update dates."
  ],
  [
    "Archives and requests",
    "Local history collections",
    "Public libraries, state archives, and university special collections",
    "City directories, newspaper microfilm, photographs, and finding aids",
    "Catalog descriptions may be incomplete; inspect the original item."
  ],
  [
    "International",
    "UK Companies House",
    "https://find-and-update.company-information.service.gov.uk/",
    "UK company filings, officers, and status",
    "Check company number and filings; names alone are ambiguous."
  ],
  [
    "International",
    "UK Charity Commission",
    "https://register-of-charities.charitycommission.gov.uk/",
    "Charity registration and public filings for England and Wales",
    "Check jurisdiction and registered charity number."
  ],
  [
    "International",
    "European business registers",
    "https://e-justice.europa.eu/",
    "Access points for participating national business registers",
    "Available fields and fees vary by country."
  ],
  [
    "International",
    "EU procurement TED",
    "https://ted.europa.eu/",
    "Published European procurement notices and awards",
    "Match procurement identifiers and amendments."
  ],
  [
    "International",
    "Canada federal corporations",
    "https://ised-isde.canada.ca/site/corporations-canada/en",
    "Federally incorporated entities and public records",
    "Provincial corporations may need a separate registry."
  ],
  [
    "International",
    "Australian ABN Lookup",
    "https://abr.business.gov.au/",
    "Australian Business Number public information",
    "ABN status and corporate registration are different."
  ],
  [
    "International",
    "OpenCorporates",
    "https://opencorporates.com/",
    "Cross-jurisdiction company index",
    "Use as a lead and confirm with the original registry."
  ],
  [
    "International",
    "OpenSanctions",
    "https://www.opensanctions.org/",
    "Aggregated sanctions and public-interest datasets",
    "Verify the official listing and use multiple matching identifiers."
  ],
  [
    "Live cameras",
    "Virginia 511 traffic cameras",
    "https://www.511virginia.org/",
    "Official Virginia roadway camera map, including Richmond-area highways",
    "Use to check roadway conditions. Feed refresh and coverage vary."
  ],
  [
    "Live cameras",
    "NYC DOT traffic cameras",
    "https://webcams.nyctmc.org/",
    "New York City traffic camera map",
    "Coverage and availability vary. Follow the operator’s camera links."
  ],
  [
    "Live cameras",
    "Caltrans QuickMap",
    "https://quickmap.dot.ca.gov/",
    "California highway camera and traffic layers",
    "Enable the camera layer. A still image may lag current conditions."
  ],
  [
    "Live cameras",
    "WSDOT real-time travel map",
    "https://wsdot.com/Travel/Real-time/Map/",
    "Washington highway cameras and travel conditions",
    "Check camera timestamps and the operator’s incident information."
  ],
  [
    "Live cameras",
    "Oregon TripCheck",
    "https://www.tripcheck.com/",
    "Oregon road and weather camera map",
    "Mountain pass and roadway coverage varies by location."
  ],
  [
    "Live cameras",
    "Utah Traffic",
    "https://www.udottraffic.utah.gov/",
    "Utah road conditions and traffic cameras",
    "Cameras are subject to outages and maintenance."
  ],
  [
    "Live cameras",
    "Colorado COtrip",
    "https://www.cotrip.org/",
    "Colorado highway and mountain pass camera map",
    "Check the camera timestamp before relying on an image."
  ],
  [
    "Live cameras",
    "Texas DriveTexas",
    "https://drivetexas.org/",
    "Official Texas roadway condition map and available camera information",
    "Some locations have no camera view."
  ],
  [
    "Live cameras",
    "Florida 511",
    "https://fl511.com/",
    "Florida highway camera and traffic map",
    "Availability can change during storms or outages."
  ],
  [
    "Live cameras",
    "Pennsylvania 511PA",
    "https://www.511pa.com/",
    "Pennsylvania traffic camera and travel map",
    "Select the camera layer."
  ],
  [
    "Live cameras",
    "New England 511",
    "https://newengland511.org/",
    "Regional road information and cameras for participating states",
    "Camera availability varies across the region."
  ],
  [
    "Live cameras",
    "Mass511",
    "https://mass511.com/",
    "Massachusetts traffic cameras and travel map",
    "Use the map controls to show cameras."
  ],
  [
    "Live cameras",
    "Alaska 511",
    "https://511.alaska.gov/",
    "Alaska road cameras and highway conditions",
    "Verify the last image update during severe weather."
  ],
  [
    "Live cameras",
    "DriveBC webcams",
    "https://www.drivebc.ca/mobile/pub/webcams/",
    "British Columbia highway webcam index",
    "Images and refresh intervals differ by camera."
  ],
  [
    "Live cameras",
    "NPS webcams",
    "https://www.nps.gov/subjects/parksandwebcams/webcams.htm",
    "National Park Service park and scenic webcam collection",
    "Some are live video and others are periodically refreshed images."
  ],
  [
    "Live cameras",
    "Yellowstone webcams",
    "https://www.nps.gov/yell/learn/photosmultimedia/webcams.htm",
    "Official Yellowstone geyser and park views",
    "Temporary outages and seasonal availability apply."
  ],
  [
    "Live cameras",
    "Yosemite webcams",
    "https://www.nps.gov/yose/learn/photosmultimedia/webcams.htm",
    "Official Yosemite scenic webcam links",
    "Weather, visibility, and refresh rates vary."
  ],
  [
    "Live cameras",
    "USGS volcano webcams",
    "https://www.usgs.gov/programs/VHP/volcano-webcams",
    "Volcano monitoring camera directories",
    "View alongside official monitoring updates and image timestamps."
  ],
  [
    "Live cameras",
    "Explore live nature cameras",
    "https://explore.org/livecams",
    "Operator-published wildlife and conservation streams",
    "Streams may switch to highlights or recorded footage."
  ]
];
