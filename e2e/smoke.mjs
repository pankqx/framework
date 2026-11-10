// End-to-end smoke test: `npm run build && npm run test:e2e` (uses the installed Google Chrome).
import { chromium } from 'playwright-core'
import { preview } from 'vite'
import assert from 'node:assert/strict'

const shots = process.env.SHOTS
const server = await preview({ preview: { port: 4179, strictPort: true }, logLevel: 'silent' })
const browser = await chromium.launch({ channel: 'chrome' })
const errors = []
const base = 'http://localhost:4179'

async function run(name, viewport) {
  const context = await browser.newContext({ viewport })
  const page = await context.newPage()
  page.on('console', (m) => m.type() === 'error' && !/fonts\.g|ERR_|Failed to load resource/.test(m.text()) && errors.push(`${name}: ${m.text()}`))
  page.on('pageerror', (e) => errors.push(`${name}: ${e.message}`))
  const shot = async (label) => shots && (await page.waitForTimeout(900), await page.screenshot({ path: `${shots}/${name}-${label}.png`, fullPage: label !== 'hero' }))
  const noOverflow = async (label) =>
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), `${name}: horizontal overflow on ${label}`)

  // Landing
  await page.goto(base)
  await page.getByRole('heading', { level: 1 }).waitFor()
  await shot('hero')
  await noOverflow('landing')
  await shot('landing')

  // /app without a profile redirects to onboarding
  await page.goto(`${base}/app`)
  await page.waitForURL('**/onboarding')

  // Onboarding form
  await page.getByLabel('Your name').fill('Tester')
  await page.getByRole('button', { name: /Continue/ }).click()
  assert.ok(await page.getByRole('button', { name: /Continue/ }).isDisabled(), 'Continue must be disabled until answered')
  await page.getByText('Around N5').click()
  await page.getByText('Self-study').click()
  await shot('onboarding')
  await page.getByRole('button', { name: /Continue/ }).click()
  await page.getByText('Pass the JLPT').click()
  await page.getByRole('button', { name: /Continue/ }).click()
  await page.getByText('30 min').click()
  await page.getByText('Steady').click()
  await page.getByRole('button', { name: /Continue/ }).click()
  await page.getByText('English', { exact: true }).click()
  await page.getByRole('button', { name: /Continue/ }).click()
  await page.getByRole('button', { name: /Take the assessment/ }).click()

  // Placement: answer foundation + N5 correctly, then fail N4 (2 wrong, 2 "don't know").
  const correct = ['ne', 'shi', 'おばあさん', 'kitte', 'は', 'みました', 'に', 'おいしくないです']
  for (const text of correct) {
    await page.getByRole('group', { name: 'Answer choices' }).getByRole('button', { name: text, exact: true }).click()
    await page.getByText('Correct — here is why').waitFor()
    await page.getByRole('button', { name: /Next/ }).click()
  }
  await page.getByRole('button', { name: 'とりて', exact: true }).click()
  await page.getByText('Not quite — here is why').waitFor()
  await shot('placement-feedback')
  await noOverflow('placement')
  await page.getByRole('button', { name: /Next/ }).click()
  await page.getByRole('button', { name: 'ひきます', exact: true }).click()
  await page.getByRole('button', { name: /Next/ }).click()
  for (let i = 0; i < 2; i++) {
    await page.getByRole('button', { name: /I don’t know/ }).click()
    await page.getByRole('button', { name: /Next/ }).click()
  }

  // Result: placed at N4, plan sums to 30 minutes
  await page.getByText('Placed by assessment').waitFor()
  assert.match(await page.locator('main').innerText(), /Foundation 4\/4 · JLPT N5 4\/4 · JLPT N4 0\/4/)
  await shot('plan')
  await page.getByRole('button', { name: /Open my dashboard/ }).click()
  await page.waitForURL('**/app')

  // Dashboard reflects exactly what was done — nothing more
  await page.getByText('Tester').waitFor()
  const body = (await page.locator('main').innerText()).replace(/\s+/g, ' ')
  assert.match(body, /Kana 4\/4 correct/i)
  assert.match(body, /Grammar 4\/8 correct/i)
  assert.match(body, /Reading No activity yet/i)
  assert.match(body, /Level N4 by placement/i)
  assert.match(body, /Streak 1 day/i)
  assert.match(body, /JLPT N4 0\/4 · not yet/i)
  assert.match(body, /\/ 30 min/)
  for (const concept of ['て-form + もいいですか', 'Potential form', 'Giving and receiving: くれる', 'Conditional ～と'])
    assert.ok(body.includes(concept), `weak concept missing: ${concept}`)
  assert.ok(!body.includes('Topic particle は'), 'correctly answered concepts must not be listed as weak')
  await noOverflow('dashboard')
  await shot('dashboard')

  // Progress survives a reload
  await page.reload()
  await page.getByText('Tester').waitFor()

  // Changing goals recalculates the plan
  await page.getByRole('navigation', { name: 'Primary' }).locator('visible=true').getByRole('link', { name: /Settings/ }).click()
  await page.getByText('60 min').click()
  await page.getByRole('button', { name: 'Save goals' }).click()
  await page.getByText('Saved. Your plan has been recalculated.').waitFor()
  await noOverflow('settings')
  await page.getByRole('navigation', { name: 'Primary' }).locator('visible=true').getByRole('link', { name: /Today/ }).click()
  await page.getByText('/ 60 min').waitFor()

  await page.getByRole('navigation', { name: 'Primary' }).locator('visible=true').getByRole('link', { name: /Curriculum/ }).click()
  await page.getByText('You are here').waitFor()
  await noOverflow('curriculum')
  await shot('curriculum')

  // Dark theme + erase
  await page.getByRole('button', { name: /Switch to dark theme/ }).locator('visible=true').click()
  await page.goto(`${base}/app`)
  await page.getByText('Tester').waitFor()
  await shot('dashboard-dark')
  await page.goto(`${base}/app/settings`)
  await page.getByRole('button', { name: /Erase my data/ }).click()
  await page.getByRole('button', { name: /Yes, erase everything/ }).click()
  await page.waitForURL(base + '/')
  await page.goto(`${base}/app`)
  await page.waitForURL('**/onboarding')
  await context.close()
}

let failed = false
try {
  await run('mobile', { width: 390, height: 844 })
  await run('desktop', { width: 1440, height: 900 })
  assert.deepEqual(errors, [], 'console errors')
  console.log('e2e smoke: PASS (mobile 390px + desktop 1440px)')
} catch (e) {
  failed = true
  console.error('e2e smoke: FAIL\n', e)
} finally {
  await browser.close()
  await server.close()
  process.exit(failed ? 1 : 0)
}
