//@ts-nocheck
import React, { Component } from 'react';
import Menu, { MenuItem } from 'react-native-material-menu';
import MdIcon from 'react-native-vector-icons/MaterialIcons';

import Touchable from '../Touchable';
import autobind from '../../helpers/autobind';
import i18n from '../../services/i18n.service';
import ThemedStyles from '../../../styles/ThemedStyles';
import MText from '../MText';

export default class NsfwToggle extends Component {
  constructor(props) {
    super(props);

    this.reasons = [
      { value: 1, label: i18n.t('nsfw.1') },
      { value: 2, label: i18n.t('nsfw.2') },
      { value: 3, label: i18n.t('nsfw.3') },
      { value: 4, label: i18n.t('nsfw.4') },
      { value: 5, label: i18n.t('nsfw.5') },
      { value: 6, label: i18n.t('nsfw.6') },
    ];

    this.menuRef = React.createRef();
  }

  @autobind
  showDropdown() {
    const menu = this.menuRef.current;

    if (!menu) {
      return;
    }

    menu.show();
  }

  @autobind
  toggleDropdownOption(reason) {
    const activeReasonValues = [...(this.props.value || [])];
    const reasonIndex = activeReasonValues.indexOf(reason.value);

    if (reasonIndex > -1) {
      activeReasonValues.splice(reasonIndex, 1);
    } else {
      activeReasonValues.push(reason.value);
    }

    this.props.onChange(activeReasonValues);
  }

  isReasonActive(reason) {
    const activeReasonValues = this.props.value || [];
    return activeReasonValues.indexOf(reason.value) > -1;
  }

  render() {
    const isActive = Boolean(this.props.value && this.props.value.length);
    const themed = ThemedStyles.style;

    const button = (
      <Touchable
        style={this.props.containerStyle}
        onPress={this.showDropdown}
        testID="NsfwToggle">
        <MdIcon
          name="explicit"
          size={25}
          style={[
            this.props.iconStyle,
            isActive && this.props.iconActiveStyle,
            isActive ? themed.colorAlert : themed.colorIcon,
          ]}
        />

        {isActive && !this.props.hideLabel && (
          <MText style={this.props.labelStyle}>{i18n.t('nsfw.button')}</MText>
        )}
      </Touchable>
    );

    return (
      <React.Fragment>
        <Menu ref={this.menuRef} style={menuStyle} button={button}>
          {this.reasons.map((reason, i) => (
            <MenuItem
              key={i}
              onPress={() => this.toggleDropdownOption(reason)}
              textStyle={[this.isReasonActive(reason) && themed.colorLink]}
              testID={`NsfwReason${reason.label}`}>
              {this.isReasonActive(reason) && <MdIcon name="check" />}{' '}
              {reason.label}
            </MenuItem>
          ))}
        </Menu>
      </React.Fragment>
    );
  }
}

const menuStyle = ThemedStyles.combine(
  {
    width: 180,
  },
  'marginTop4x',
  'bgTertiaryBackground',
);
