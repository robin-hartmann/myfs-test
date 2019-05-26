* use execa to launch tests like in https://github.com/avajs/gulp-ava/blob/master/index.js

- Erzeugen der Dateien über
  - initFiles bei mkfs
  - create bei mount
- Unmounten und gleichen Container wieder mounten, um Persistenz zu testen

Seriell
- genau 64 Dateien öffnen
- mehr als 64 Dateien öffnen

Parallel
- Metadaten lesen
  - übrige Attribute entsprechen der Originaldatei
- Inhalt komplett lesen
  - entspricht der Originaldatei
- Inhalt an bestimmter Stelle lesen
  - entspricht der Originaldatei
- Inhalt mehrfach lesen (und an verschiedenen Stellen)

Parallel
- Dateien anlegen
  - ungültiger Dateiname
    - `.` oder `..`
  - Dateiname existiert bereits
  - Größe überschreitet verfügbaren Speicherplatz
- Dateien löschen
  - Dateiname existiert nicht
  - mehrfach löschen und wieder anlegen
- Verzeichnis anlegen
  - muss Fehler `EACCES` verursachen

- `mkfs.myfs`
  - CLI
    - Pfad zu Container
      - nicht angegeben
      - existiert bereits
    - Zu kopierende Datei(en)
      - nicht angegeben
      - existiert nicht
      - genau 64
      - mehr als 64
      - mehrere Dateien mit gleichem Namen
      - Dateiname länger als 255 Zeichen
      - Inhalt
        - leer
        - genau ein Block groß
        - minimal größer als ein Block
        - überschreitet Größe des Datenträgers
          - eine einzelne Datei
          - mehrere Dateien zusammen

- `mount.myfs`
  - CLI
    - Pfad zu Container
      - nicht angegeben
      - existiert nicht
      - bereits gemountet
    - Pfad zu Logfile
      - nicht angegeben
      - existiert bereits
    - Mouting Ziel
      - nicht angegeben
      - existiert nicht
      - dort ist bereits etwas anderes gemountet
