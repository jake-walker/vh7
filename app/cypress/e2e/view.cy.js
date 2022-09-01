/// <reference types="Cypress" />
describe('View Page', () => {
  it('can view a short link', () => {
    cy.request('POST', 'http://localhost:8787/api/shorten', {
      url: "https://example.com"
    }).then((res) => {
      cy.visit(`/visit/${res.body.id}`);
    });
  });
})
