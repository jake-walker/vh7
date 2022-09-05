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
        const id = res.body.id;
        cy.visit(`/view/${id}`);

        cy.get('.mantine-Container-root > .mantine-Title-root').should('have.text', 'Paste');
        // TODO: check paste content

        cy.contains('Download').invoke('attr', 'href').then((downloadLink) => {
          cy.request('GET', downloadLink).should((res) => {
            expect(res.status).to.equal(200);
            expect(res.body).to.equal(code);
            expect(res.headers["content-disposition"]).to.include(`filename="vh7-paste-${id}.txt"`);
          });
        });
      });
    });
  });

  it('can view an upload', () => {
    cy.window().then((win) => {
      cy.fixture('image.png').then((image) => {
        const imageBlob = Cypress.Blob.base64StringToBlob(image, 'image/png');

        const data = new FormData();
        data.set('file', imageBlob, 'image.png');

        return new Promise((resolve, reject) => {
          const xhr = new win.XMLHttpRequest();
          xhr.open('POST', 'http://localhost:8787/api/upload');
          xhr.send(data);

          xhr.onload = () => resolve(xhr);
          xhr.onerror = () => reject(xhr);
        }).then((res) => {
          const json = JSON.parse(res.responseText);
          const id = json.id;

          cy.visit(`/view/${id}`);

          cy.get('.mantine-Container-root > .mantine-Title-root').should('have.text', 'image.png');

          // TODO: check file hash

          cy.contains('Download image.png').invoke('attr', 'href').then((downloadLink) => {
            cy.request({
              method: 'GET',
              url: downloadLink,
              encoding: 'base64'
            }).should((res) => {
              expect(res.status).to.equal(200);
              expect(res.body).to.equal(image);
              expect(res.headers["content-disposition"]).to.include(`filename="image.png"`);
            });
          });
        });
      });
    });
  });
})
