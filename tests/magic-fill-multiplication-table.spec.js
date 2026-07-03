const path = require('path');
const { test, expect } = require('@playwright/test');

test('student creates a multiplication table with Magic Fill', async ({ page }) => {
  const appPath = `file://${path.resolve(__dirname, '..', 'index.html')}`;
  const cell = (row, col) => page.getByTestId(`cell-${row}-${col}`);
  const editCell = async (row, col, value) => {
    await cell(row, col).click();
    await page.keyboard.press('Enter');
    await page.locator('.cell-input').fill(value);
    await page.keyboard.press('Enter');
  };

  await page.goto(appPath);
  await expect(cell(0, 0)).toBeVisible();

  await editCell(0, 0, '7');
  await editCell(1, 0, '14');

  await cell(0, 0).click();
  await page.keyboard.down('Shift');
  await cell(9, 0).click();
  await page.keyboard.up('Shift');

  await page.getByTestId('magic-fill-button').click();

  for (let row = 0; row < 10; row++) {
    await expect(cell(row, 0).locator('.cell-content')).toHaveText(String((row + 1) * 7));
  }
});
