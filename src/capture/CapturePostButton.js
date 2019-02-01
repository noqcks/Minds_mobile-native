import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';

import { observer, inject } from 'mobx-react/native';
import * as Progress from 'react-native-progress';
import colors from '../styles/Colors';
import { CommonStyle as CS } from '../styles/Common';

@inject('capture')
@observer
export default class CapturePostButton extends Component {

  render() {
    const attachment = this.props.capture.attachment;
    const isPosting = this.props.capture.isPosting;
    const text = this.props.text || 'POST';

    return (
      <View style={styles.posterActions}>
        {
          attachment.uploading ?
            <Progress.Pie progress={attachment.progress} size={36} />
            :
            (isPosting || attachment.checkingVideoLength) ?
              <ActivityIndicator size={'large'} />
              :
              <TouchableOpacity
                onPress={this.props.onPress}
                style={[styles.button, CS.borderRadius10x, CS.borderPrimary, CS.border]}
              >
                <Text style={styles.buttonText}>{text}</Text>
              </TouchableOpacity>
        }
      </View>
    )
  }
}


const styles = StyleSheet.create({
  posterActions: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
    alignContent: 'center',
  },
  buttonText: {
    color: colors.primary,
    fontSize: 16,
  },
  button: {
    margin: 4,
    padding: 6,
    paddingLeft: 16,
    paddingRight: 16,
    alignItems: 'center',
    //borderRadius: 3,
    //backgroundColor: 'white',
    //borderWidth: 1,
    //borderColor: colors.primary,
  }
});
