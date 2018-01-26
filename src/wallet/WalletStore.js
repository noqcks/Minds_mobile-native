import {
  observable,
  computed,
  action
} from 'mobx'

import walletService from './WalletService';
import abbrev from "../common/helpers/abbrev";
import token from "../common/helpers/token";
import number from "../common/helpers/number";
import TokensStore from './tokens/TokensStore';
/**
 * Wallet store
 */
class WalletStore {
  @observable points = -1;
  @observable rewards = -1;
  @observable money = -1;
  @observable tokens = -1;

  ledger = new TokensStore();

  refreshing = false;
  loaded = false;

  async refresh(force = false) {
    if ((this.refreshing || this.loaded) && !force) {
      return;
    }

    console.log('Refreshing wallet…');

    this.refreshing = true;
    const asyncs = [];

    // Points
    asyncs.push(walletService.getCount()
      .then(points => {
        this.points = points;
      })
      .catch(e => {
        this.points = -1;
      }));

    // Rewards
    asyncs.push(walletService.getRewardsBalance()
      .then(rewards => {
        this.rewards = rewards;
      })
      .catch(e => {
        this.rewards = -1;
      }));

    // Money
    asyncs.push(walletService.getMoneyBalance()
      .then(money => {
        this.money = money;
      })
      .catch(e => {
        this.money = -1;
      }));

    // Tokens
    asyncs.push(walletService.getTokensBalance()
      .then(tokens => {
        this.tokens = tokens;
      })
      .catch(e => {
        this.tokens = -1;
      }));

    //

    await Promise.all(asyncs); // Wait for all 3 requests to finish
    this.refreshing = false;
    this.loaded = true;
  }

  // Computed properties for display
  @computed get pointsFormatted() {
    return this.points > -1 ? abbrev(this.points) : '…'
  }

  @computed get rewardsFormatted() {
    return this.rewards > -1 ? abbrev(number(token(this.rewards, 18), 2)) : '…'
  }

  @computed get moneyFormatted() {
    return this.money > -1 ? `$ ${this.money}` : '$ …'
  }

  @computed get tokensFormatted() {
    return this.tokens > -1 ? number(this.tokens, 2) : '…'
  }

  /**
   * Join to wallet tokens
   * @param {string} number
   */
  join(number) {
    return walletService.join(number)
  }

  /**
   * Confirm join
   * @param {string} number
   * @param {string} code
   * @param {string} secret
   */
  confirm(number, code, secret) {
    return walletService.confirm(number, code, secret);
  }

  // TODO: Implement forced auto-refresh every X minutes
  // TODO: Implement socket and atomic increases/decreases
}

export default new WalletStore()
