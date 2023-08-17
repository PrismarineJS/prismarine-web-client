/// <reference types="cypress" />

it('Renders menu (options button)', () => {
    // todo use <button match text selectors
    cy.visit('/')
    cy.window().then((win) => {
        win['cypress'] = true
        win['hideStats']()
    })
    window.localStorage.server = 'localhost'
    window.localStorage.setItem('renderDistance', '2')
    window.localStorage.setItem('localServerOptions', JSON.stringify({
        generation: {
            name: 'superflat',
            options: { seed: 250869072 }
        }
    }))
    cy.get('#title-screen').find('.menu > pmui-button:nth-child(2)', { includeShadowDom: true, }).click()
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
