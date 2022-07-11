import React from 'react';

import { View } from 'react-native';
import ThemedStyles from '../../styles/ThemedStyles';
import { observer, useLocalStore } from 'mobx-react';
import createLoginStore from './createLoginStore';
import FastImage from 'react-native-fast-image';
import UserModel from '../../channel/UserModel';
import sessionService from '../../common/services/session.service';
import InputContainer from '../../common/components/InputContainer';
import i18n from '../../common/services/i18n.service';
import MText from '../../common/components/MText';
import { IS_IOS } from '../../config/Config';
import { Button, Row, B1 } from '~ui';
import DismissKeyboard from '~/common/components/DismissKeyboard';
import PasswordInput from '~/common/components/password-input/PasswordInput';

type PropsType = {
  onLogin?: Function;
  onRegisterPress?: () => void;
  multiUser?: boolean;
  relogin?: boolean;
  sessionIndex?: number;
};
/**
 * Login Form component
 */
export default observer(function LoginForm(props: PropsType) {
  const localStore = useLocalStore(createLoginStore, { props });

  const theme = ThemedStyles.style;

  const user = React.useMemo(() => {
    const u =
      props.sessionIndex !== undefined
        ? UserModel.checkOrCreate(
            sessionService.getSessionForIndex(props.sessionIndex).user,
          )
        : sessionService.getUser();

    if (props.relogin && !localStore.username) {
      localStore.username = u.username;
    }
    return u;
  }, [props.sessionIndex, props.relogin, localStore.username]);

  const usernameInput = props.relogin ? (
    <View style={styles.container}>
      <FastImage
        source={user.getAvatarSource('medium')}
        style={styles.avatar}
      />
      <View style={styles.nameContainer}>
        <MText style={styles.name}>{user.name}</MText>
        <MText style={styles.username} testID={`username${user.username}`}>
          @{user.username}
        </MText>
      </View>
    </View>
  ) : (
    <InputContainer
      placeholder={i18n.t('auth.username')}
      onChangeText={localStore.setUsername}
      autoComplete="username"
      textContentType="username"
      value={localStore.username}
      testID="usernameLoginInput"
      autoCorrect={false}
      noBottomBorder
      keyboardType="default"
      error={
        localStore.showErrors && !localStore.username
          ? i18n.t('auth.fieldRequired')
          : undefined
      }
      autoFocus={true}
    />
  );

  return (
    <View style={theme.flexContainer}>
      <DismissKeyboard>
        {usernameInput}
        <View style={theme.marginBottom4x}>
          <PasswordInput
            placeholder={i18n.t('auth.password')}
            autoComplete="password"
            textContentType="password"
            onChangeText={localStore.setPassword}
            value={localStore.password}
            testID="userPasswordInput"
            autoFocus={props.relogin}
            error={
              localStore.showErrors && !localStore.password
                ? i18n.t('auth.fieldRequired')
                : undefined
            }
          />
        </View>
        <Button
          mode="outline"
          type="action"
          testID="loginButton"
          spinner
          horizontal="XL"
          top="XXL"
          onPress={localStore.onLoginPress}>
          {i18n.t('auth.login')}
        </Button>
        <Row top="L2" align="centerBoth">
          <B1 onPress={localStore.onForgotPress}>{i18n.t('auth.forgot')}</B1>
        </Row>
      </DismissKeyboard>
    </View>
  );
});

const styles = ThemedStyles.create({
  name: ['bold', 'fontXL'],
  username: ['fontMedium', 'fontM'],
  forgotText: ['colorPrimaryText', 'fontL', 'textCenter'],
  container: [
    'rowJustifyCenter',
    'padding4x',
    'bcolorPrimaryBorder',
    'borderTopHair',
    'bgPrimaryBackground',
  ],
  nameContainer: ['flexContainerCenter', 'paddingLeft', 'justifyCenter'],
  avatar: [
    {
      height: 40,
      width: 40,
      borderRadius: 20,
    },
    'bgTertiaryBackground',
  ],
  icon: [
    {
      position: 'absolute',
      right: 12,
      top: IS_IOS ? 30 : 33,
    },
    'colorSecondaryText',
  ],
});
