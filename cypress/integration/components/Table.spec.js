"use strict";
describe('My First Test', function () {
    it('Does not do much!', function () {
        cy.visit("http://localhost:6006/iframe.html?id=table--paginable&args=&viewMode=story");
        cy.contains(">").click();
        cy.contains(">").click();
    });
});
//# sourceMappingURL=Table.spec.js.map