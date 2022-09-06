const { defineConfig } = require("cypress");

module.exports = defineConfig({
  projectId: "wue6xw",
  e2e: {
    baseUrl: "http://localhost:3000",
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
