const SAFE = 'gor:0x97d314157727D517A706B5D08507A1f9B44AaaE9'

const INCOMING = '/images/transactions/incoming.svg'
const OUTGOING = '/images/transactions/outgoing.svg'
const CONTRACT_INTERACTION = '/images/transactions/custom.svg'

describe('Transaction history', () => {
  before(() => {
    // Go to the test Safe transaction history
    cy.visit(`/${SAFE}/transactions/history`, { failOnStatusCode: false })
    cy.contains('button', 'Accept selection').click()
  })

  it('should display October 9th transactions', () => {
    const DATE = 'Oct 9, 2022'
    const NEXT_DATE_LABEL = 'Feb 8, 2022'

    // Date label
    cy.contains('div', DATE).should('exist')

    // Transaction summaries from October 9th
    const rows = cy.contains('div', DATE).nextUntil(`div:contains(${NEXT_DATE_LABEL})`)

    rows.should('have.length', 19)

    rows
      // Receive 0.25 GOR
      .last()
      .within(() => {
        // Type
        cy.get('img').should('have.attr', 'src', INCOMING)
        cy.contains('div', 'Received').should('exist')

        // Info
        cy.get('img[alt="GOR"]').should('be.visible')
        cy.contains('span', '0.25 GOR').should('exist')

        // Time
        cy.contains('span', '4:56 PM').should('exist')

        // Status
        cy.contains('span', 'Success').should('exist')
      })
      // CowSwap deposit of Wrapped Ether
      .prev()
      .within(() => {
        // Nonce
        cy.contains('0')

        // Type
        // TODO: update next line after fixing the logo
        // cy.find('img').should('have.attr', 'src').should('include', WRAPPED_ETH)
        cy.contains('div', 'Wrapped Ether').should('exist')

        // Info
        cy.contains('div', 'deposit').should('exist')

        // Time
        cy.contains('span', '4:59 PM').should('exist')

        // Status
        cy.contains('span', 'Success').should('exist')
      })
      // CowSwap approval of Wrapped Ether
      .prev()
      .within(() => {
        // Nonce
        cy.contains('1')

        // Type
        // TODO: update next line after fixing the logo
        // cy.find('img').should('have.attr', 'src').should('include', WRAPPED_ETH)
        cy.contains('div', 'Wrapped Ether').should('exist')

        // Info
        cy.contains('div', 'approve').should('exist')

        // Time
        cy.contains('span', '5:00 PM').should('exist')

        // Status
        cy.contains('span', 'Success').should('exist')
      })
      // Contract interaction
      .prev()
      .within(() => {
        // Nonce
        cy.contains('2')

        // Type
        cy.contains('div', 'Contract interaction').should('exist')

        // Time
        cy.contains('span', '5:01 PM').should('exist')

        // Status
        cy.contains('span', 'Success').should('exist')
      })
      // Receive 120 DAI
      .prev()
      .within(() => {
        // Type
        cy.contains('div', 'Received').should('exist')

        // Info
        cy.contains('span', '120,497.61 DAI').should('exist')

        // Time
        cy.contains('span', '5:01 PM').should('exist')

        // Status
        cy.contains('span', 'Success').should('exist')
      })
      // Send 0.11 WETH
      .prev()
      .within(() => {
        // Type
        cy.get('img').should('have.attr', 'src', OUTGOING)
        cy.contains('div', 'Sent').should('exist')

        // Info
        cy.contains('span', '-0.11 WETH').should('exist')

        // Time
        cy.contains('span', '5:01 PM').should('exist')

        // Status
        cy.contains('span', 'Success').should('exist')
      })
  })
})
