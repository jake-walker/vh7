/// <reference types="Cypress" />
describe('View Page', () => {
  it('can view a short link', () => {
    cy.request('POST', 'http://localhost:8787/api/shorten', {
      url: 'http://localhost:3000/testing123'
    }).then((res) => {
      cy.visit(`/view/${res.body.id}`);

      cy.get('.mantine-Container-root > .mantine-Title-root').should('have.text', 'localhost:3000/testing123');

      cy.location('href', {
        timeout: 8000
      }).should('eq', 'http://localhost:3000/testing123');
    });
  });

  it('can view a paste', () => {
    cy.fixture('paste').then((code) => {
      cy.request('POST', 'http://localhost:8787/api/paste', {
        language: 'python',
        code
      }).then((res) => {
        cy.visit(`/view/${res.body.id}`);

        cy.get('.mantine-Container-root > .mantine-Title-root').should('have.text', 'Paste');

        cy.contains('Download').click();
      });
    });
  });
})
