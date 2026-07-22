const path = require('path');
const { test, expect } = require('@playwright/test');

test.describe('Date Handling & Year Preservation Tests', () => {
  const appPath = `file://${path.resolve(__dirname, '..', 'index.html')}`;
  const cell = (page, row, col) => page.getByTestId(`cell-${row}-${col}`);

  const enterValue = async (page, row, col, val) => {
    const targetCell = cell(page, row, col);
    await targetCell.click();
    await page.keyboard.press('Enter');
    await page.locator('.cell-input').fill(val);
    await page.keyboard.press('Enter');
  };

  test('preserves user-entered year for 20/01/2025', async ({ page }) => {
    await page.goto(appPath);
    await enterValue(page, 0, 0, '20/01/2025');

    const text = await cell(page, 0, 0).locator('.cell-content').innerText();
    expect(text).toBe('20/01/2025');
  });

  test('preserves user-entered year for 01-Jan-2024', async ({ page }) => {
    await page.goto(appPath);
    await enterValue(page, 0, 1, '01-Jan-2024');

    const text = await cell(page, 0, 1).locator('.cell-content').innerText();
    expect(text).toBe('01-Jan-2024');
  });

  test('preserves user-entered year for 31/12/2030', async ({ page }) => {
    await page.goto(appPath);
    await enterValue(page, 0, 2, '31/12/2030');

    const text = await cell(page, 0, 2).locator('.cell-content').innerText();
    expect(text).toBe('31/12/2030');
  });

  test('rejects invalid date 31/02/2025 with validation error indicator instead of defaulting to 1900', async ({ page }) => {
    await page.goto(appPath);
    // Explicitly apply Date format first
    await cell(page, 1, 0).click();
    await page.getByTestId('btnFormatDate').click();

    // Enter invalid Feb 31 date
    await enterValue(page, 1, 0, '31/02/2025');

    const text = await cell(page, 1, 0).locator('.cell-content').innerText();
    expect(text).toBe('#INVALID DATE!');
    expect(text).not.toContain('1900');
  });

  test('handles leap year correctly (29/02/2024 is valid, 29/02/2025 is invalid)', async ({ page }) => {
    await page.goto(appPath);

    // 2024 is a leap year -> valid!
    await enterValue(page, 2, 0, '29/02/2024');
    const validLeapText = await cell(page, 2, 0).locator('.cell-content').innerText();
    expect(validLeapText).toBe('29/02/2024');

    // 2025 is not a leap year -> invalid!
    await cell(page, 2, 1).click();
    await page.getByTestId('btnFormatDate').click();
    await enterValue(page, 2, 1, '29/02/2025');

    const invalidLeapText = await cell(page, 2, 1).locator('.cell-content').innerText();
    expect(invalidLeapText).toBe('#INVALID DATE!');
  });
});
