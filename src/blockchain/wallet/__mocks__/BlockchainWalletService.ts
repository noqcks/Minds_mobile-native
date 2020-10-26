export default {
  isValidAddress: jest.fn(),
  normalizePrivateKey: jest.fn(),
  isValidPrivateKey: jest.fn(),
  getAll: jest.fn(),
  get: jest.fn(),
  set: jest.fn(),
  delete: jest.fn(),
  getCurrent: jest.fn(),
  unlock: jest.fn(),
  selectCurrent: jest.fn(),
  setCurrent: jest.fn(),
  restoreCurrentFromStorage: jest.fn(),
  create: jest.fn(),
  import: jest.fn(),
  getFunds: jest.fn(),
  getOnchainFunds: jest.fn(),
  getOffchainFunds: jest.fn(),
  _DANGEROUS_wipe: jest.fn(),
};
