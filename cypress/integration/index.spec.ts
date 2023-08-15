/// <reference types="cypress" />

it('Renders menu (options button)', () => {
    // todo use <button match text selectors
    cy.visit('/')
    window.localStorage.server = 'localhost'
    window.localStorage.setItem('renderDistance', '2')
    cy.get('#title-screen').find('.menu > pmui-button:nth-child(1)', {includeShadowDom: true,}).click()
    // config load TODO remove
    // cy.wait(500)
    cy.get('#play-screen').find('pmui-button', {includeShadowDom: true,}).contains('Connect', {includeShadowDom: true, }).click()
})
