//@ts-nocheck
import React, { Component } from 'react';

import { Image, View, StyleSheet } from 'react-native';

import { observer } from 'mobx-react';

import { MINDS_CDN_URI } from '../config/Config';
import MindsVideo from './v2/mindsVideo/MindsVideo';
import i18n from '../common/services/i18n.service';
import MText from '../common/components/MText';

/**
 * Video Card
 */
@observer
export default class VideoCard extends Component {
  /**
   * Get Channel Avatar
   */
  getAvatar() {
    const channel = this.props.entity.ownerObj;
    return {
      uri:
        MINDS_CDN_URI + 'icon/' + channel.guid + '/small/' + channel.icontime,
    };
  }

  /**
   * Render Card
   */
  render() {
    const entity = this.props.entity;

    const video = { uri: entity.src['360.mp4'] };

    return (
      <View>
        <View style={styles.videoContainer}>
          <MindsVideo video={video} entity={entity} />
        </View>
        <View style={styles.headertextcontainer}>
          <View style={styles.namecontainer}>
            <View style={styles.namecol}>
              <View style={styles.ownerContainer}>
                <Image source={this.getAvatar()} style={styles.avatar} />
                <MText style={styles.username}>
                  {entity.ownerObj.username.toUpperCase()}
                </MText>
                <MText style={styles.createdDate}>
                  {i18n.date(entity.time_created * 1000)}
                </MText>
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  headertextcontainer: {
    padding: 8,
    paddingLeft: 15,
    paddingRight: 15,
    alignItems: 'stretch',
    flexDirection: 'column',
    width: '100%',
  },
  namecol: {
    flex: 1,
  },
  namecontainer: {
    flexDirection: 'row',
    flex: 1,
  },
  ownerContainer: {
    flex: 1,
    flexDirection: 'row',
    alignSelf: 'flex-start',
    padding: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoContainer: {
    flex: 1,
    backgroundColor: 'black',
    alignItems: 'stretch',
    minHeight: 250,
  },
  headercontainer: {
    flex: 1,
    height: 100,
    flexDirection: 'row',
  },
  username: {
    paddingLeft: 5,
    fontSize: 10,
    color: '#999',
  },
  name: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  createdDate: {
    paddingLeft: 5,
    fontSize: 8,
  },
  countercontainer: {
    paddingLeft: 130,
    height: 60,
    flexDirection: 'row',
  },
  avatar: {
    height: 20,
    width: 20,
    borderRadius: 10,
  },
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#FFF',
  },
});
