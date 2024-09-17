import React, { Component } from 'react';
import { StyleSheet, TouchableOpacity, Text, Image } from 'react-native';
import LottieView from 'lottie-react-native';
export default class LottieChecked extends Component {
    constructor(props) {
        super(props);
    }
  render() {
    return (
      <LottieView source={require('./icon1.json')} autoPlay loop={false} style={{width: this.props.width}} />
    );
  }
}
