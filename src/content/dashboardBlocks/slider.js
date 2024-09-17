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
import Carousel, { Pagination } from "react-native-snap-carousel";

export default class BlockSlider extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeIndex: 0,
    };
    //console.log(this.props.duration);
  }
  get pagination() {
    const { entries, activeIndex } = this.state;
    return (
      <Pagination
        dotsLength={this.props.sliderItems.length}
        activeDotIndex={activeIndex}
        containerStyle={{ marginVertical: -20 }}
        dotStyle={{
          width: 10,
          height: 10,
          borderRadius: 5,
          marginHorizontal: 8,
          backgroundColor: "rgba(0, 0, 0, 0.92)",
        }}
        inactiveDotStyle={
          {
            // Define styles for inactive dots here
          }
        }
        inactiveDotOpacity={0.4}
        inactiveDotScale={0.6}
      />
    );
  }
  _renderItem = ({ item, index }) => {
    return (
      <TouchableOpacity onPress={() => this.props.gotoPage(item.link)}>
        <ImageBackground
          style={{
            backgroundColor: "#b9d1d7",
            borderRadius: 10,
            minHeight: 180,
            padding: 20,
            marginLeft: 25,
            marginRight: 25,
            justifyContent: "center",
            alignItems: "flex-end",
          }}
          source={{
            uri: item.img.includes("http")
              ? item.img
              : global.devUrl + item.img,
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
    );
  };

  render() {
    return (
      <View style={{ marginTop: 15 }}>
        <Carousel
          layout={"default"}
          loop={true}
          autoplay={true}
          scrollEnabled={true}
          autoplayInterval={this.props.duration * 1000}
          ref={(ref) => (this.carousel = ref)}
          data={this.props.sliderItems}
          renderItem={this._renderItem}
          sliderWidth={Dimensions.get("window").width}
          itemWidth={Dimensions.get("window").width}
          onSnapToItem={(index) =>
            this.setState({
              activeIndex: index,
            })
          }
        />
        {this.pagination}
      </View>
    );
  }
}
