import React, { Component, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Dimensions,
  TouchableOpacity,
  ImageBackground,
  Image,
} from "react-native";
import ScalableImage from "react-native-scalable-image";
import { SvgUri } from "react-native-svg";

export default class ImageOrSvg extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    return (
      <>
        {this.props.uri.split(".").pop().split(/\#|\?/)[0].toLowerCase() ==
        "svg" ? (
          <SvgUri
            width={this.props.width || 40}
            height={this.props.height || 40}
            uri={this.props.uri} // Remote SVG URL
          />
        ) : (
          <ScalableImage
            source={{ uri: this.props.uri }}
            height={parseInt(this.props.height) || 50}
          />
        )}
      </>
    );
  }
}
