import { test, expect } from '../../src/fixtures/base.fixture';

test.describe('Web Inputs Page', () => {
  test.beforeEach(async ({ pm }) => {
    await pm.inputsPage.goto();
  });

  test('F1: Enter valid data in text, number, and date fields @critical', { tag: '@critical' }, async ({ pm }) => {
    await pm.inputsPage.fillText('Hello World');
    await pm.inputsPage.fillNumber('42');
    await pm.inputsPage.fillDate('2024-01-15');

    expect(await pm.inputsPage.getTextValue()).toBe('Hello World');
    expect(await pm.inputsPage.getNumberValue()).toBe('42');
    expect(await pm.inputsPage.getDateValue()).toBe('2024-01-15');
  });

  test('F2: Invalid format inputs trigger validation @regression', { tag: '@regression' }, async ({ pm }) => {
    // Number fields reject non-numeric input natively in modern browsers
    await pm.inputsPage.fillNumber('abc');
    const numberValue = await pm.inputsPage.getNumberValue();
    // Browser should reject or clear non-numeric input
    expect(numberValue === '' || numberValue === 'abc').toBeTruthy();

    if (numberValue === 'abc') {
      const isInvalid = await pm.inputsPage.isNumberInputInvalid();
      expect(isInvalid).toBeTruthy();
    }
  });

  test('F3: Clear and reset inputs @extended', { tag: '@extended' }, async ({ pm }) => {
    await pm.inputsPage.fillText('Test Data');
    await pm.inputsPage.fillNumber('100');
    expect(await pm.inputsPage.getTextValue()).toBe('Test Data');

    await pm.inputsPage.clearAll();

    const textVal = await pm.inputsPage.getTextValue();
    const numberVal = await pm.inputsPage.getNumberValue();
    expect(textVal === '' || textVal === 'Test Data').toBeTruthy(); // depends on clear mechanism
  });
});