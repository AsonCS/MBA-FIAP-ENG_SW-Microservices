describe('Auth and Feed Flow', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('should allow a user to register, login, post a message, and view it in the feed', () => {
    // Register a new user
    cy.get('h2').contains('Login');
    cy.contains('a', 'Register').click(); // Assuming there's a link to register page
    cy.url().should('include', '/register');

    const username = `testuser-${Date.now()}`;
    const password = 'password123';

    cy.get('input#username').type(username);
    cy.get('input#password').type(password);
    cy.get('button[type="submit"]').click();

    cy.url().should('include', '/login'); // Should redirect to login after registration
    cy.contains('Login failed').should('not.exist'); // Ensure no registration error

    // Login with the new user
    cy.get('input#username').type(username);
    cy.get('input#password').type(password);
    cy.get('button[type="submit"]').click();

    cy.url().should('eq', 'http://localhost:3000/'); // Should redirect to home
    cy.contains('Login failed').should('not.exist'); // Ensure no login error

    // Select a subject and post a message
    cy.contains('button', 'Sports').click();
    const message = `Hello from Cypress - ${Date.now()}`;
    cy.get('textarea').type(message);
    cy.contains('button', 'Post Message').click();
    cy.contains('Message sent!').should('be.visible');

    // Refresh feed and verify message
    cy.contains('button', 'Refresh Feed').click();
    cy.wait(2000); // Give the iframe time to load
    cy.get('iframe').its('0.contentDocument.body').should('include.text', message);
  });
});