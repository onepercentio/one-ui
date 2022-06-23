describe('My First Test', () => {
    it('Does not do much!', () => {
      cy.visit("http://localhost:6006/iframe.html?id=table--paginable&args=&viewMode=story")
      cy.contains(">").click()
      cy.contains(">").click()
      cy.contains(".")
    })
  })