import 'cypress-plugin-snapshots/commands'
Cypress.Commands.overwrite('log', (_subject, message) => cy.task('log', message))
