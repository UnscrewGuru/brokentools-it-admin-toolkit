/*
 * Λίστα ΕΠΙΤΡΕΠΤΩΝ ενεργειών.
 * Η σελίδα (UI) στέλνει μόνο το id μιας ενέργειας. Καμία ελεύθερη εντολή δεν εκτελείται.
 * Παράμετροι (host, port, πακέτο) ελέγχονται εδώ πριν μπουν σε εντολή.
 *   { cmd: '...' }  -> τρέχει με cmd.exe
 *   { ps:  '...' }  -> τρέχει με PowerShell (EncodedCommand)
 *   confirm: true   -> ζητά επιβεβαίωση από το κύριο πρόγραμμα
 */
const R = String.raw;

const C = (cmd, confirm = false) => ({ cmd, confirm });
const P = (ps, confirm = false) => ({ ps, confirm });
const FT = '| Format-Table -AutoSize | Out-String -Width 220';
const FL = '| Format-List | Out-String -Width 220';

function host(params, fallback) {
  const h = String((params && params.host) || '').trim() || fallback;
  const dns = /^[A-Za-z0-9]([A-Za-z0-9.-]{0,251}[A-Za-z0-9])?$/;
  const v6 = /^[0-9A-Fa-f:]{2,45}$/;
  if (!dns.test(h) && !v6.test(h)) throw new Error('Invalid host / Μη έγκυρο host');
  return h;
}
function port(params) {
  const n = Number(params && params.port);
  if (!Number.isInteger(n) || n < 1 || n > 65535) throw new Error('Invalid port / Μη έγκυρη θύρα (1-65535)');
  return n;
}

/* Επιτρεπτά πακέτα winget (κλειδί -> id) */
const PACKAGES = {
  '7zip': '7zip.7zip',
  chrome: 'Google.Chrome',
  firefox: 'Mozilla.Firefox',
  notepadpp: 'Notepad++.Notepad++',
  powertoys: 'Microsoft.PowerToys',
  vlc: 'VideoLAN.VLC',
  treesize: 'JAMSoftware.TreeSize.Free',
  acrobat: 'Adobe.Acrobat.Reader.64-bit'
};

const DESKTOP = R`[Environment]::GetFolderPath('Desktop')`;

