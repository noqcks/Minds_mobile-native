import React, { FC, PureComponent } from 'react';
import { TextStyle, ViewStyle } from 'react-native';
import { IconNextSpaced } from '~ui/icons';
import type UserModel from '../UserModel';
import ThemedStyles from '../../styles/ThemedStyles';
import i18n from '../../common/services/i18n.service';
import { Popable } from 'react-native-popable';

/**
 * Badge tooltip using Poppable because react-native-elements/Tooltip
 * doesn't have a way to show the Tooltip on top
 **/
const BadgeTooltip: FC<any> = ({ label, color, children }) => {
  return (
    <Popable
      backgroundColor={color}
      position={'top'}
      animationType={'spring'}
      content={label}>
      {children}
    </Popable>
  );
};

type PropsType = {
  channel: UserModel;
  size?: number | string;
  style?: ViewStyle;
  iconStyle: TextStyle;
};

/**
 * Channel Badges
 */
export default class ChannelBadges extends PureComponent<PropsType> {
  /**
   * Render
   */
  render() {
    // const size = this.props.size || 25;
    const size = 'tiny';
    const channel = this.props.channel;
    const badges: Array<React.ReactNode> = [];

    if (channel.plus) {
      badges.push(
        <BadgeTooltip
          label={i18n.t('channel.badge.plus')}
          color={ThemedStyles.getColor('Link')}>
          <IconNextSpaced
            active
            name="plus-circle-outline"
            size={size}
            horizontal="0x"
            key={1}
          />
        </BadgeTooltip>,
      );
    }

    if (channel.verified) {
      badges.push(
        <BadgeTooltip
          label={i18n.t('channel.badge.verified')}
          color={ThemedStyles.getColor('SuccessBackground')}>
          <IconNextSpaced
            name="verified"
            size={size}
            color={channel.isAdmin() ? 'Green' : null}
            active
            horizontal="0x"
            key={2}
          />
        </BadgeTooltip>,
      );
    }

    if (channel.founder) {
      badges.push(
        <BadgeTooltip
          label={i18n.t('channel.badge.founder')}
          color={ThemedStyles.getColor('Link')}>
          <IconNextSpaced
            horizontal="0x"
            name="founder"
            active
            size={size}
            key={3}
          />
        </BadgeTooltip>,
      );
    }

    return <>{badges}</>;
  }
}
