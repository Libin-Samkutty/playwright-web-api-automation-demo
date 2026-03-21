import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';
import { step } from '../helpers/allure.helper';

export class GeolocationPage extends BasePage {
  protected readonly path = '/geolocation';

  readonly getLocationButton: Locator;
  readonly latitudeDisplay: Locator;
  readonly longitudeDisplay: Locator;
  readonly errorDisplay: Locator;
  readonly locationDisplay: Locator;

  constructor(page: Page) {
    super(page);
    this.getLocationButton = page.locator(
      'button:has-text("Where am I"), button:has-text("location"), button:has-text("Get")',
    ).first();
    this.latitudeDisplay = page.locator('#lat-value, .latitude, [id*="lat"]').first();
    this.longitudeDisplay = page.locator('#long-value, .longitude, [id*="long"]').first();
    this.errorDisplay = page.locator('.error, #error, [class*="error"]').first();
    this.locationDisplay = page.locator('#demo, #location, .location-result').first();
  }

  async clickGetLocation(): Promise<void> {
    await step('Click get location button', async () => {
      await this.getLocationButton.click();
    });
  }

  async getDisplayedLatitude(): Promise<string> {
    await this.latitudeDisplay.waitFor({ state: 'visible', timeout: 5000 });
    return (await this.latitudeDisplay.textContent())?.trim() ?? '';
  }

  async getDisplayedLongitude(): Promise<string> {
    await this.longitudeDisplay.waitFor({ state: 'visible', timeout: 5000 });
    return (await this.longitudeDisplay.textContent())?.trim() ?? '';
  }

  async getLocationText(): Promise<string> {
    await this.locationDisplay.waitFor({ state: 'visible', timeout: 5000 });
    return (await this.locationDisplay.textContent())?.trim() ?? '';
  }

  async expectError(): Promise<void> {
    await step('Verify geolocation error displayed', async () => {
      await this.errorDisplay.waitFor({ state: 'visible', timeout: 5000 });
    });
  }
}