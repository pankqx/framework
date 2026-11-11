// End-to-end smoke test: `npm run build && npm run test:e2e` (uses the installed Google Chrome).
import { chromium } from 'playwright-core'
import { createServer, preview } from 'vite'
import assert from 'node:assert/strict'

const shots = process.env.SHOTS
const server = await preview({ preview: { port: 4179, strictPort: true }, logLevel: 'silent' })
const browser = await chromium.launch({ channel: 'chrome' })
// Load the real content modules so the test answers from the same data the app uses.
const loader = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'silent' })
const { lessonBySlug } = await loader.ssrLoadModule('/src/content/lessons.ts')
const { shuffled } = await loader.ssrLoadModule('/src/modules/exercises/evaluate.ts')
const { examQuestions } = await loader.ssrLoadModule('/src/content/jlpt.ts')

async function solve(page, exercises) {
  for (let i = 0; i < exercises.length; i++) {
    const e = exercises[i]
    await page.getByText(`${i + 1} / ${exercises.length}`).waitFor()
    if (e.kind === 'mcq') {
      const index = shuffled(e.options, e.key).findIndex((o) => o.text === e.options[0].text)
      await page.getByRole('group', { name: 'Answer choices' }).getByRole('button').nth(index).click()
    } else if (e.kind === 'order') {
      for (const token of e.tokens) await page.locator('button.border-ink', { hasText: new RegExp(`^${token}$`) }).first().click()
      await page.getByRole('button', { name: 'Check' }).click()
    } else {
      await page.getByLabel('Your answer').fill(e.accept[0])
      await page.getByRole('button', { name: 'Check' }).click()
    }
    await page.getByText('Correct — here is why').waitFor()
    await page.getByRole('button', { name: i + 1 < exercises.length ? /^Next/ : /^Finish/ }).click()
  }
}
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
  await page.getByText('Accuracy by skill').waitFor()
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
  await page.getByText('Accuracy by skill').waitFor()

  // Changing goals recalculates the plan
  await page.goto(`${base}/app/settings`)
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

  // A full lesson: study → practise → apply → check → completion creates revision cards
  const lesson = lessonBySlug('n4-te-form')
  await page.goto(`${base}/app`)
  await page.getByRole('link', { name: /Start today’s lesson/ }).click()
  await page.waitForURL('**/app/lesson/n4-te-form')
  await page.getByText('Learning objective').waitFor()
  await noOverflow('lesson')
  await shot('lesson')
  await page.getByRole('button', { name: /^Practise/ }).click()
  await solve(page, lesson.practice)
  await page.getByRole('button', { name: /Take the check/ }).click()
  await solve(page, lesson.assessment)
  await page.getByText('Lesson completed').waitFor()
  const cardCount = lesson.vocab.length + lesson.grammar.length
  await page.getByText(`${cardCount} revision cards added and due now.`).waitFor()
  await shot('lesson-result')

  // Revision: every new card is due; rating them empties the queue
  await page.getByRole('link', { name: /Review cards/ }).click()
  for (let i = 0; i < cardCount; i++) {
    await page.getByRole('button', { name: 'Show answer' }).click()
    if (i === 0) { await noOverflow('review'); await shot('review') }
    await page.getByRole('button', { name: /^Good/ }).click()
  }
  await page.getByText(`Done — ${cardCount} reviewed`).waitFor()
  await page.getByLabel('Japanese').fill('猫')
  await page.getByLabel('Meaning').fill('cat')
  await page.getByRole('button', { name: 'Add card' }).click()
  await page.getByRole('button', { name: 'Show answer' }).waitFor()

  await page.goto(`${base}/app`)
  await page.getByText('Accuracy by skill').waitFor()
  const after = (await page.locator('main').innerText()).replace(/\s+/g, ' ')
  assert.match(after, /Due now 1 cards/i)
  assert.match(after, new RegExp(`Next 7 days ${cardCount} cards`, 'i'))
  assert.match(after, new RegExp(`Mastered 0 of ${cardCount + 1}`, 'i'))
  assert.match(after, /Grammar 10\/14 correct/i)
  await page.goto(`${base}/app/curriculum`)
  await page.getByText('1 / 4 lessons completed').waitFor()

  // JLPT centre: an untimed section is recorded in the history
  await page.goto(`${base}/app/jlpt`)
  await page.getByRole('button', { name: 'N4', exact: true }).click()
  await page.getByRole('button', { name: 'Untimed' }).first().click()
  await solve(page, examQuestions('n4', 'vocabulary'))
  await page.getByText('practice result').waitFor()
  await page.getByText('4/4', { exact: true }).waitFor()
  await noOverflow('jlpt')
  await shot('jlpt')

  // Challenge: start, see day 1, end
  await page.goto(`${base}/app/challenges`)
  await page.getByRole('button', { name: 'Start 30-day challenge' }).click()
  await page.getByRole('heading', { name: /Day 1/ }).waitFor()
  await noOverflow('challenge')
  await shot('challenge')

  // Every other area renders, fits the screen and is honest about what is not connected
  for (const [path, text] of [
    ['kanji', 'Readings in real words'], ['sensei', 'Sensei is not connected yet'], ['reading', 'Reading Studio'], ['listening', 'Speaking & Listening Studio'],
    ['writing', 'Writing Studio'], ['tech', 'Technical vocabulary'], ['analytics', 'Total study time'], ['more', 'Everything'],
  ]) {
    await page.goto(`${base}/app/${path}`)
    await page.getByText(text).first().waitFor()
    await noOverflow(path)
    if (['kanji', 'sensei', 'analytics'].includes(path)) await shot(path)
  }
  await page.goto(`${base}/app/sensei`)
  await page.getByRole('tab', { name: /Challenge/ }).click()
  await page.getByText(/exercises drawn from lessons covering the concepts you most recently got wrong/).waitFor()
  await page.getByLabel('Search lessons').fill('ください')
  await page.getByText('From: The て-form').first().waitFor()

  // Dark theme + erase
  await page.goto(`${base}/app`)
  await page.getByRole('button', { name: /Switch to dark theme/ }).locator('visible=true').click()
  await page.goto(`${base}/app`)
  await page.getByText('Accuracy by skill').waitFor()
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
  await loader.close()
  process.exit(failed ? 1 : 0)
}
