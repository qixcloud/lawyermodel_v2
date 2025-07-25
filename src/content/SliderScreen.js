import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  Dimensions,
  TouchableOpacity,
  ImageBackground,
  Linking,
} from "react-native";
import { Icon } from "react-native-elements";
import { Modal } from "react-native";
import LottieView from "lottie-react-native";
import { appId, getHeaders, getDashboardItems } from "./Helper";
import * as Progress from "react-native-progress";

const { width: screenWidth } = Dimensions.get("window");

let data = [];
const ITEM_WIDTH = screenWidth * 0.75;
const ITEM_SEPARATOR_WIDTH = screenWidth * 0.1;

const SliderScreen = (props) => {
  //data = props.sliderItems;
  const [activeSlide, setActiveSlide] = useState(0);
  const [appName, setAppName] = useState("");
  const [intro, setIntro] = useState("");
  const [data, setData] = useState([]);
  const [loaded, setLoaded] = useState(false);

  const animationRef = React.useRef(null);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        // Your async code here
        const dashboardData = await getDashboardItems();
        //console.log("appName", dashboardData.appName);
        setAppName(dashboardData.appName); // Set data to state
        setIntro(dashboardData.intro[global.lang]); // Set data to state
        setData(dashboardData.intro[global.lang].images); // Set data to state
        //console.log(dashboardData.intro.images);

        if (Array.isArray(data) && activeSlide === data.length - 1) {
          animationRef.current.play();
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        //setAppName(""); // Set loading to false once data is fetched
      }
    };

    fetchData();
  }, [activeSlide]);
  const handleLoad = () => {
    setLoaded(true);
  };
  const renderItem = ({ item, index }) => {
    if (index === data.length - 1) {
      return (
        <View
          style={{
            width: ITEM_WIDTH,
            height: "100%",
            borderRadius: 15,
            marginHorizontal: ITEM_SEPARATOR_WIDTH / 2,
          }}
        >
          <View
            style={{
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <LottieView
              ref={animationRef}
              source={require("../assets/lottie/checkmark.json")}
              loop={false}
              speed={0.5}
              resizeMode="contain"
              style={{
                width: 200,
                height: 200,
              }}
            />
          </View>

          <Text style={{ fontSize: 30, textAlign: "center", color: "#e4e7e9" }}>
            {props.translate("allSet")}
          </Text>
          <Text
            style={{
              fontSize: 15,
              textAlign: "center",
              marginTop: 25,
              color: "#e4e7e9",
            }}
          >
            {props.translate("thanksForChoosing")}
          </Text>
          <Text
            style={{
              fontSize: 15,
              textAlign: "center",
              marginTop: 0,
              color: "#e4e7e9",
            }}
          >
            {appName}
          </Text>

          <TouchableOpacity
            onPress={props.onPress}
            style={{
              marginTop: 40,
              paddingVertical: 15,
              borderRadius: 10,
              backgroundColor: "#599cdb",
              justifyContent: "center",
              minWidth: 200,
              alignItems: "center",
              alignSelf: "center",
              paddingHorizontal: 10,
            }}
          >
            <Text style={{ fontSize: 20, color: "white" }}>
              {props.translate("goToDashboard")}
            </Text>
          </TouchableOpacity>
        </View>
      );
    }
    //console.log("item", item);
    return (
      <ImageBackground
        style={{
          width: ITEM_WIDTH,
          height: "100%",
          backgroundColor: "white",
          borderRadius: 15,
          marginHorizontal: ITEM_SEPARATOR_WIDTH / 2,
        }}
        resizeMode={"cover"}
        source={{ uri: item }}
        imageStyle={{ borderRadius: 10 }}
        onLoad={handleLoad}
      >
        <Text
          style={{
            fontSize: 35,
            textAlign: "center",
            marginTop: "30%",
            color: "black",
          }}
        >
          {" "}
          {/* Slide {item.idx} */}
        </Text>
        {index === 1 && (
          <TouchableOpacity
            style={{
              height: 50,
              paddingHorizontal: 20,
              backgroundColor: "#599cdc",
              flexDirection: "row",
              alignSelf: "center",
              justifyContent: "flex-end",
              alignItems: "center",
              position: "absolute",
              bottom: 30,
              borderRadius: 10,
            }}
            onPress={() => Linking.openURL(intro.link)}
          >
            <Icon
              name="play-circle"
              type="font-awesome"
              style={{ marginRight: 10 }}
            />
            <Text>Watch video</Text>
          </TouchableOpacity>
        )}
      </ImageBackground>
    );
  };

  const onSlideChange = (index) => {
    setActiveSlide(index);
  };

  const renderDot = (index) => {
    const isActive = index === activeSlide;
    return (
      <View
        key={index}
        style={{
          width: isActive ? 50 : 10,
          height: 10,
          borderRadius: 5,
          backgroundColor: isActive ? "#e4e7e9" : "#9e9e9e",
          margin: 5,
        }}
      />
    );
  };

  return (
    <>
      <Modal
        animationType="slide"
        visible={props.showSlider}
        onRequestClose={props.onPress}
      >
        <View style={{ flex: 1, backgroundColor: "#2e3643", paddingTop: 20 }}>
          {activeSlide >= 1 ? (
            <TouchableOpacity
              onPress={props.onPress}
              style={{
                width: 50,
                height: 50,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#e4e7e9",
                borderRadius: 5,
                alignSelf: "flex-end",
                margin: 30,
              }}
            >
              <Icon name={"close"} />
            </TouchableOpacity>
          ) : (
            <View
              style={{
                width: 50,
                height: 50,
                justifyContent: "center",
                alignItems: "center",
                borderRadius: 5,
                alignSelf: "flex-end",
                margin: 30,
              }}
            />
          )}
          <View style={{ marginLeft: 40 }}>
            <Text style={{ color: "#e4e7e9", fontSize: 18 }}>
              {props.translate("intro")}
            </Text>
            <Text style={{ color: "#e4e7e9", marginTop: 10, marginBottom: 30 }}>
              {props.translate("whatToExpect")}
            </Text>
          </View>
          <View style={{ paddingBottom: "20%" }}>
            <FlatList
              data={data}
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
                paddingHorizontal: ITEM_SEPARATOR_WIDTH / 2,
              }}
            />
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 30,
            }}
          >
            {Array.isArray(data) && data.length > 0 && (
              <>{data.map((item, index) => renderDot(index))}</>
            )}
          </View>
        </View>
        {!loaded && (
          <View
            style={{
              height: "100%",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#2e3643",
              position: "absolute",
              width: "100%",
              zIndex: 1,
            }}
          >
            <Progress.Circle size={30} indeterminate={true} />
          </View>
        )}
      </Modal>
    </>
  );
};

export default SliderScreen;
