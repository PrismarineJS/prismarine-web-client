/// <reference types="cypress" />

it('Loads & renders singleplayer', () => {
    // todo use <button match text selectors
    cy.visit('/')
    window.localStorage.cypress = 'true'
    cy.window().then((win) => {
    })
    window.localStorage.server = 'localhost'
    window.localStorage.setItem('renderDistance', '2')
    window.localStorage.setItem('localServerOptions', JSON.stringify({
        generation: {
            name: 'superflat',
            options: { seed: 250869072 }
        }
    }))
    // todo replace with data-test
    cy.get('#title-screen').find('.menu > div:nth-child(2) > pmui-button:nth-child(1)', { includeShadowDom: true, }).click()
    // todo implement load event
    cy.wait(6000)
    //@ts-ignore
    cy.get('body').toMatchImageSnapshot({
        // imageConfig: {
        //   threshold: 0.001,
        // },
    })

    // config load TODO remove
    // cy.get('#play-screen').find('pmui-button', {includeShadowDom: true,}).contains('Connect', {includeShadowDom: true, }).click()
})
