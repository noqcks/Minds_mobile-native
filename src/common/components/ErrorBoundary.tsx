import React, { Component } from 'react';

import { Text, View, ViewStyle } from 'react-native';
import logService from '../services/log.service';
import i18n from '../services/i18n.service';
import { showNotification } from '../../../AppMessages';
import Clipboard from '@react-native-clipboard/clipboard';
import ThemedStyles from '../../styles/ThemedStyles';

type PropsType = {
  message: string;
  containerStyle?: ViewStyle | Array<ViewStyle>;
  children: React.ReactNode;
  textSmall?: boolean;
};

type StateType = {
  hasError: boolean;
};

/**
 * Error boundary
 */
export default class ErrorBoundary extends Component<PropsType, StateType> {
  error?: Error;
  info: any;
  state = {
    hasError: false,
  } as StateType;

  /**
   * Constructors
   * @param props
   */
  constructor(props: PropsType) {
    super(props);
    this.state = { hasError: false };
  }

  /**
   *
   * @param error
   */
  static getDerivedStateFromError() {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error: Error, info) {
    logService.exception(error);
    this.error = error;
    this.info = info;
  }

  copy = () => {
    Clipboard.setString(
      (this.error?.message || this.error) +
        '\nSTACK:\n' +
        this.info.componentStack,
    );
    showNotification(i18n.t('stacktraceCopied'));
  };

  getErrorMessage() {
    const { containerStyle, textSmall } = this.props;
    const theme = ThemedStyles.style;
    return (
      <View style={[theme.columnAlignCenter, containerStyle]}>
        <Text
          style={[
            textSmall ? theme.fontS : theme.fontM,
            theme.textCenter,
            theme.marginTop2x,
            theme.fontHairline,
            theme.colorAlert,
          ]}
          onPress={this.copy}>
          {this.props.message || i18n.t('errorDisplaying')}
        </Text>
        <Text
          style={[
            textSmall ? theme.fontXS : theme.fontS,
            theme.textCenter,
            theme.marginTop2x,
            theme.marginBottom2x,
            theme.fontHairline,
          ]}
          onPress={this.copy}>
          {i18n.t('tapCopyError')}
        </Text>
      </View>
    );
  }

  /**
   * Render
   */
  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return this.getErrorMessage();
    }

    return this.props.children;
  }
}

/**
 * With error boundary HOC
 * @param {Component} WrappedComponent
 * @param {string} message
 * @param {boolean} small
 */
export const withErrorBoundary = (
  WrappedComponent,
  message = '',
  small = false,
) => props => {
  if (!message) message = i18n.t('errorDisplaying');
  return (
    <ErrorBoundary message={message} textSmall={small}>
      <WrappedComponent {...props} />
    </ErrorBoundary>
  );
};
