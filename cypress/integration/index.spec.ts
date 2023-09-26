/// <reference types="cypress" />
import type { AppOptions } from '../../src/optionsStorage'

const cleanVisit = () => {
  window.localStorage.clear()
  visit()
}

const visit = (url = '/') => {
  window.localStorage.cypress = 'true'
  cy.visit(url)
}

// todo use ssl

const compareRenderedFlatWorld = () => {
  // wait for render
  // cy.wait(6000)
  // cy.get('body').toMatchImageSnapshot({
  //     name: 'superflat-world',
  // })
}

const testWorldLoad = () => {
  cy.document().then({ timeout: 20_000, }, doc => {
    return new Cypress.Promise(resolve => {
      doc.addEventListener('cypress-world-ready', resolve)
    })
  }).then(() => {
    compareRenderedFlatWorld()
  })
}

const setOptions = (options: Partial<AppOptions>) => {
  cy.window().then(win => {
    Object.assign(win['options'], options)
  })
}

it('Loads & renders singleplayer', () => {
  cleanVisit()
  setOptions({
    localServerOptions: {
      generation: {
        name: 'superflat',
        // eslint-disable-next-line unicorn/numeric-separators-style
        options: { seed: 250869072 }
      },
    },
    renderDistance: 2
  })
  cy.get('#title-screen').find('[data-test-id="singleplayer-button"]', { includeShadowDom: true, }).click()
  testWorldLoad()
})

it('Joins to server', () => {
  // visit('/?version=1.16.1')
  window.localStorage.version = ''
  visit()
  // todo replace with data-test
  cy.get('#title-screen').find('[data-test-id="connect-screen-button"]', { includeShadowDom: true, }).click()
  cy.get('input#serverip', { includeShadowDom: true, }).clear().focus().type('localhost')
  cy.get('[data-test-id="connect-to-server"]', { includeShadowDom: true, }).click()
  testWorldLoad()
})

it('Loads & renders zip world', () => {
  cleanVisit()
  cy.get('#title-screen').find('[data-test-id="select-file-folder"]', { includeShadowDom: true, }).click({ shiftKey: true })
  cy.get('input[type="file"]').selectFile('cypress/superflat.zip', { force: true })
  testWorldLoad()
})

it.skip('Performance test', () => {
  // select that world
  // from -2 85 24
  // await bot.loadPlugin(pathfinder.pathfinder)
  // bot.pathfinder.goto(new pathfinder.goals.GoalXZ(28, -28))
})
