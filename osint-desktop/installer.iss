[Setup]
AppId=CandyLandOSINTWorkspace
AppName=CandyLand OSINT Workspace
AppVersion=0.1.0
DefaultDirName={localappdata}\Programs\CandyLandOSINT
DefaultGroupName=CandyLand OSINT
PrivilegesRequired=lowest
OutputDir=installer
OutputBaseFilename=CandyLand-OSINT-Setup
Compression=lzma2
SolidCompression=yes
UninstallDisplayIcon={app}\CandyLandOSINT.exe

[Files]
Source: "dist\CandyLandOSINT\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{group}\CandyLand OSINT"; Filename: "{app}\CandyLandOSINT.exe"
Name: "{userdesktop}\CandyLand OSINT"; Filename: "{app}\CandyLandOSINT.exe"; Tasks: desktopicon

[Tasks]
Name: desktopicon; Description: "Create a desktop shortcut"; Flags: unchecked
