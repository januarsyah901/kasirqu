describe('POS Sale Flow', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173/pos');
  });

  it('completes a full sale transaction', () => {
    // Add products to cart
    cy.contains('Kopi Susu').click();
    cy.contains('Nasi Goreng').click();
    
    // Verify cart items
    cy.get('.bg-gray-50').should('have.length', 2);
    
    // Verify total calculation
    cy.contains('Rp 40,000').should('exist');
    
    // Click checkout
    cy.contains('Checkout').click();
    
    // Payment modal should appear
    cy.contains('Payment').should('be.visible');
    
    // Select payment method
    cy.contains('Cash').click();
    
    // Cart should be cleared
    cy.contains('Cart is empty').should('be.visible');
  });

  it('allows quantity adjustment', () => {
    // Add product
    cy.contains('Kopi Susu').click();
    
    // Increase quantity
    cy.get('button').contains('+').click();
    cy.contains('2').should('exist');
    
    // Decrease quantity
    cy.get('button').contains('-').click();
    cy.contains('1').should('exist');
  });

  it('removes item from cart', () => {
    // Add product
    cy.contains('Kopi Susu').click();
    
    // Remove item
    cy.get('button').contains('✕').click();
    
    // Cart should be empty
    cy.contains('Cart is empty').should('be.visible');
  });
});
