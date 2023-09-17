/// <reference types="cypress" />

const setLocalStorageSettings = () => {
    window.localStorage.cypress = 'true'
    window.localStorage.server = 'localhost'
}

// todo use ssl

it('Loads & renders singleplayer', () => {
    // todo use <button match text selectors
    cy.visit('/')
    window.localStorage.clear()
    window.localStorage.setItem('renderDistance', '2')
    window.localStorage.setItem('options', JSON.stringify({
        localServerOptions: {
            generation: {
                name: 'superflat',
                options: { seed: 250869072 }
            }
        }
    }))
    setLocalStorageSettings()
    // todo replace with data-test
    cy.get('#title-screen').find('[data-test-id="singleplayer-button"]', { includeShadowDom: true, }).click()
    // todo implement load event
    cy.wait(12000)
    cy.get('body').toMatchImageSnapshot({
        name: 'superflat-world',
    })
})

it.skip('Joins to server', () => {
    cy.visit('/')
    setLocalStorageSettings()
    // todo replace with data-test
    cy.get('#title-screen').find('[data-test-id="connect-screen-button"]', { includeShadowDom: true, }).click()
    cy.get('input#serverip', { includeShadowDom: true, }).clear().focus().type('localhost')
    cy.get('[data-test-id="connect-to-server"]', { includeShadowDom: true, }).click()
    // todo implement load event
    cy.wait(12000)
    cy.get('body').toMatchImageSnapshot({
        name: 'superflat-world',
    })
})

it('Loads & renders zip world', () => {
    cy.visit('/')
    setLocalStorageSettings()
    // todo replace with data-test
    cy.get('#title-screen').find('[data-test-id="select-file-folder"]', { includeShadowDom: true, }).click({ shiftKey: true })
    cy.get('input[type="file"]').selectFile('cypress/superflat.zip', { force: true })
    // todo implement load event
    cy.wait(12000)
    cy.get('body').toMatchImageSnapshot({
        name: 'superflat-world',
    })
})

it.skip('Performance test', () => {
    cy.visit('/')
    window.localStorage.cypress = 'true'
    window.localStorage.setItem('renderDistance', '6')
    cy.get('#title-screen').find('.menu > div:nth-child(2) > pmui-button:nth-child(1)', { includeShadowDom: true, }).selectFile('worlds')
    // -2 85 24
    // await bot.loadPlugin(pathfinder.pathfinder)
    // bot.pathfinder.goto(new pathfinder.goals.GoalXZ(28, -28))
})
