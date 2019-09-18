import React, {
  Component
} from 'react';

import {
  Text,
  Image,
  TouchableOpacity
} from 'react-native';

import Icon from 'react-native-vector-icons/Ionicons';
import { observer } from 'mobx-react/native'

import { MINDS_CDN_URI } from '../../config/Config';

import Sentry from 'react-native-sentry';

/**
 * Conversation Component
 */
@observer
export default class ConversationView extends Component {

  /**
   * Navigate To conversation
   */
  _navToConversation = () => {
    if (this.props.navigation) {
      this.props.navigation.push('Conversation', { conversation: this.props.item });
    }
  }

  render() {
    const item = this.props.item;
    const avatarImg = { uri: MINDS_CDN_URI + 'icon/' + item.participants[0].guid + '/medium/' + item.participants[0].icontime };
    const styles = this.props.styles;
    let unread = item.unread ? <Icon style={styles.icons} name='md-notifications' color='#4caf50' size={19} /> : null;
    let online = item.online ? <Icon style={styles.icons} name='md-radio-button-on' color='#2196f3' size={19} /> : null;
    
    // Added to capture information about /issues/1203549247/?project=1538735
    Sentry.setExtraContext({
      conversationViewItem: item
    });
    
    return (
      <TouchableOpacity style={styles.row} onPress={this._navToConversation}>
        <Image source={avatarImg} style={styles.avatar} />
        <Text style={styles.body}>{item.username.toUpperCase()}</Text>
        {unread}
        {online}
      </TouchableOpacity>
    );
  }
}
