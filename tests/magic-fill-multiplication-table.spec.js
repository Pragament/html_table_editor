const path = require('path');
const { test, expect } = require('@playwright/test');

test('student creates a multiplication table with Magic Fill', async ({ page }) => {
  const appPath = `file://${path.resolve(__dirname, '..', 'index.html')}`;
  const cell = (row, col) => page.locator(`.cell[data-row="${row}"][data-col="${col}"]`);
  const dispatchCellMouseEvent = async (row, col, type) => {
    const selector = `.cell[data-row="${row}"][data-col="${col}"]`;
    await page.waitForSelector(selector);
    await page.evaluate(({ cellSelector, eventType }) => {
      const target = document.querySelector(cellSelector);
      if (!target) throw new Error(`Missing ${cellSelector}`);
      target.dispatchEvent(new MouseEvent(eventType, {
        bubbles: true,
        cancelable: true,
        button: 0,
      }));
    }, { cellSelector: selector, eventType: type });
  };
  const selectCell = async (row, col) => {
    await dispatchCellMouseEvent(row, col, 'mousedown');
    await page.evaluate(() => {
      document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    });
  };
  const editCell = async (row, col, value) => {
    await selectCell(row, col);
    await page.evaluate(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true,
        cancelable: true,
      }));
    });
    await page.locator('.cell-input').fill(value);
    await page.keyboard.press('Enter');
  };
  const dragSelectCells = async (startRow, startCol, endRow, endCol) => {
    await dispatchCellMouseEvent(startRow, startCol, 'mousedown');
    const rowStep = startRow <= endRow ? 1 : -1;
    const colStep = startCol <= endCol ? 1 : -1;
    for (let row = startRow; row !== endRow + rowStep; row += rowStep) {
      for (let col = startCol; col !== endCol + colStep; col += colStep) {
        await dispatchCellMouseEvent(row, col, 'mouseenter');
      }
    }
    await page.evaluate(() => {
      document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    });
  };

  await page.goto(appPath);
  await expect(cell(0, 0)).toBeVisible();

  await editCell(0, 0, '7');
  await editCell(1, 0, '14');

  await dragSelectCells(0, 0, 9, 0);

  await page.locator('#btnMagicFill').click();

  for (let row = 0; row < 10; row++) {
    await expect(cell(row, 0).locator('.cell-content')).toHaveText(String((row + 1) * 7));
  }
});
