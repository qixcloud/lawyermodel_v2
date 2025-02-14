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

export default class BlockStatus extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    //console.log(this.props.status);
  }

  render() {
      console.log('status from status.js',this.props.status);
      console.log('currentPhase from status.js',this.props.currentPhase);

      return (
      <View style={{ marginVertical: 15, marginHorizontal: 25 }}>
        <View style={{ borderWidth: 0 }}>
          <TouchableOpacity
            onPress={this.props.onStatusPress}
            style={{
              overflow: "hidden",
              borderRadius: 10,
            }}
          >
            <Image
              source={require("../images/layout3.png")}
              borderRadius={10}
              style={{
                overflow: "hidden",
                height: 100,
                width: Dimensions.get("window").width - 50,
              }}
            />
            <View
              style={{
                width: "100%",
                height: "100%",
                position: "absolute",
                flex: 1,
                justifyContent: "space-around",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: "#fff",
                    paddingLeft: 20,
                    fontSize: 16,
                    fontWeight: "bold",
                  }}
                >
                  {this.props.currentPhase || this.props.status.title}
                </Text>
                <Text
                  style={{
                    color: "#fff",
                    paddingHorizontal: 20,
                    marginTop: 6,
                  }}
                >
                  Click to learn more
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Image
                  source={require("../images/white_arrow.png")}
                  style={{
                    width: 35,
                    height: 35,
                    alignSelf: "flex-end",
                    marginRight: 30,
                  }}
                />
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}
