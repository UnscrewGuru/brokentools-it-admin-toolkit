/* Κατάλογος εργαλείων: id = id ενέργειας στο commands.js (main process) */
(function () {
  const T = (id, cat, btn, tone, title, d, opt) => Object.assign({ id, cat, btn, tone, title, d }, opt || {});

  window.TOOLS = [
    /* ===== Επιδιόρθωση ===== */
    T('sfc', 'repairs', 'scan', 'g', 'SFC /SCANNOW', {
      el: 'Ελέγχει και επιδιορθώνει κατεστραμμένα αρχεία συστήματος των Windows.',
      en: 'Scans and repairs corrupted Windows system files.',
      es: 'Analiza y repara archivos del sistema de Windows dañados.',
      ru: 'Проверяет и восстанавливает повреждённые системные файлы Windows.' }),
    T('dism', 'repairs', 'fix', 'b', 'DISM RestoreHealth', {
      el: 'Επιδιορθώνει την εικόνα των Windows μέσω Windows Update (ταιριάζει όταν το SFC αποτυγχάνει).',
      en: 'Repairs the Windows image through Windows Update (use it when SFC fails).',
      es: 'Repara la imagen de Windows mediante Windows Update (úsalo si SFC falla).',
      ru: 'Восстанавливает образ Windows через Центр обновления (если SFC не справился).' }),
    T('chkdsk', 'repairs', 'scan', 'r', 'CHKDSK C: /scan', {
      el: 'Ελέγχει τον δίσκο C: για σφάλματα χωρίς επανεκκίνηση.',
      en: 'Checks drive C: for errors without a restart.',
      es: 'Busca errores en la unidad C: sin reiniciar.',
      ru: 'Проверяет диск C: на ошибки без перезагрузки.' }),
    T('restore_point', 'repairs', 'make', 'y', {
      el: 'Σημείο επαναφοράς', en: 'Restore point', es: 'Punto de restauración', ru: 'Точка восстановления' }, {
      el: 'Δημιουργεί σημείο επαναφοράς πριν από επισκευές. Τα Windows επιτρέπουν ένα ανά 24 ώρες.',
      en: 'Creates a restore point before repairs. Windows allows one per 24 hours.',
      es: 'Crea un punto de restauración antes de reparar. Windows permite uno cada 24 horas.',
      ru: 'Создаёт точку восстановления перед ремонтом. Windows разрешает одну в сутки.' }, {}),

    /* ===== Γρήγορες διορθώσεις ===== */
    T('fix_spooler', 'quick', 'fix', 'y', {
      el: 'Επιδιόρθωση εκτυπωτών (Spooler)', en: 'Fix Print Spooler', es: 'Reparar cola de impresión', ru: 'Сброс очереди печати' }, {
      el: 'Καθαρίζει κολλημένες εκτυπώσεις και επανεκκινεί την υπηρεσία Spooler.',
      en: 'Clears stuck print jobs and restarts the Spooler service.',
      es: 'Borra trabajos atascados y reinicia el servicio Spooler.',
      ru: 'Очищает зависшие задания печати и перезапускает службу Spooler.' }, { confirm: true }),
    T('reset_wua', 'quick', 'fix', 'b', 'Reset Windows Update', {
      el: 'Επανεκκινεί τις υπηρεσίες wuauserv, bits και cryptsvc.',
      en: 'Restarts the wuauserv, bits and cryptsvc services.',
      es: 'Reinicia los servicios wuauserv, bits y cryptsvc.',
      ru: 'Перезапускает службы wuauserv, bits и cryptsvc.' }, { confirm: true }),
    T('gpupdate', 'quick', 'run', 'g', 'GPUpdate /force', {
      el: 'Άμεση ενημέρωση των πολιτικών Active Directory.',
      en: 'Immediately refreshes Active Directory group policies.',
      es: 'Actualiza al instante las directivas de grupo de Active Directory.',
      ru: 'Немедленно обновляет групповые политики Active Directory.' }),
    T('rebuild_icons', 'quick', 'fix', 'p', {
      el: 'Ανανέωση εικονιδίων', en: 'Rebuild icon cache', es: 'Reconstruir caché de iconos', ru: 'Сброс кэша иконок' }, {
      el: 'Διορθώνει λευκά ή κατεστραμμένα εικονίδια. Κάνει επανεκκίνηση του Explorer.',
      en: 'Fixes blank or corrupted icons. Restarts Explorer.',
      es: 'Arregla iconos en blanco o dañados. Reinicia el Explorador.',
      ru: 'Исправляет пустые или повреждённые значки. Перезапускает Проводник.' }, { confirm: true }),
    T('sync_time', 'quick', 'run', 'c', {
      el: 'Συγχρονισμός ώρας', en: 'Sync system time', es: 'Sincronizar la hora', ru: 'Синхронизация времени' }, {
      el: 'Συγχρονίζει το ρολόι των Windows με διακομιστή NTP.',
      en: 'Synchronises the Windows clock with an NTP server.',
      es: 'Sincroniza el reloj de Windows con un servidor NTP.',
      ru: 'Синхронизирует часы Windows с сервером NTP.' }),

    /* ===== Προγράμματα & εκκίνηση ===== */
    T('installed', 'software', 'view', 'g', {
      el: 'Εγκατεστημένα προγράμματα', en: 'Installed programs', es: 'Programas instalados', ru: 'Установленные программы' }, {
      el: 'Λίστα όλων των προγραμμάτων με έκδοση και εκδότη. Για απεγκατάσταση χρησιμοποίησε το appwiz.cpl.',
      en: 'Lists every program with version and publisher. Use appwiz.cpl to uninstall.',
      es: 'Lista todos los programas con versión y editor. Usa appwiz.cpl para desinstalar.',
      ru: 'Список всех программ с версией и издателем. Для удаления используйте appwiz.cpl.' }),
    T('startup_list', 'software', 'view', 'y', {
      el: 'Προγράμματα εκκίνησης', en: 'Startup programs', es: 'Programas de inicio', ru: 'Программы автозапуска' }, {
      el: 'Δείχνει ποια προγράμματα ξεκινούν μαζί με τα Windows και επιβραδύνουν την εκκίνηση.',
      en: 'Shows which programs start with Windows and slow the boot down.',
      es: 'Muestra qué programas arrancan con Windows y ralentizan el inicio.',
      ru: 'Показывает, какие программы запускаются с Windows и замедляют загрузку.' }),
    T('startup_settings', 'software', 'open', 'b', {
      el: 'Ρυθμίσεις εκκίνησης', en: 'Startup settings', es: 'Ajustes de inicio', ru: 'Параметры автозапуска' }, {
      el: 'Ανοίγει τη σελίδα των Windows όπου ενεργοποιείς ή απενεργοποιείς εφαρμογές εκκίνησης.',
      en: 'Opens the Windows page where you switch startup apps on or off.',
      es: 'Abre la página de Windows donde activas o desactivas las apps de inicio.',
      ru: 'Открывает страницу Windows, где можно включать и отключать автозапуск.' }),
    T('winget_all', 'software', 'run', 'g', {
      el: 'Ενημέρωση ΟΛΩΝ των προγραμμάτων', en: 'Update ALL programs', es: 'Actualizar TODOS los programas', ru: 'Обновить ВСЕ программы' }, {
      el: 'Τρέχει winget upgrade --all και ενημερώνει όσα προγράμματα το υποστηρίζουν.',
      en: 'Runs winget upgrade --all and updates every program that supports it.',
      es: 'Ejecuta winget upgrade --all y actualiza todos los programas compatibles.',
      ru: 'Запускает winget upgrade --all и обновляет все поддерживаемые программы.' }, {}),

    /* ===== Hardware & αναφορά ===== */
    T('sys_report', 'hardware', 'make', 'g', {
      el: 'Αναφορά συστήματος', en: 'System report', es: 'Informe del sistema', ru: 'Отчёт о системе' }, {
      el: 'Δημιουργεί αρχείο κειμένου στην επιφάνεια εργασίας με CPU, RAM, δίσκους, δίκτυο και σειριακό.',
      en: 'Creates a text file on the desktop with CPU, RAM, disks, network and serial number.',
      es: 'Crea un archivo de texto en el escritorio con CPU, RAM, discos, red y número de serie.',
      ru: 'Создаёт текстовый файл на рабочем столе: ЦП, ОЗУ, диски, сеть и серийный номер.' }),
    T('hw_bios', 'hardware', 'view', 'b', 'Serial Number & BIOS', {
      el: 'Service Tag / S/N, κατασκευαστής, μοντέλο και έκδοση BIOS.',
      en: 'Service tag / S/N, manufacturer, model and BIOS version.',
      es: 'Service Tag / S/N, fabricante, modelo y versión de BIOS.',
      ru: 'Service Tag / S/N, производитель, модель и версия BIOS.' }),
    T('hw_key', 'hardware', 'view', 'g', {
      el: 'Κλειδί Windows (OEM)', en: 'Windows key (OEM)', es: 'Clave de Windows (OEM)', ru: 'Ключ Windows (OEM)' }, {
      el: 'Ανακτά το εργοστασιακό κλειδί από το BIOS/UEFI, αν υπάρχει.',
      en: 'Reads the factory key from BIOS/UEFI, if one is embedded.',
      es: 'Lee la clave de fábrica de la BIOS/UEFI, si existe.',
      ru: 'Считывает заводской ключ из BIOS/UEFI, если он есть.' }),
    T('activation', 'hardware', 'view', 'y', {
      el: 'Κατάσταση ενεργοποίησης', en: 'Activation status', es: 'Estado de activación', ru: 'Статус активации' }, {
      el: 'Δείχνει αν τα Windows και το Office είναι ενεργοποιημένα.',
      en: 'Shows whether Windows and Office are activated.',
      es: 'Muestra si Windows y Office están activados.',
      ru: 'Показывает, активированы ли Windows и Office.' }),
    T('hw_disk', 'hardware', 'view', 'y', {
      el: 'Υγεία δίσκων (S.M.A.R.T.)', en: 'Disk health (S.M.A.R.T.)', es: 'Salud de discos (S.M.A.R.T.)', ru: 'Состояние дисков (S.M.A.R.T.)' }, {
      el: 'Ελέγχει την κατάσταση όλων των δίσκων SSD και HDD.',
      en: 'Checks the health of all SSD and HDD drives.',
      es: 'Comprueba el estado de todos los discos SSD y HDD.',
      ru: 'Проверяет состояние всех SSD и HDD.' }),
    T('hw_battery', 'hardware', 'make', 'p', {
      el: 'Αναφορά μπαταρίας', en: 'Battery report', es: 'Informe de batería', ru: 'Отчёт о батарее' }, {
      el: 'Φτιάχνει και ανοίγει αναλυτική αναφορά φθοράς μπαταρίας laptop.',
      en: 'Builds and opens a detailed laptop battery wear report.',
      es: 'Genera y abre un informe detallado del desgaste de la batería.',
      ru: 'Создаёт и открывает подробный отчёт об износе батареи ноутбука.' }),
    T('hw_errors', 'hardware', 'view', 'r', {
      el: '10 τελευταία σφάλματα', en: '10 last critical errors', es: 'Últimos 10 errores críticos', ru: '10 последних ошибок' }, {
      el: 'Τα 10 πιο πρόσφατα σφάλματα συστήματος από το Event Viewer.',
      en: 'The 10 most recent system errors from Event Viewer.',
      es: 'Los 10 errores del sistema más recientes del Visor de eventos.',
      ru: '10 последних системных ошибок из Журнала событий.' }),
    T('hw_specs', 'hardware', 'view', 'c', {
      el: 'CPU, RAM και uptime', en: 'CPU, RAM and uptime', es: 'CPU, RAM y tiempo activo', ru: 'ЦП, ОЗУ и аптайм' }, {
      el: 'Σύνοψη επεξεργαστή, έκδοσης Windows, μνήμης και χρόνου από την τελευταία εκκίνηση.',
      en: 'Summary of processor, Windows version, memory and time since last boot.',
      es: 'Resumen del procesador, versión de Windows, memoria y tiempo desde el arranque.',
      ru: 'Сводка: процессор, версия Windows, память и время с последней загрузки.' }),

    /* ===== Δίσκος & καθαρισμός ===== */
    T('disk_space', 'storage', 'view', 'g', {
      el: 'Ελεύθερος χώρος', en: 'Free disk space', es: 'Espacio libre', ru: 'Свободное место' }, {
      el: 'Μέγεθος, ελεύθερος χώρος και ποσοστό για κάθε δίσκο.',
      en: 'Size, free space and percentage for every drive.',
      es: 'Tamaño, espacio libre y porcentaje de cada unidad.',
      ru: 'Размер, свободное место и процент для каждого диска.' }),
    T('large_files', 'storage', 'scan', 'y', {
      el: 'Μεγάλα αρχεία', en: 'Large files', es: 'Archivos grandes', ru: 'Большие файлы' }, {
      el: 'Βρίσκει τα 25 μεγαλύτερα αρχεία (πάνω από 100 MB) στον φάκελο του χρήστη. Μπορεί να αργήσει.',
      en: 'Finds the 25 biggest files (over 100 MB) in the user folder. May take a while.',
      es: 'Busca los 25 archivos más grandes (más de 100 MB) en la carpeta del usuario. Puede tardar.',
      ru: 'Находит 25 самых больших файлов (свыше 100 МБ) в папке пользователя. Может занять время.' }),
    T('big_folders', 'storage', 'scan', 'b', {
      el: 'Μεγαλύτεροι φάκελοι', en: 'Biggest folders', es: 'Carpetas más grandes', ru: 'Самые большие папки' }, {
      el: 'Δείχνει ποιος φάκελος του χρήστη πιάνει τον περισσότερο χώρο.',
      en: 'Shows which user folder takes up the most space.',
      es: 'Muestra qué carpeta del usuario ocupa más espacio.',
      ru: 'Показывает, какая папка пользователя занимает больше всего места.' }),
    T('cleanmgr', 'storage', 'open', 'c', 'Disk Cleanup', {
      el: 'Ανοίγει τον κλασικό Καθαρισμό Δίσκου των Windows.',
      en: 'Opens the classic Windows Disk Cleanup.',
      es: 'Abre el Liberador de espacio en disco de Windows.',
      ru: 'Открывает классическую «Очистку диска» Windows.' }),
    T('drivers_list', 'storage', 'view', 'p', {
      el: 'Λίστα drivers', en: 'Driver list', es: 'Lista de controladores', ru: 'Список драйверов' }, {
      el: 'Εμφανίζει τους εγκατεστημένους drivers με έκδοση και κατασκευαστή.',
      en: 'Lists installed drivers with version and manufacturer.',
      es: 'Muestra los controladores instalados con versión y fabricante.',
      ru: 'Показывает установленные драйверы с версией и производителем.' }),
    T('drivers_export', 'storage', 'make', 'r', {
      el: 'Backup drivers', en: 'Driver backup', es: 'Copia de controladores', ru: 'Резерв драйверов' }, {
      el: 'Αντιγράφει όλους τους drivers σε φάκελο στην επιφάνεια εργασίας. Χρήσιμο πριν από format.',
      en: 'Copies all drivers to a folder on the desktop. Handy before a reinstall.',
      es: 'Copia todos los controladores a una carpeta del escritorio. Útil antes de formatear.',
      ru: 'Копирует все драйверы в папку на рабочем столе. Полезно перед переустановкой.' }, {}),

    /* ===== Ασφάλεια & χρήστες ===== */
    T('defender_status', 'security', 'view', 'g', 'Microsoft Defender', {
      el: 'Κατάσταση προστασίας σε πραγματικό χρόνο και τελευταία ενημέρωση ορισμών.',
      en: 'Real-time protection status and last signature update.',
      es: 'Estado de la protección en tiempo real y última actualización de firmas.',
      ru: 'Состояние защиты в реальном времени и дата обновления баз.' }),
    T('defender_update', 'security', 'run', 'b', {
      el: 'Ενημέρωση Defender', en: 'Update Defender', es: 'Actualizar Defender', ru: 'Обновить Defender' }, {
      el: 'Κατεβάζει τους πιο πρόσφατους ορισμούς ιών.',
      en: 'Downloads the latest virus definitions.',
      es: 'Descarga las últimas definiciones de virus.',
      ru: 'Загружает свежие антивирусные базы.' }),
    T('defender_scan', 'security', 'scan', 'r', {
      el: 'Γρήγορη σάρωση', en: 'Quick scan', es: 'Análisis rápido', ru: 'Быстрая проверка' }, {
      el: 'Τρέχει γρήγορη σάρωση ιών με τον Microsoft Defender.',
      en: 'Runs a quick virus scan with Microsoft Defender.',
      es: 'Ejecuta un análisis rápido con Microsoft Defender.',
      ru: 'Запускает быструю проверку Microsoft Defender.' }, {}),
    T('firewall', 'security', 'view', 'y', 'Firewall', {
      el: 'Δείχνει αν το τείχος προστασίας είναι ενεργό σε κάθε προφίλ δικτύου.',
      en: 'Shows whether the firewall is on for each network profile.',
      es: 'Muestra si el firewall está activo en cada perfil de red.',
      ru: 'Показывает, включён ли брандмауэр в каждом сетевом профиле.' }),
    T('bitlocker', 'security', 'view', 'p', 'BitLocker', {
      el: 'Κατάσταση κρυπτογράφησης των δίσκων.',
      en: 'Encryption status of the drives.',
      es: 'Estado del cifrado de las unidades.',
      ru: 'Состояние шифрования дисков.' }),
    T('local_users', 'security', 'view', 'c', {
      el: 'Τοπικοί χρήστες', en: 'Local users', es: 'Usuarios locales', ru: 'Локальные пользователи' }, {
      el: 'Λίστα λογαριασμών του υπολογιστή και αν είναι ενεργοί.',
      en: 'Lists the computer’s accounts and whether they are enabled.',
      es: 'Lista las cuentas del equipo y si están activas.',
      ru: 'Список учётных записей компьютера и их состояние.' }),
    T('local_admins', 'security', 'view', 'r', {
      el: 'Διαχειριστές', en: 'Local administrators', es: 'Administradores locales', ru: 'Локальные администраторы' }, {
      el: 'Ποιοι λογαριασμοί έχουν δικαιώματα διαχειριστή.',
      en: 'Which accounts have administrator rights.',
      es: 'Qué cuentas tienen derechos de administrador.',
      ru: 'Какие учётные записи имеют права администратора.' }),
    T('sched_tasks', 'security', 'view', 'y', {
      el: 'Προγραμματισμένες εργασίες', en: 'Scheduled tasks', es: 'Tareas programadas', ru: 'Запланированные задачи' }, {
      el: 'Εργασίες που δεν είναι της Microsoft. Χρήσιμο για εύρεση ύποπτων ή παλιών προγραμμάτων.',
      en: 'Non-Microsoft tasks. Handy for spotting suspicious or leftover programs.',
      es: 'Tareas que no son de Microsoft. Útil para detectar programas sospechosos.',
      ru: 'Задачи не от Microsoft. Помогает найти подозрительные или остаточные программы.' }),

    /* ===== Δίκτυο ===== */
    T('net_wifi', 'network', 'view', 'g', {
      el: 'Κωδικοί Wi-Fi', en: 'Wi-Fi passwords', es: 'Contraseñas Wi-Fi', ru: 'Пароли Wi-Fi' }, {
      el: 'Δείχνει τα αποθηκευμένα δίκτυα Wi-Fi και τους κωδικούς τους.',
      en: 'Shows the saved Wi-Fi networks and their passwords.',
      es: 'Muestra las redes Wi-Fi guardadas y sus contraseñas.',
      ru: 'Показывает сохранённые сети Wi-Fi и их пароли.' }),
    T('flush_dns', 'network', 'run', 'b', 'Flush DNS', {
      el: 'Καθαρίζει τη μνήμη DNS (ipconfig /flushdns).',
      en: 'Clears the DNS cache (ipconfig /flushdns).',
      es: 'Vacía la caché DNS (ipconfig /flushdns).',
      ru: 'Очищает кэш DNS (ipconfig /flushdns).' }),
    T('net_reset', 'network', 'fix', 'y', {
      el: 'Πλήρες reset δικτύου', en: 'Full network reset', es: 'Restablecer red por completo', ru: 'Полный сброс сети' }, {
      el: 'Release, Renew, FlushDNS, Winsock και TCP/IP reset. Θέλει επανεκκίνηση.',
      en: 'Release, renew, flush DNS, Winsock and TCP/IP reset. Needs a restart.',
      es: 'Release, renew, FlushDNS, Winsock y TCP/IP. Requiere reiniciar.',
      ru: 'Release, Renew, FlushDNS, Winsock и TCP/IP. Нужна перезагрузка.' }, { confirm: true }),
    T('ipconfig_all', 'network', 'view', 'c', 'IPConfig /all', {
      el: 'Πλήρης αναφορά καρτών δικτύου, MAC και DHCP.',
      en: 'Full report of network adapters, MAC and DHCP.',
      es: 'Informe completo de adaptadores de red, MAC y DHCP.',
      ru: 'Полный отчёт о сетевых адаптерах, MAC и DHCP.' }),
    T('speed_test', 'network', 'test', 'g', {
      el: 'Test ταχύτητας', en: 'Speed test', es: 'Test de velocidad', ru: 'Тест скорости' }, {
      el: 'Κατεβάζει 25 MB από την Cloudflare και υπολογίζει την ταχύτητα λήψης.',
      en: 'Downloads 25 MB from Cloudflare and works out the download speed.',
      es: 'Descarga 25 MB de Cloudflare y calcula la velocidad de bajada.',
      ru: 'Скачивает 25 МБ с Cloudflare и вычисляет скорость загрузки.' }),
    T('hosts_view', 'network', 'view', 'p', 'Hosts file', {
      el: 'Εμφανίζει το αρχείο hosts (συχνή αιτία ανακατευθύνσεων).',
      en: 'Shows the hosts file (a common cause of odd redirects).',
      es: 'Muestra el archivo hosts (causa habitual de redirecciones extrañas).',
      ru: 'Показывает файл hosts (частая причина странных перенаправлений).' }),
    T('hosts_edit', 'network', 'open', 'y', {
      el: 'Επεξεργασία hosts', en: 'Edit hosts', es: 'Editar hosts', ru: 'Правка hosts' }, {
      el: 'Ανοίγει το αρχείο hosts στο Notepad με δικαιώματα διαχειριστή.',
      en: 'Opens the hosts file in Notepad with administrator rights.',
      es: 'Abre el archivo hosts en el Bloc de notas como administrador.',
      ru: 'Открывает файл hosts в Блокноте с правами администратора.' }),

    /* ===== Πίνακες & Remote ===== */
    T('p_ncpa', 'panels', 'open', 'b', 'ncpa.cpl', {
      el: 'Κλασικές κάρτες δικτύου', en: 'Network connections', es: 'Conexiones de red', ru: 'Сетевые подключения' }),
    T('p_appwiz', 'panels', 'open', 'g', 'appwiz.cpl', {
      el: 'Προσθαφαίρεση προγραμμάτων', en: 'Programs and features', es: 'Programas y características', ru: 'Программы и компоненты' }),
    T('p_sysdm', 'panels', 'open', 'p', 'sysdm.cpl', {
      el: 'Ιδιότητες συστήματος / Domain', en: 'System properties / domain', es: 'Propiedades del sistema / dominio', ru: 'Свойства системы / домен' }),
    T('p_services', 'panels', 'open', 'y', 'services.msc', {
      el: 'Υπηρεσίες Windows', en: 'Windows services', es: 'Servicios de Windows', ru: 'Службы Windows' }),
    T('p_devmgmt', 'panels', 'open', 'c', 'devmgmt.msc', {
      el: 'Διαχείριση συσκευών', en: 'Device Manager', es: 'Administrador de dispositivos', ru: 'Диспетчер устройств' }),
    T('p_diskmgmt', 'panels', 'open', 'r', 'diskmgmt.msc', {
      el: 'Διαχείριση δίσκων', en: 'Disk Management', es: 'Administración de discos', ru: 'Управление дисками' }),
    T('p_eventvwr', 'panels', 'open', 'b', 'eventvwr.msc', {
      el: 'Event Viewer (αρχεία καταγραφής)', en: 'Event Viewer (logs)', es: 'Visor de eventos (registros)', ru: 'Просмотр событий (журналы)' }),
    T('p_taskschd', 'panels', 'open', 'g', 'taskschd.msc', {
      el: 'Χρονοπρογραμματιστής εργασιών', en: 'Task Scheduler', es: 'Programador de tareas', ru: 'Планировщик заданий' }),
    T('p_lusrmgr', 'panels', 'open', 'p', 'lusrmgr.msc', {
      el: 'Τοπικοί χρήστες και ομάδες', en: 'Local users and groups', es: 'Usuarios y grupos locales', ru: 'Локальные пользователи и группы' }),
    T('p_compmgmt', 'panels', 'open', 'y', 'compmgmt.msc', {
      el: 'Διαχείριση υπολογιστή', en: 'Computer Management', es: 'Administración de equipos', ru: 'Управление компьютером' }),
    T('p_god', 'panels', 'open', 'c', 'God Mode', {
      el: 'Όλες οι ρυθμίσεις σε έναν πίνακα', en: 'All settings in one panel', es: 'Todos los ajustes en un panel', ru: 'Все настройки в одной панели' }),
    T('quick_assist', 'panels', 'open', 'b', 'Quick Assist', {
      el: 'Απομακρυσμένη βοήθεια των Windows', en: 'Windows remote assistance', es: 'Asistencia remota de Windows', ru: 'Удалённая помощь Windows' }),
    T('net_center', 'panels', 'open', 'c', {
      el: 'Κέντρο δικτύου', en: 'Network and Sharing Center', es: 'Centro de redes', ru: 'Центр управления сетями' }, {
      el: 'Κέντρο δικτύου και κοινής χρήσης', en: 'Network and sharing settings', es: 'Redes y recursos compartidos', ru: 'Сеть и общий доступ' })
  ];

  /* Εφαρμογές για εγκατάσταση (το κλειδί υπάρχει και στο commands.js) */
  window.PACKAGES = [
    ['7zip', '7-Zip', { el: 'Αρχεία ZIP/RAR', en: 'File archiver', es: 'Compresor', ru: 'Архиватор' }, 'g'],
    ['chrome', 'Google Chrome', { el: 'Browser', en: 'Web browser', es: 'Navegador', ru: 'Браузер' }, 'b'],
    ['firefox', 'Mozilla Firefox', { el: 'Browser', en: 'Web browser', es: 'Navegador', ru: 'Браузер' }, 'y'],
    ['notepadpp', 'Notepad++', { el: 'Κείμενο & κώδικας', en: 'Text & code editor', es: 'Editor de texto', ru: 'Текстовый редактор' }, 'g'],
    ['powertoys', 'PowerToys', { el: 'Εργαλεία Windows', en: 'Windows utilities', es: 'Utilidades de Windows', ru: 'Утилиты Windows' }, 'c'],
    ['vlc', 'VLC', { el: 'Αναπαραγωγή βίντεο', en: 'Media player', es: 'Reproductor', ru: 'Медиаплеер' }, 'y'],
    ['treesize', 'TreeSize Free', { el: 'Ανάλυση χώρου δίσκου', en: 'Disk space analyzer', es: 'Analizador de disco', ru: 'Анализ диска' }, 'p'],
    ['acrobat', 'Adobe Reader', { el: 'Προβολή PDF', en: 'PDF viewer', es: 'Lector de PDF', ru: 'Просмотр PDF' }, 'r']
  ];

  window.CAT_ORDER = ['repairs', 'quick', 'software', 'hardware', 'storage', 'security', 'network', 'processes', 'panels'];
})();
