import 'react-native';
import React from 'react';
import renderer from 'react-test-renderer';

import LoginScreen from '../../src/auth/multi-user/LoginScreen';
import { getStores } from '../../AppStores';
jest.mock('@gorhom/bottom-sheet');
jest.mock('react-native-reanimated', () =>
  require('react-native-reanimated/mock'),
);
jest.mock('../../src/auth/AuthService');
jest.mock('react-native-safe-area-context');

getStores.mockReturnValue({
  user: {
    me: {},
    load: jest.fn().mockReturnValue({ guid: '1' }),
    setUser: jest.fn(),
  },
});

describe('LoginScreen component', () => {
  beforeEach(() => {});

  it('should renders correctly', () => {
    const route = { params: {} };
    const navigation = { goBack: jest.fn() };
    const loginScreen = renderer
      .create(<LoginScreen route={route} navigation={navigation} />)
      .toJSON();
    expect(loginScreen).toMatchSnapshot();
  });
});
