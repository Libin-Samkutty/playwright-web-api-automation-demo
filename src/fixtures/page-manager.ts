import { Page } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { RegisterPage } from '../pages/register.page';
import { ForgotPasswordPage } from '../pages/forgot-password.page';
import { SecurePage } from '../pages/secure.page';
import { InputsPage } from '../pages/inputs.page';
import { FormValidationPage } from '../pages/form-validation.page';
import { DropdownPage } from '../pages/dropdown.page';
import { CheckboxesPage } from '../pages/checkboxes.page';
import { RadioButtonsPage } from '../pages/radio-buttons.page';
import { AlertsPage } from '../pages/alerts.page';
import { WindowsPage } from '../pages/windows.page';
import { DragDropPage } from '../pages/drag-drop.page';
import { DragCirclesPage } from '../pages/drag-circles.page';
import { UploadPage } from '../pages/upload.page';
import { DynamicTablePage } from '../pages/dynamic-table.page';
import { PaginationTablePage } from '../pages/pagination-table.page';
import { LocatorsPage } from '../pages/locators.page';
import { ShadowDomPage } from '../pages/shadow-dom.page';
import { IframePage } from '../pages/iframe.page';
import { GeolocationPage } from '../pages/geolocation.page';
import { ContextMenuPage } from '../pages/context-menu.page';
import { TooltipsPage } from '../pages/tooltips.page';
import { InfiniteScrollPage } from '../pages/infinite-scroll.page';
import { HorizontalSliderPage } from '../pages/horizontal-slider.page';
import { ChallengingDomPage } from '../pages/challenging-dom.page';
import { LargePagePage } from '../pages/large-page.page';
import { StatusCodesPage } from '../pages/status-codes.page';
import { BrokenImagesPage } from '../pages/broken-images.page';
import { RedirectPage } from '../pages/redirect.page';
import { ABTestPage } from '../pages/abtest.page';
import { TyposPage } from '../pages/typos.page';
import { BrowserInfoPage } from '../pages/browser-info.page';
import { NotesAppPage } from '../pages/notes-app.page';

export class PageManager {
  private page: Page;
  private cache = new Map<string, unknown>();

  constructor(page: Page) {
    this.page = page;
  }

  private getOrCreate<T>(key: string, factory: () => T): T {
    if (!this.cache.has(key)) {
      this.cache.set(key, factory());
    }
    return this.cache.get(key) as T;
  }

  get loginPage() { return this.getOrCreate('login', () => new LoginPage(this.page)); }
  get registerPage() { return this.getOrCreate('register', () => new RegisterPage(this.page)); }
  get forgotPasswordPage() { return this.getOrCreate('forgot', () => new ForgotPasswordPage(this.page)); }
  get securePage() { return this.getOrCreate('secure', () => new SecurePage(this.page)); }
  get inputsPage() { return this.getOrCreate('inputs', () => new InputsPage(this.page)); }
  get formValidationPage() { return this.getOrCreate('formVal', () => new FormValidationPage(this.page)); }
  get dropdownPage() { return this.getOrCreate('dropdown', () => new DropdownPage(this.page)); }
  get checkboxesPage() { return this.getOrCreate('checkbox', () => new CheckboxesPage(this.page)); }
  get radioButtonsPage() { return this.getOrCreate('radio', () => new RadioButtonsPage(this.page)); }
  get alertsPage() { return this.getOrCreate('alerts', () => new AlertsPage(this.page)); }
  get windowsPage() { return this.getOrCreate('windows', () => new WindowsPage(this.page)); }
  get dragDropPage() { return this.getOrCreate('dragdrop', () => new DragDropPage(this.page)); }
  get dragCirclesPage() { return this.getOrCreate('circles', () => new DragCirclesPage(this.page)); }
  get uploadPage() { return this.getOrCreate('upload', () => new UploadPage(this.page)); }
  get dynamicTablePage() { return this.getOrCreate('dynTable', () => new DynamicTablePage(this.page)); }
  get paginationTablePage() { return this.getOrCreate('pagTable', () => new PaginationTablePage(this.page)); }
  get locatorsPage() { return this.getOrCreate('locators', () => new LocatorsPage(this.page)); }
  get shadowDomPage() { return this.getOrCreate('shadow', () => new ShadowDomPage(this.page)); }
  get iframePage() { return this.getOrCreate('iframe', () => new IframePage(this.page)); }
  get geolocationPage() { return this.getOrCreate('geo', () => new GeolocationPage(this.page)); }
  get contextMenuPage() { return this.getOrCreate('context', () => new ContextMenuPage(this.page)); }
  get tooltipsPage() { return this.getOrCreate('tooltips', () => new TooltipsPage(this.page)); }
  get infiniteScrollPage() { return this.getOrCreate('scroll', () => new InfiniteScrollPage(this.page)); }
  get horizontalSliderPage() { return this.getOrCreate('slider', () => new HorizontalSliderPage(this.page)); }
  get challengingDomPage() { return this.getOrCreate('challDom', () => new ChallengingDomPage(this.page)); }
  get largePagePage() { return this.getOrCreate('largePage', () => new LargePagePage(this.page)); }
  get statusCodesPage() { return this.getOrCreate('status', () => new StatusCodesPage(this.page)); }
  get brokenImagesPage() { return this.getOrCreate('broken', () => new BrokenImagesPage(this.page)); }
  get redirectPage() { return this.getOrCreate('redirect', () => new RedirectPage(this.page)); }
  get abTestPage() { return this.getOrCreate('abtest', () => new ABTestPage(this.page)); }
  get typosPage() { return this.getOrCreate('typos', () => new TyposPage(this.page)); }
  get browserInfoPage() { return this.getOrCreate('browser', () => new BrowserInfoPage(this.page)); }
  get notesAppPage() { return this.getOrCreate('notesApp', () => new NotesAppPage(this.page)); }
}