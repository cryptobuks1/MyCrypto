import { t, Selector } from 'testcafe';

import { getTransValueByKey } from './translation-utils';

import { PAGES, FIXTURE_ETHEREUM, FIXTURE_INCOMING_TX_HASH } from './fixtures';
import BasePage from './base-page.po';

export default class TxStatusPage extends BasePage {
  async navigateToPage() {
    this.navigateTo(PAGES.TX_STATUS);
  }

  async waitPageLoaded(timeout) {
    await this.waitForPage(PAGES.TX_STATUS, timeout);
  }

  async fillForm() {
    await t
      .typeText(Selector('div[data-testid="selector"]').find('input'), FIXTURE_ETHEREUM)
      .click(Selector('div[data-testid="selector"]').find('span').withText(FIXTURE_ETHEREUM))
      .typeText(Selector(`input[name="txhash"]`), FIXTURE_INCOMING_TX_HASH)
      .click(Selector('button').withText(getTransValueByKey('FETCH')));
  }
}
