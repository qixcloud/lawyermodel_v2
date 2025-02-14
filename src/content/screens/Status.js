import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  Dimensions,
  Platform,
  ScrollView,
} from "react-native";

const { width } = Dimensions.get("window");

const Status = ({ goBack, translate, status, currentPhase }) => {
  // Encontrar el índice que corresponde al phase actual
  const initialIndex = status.findIndex(s => s.title === currentPhase);
  const [currentIndex, setCurrentIndex] = useState(initialIndex >= 0 ? initialIndex : 0);

  console.log('status from screen status.js', status);
  console.log('current phase:', currentPhase);
  console.log('initial index:', initialIndex);

  const renderItem = (item) => (
    <View
      style={{
        width,
        alignItems: "flex-start",
        paddingRight: 20,
        paddingLeft: 20,
      }}
    >
      <Text style={{ fontSize: 24, color: "#2d96ef", marginBottom: 20 }}>
        {item.title}
      </Text>
      <Text style={{ fontSize: 16, color: "white" }}>{item.description}</Text>
    </View>
  );

  const handleScroll = (event) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentIndex(index);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#2e3643" }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginTop: Platform.OS === "ios" ? 60 : 20,
          marginHorizontal: 20,
          alignItems: "center",
        }}
      >
        <Text
          style={{
            fontFamily: "Quicksand-Bold",
            fontSize: 26,
            color: "white",
            fontWeight: "bold",
          }}
        >
          Status
        </Text>
        <TouchableOpacity onPress={goBack}>
          <Image
            source={require("../images/close.png")}
            style={{
              width: 25,
              height: 25,
              marginHorizontal: 10,
            }}
          />
        </TouchableOpacity>
      </View>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          marginVertical: 35,
        }}
      >
        {status.map((_, index) => (
          <View
            key={index}
            style={{
              height: 10,
              width: 30,
              borderRadius: 5,
              backgroundColor:
                index === currentIndex
                  ? "#2d96ef"
                  : index < currentIndex
                  ? "#25b67c"
                  : "#adafac",
              margin: 5,
            }}
          />
        ))}
      </View>

      <ScrollView
        onScroll={handleScroll}
        scrollEventThrottle={16}
        pagingEnabled
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        {renderItem(status[currentIndex])}
      </ScrollView>

      <View
        style={{
          justifyContent: "space-between",
          flexDirection: "row",
          marginBottom: Platform.OS === "ios" ? 40 : 20,
        }}
      >
        {currentIndex > 0 ? (
          <TouchableOpacity
            onPress={() => {
              if (currentIndex > 0) {
                setCurrentIndex(currentIndex - 1);
              }
            }}
            style={{
              alignSelf: "flex-end",
              backgroundColor: "#2d96ef",
              paddingVertical: 10,
              paddingHorizontal: 40,
              marginLeft: 20,
              borderRadius: 10,
            }}
          >
            <Text style={{ color: "white" }}>Back</Text>
          </TouchableOpacity>
        ) : (
          <View />
        )}

        {currentIndex < status.length - 1 ? (
          <TouchableOpacity
            onPress={() => {
              if (currentIndex < status.length - 1) {
                setCurrentIndex(currentIndex + 1);
              }
            }}
            style={{
              alignSelf: "flex-end",
              backgroundColor: "#2d96ef",
              paddingVertical: 10,
              paddingHorizontal: 40,
              marginRight: 20,
              borderRadius: 10,
            }}
          >
            <Text style={{ color: "white" }}>Next</Text>
          </TouchableOpacity>
        ) : (
          <View />
        )}
      </View>
    </View>
  );
};

export default Status;
