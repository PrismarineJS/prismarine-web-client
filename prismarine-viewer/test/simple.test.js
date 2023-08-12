/* eslint-env jest */
/* global page */

describe('Google', () => {
  beforeAll(async () => {
    await page.goto('https://google.com')
  }, 20000)

  it('should display "google" text on page', async () => {
    await expect(page).toMatch('google')
  }, 20000)
})
