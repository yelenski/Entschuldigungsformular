// Nach jedem Test einen Screenshot machen, sortiert nach Ergebnis
afterEach(function () {
  const testName = this.currentTest.title.replace(/[^a-zA-Z0-9-_]/g, '_');
  if (this.currentTest.state === 'failed') {
    cy.screenshot(`Failed/${testName}`);
  } else {
    cy.screenshot(`Done/${testName}`);
  }
});

describe('Login Tests', () => {
  beforeEach(() => {
    // Vor jedem Test zur Login-Seite navigieren
    cy.visit('http://localhost:3000');
    // Warten bis die Login-Card und das Formular geladen sind
    cy.get('.max-w-md').should('be.visible');
    cy.get('form').should('exist');
  });

  afterEach(() => {
    // Nach jedem Test ausloggen falls eingeloggt
    cy.url().then((url) => {
      if (!url.includes('/')) {
        cy.get('button').contains('Abmelden').click();
        cy.url().should('include', '/');
        cy.get('.max-w-md').should('be.visible');
      }
    });
  });

  it('Soll das Entschuldigungsformular für Schüler laden', () => {
    // Prüfen ob die Radio-Gruppe geladen ist
    cy.get('[role="radiogroup"]').should('be.visible');
    
    // Radio-Button für Schüler auswählen - sollte standardmäßig ausgewählt sein
    cy.get('[value="student"]').should('be.checked');
    
    // Benutzername und Passwort eingeben
    cy.get('input[placeholder="Benutzername"]').type('schueler');
    cy.get('input[placeholder="********"]').type('SchuelerPass');
    
    // Submit Button finden und klicken
    cy.get('button[type="submit"]').should('be.visible').not('disabled').click();
    
    // Überprüfen der Navigation und des Inhalts
    cy.url().should('include', '/student/form');
    cy.contains('Entschuldigungsformular').should('be.visible');
    cy.screenshot('Done/Soll_das_Entschuldigungsformular_fuer_Schueler_laden');
  });

  it('Soll die Lehrer-Übersicht laden', () => {
    // Prüfen ob die Radio-Gruppe geladen ist
    cy.get('[role="radiogroup"]').should('be.visible');
    
    // Radio-Button für Lehrer auswählen durch Klicken des Labels
    cy.get('label').contains('Lehrer').click({ force: true });
    
    // Warten bis der Lehrer-Radio-Button ausgewählt ist
    cy.get('[value="teacher"]').should('be.checked');
    
    // Anmeldedaten eingeben
    cy.get('input[placeholder="Benutzername"]').should('be.visible').type('lehrer');
    cy.get('input[placeholder="********"]').should('be.visible').type('LehrerPass');
    
    // Submit Button finden und klicken
    cy.get('button[type="submit"]').should('be.visible').not('disabled').click();
    
    // Warten auf Navigation und Laden der Lehrerseite
    cy.url().should('include', '/teacher/overview');
    cy.contains('h1', 'Entschuldigungen', { timeout: 10000 }).should('be.visible');
    cy.get('.max-w-7xl').should('exist');
    cy.screenshot('Done/Soll_die_Lehrer-Uebersicht_laden');
  });
});

describe('Login und Logout Tests', () => {
  beforeEach(() => {
    // Vor jedem Test zur Login-Seite navigieren
    cy.visit('http://localhost:3000');
    // Warten bis die Login-Card und das Formular geladen sind
    cy.get('.max-w-md').should('be.visible');
    cy.get('form').should('exist');
  });

  it('Soll Login als Schüler, Logout und dann Login als Lehrer durchführen', () => {
    // 1. Login als Schüler
    cy.log('--- Login als Schüler ---');
    
    // Prüfen ob die Radio-Gruppe geladen ist
    cy.get('[role="radiogroup"]').should('be.visible');
    
    // Prüfen, ob Schüler-Radio-Button standardmäßig ausgewählt ist
    cy.get('[value="student"]').should('be.checked');
    
    // Anmeldedaten eingeben
    cy.get('input[placeholder="Benutzername"]').should('be.visible').type('schueler');
    cy.get('input[placeholder="********"]').should('be.visible').type('SchuelerPass');
    
    // Submit Button finden und klicken
    cy.get('button[type="submit"]').should('be.visible').not('disabled').click();
    
    // Warten auf Navigation und Laden der Schülerseite
    cy.url().should('include', '/student/form');
    cy.contains('Entschuldigungsformular').should('be.visible');
    cy.get('.max-w-3xl').should('exist');
    cy.screenshot('Done/schueler-bereich');
    
    // 2. Logout durchführen
    cy.log('--- Logout ---');
    cy.get('button').contains('Abmelden').should('be.visible').not('disabled').click();
    
    // Warten auf Navigation zurück zur Login-Seite
    cy.url().should('include', '/');
    
    // Warten bis die Login-Seite wieder vollständig geladen ist
    cy.get('.max-w-md').should('be.visible');
    cy.get('form').should('exist');
    cy.get('[role="radiogroup"]').should('be.visible');
    cy.screenshot('Done/nach-logout');
    
    // 3. Login als Lehrer
    cy.log('--- Login als Lehrer ---');
    
    // Radio-Button für Lehrer auswählen durch Klicken des Labels
    cy.get('label').contains('Lehrer').click({ force: true });
    
    // Warten bis der Lehrer-Radio-Button ausgewählt ist
    cy.get('[value="teacher"]').should('be.checked');
    
    // Anmeldedaten eingeben
    cy.get('input[placeholder="Benutzername"]').should('be.visible').clear().type('lehrer');
    cy.get('input[placeholder="********"]').should('be.visible').clear().type('LehrerPass');
    
    // Submit Button finden und klicken
    cy.get('button[type="submit"]').should('be.visible').not('disabled').click();
    
    // Warten auf Navigation und Laden der Lehrerseite
    cy.url().should('include', '/teacher/overview');
    cy.contains('h1', 'Entschuldigungen', { timeout: 10000 }).should('be.visible');
    cy.get('.max-w-7xl').should('exist');
    cy.screenshot('Done/lehrer-bereich');
  });
});
