/// <reference types="Cypress" />
describe("View Page", () => {
  it("can view a short link", () => {
    const baseUrl = new URL(Cypress.config().baseUrl ?? "https://localhost:5173");

    // first, create a new short link
    cy.request({
      method: "POST",
      url: "http://localhost:8787/api/shorten",
      body: {
        url: new URL("/testing123", baseUrl).toString(),
      },
    }).then((res) => {
      // then visit it
      cy.visit(`/${res.body.id}`);

      // check the page title is equal to a pretty url
      cy.get(".mantine-Container-root > .mantine-Title-root").should(
        "have.text",
        `${baseUrl.hostname}${baseUrl.port ? `:${baseUrl.port}` : ""}/testing123`,
      );

      // check we have redirected to the right place
      cy.location("href", {
        timeout: 8000,
      }).should("eq", new URL("/testing123", baseUrl).toString());
    });
  });

  it("can view a paste", () => {
    cy.fixture("paste").then((code) => {
      // first, create a new paste
      cy.request({
        method: "POST",
        url: "http://localhost:8787/api/paste",
        body: {
          language: "python",
          code: code,
        },
      }).then((res) => {
        // then visit it
        const id = res.body.id;
        cy.visit(`/${id}`);

        // check the page title is expected for a paste
        cy.get(".mantine-Container-root > .mantine-Title-root").should("have.text", "Paste");
        // check the content of the code box matches
        cy.get("#paste-content pre")
          .invoke("text")
          .then((text) => text.replace(/\n/g, ""))
          .should("equal", code.replace(/\n/g, ""));

        // simulate clicking on the download link
        cy.contains("Download")
          .invoke("attr", "href")
          .then((downloadLink) => {
            cy.request("GET", downloadLink).should((res) => {
              expect(res.status).to.equal(200);
              expect(res.body).to.equal(code);
              // check the file name of the file would equal this
              expect(res.headers["content-disposition"]).to.include(`filename="vh7-paste-${id}.py"`);
            });
          });
      });
    });
  });

  it("can view an upload", () => {
    // the window object is needed for making a form request with a file
    cy.window().then((_win) => {
      cy.fixture("image.png", "binary").then((image) => {
        const imageBlob = Cypress.Blob.binaryStringToBlob(image, "image/png");

        // create a new formdata object with the file
        const data = new FormData();
        data.set("file", imageBlob, "image.png");

        cy.request({
          method: "POST",
          url: "http://localhost:8787/api/upload",
          body: data,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }).then((res) => {
          // then visit it
          const json = JSON.parse(new TextDecoder().decode(res.body));
          const id = json.id;
          cy.visit(`/${id}`);

          // check the title of the page matches the uploaded filename
          cy.get(".mantine-Container-root > .mantine-Title-root").should("have.text", "image.png");
          // check the hash is correct
          cy.get("#upload-sha256").should(
            "have.text",
            "3f9dba53159de1ec89b2a9a0821c3fd0290e3c5566e31daf967aaa8d05b63e35",
          );

          // simulate clicking the download link
          cy.contains("Download image.png")
            .invoke("attr", "href")
            .then((downloadLink) => {
              cy.request({
                method: "GET",
                url: downloadLink,
                encoding: "base64",
              }).should((res_1) => {
                expect(res_1.status).to.equal(200);
                Cypress.Blob.blobToBase64String(imageBlob).then((b64String) => {
                  expect(res_1.body).to.equal(b64String);
                });

                // check the name of the downloaded file is the same
                expect(res_1.headers["content-disposition"]).to.include(`filename="image.png"`);
              });
            });
        });
      });
    });
  });
});
