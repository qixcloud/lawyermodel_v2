import React, { Component, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Dimensions,
  TouchableOpacity,
  ImageBackground,
  Image,
  Linking,
} from "react-native";
export let gotoPage;
export default class BlockButton extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    //console.log(this.props.button);
  }
  render() {
    return (
      <View style={{ marginVertical: 15, marginHorizontal: 18 }}>
        <TouchableOpacity
          onPress={() => this.props.gotoPage(this.props.button.link)}
        >
          <ImageBackground
            style={{
              borderRadius: 10,
              height: 100,
              padding: 20,
              marginLeft: 10,
              marginRight: 10,
              justifyContent: "center",
              alignItems: "flex-end",
            }}
            source={{
              uri: this.props.button.image.includes("http")
                ? this.props.button.image
                : global.devUrl + this.props.button.image,
            }}
            imageStyle={{ borderRadius: 10 }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "flex-end",
                alignItems: "center",
              }}
            ></View>
          </ImageBackground>
        </TouchableOpacity>
      </View>
    );
  }
}
