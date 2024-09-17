import React, { Component } from 'react';
import { StyleSheet, TouchableOpacity, Text, Image } from 'react-native';
import LottieView from 'lottie-react-native';
export default class Lottie extends Component {
    constructor(props) {
        super(props);
    }
  render() {
    return (
      <LottieView source={this.props.icon} autoPlay loop={this.props.loop} style={{width: this.props.width}} />
    );
  }
}
