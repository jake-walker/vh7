/// <reference types="Cypress" />
describe('Home Page', () => {
  it('shortens', () => {
    cy.visit('/');

    cy.get("#shorten-url").type("https://example.com").should("have.value", "https://example.com");
    cy.get("#shorten-submit").click();

    cy.get("#success-alert").should("be.visible");
  });

  it('pastes', () => {
    cy.fixture('paste').then((code) => {
      cy.visit('/');

      cy.get('#paste-tab').click();

      cy.get("#paste-code").type(code).should("have.value", code);
      cy.get("#paste-language").click()
      cy.contains("Python").click();
      cy.get("#paste-submit").click();

      cy.get("#success-alert").should("be.visible");
    });
  });

  it('uploads', () => {
    cy.visit('/');

    cy.get('#upload-tab').click();

    cy.get('#upload-file').get("input[type=file]").selectFile({
      contents: Cypress.Buffer.from("Hello World!"),
      fileName: "test.txt",
      lastModified: Date.now()
    }, {
      force: true
    });

    cy.get("#success-alert").should("be.visible");
  });
});
