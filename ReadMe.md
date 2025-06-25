# Entschuldigungsformular

## Einführung

Die SchoolAbsence App / Entschuldigungsformular ist eine moderne Webanwendung zur Verwaltung von Abwesenheiten in Schulen. Sie bietet eine benutzerfreundliche Oberfläche für Schüler und Lehrer, um Abwesenheiten zu erfassen, anzuzeigen und zu verwalten.

## Funktionsweise

### Absenzverwaltung

#### Für Schüler
- **Eingabe von Absenzen:**
  - Persönliche Daten (Name, Klasse)
  - Datum und Zeitraum der Absenz
  - Grund der Absenz (Krankheit, Arztbesuch, etc.)
  - Upload von Dokumenten (z.B. Arztzeugnis)
- **Statusverfolgung:**
  - Einsicht in den aktuellen Status ihrer Absenzmeldungen
  - Benachrichtigungen bei Statusänderungen






#### Für Lehrer
- **Absenzübersicht:**
  - Gesamtübersicht aller Absenzmeldungen
  - Filterung nach Klassen, Datum und Status
  - Detailansicht einzelner Meldungen
- **Verwaltungsfunktionen:**
  - Genehmigung/Ablehnung von Absenzen
  - Kommentarfunktion
  - Statistiken und Auswertungen

### Datenspeicherung

Die Anwendung verwendet ein JSON-basiertes Speichersystem:

- **Speicherort:** `server/data/absences.json`
- **Backup:** Automatische Backup-Erstellung unter `absences.json.bak`
- **Datenstruktur:**
  ```json
  {
    "id": "unique-id",
    "studentName": "Max Mustermann",
    "class": "2B",
    "startDate": "2025-05-19T08:00:00",
    "endDate": "2025-05-19T16:00:00",
    "reason": "Arztbesuch",
    "status": "pending",
    "attachments": ["dokument.pdf"],
    "comments": [],
    "timestamp": "2025-05-19T07:30:00"
  }
  ```

### Validierung und Sicherheit
- Strikte Eingabevalidierung mit Zod
- Authentifizierung für alle Zugriffe
- Automatische Backup-Erstellung
- Rollenbasierte Zugriffskontrolle (Schüler/Lehrer)

## Technologie-Stack

### Frontend
* **Framework:** React mit TypeScript
* **Build-Tool:** Vite
* **UI-Komponenten:** 
  * Radix UI für barrierefreie Komponenten
  * Tailwind CSS für Styling
  * Shadcn/ui für moderne UI-Komponenten
* **State Management:** React Query
* **Formular-Handling:** React Hook Form mit Zod-Validierung
* **Routing:** Wouter

### Backend
* **Runtime:** Node.js
* **Framework:** Express
* **Datenverwaltung:** In-Memory (MemStorage)
* **Sitzungsmanagement:** express-session, memorystore
* **API:** RESTful mit TypeScript

### Testing
* **Framework:** Cypress
* **Arten:** End-to-End Tests (E2E)
* **Screenshot-Testing:** Automatische Bildschirmaufnahmen für visuelle Regression Tests

## Voraussetzungen

* Node.js (Version 16 oder höher)
* npm oder yarn

## Installation

1. Repository klonen:
   ```bash
   git clone <repository-url>
   cd SchoolAbsence
   ```

2. Abhängigkeiten installieren:
   ```bash
   npm install
   ```

## API-Endpunkte

### Absenzen
- `GET /api/absences` - Liste aller Absenzen (für Lehrer)
- `GET /api/absences/:id` - Details einer spezifischen Absenz
- `POST /api/absences` - Neue Absenz erstellen
- `PUT /api/absences/:id` - Absenz aktualisieren (Status, Kommentare)
- `DELETE /api/absences/:id` - Absenz löschen

### Authentifizierung
- `POST /api/auth/login` - Login für Schüler/Lehrer
- `POST /api/auth/logout` - Logout
- `GET /api/auth/status` - Aktuelle Session-Status

## Entwicklung

### Development Server starten

Starte den Backend- und Frontend-Server im Entwicklungsmodus:
```bash
npm run dev        # Startet den Backend-Server
npm run client:dev # Startet den Frontend-Server in einem separaten Terminal
```

Der Frontend-Server läuft auf http://localhost:3000
Der Backend-Server läuft auf http://localhost:5000

### Tests ausführen

#### Cypress Test Runner (Interaktiv)
```bash
npm run test:open
```

#### Automatisierte Tests
```bash
npm run test:run
```

Dies startet:
1. Den Development-Server
2. Den Client-Server
3. Führt die Cypress-Tests aus
4. Erstellt Screenshots in cypress/screenshots/

### Verfügbare npm Scripts

- `npm run dev` - Startet den Backend-Server
- `npm run client:dev` - Startet den Frontend-Development-Server
- `npm run build` - Baut das Projekt für Produktion
- `npm run start` - Startet die Produktionsversion
- `npm run check` - Führt TypeScript-Überprüfungen durch
- `npm run test:open` - Öffnet Cypress Test Runner
- `npm run test:run` - Führt Cypress-Tests automatisch aus
- `npm run test` - Startet Server und führt Tests aus

## Projektstruktur

```
├── client/               # Frontend-Code
│   ├── src/
│   │   ├── components/   # React-Komponenten
│   │   ├── hooks/       # Custom React Hooks
│   │   ├── lib/         # Utilities und Helpers
│   │   └── pages/       # Seiten-Komponenten
├── server/              # Backend-Code
│   ├── routes.ts        # API-Routen
│   └── storage.ts       # Datenspeicherung
├── shared/             # Gemeinsam genutzte Typen/Schemas
└── tests/              # Cypress Tests
    └── e2e/            # End-to-End Tests
```

## Features

### Benutzeroberfläche
- 🎨 Modernes, intuitives Design mit Shadcn/ui
- 📱 Vollständig responsive Layouts
- ♿ Barrierefreie UI-Komponenten (ARIA-konform)
- 🌙 Dark/Light Mode Unterstützung
- 🔔 Toast-Benachrichtigungen für Statusupdates

### Funktionalität
- 🔐 Sicheres Authentifizierungssystem
  - Separate Zugänge für Schüler und Lehrer
  - Session-Management mit express-session
  - Automatische Weiterleitung nach Login
- 📝 Umfassendes Absenzenformular
  - Validierung aller Eingaben in Echtzeit
  - Datums- und Zeitauswahl mit Kalenderfunktion
  - Dokumenten-Upload-Möglichkeit
  - Automatische Speicherung in absences.json
- 👀 Lehrer-Dashboard
  - Tabellarische Übersicht aller Absenzen
  - Fortgeschrittene Filterfunktionen
  - Kontextmenü für schnelle Aktionen
  - Detailansicht für einzelne Absenzen
- 🔄 Status-Management
  - Verschiedene Status (Eingereicht, Genehmigt, Abgelehnt)
  - Kommentarfunktion für Lehrer
  - Historie der Statusänderungen

### Technisch
- 🌐 RESTful API mit TypeScript
- 💾 Persistente JSON-Datenspeicherung
- 🔄 Automatisches Backup-System
- ✅ Umfassende E2E-Tests
- 📊 Performance-Optimierung durch React Query
- 🛡️ Typsichere Entwicklung mit TypeScript

## Produktion

Build erstellen und Produktionsserver starten:
```bash
npm run build
npm start
```

## Lizenz

MIT License