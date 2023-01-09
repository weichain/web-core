describe('Landing page', () => {
  it('redirects to welcome page', () => {
    cy.visit('/')

    cy.url().should('include', '/welcome')
  })

  it('should require accept "Updates" cookies to display Beamer', () => {
    // Disable PWA, otherwise it will throw a security error
    cy.visit('/')

    // Way to select the cookies banner without an id
    cy.contains('We use cookies to provide')
    cy.contains('Accept selection').click()
    cy.contains('We use cookies to provide').should('not.exist')

    // Open What's new
    cy.contains("What's new").click()

    // Tells that the user has to accept "Updates & Feedback" cookies
    cy.contains('We use cookies to provide').parent('div').contains('accept the "Updates & Feedback"')

    // "Updates" is checked when the banner opens
    cy.contains('We use cookies to provide').parent('div').get('input[name="updates"]').should('be.checked')
    // Accept "Updates & Feedback" cookies
    cy.contains('Accept selection').click()
    cy.contains('We use cookies to provide').should('not.exist')

    // wait for Beamer cookies to be set
    cy.wait(3000)

    // Open What's new
    cy.contains("What's new").click({ force: true }) // clicks through the "lastPostTitle"
    cy.get('#beamerOverlay .iframeCointaner').should('exist')
  })
})
