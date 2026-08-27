describe('Booking Flow E2E', () => {
  it('should successfully book an appointment', () => {
    // Navigate to the demo doctor page
    cy.visit('/dr-ahmet');

    // Step 1: Select a service
    cy.contains('Hizmet Seçiniz', { timeout: 10000 }).should('be.visible');
    cy.get('button.group').first().click();

    // Step 2: Select a date and time
    cy.contains('Tarih ve Saat').should('be.visible');
    // Find the 09:00 time slot and click it
    cy.get('button').contains('09:00').click();

    // Step 3: Fill customer details
    cy.contains('Bilgileriniz').should('be.visible');
    cy.get('input[placeholder="Örn: Ayşe Demir"]').type('Test Kullanıcısı');
    cy.get('input[placeholder="05XX XXX XX XX"]').type('05551234567');
    cy.get('textarea').type('Bu bir e2e otomatik testidir.');
    
    // Submit the form
    cy.contains('button', 'Randevuyu Onayla').click();

    // Step 4: Success page
    cy.contains('Harika, Onaylandı!', { timeout: 15000 }).should('be.visible');
    cy.contains('Randevu detaylarınız WhatsApp üzerinden telefonunuza az önce gönderildi.').should('be.visible');
  });
});
