import { expect, test } from '@playwright/test';

test('copy room link gives visible clipboard feedback', async ({ page }) => {
  await page.context().grantPermissions(['clipboard-write']);

  await page.goto('/');
  await page.getByLabel('Create a room').fill('Alice');
  await page.getByRole('button', { name: 'Create room' }).click();

  await expect(page).toHaveURL(/\/room\/room_/);

  await page.getByRole('button', { name: 'Copy link' }).click();

  await expect(page.getByRole('button', { name: 'Copied' })).toBeVisible();
});

test('single voter does not auto-reveal after voting', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Create a room').fill('Alice');
  await page.getByRole('button', { name: 'Create room' }).click();

  await expect(page).toHaveURL(/\/room\/room_/);
  await expect(page.getByText('Alice (you) · host')).toBeVisible();
  await expect(
    page.getByText('Your current pick stays highlighted until the round reveals.'),
  ).toBeVisible();

  const voteFive = page.getByRole('button', { name: '5', exact: true });
  const voteEight = page.getByRole('button', { name: '8', exact: true });

  await voteFive.click();

  await expect(page.getByText('1/1 votes in')).toBeVisible();
  await expect(voteFive).toHaveAttribute('aria-pressed', 'true');
  await expect(voteEight).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('article').filter({ hasText: 'Alice (you) · host' })).toContainText(
    '•••',
  );
  await expect(page.locator('article').filter({ hasText: 'Alice (you) · host' })).not.toContainText(
    '5',
  );

  await voteEight.click();

  await expect(voteEight).toHaveAttribute('aria-pressed', 'true');
  await expect(voteFive).toHaveAttribute('aria-pressed', 'false');
});

test('multi-voter room auto-reveals after the final vote', async ({ browser, page }) => {
  await page.goto('/');
  await page.getByLabel('Create a room').fill('Alice');
  await page.getByRole('button', { name: 'Create room' }).click();

  await expect(page).toHaveURL(/\/room\/room_/);
  await expect(page.getByText('Alice (you) · host')).toBeVisible();

  const roomUrl = page.url();

  const guestContext = await browser.newContext();
  const guestPage = await guestContext.newPage();
  await guestPage.goto(roomUrl);
  await guestPage.getByLabel('Display name').fill('Bob');
  await guestPage.getByRole('button', { name: 'Join as voter' }).click();
  await expect(guestPage.getByText('Bob (you)')).toBeVisible();

  await page.reload();
  await expect(page.getByText('Bob')).toBeVisible();

  await page.getByRole('button', { name: '3', exact: true }).click();
  await expect(page.getByText('1/2 votes in')).toBeVisible();
  await expect(page.locator('article').filter({ hasText: 'Alice (you) · host' })).toContainText(
    '•••',
  );

  await guestPage.getByRole('button', { name: '5' }).click();

  await expect(page.getByText('2/2 votes in')).toBeVisible();
  await expect(page.locator('article').filter({ hasText: 'Alice (you) · host' })).toContainText(
    '3',
  );
  await expect(page.locator('article').filter({ hasText: 'Bob' })).toContainText('5');

  await page.getByRole('button', { name: 'Reset round' }).click();
  await expect(page.getByText('0/2 votes in')).toBeVisible();

  await page.reload();
  await expect(page.getByText('Alice (you)')).toBeVisible();

  await guestContext.close();
});

test('host timer is visible to participants and resets with the round', async ({
  browser,
  page,
}) => {
  await page.goto('/');
  await page.getByLabel('Create a room').fill('Alice');
  await page.getByRole('button', { name: 'Create room' }).click();

  await expect(page).toHaveURL(/\/room\/room_/);
  await expect(page.locator('header').getByText('02:00')).toBeVisible();
  await page.getByLabel('Timer').fill('03:30');
  await expect(page.getByText(/Timer sound: (ready|off)/)).toBeVisible();
  await expect(
    page.getByRole('button', { name: /Enable timer sound|Test sound/ }),
  ).toBeVisible();

  const roomUrl = page.url();
  const guestContext = await browser.newContext();
  const guestPage = await guestContext.newPage();
  await guestPage.goto(roomUrl);
  await guestPage.getByLabel('Display name').fill('Bob');
  await guestPage.getByRole('button', { name: 'Join as observer' }).click();
  await expect(guestPage.getByText('Bob (you)')).toBeVisible();
  await expect(guestPage.getByRole('button', { name: 'Start timer' })).toBeHidden();
  await expect(guestPage.getByText('Two-minute timebox ready.')).toBeHidden();

  await page.getByRole('button', { name: 'Start timer' }).click();

  await expect(page.locator('header').getByText(/03:30|03:29|03:28/)).toBeVisible();
  await guestPage.reload();
  await expect(
    guestPage.locator('header').getByText(/03:30|03:29|03:28/),
  ).toBeVisible();

  await page.getByRole('button', { name: 'Reset round' }).click();
  await expect(page.locator('header').getByText('03:30')).toBeVisible();
  await guestPage.reload();
  await expect(guestPage.locator('header').getByText('02:00')).toBeVisible();

  await guestContext.close();
});
