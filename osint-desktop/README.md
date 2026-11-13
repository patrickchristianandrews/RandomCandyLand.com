# CandyLand OSINT Workspace: initial implementation

Source code, not a verified Windows installer. This local workspace is not the finished nationwide OSINT app.

## Included
Tk desktop UI, CSV import/filtering (10,000-record cap), record inspection, pairwise comparisons, selected-record candidate discovery, JSON evidence export, explicit-consent Census geocoding, and source links labeled manual/external. Matching uses uncalibrated heuristics, not validated identity probabilities. No automatic merges. Source identifiers and dates are retained when supplied.

## Not implemented or tested
No live nationwide property/court/voter adapters, publisher-specific CSV schema mapping, persistent database, merge/reject review management, dark-web search, bundled LLM, signing, automatic updates, or guaranteed nationwide coverage. Imported U.S. jurisdiction is not automatically validated. Records are in memory and are lost at exit unless included in an exported comparison. Exports are not encrypted. GUI, network integration and installer require Windows testing. No prebuilt installer is included in this source commit.

## Run
Python 3.12 with Tk: `python app.py` from this directory. No third-party runtime packages. Tests: `python -m unittest discover -s tests -v`. Input must be UTF-8 CSV with lowercase headers; use template.csv. Extra columns are retained. Native publisher downloads require schema conversion.

## Build on Windows
Install Python 3.12 and Inno Setup 6. Run:
1. `python -m pip install -r requirements-build.txt`
2. `python -m unittest discover -s tests -v`
3. `python -m PyInstaller --noconfirm --clean --windowed --onedir --name CandyLandOSINT app.py`
4. Compile installer.iss using Inno Setup.

The setup executable installs per user without requiring a separate Python installation. It is unsigned; Windows warnings are possible. Test install, launch, import, comparisons, export, networking and uninstall before distribution.

## GitHub build
The manually triggered workflow builds an installer artifact on Windows. It does not publish a release or run on push. Runner tools and account quotas apply; no paid fallback is configured. A successful build is not proof of GUI correctness. If the workflow is unavailable on this non-default branch, it may need to be merged into the default branch after separate review.

## Data handling
Use lawfully obtained records and check source-specific automation, reuse and redistribution permissions. Exclude protected and unauthorized leaked records. Voter rules differ by state. Shared addresses and phones do not establish identity. Ownership is not residence; case participation is not a conviction. Do not use this prototype for consequential eligibility decisions. No telemetry is implemented. External links open the system browser; geocoding sends only the confirmed input address to Census. The source directory is not evidence of nationwide coverage.
