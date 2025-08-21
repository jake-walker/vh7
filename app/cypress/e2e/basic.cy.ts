/// <reference types="Cypress" />
describe("Home Page", () => {
  it("can create short url", () => {
    cy.visit("/");

    // fill in the form and submit
    cy.get("#shorten-url").type("https://example.com").should("have.value", "https://example.com");
    cy.get("#shorten-submit").click();

    // check the success alert is shown
    cy.get("#success-alert").should("be.visible");
  });

  it("can create paste", () => {
    cy.fixture("paste").then((code) => {
      // replace windows line endings with linux ones as it breaks the test
      code = code.replace(/\r\n/g, "\n");

      cy.visit("/");
      cy.get("[id$=-tab-paste]").click();

      // fill in the form
      cy.get("#paste-code").type(code).should("have.value", code);
      // open the language drop down
      cy.get("#paste-language").click();
      // click on the python item in the drop down
      cy.contains("Python").click();
      // submit the form
      cy.get("#paste-submit").click();

      // check the success alert is shown
      cy.get("#success-alert").should("be.visible");
    });
  });

  it("can create paste without language set", () => {
    cy.visit("/");
    cy.get("[id$=-tab-paste]").click();

    // fill in the form
    cy.get("#paste-code").type("Hello World!").should("have.value", "Hello World!");
    // submit the form
    cy.get("#paste-submit").click();

    // check the success alert is shown
    cy.get("#success-alert").should("be.visible");
  });

  it("can create upload", () => {
    cy.visit("/");
    cy.get("[id$=-tab-upload]").click();

    // upload a file to the dropzone
    cy.get("#upload-file")
      .get("input[type=file]")
      .selectFile(
        {
          contents: Cypress.Buffer.from("Hello World!"),
          fileName: "test.txt",
          lastModified: Date.now(),
        },
        {
          force: true,
        },
      );

    // check the success alert is shown
    cy.get("#success-alert").should("be.visible");
  });

  it("can delete from history", () => {
    cy.request({
      method: "POST",
      url: "http://localhost:8787/api/shorten",
      body: {
        url: "http://example.com",
        deleteToken: "keyboardcat",
      },
    }).then((res) => {
      window.localStorage.setItem(
        "state",
        JSON.stringify({
          history: {
            items: [res.body],
          },
        }),
      );
      cy.visit("/");
      cy.get(`#history-item-${res.body.id} >> .delete-button`).click();

      cy.on("window:confirm", (t) => {
        expect(t).to.contain("Are you sure you want to delete");
        return true;
      });

      cy.get(`#history-item-${res.body.id}`).should("not.exist");
    });
  });
});
