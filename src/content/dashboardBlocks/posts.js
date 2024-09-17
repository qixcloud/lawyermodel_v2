import React, { useRef, useState } from "react";
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
import { useNavigation } from "@react-navigation/native";

const { width: screenWidth } = Dimensions.get("window");
const { height: screenHeight } = Dimensions.get("window");
import { SharedElement } from "react-navigation-shared-element";
import { BackgroundImage } from "react-native-elements/dist/config";
import { Icon } from "react-native-elements";

const ITEM_WIDTH = screenWidth * 0.6;
const ITEM_HEIGHT = screenHeight * 0.3;
const ITEM_SEPARATOR_WIDTH = screenWidth * 0.08;

const BlockPosts = (props) => {
  const [activeSlide, setActiveSlide] = useState(0);
  const navigation = useNavigation();
  //console.log(props.posts);
  React.useEffect(() => {
    if (activeSlide === props.posts.length - 1) {
      //animationRef.current.play();
    }
  }, [activeSlide]);

  const renderItem = ({ item, index }) => {
    // console.log(item.title)
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => navigation.navigate("AboutYourCase", { item })}
      >
        <SharedElement id={`item.${item.title}.content`}>
          <Image
            style={{
              width: ITEM_WIDTH,
              height: ITEM_HEIGHT,
              borderRadius: 15,
              marginHorizontal: ITEM_SEPARATOR_WIDTH / 2,
              position: "absolute",
              marginLeft: 0,
            }}
            source={{
              uri: item.image.includes("http")
                ? item.image
                : global.devUrl + item.image,
            }}
            imageStyle={{ borderRadius: 10 }}
          />
        </SharedElement>
        <View
          style={{
            width: ITEM_WIDTH,
            height: ITEM_HEIGHT,
            borderRadius: 15,
            marginHorizontal: ITEM_SEPARATOR_WIDTH / 2,
            overflow: "hidden",
            borderWidth: 1,
            borderColor: "#2e3643",
            marginLeft: 0,
          }}
        >
          <Text
            style={{
              width: "100%",
              fontSize: 15,
              color: "black",
              backgroundColor: "#fff",
              paddingHorizontal: 20,
              paddingVertical: 10,
            }}
          >
            {item.title}
          </Text>
          <Text
            style={{
              fontSize: 15,
              width: "100%",
              color: "#fff",
              backgroundColor: "rgba(0,0,0,0.8)",
              paddingHorizontal: 20,
              paddingVertical: 10,
              position: "absolute",
              bottom: 0,
            }}
          >
            {item.description.length > 50
              ? item.description.substring(0, 50) + "..."
              : item.description}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const onSlideChange = (index) => {
    setActiveSlide(index);
  };

  return (
    <View
      style={{
        marginVertical: 15,
        marginHorizontal: 25,
        overflow: "hidden",
      }}
    >
      <FlatList
        data={props.posts}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        disableIntervalMomentum
        snapToInterval={ITEM_WIDTH + ITEM_SEPARATOR_WIDTH}
        decelerationRate={"fast"}
        onMomentumScrollEnd={(event) =>
          onSlideChange(
            Math.round(
              event.nativeEvent.contentOffset.x /
                (ITEM_WIDTH + ITEM_SEPARATOR_WIDTH)
            )
          )
        }
        contentContainerStyle={{
          paddingHorizontal: 0, //ITEM_SEPARATOR_WIDTH / 10,
        }}
      />
    </View>
  );
};

export default BlockPosts;
