# IT Admin Toolkit by BrokenTools

A free Windows 10/11 program for IT support: system repairs, disk cleanup, security checks, network tools and reports in one window. Available in English, Greek, Spanish and Russian.

- **Download:** see the [latest release](../../releases/latest) (Setup installer or Portable).
- **What every button does:** https://brokentools.org/en/toolkit-help
- More free tools: https://brokentools.org

## Safety
Every button runs one fixed command chosen by the program. There is no free command line, and host/port boxes accept only safe characters. The program asks for administrator rights because repairs need them.

## Windows SmartScreen
The program is new and not yet code-signed, so Windows may show a blue warning. Click *More info*, then *Run anyway*. You can also scan the files with VirusTotal.

SHA-256:
```
946168b677dc904296b00913bfccfee7af441c42d004ab227601633268d132b0  IT-Admin-Toolkit-2.3.0-Setup.exe
5f3eb64586cb4c62d4d3d25addb815d6ff2d91a957b25c44c82aa63d4331f891  IT-Admin-Toolkit-2.3.0-Portable.exe
```

## Build from source
```
npm install
npm run build:win
```
Licensed under GPL-3.0.
