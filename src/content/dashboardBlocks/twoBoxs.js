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

export default class BlockBoxs extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    // console.log(this.props.boxs);
  }

  render() {
    return (
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          margin: 15,
        }}
      >
        <TouchableOpacity
          onPress={() => this.props.gotoPage(this.props.boxs.link1)}
          style={{
            width: "50%",
          }}
        >
          <ImageBackground
            style={{
              borderRadius: 10,
              minHeight: 150,
              padding: 20,
              marginLeft: 10,
              marginRight: 10,
              justifyContent: "center",
              alignItems: "flex-end",
            }}
            source={{
              uri: this.props.boxs.image1.includes("http")
                ? this.props.boxs.image1
                : global.devUrl + this.props.boxs.image1,
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

        <TouchableOpacity
          onPress={() => this.props.gotoPage(this.props.boxs.link2)}
          style={{
            width: "50%",
          }}
        >
          <ImageBackground
            style={{
              backgroundColor: "#b9d1d7",
              borderRadius: 10,
              minHeight: 150,
              padding: 20,
              marginLeft: 10,
              marginRight: 10,
              justifyContent: "center",
              alignItems: "flex-end",
            }}
            source={{
              uri: this.props.boxs.image2.includes("http")
                ? this.props.boxs.image2
                : global.devUrl + this.props.boxs.image2,
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