const COMMANDS = {
  /* ---- Επιδιόρθωση ---- */
  sfc: { cmd: 'sfc /scannow', confirm: false, utf16: true },
  dism: C('DISM /Online /Cleanup-Image /RestoreHealth'),
  chkdsk: C('chkdsk C: /scan'),
  restore_point: P(`Enable-ComputerRestore -Drive 'C:\\' -ErrorAction SilentlyContinue; Checkpoint-Computer -Description 'BrokenTools Toolkit' -RestorePointType MODIFY_SETTINGS; 'OK: restore point requested (Windows allows 1 per 24h by default).'`),

  /* ---- Γρήγορες διορθώσεις ---- */
  fix_spooler: C(R`net stop spooler & del /Q /F /S "%systemroot%\System32\Spool\Printers\*.*" & net start spooler & echo [OK] Print Spooler reset`, true),
  reset_wua: C('net stop wuauserv & net stop bits & net stop cryptsvc & net start wuauserv & net start bits & net start cryptsvc & echo [OK] Windows Update services restarted', true),
  gpupdate: C('gpupdate /force'),
  rebuild_icons: C(R`ie4uinit.exe -show & taskkill /IM explorer.exe /F & del /A /F /Q "%localappdata%\IconCache.db" & del /A /F /Q "%localappdata%\Microsoft\Windows\Explorer\iconcache*" & start explorer.exe & echo [OK] Icon cache rebuilt`, true),
  sync_time: C('net start w32time & w32tm /resync /force'),

  /* ---- Προγράμματα ---- */
  winget_all: C('winget upgrade --all --include-unknown --accept-package-agreements --accept-source-agreements'),
  winget_install: {
    confirm: false,
    build(params) {
      const id = PACKAGES[String(params && params.pkg)];
      if (!id) throw new Error('Package not allowed / Μη επιτρεπτό πακέτο');
      return { cmd: `winget install --id ${id} -e --silent --accept-package-agreements --accept-source-agreements` };
    }
  },
  installed: P(R`Get-ItemProperty 'HKLM:\Software\Microsoft\Windows\CurrentVersion\Uninstall\*','HKLM:\Software\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall\*' -ErrorAction SilentlyContinue | Where-Object DisplayName | Sort-Object DisplayName -Unique | Select-Object DisplayName,DisplayVersion,Publisher ${FT}`),
  startup_list: P(`Get-CimInstance Win32_StartupCommand | Select-Object Name,Command,Location,User ${FL}`),
  startup_settings: C('start "" ms-settings:startupapps'),

  /* ---- Hardware ---- */
  hw_bios: P(`Get-CimInstance Win32_BIOS | Select-Object Manufacturer,SMBIOSBIOSVersion,SerialNumber,ReleaseDate ${FL}; Get-CimInstance Win32_ComputerSystem | Select-Object Manufacturer,Model,Name ${FL}`),
  hw_key: P(`$k=(Get-CimInstance SoftwareLicensingService).OA3xOriginalProductKey; if($k){'OEM Product Key: '+$k}else{'No OEM key embedded in BIOS/UEFI.'}`),
  hw_disk: P(`Get-PhysicalDisk | Select-Object FriendlyName,MediaType,OperationalStatus,HealthStatus,@{N='Size(GB)';E={[math]::Round($_.Size/1GB,1)}} ${FT}`),
  hw_battery: C(R`powercfg /batteryreport /output "%temp%\battery_report.html" && start "" "%temp%\battery_report.html"`),
  hw_errors: P(`Get-WinEvent -FilterHashtable @{LogName='System';Level=1,2} -MaxEvents 10 -ErrorAction SilentlyContinue | Select-Object TimeCreated,ProviderName,Id,Message ${FL}`),
  hw_specs: P(`Get-CimInstance Win32_Processor | Select-Object Name,NumberOfCores,NumberOfLogicalProcessors ${FL}; Get-CimInstance Win32_OperatingSystem | Select-Object Caption,Version,LastBootUpTime,@{N='TotalRAM(GB)';E={[math]::Round($_.TotalVisibleMemorySize/1MB,1)}},@{N='FreeRAM(GB)';E={[math]::Round($_.FreePhysicalMemory/1MB,1)}} ${FL}`),
  activation: P(`Get-CimInstance SoftwareLicensingProduct -Filter "PartialProductKey IS NOT NULL AND ApplicationId='55c92734-d682-4d71-983e-d6ec3f16059f'" | Select-Object Name,@{N='Status';E={switch($_.LicenseStatus){0{'Unlicensed'}1{'Licensed'}2{'Grace'}3{'Grace'}4{'Grace'}5{'Notification'}6{'Extended grace'}default{'Unknown'}}}} ${FL}`),
  sys_report: P([
    `$d=${DESKTOP}; $f=Join-Path $d ('SystemReport-'+$env:COMPUTERNAME+'-'+(Get-Date -Format 'yyyyMMdd-HHmm')+'.txt')`,
    `$o=@(); $o+='=== SYSTEM REPORT (BrokenTools Toolkit) ==='; $o+=('Date: '+(Get-Date)); $o+=('Computer: '+$env:COMPUTERNAME+'  User: '+$env:USERNAME)`,
    `$o+=(Get-CimInstance Win32_ComputerSystem | Select-Object Manufacturer,Model,TotalPhysicalMemory ${FL})`,
    `$o+=(Get-CimInstance Win32_BIOS | Select-Object SMBIOSBIOSVersion,SerialNumber ${FL})`,
    `$o+=(Get-CimInstance Win32_OperatingSystem | Select-Object Caption,Version,OSArchitecture,InstallDate,LastBootUpTime ${FL})`,
    `$o+=(Get-CimInstance Win32_Processor | Select-Object Name,NumberOfCores,NumberOfLogicalProcessors ${FL})`,
    `$o+=(Get-CimInstance Win32_VideoController | Select-Object Name,DriverVersion ${FL})`,
    `$o+=(Get-PhysicalDisk | Select-Object FriendlyName,MediaType,HealthStatus,Size ${FT})`,
    `$o+=(Get-Volume | Where-Object DriveLetter | Select-Object DriveLetter,FileSystemLabel,Size,SizeRemaining ${FT})`,
    `$o+=(Get-NetIPConfiguration | Select-Object InterfaceAlias,@{N='IPv4';E={$_.IPv4Address.IPAddress}},@{N='Gateway';E={$_.IPv4DefaultGateway.NextHop}} ${FT})`,
    `$o | Out-File -FilePath $f -Encoding utf8; 'Report saved: '+$f; Start-Process explorer.exe ('/select,"'+$f+'"')`
  ].join('; ')),

  /* ---- Δίσκος & αρχεία ---- */
  disk_space: P(`Get-Volume | Where-Object DriveLetter | Select-Object DriveLetter,FileSystemLabel,@{N='Size(GB)';E={[math]::Round($_.Size/1GB,1)}},@{N='Free(GB)';E={[math]::Round($_.SizeRemaining/1GB,1)}},@{N='Free%';E={if($_.Size){[math]::Round(100*$_.SizeRemaining/$_.Size)}}} ${FT}`),
  large_files: P(`Get-ChildItem $env:USERPROFILE -Recurse -File -Force -ErrorAction SilentlyContinue | Where-Object { $_.Length -gt 100MB } | Sort-Object Length -Descending | Select-Object -First 25 @{N='MB';E={[math]::Round($_.Length/1MB)}},FullName ${FT}`),
  big_folders: P(`Get-ChildItem $env:USERPROFILE -Directory -Force -ErrorAction SilentlyContinue | ForEach-Object { $s=(Get-ChildItem $_.FullName -Recurse -File -Force -ErrorAction SilentlyContinue | Measure-Object Length -Sum).Sum; [PSCustomObject]@{GB=[math]::Round($s/1GB,2);Folder=$_.Name} } | Sort-Object GB -Descending ${FT}`),
  cleanmgr: C('start "" cleanmgr'),
  drivers_list: P(`Get-CimInstance Win32_PnPSignedDriver | Where-Object DeviceName | Sort-Object DeviceName | Select-Object -First 400 DeviceName,DriverVersion,Manufacturer ${FT}`),
  drivers_export: P(`$d=Join-Path ${DESKTOP} ('DriversBackup-'+(Get-Date -Format 'yyyyMMdd-HHmm')); New-Item -ItemType Directory -Path $d -Force | Out-Null; Export-WindowsDriver -Online -Destination $d | Out-Null; 'Drivers exported to: '+$d`),

  /* ---- Ασφάλεια & χρήστες ---- */
  defender_status: P(`Get-MpComputerStatus | Select-Object AMServiceEnabled,RealTimeProtectionEnabled,AntivirusSignatureLastUpdated,QuickScanEndTime ${FL}`),
  defender_update: P(`Update-MpSignature; 'OK'`),
  defender_scan: P(`Start-MpScan -ScanType QuickScan; 'Quick scan finished.'`),
  firewall: P(`Get-NetFirewallProfile | Select-Object Name,Enabled ${FT}`),
  bitlocker: C('manage-bde -status'),
  local_users: P(`Get-LocalUser | Select-Object Name,Enabled,LastLogon ${FT}`),
  local_admins: P(`Get-LocalGroupMember -SID S-1-5-32-544 | Select-Object Name,ObjectClass ${FT}`),
  sched_tasks: P(R`Get-ScheduledTask | Where-Object { $_.TaskPath -notlike '\Microsoft\*' } | Select-Object TaskName,State,TaskPath ${FT}`),

  /* ---- Δίκτυο ---- */
  ping: { build: (p) => ({ cmd: `ping ${host(p, '8.8.8.8')}` }) },
  tracert: { build: (p) => ({ cmd: `tracert -d ${host(p, '8.8.8.8')}` }) },
  nslookup: { build: (p) => ({ cmd: `nslookup ${host(p, 'google.com')}` }) },
  port_test: { build: (p) => ({ ps: `$r=Test-NetConnection -ComputerName '${host(p, '8.8.8.8')}' -Port ${port(p)} -WarningAction SilentlyContinue; $r | Select-Object ComputerName,RemotePort,TcpTestSucceeded ${FL}` }) },
  net_wifi: P(R`$t=Join-Path $env:TEMP ('wifi'+[guid]::NewGuid().ToString('N')); New-Item -ItemType Directory -Path $t | Out-Null; netsh wlan export profile key=clear folder="$t" | Out-Null; $rows=Get-ChildItem $t -Filter *.xml | ForEach-Object { [xml]$x=Get-Content $_.FullName -Encoding UTF8; [PSCustomObject]@{SSID=$x.WLANProfile.name;Password=$(if($x.WLANProfile.MSM.security.sharedKey.keyMaterial){$x.WLANProfile.MSM.security.sharedKey.keyMaterial}else{'<open / none>'})} }; Remove-Item $t -Recurse -Force; if($rows){$rows ${FT}}else{'No Wi-Fi profiles found.'}`),
  flush_dns: C('ipconfig /flushdns'),
  net_reset: C('ipconfig /release & ipconfig /renew & ipconfig /flushdns & netsh winsock reset & netsh int ip reset & echo [OK] Restart the PC to finish', true),
  ipconfig_all: C('ipconfig /all'),
  netstat: C('netstat -ano'),
  speed_test: P(`$sw=[Diagnostics.Stopwatch]::StartNew(); $r=Invoke-WebRequest 'https://speed.cloudflare.com/__down?bytes=25000000' -UseBasicParsing; $sw.Stop(); $mb=$r.RawContentLength/1MB; 'Downloaded '+[math]::Round($mb,1)+' MB in '+[math]::Round($sw.Elapsed.TotalSeconds,1)+' s  =>  '+[math]::Round($mb*8/$sw.Elapsed.TotalSeconds,1)+' Mbit/s'`),
  hosts_view: C(R`type "%SystemRoot%\System32\drivers\etc\hosts"`),
  hosts_edit: C(R`start "" notepad "%SystemRoot%\System32\drivers\etc\hosts"`),

  /* ---- Πίνακες διαχειριστή ---- */
  p_ncpa: C('start "" ncpa.cpl'),
  p_appwiz: C('start "" appwiz.cpl'),
  p_sysdm: C('start "" sysdm.cpl'),
  p_services: C('start "" services.msc'),
  p_devmgmt: C('start "" devmgmt.msc'),
  p_diskmgmt: C('start "" diskmgmt.msc'),
  p_eventvwr: C('start "" eventvwr.msc'),
  p_taskschd: C('start "" taskschd.msc'),
  p_lusrmgr: C('start "" lusrmgr.msc'),
  p_compmgmt: C('start "" compmgmt.msc'),
  p_god: C('start "" explorer.exe shell:::{ED7BA470-8E54-465E-825C-99712043E01C}'),

  /* ---- Απομακρυσμένη βοήθεια ---- */
  rdp: { build: (p) => { const h = String((p && p.host) || '').trim(); return { cmd: h ? `start "" mstsc /v:${host(p)}` : 'start "" mstsc' }; } },
  quick_assist: C('start "" explorer.exe ms-quick-assist:'),
  net_center: C('start "" control /name Microsoft.NetworkAndSharingCenter')
};

module.exports = COMMANDS;
