import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
  ScrollView,
} from "react-native";

const { width } = Dimensions.get("window");

const decodeHTMLEntities = (text) => {
  return text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/<\/?p>/g, '\n')
    .replace(/<\/?[^>]+(>|$)/g, '');
};

const Status = ({ goBack, translate, status, currentPhase,rawPhase }) => {
  const formattedStatus = status?.map(item => {
    const languageData = item.languages?.[global.lang] || item.languages?.['en'] || {};
    return {
      title: languageData.phase || item.title || "",
      description: languageData.description || item.description || "",
      order: item.order || 0,
      type: item.type || "",
      phase: item.phase || "",
    };
  }) || [];

  const sortedStatus = formattedStatus.sort((a, b) => a.order - b.order);

  const initialIndex = sortedStatus.findIndex(s => s.phase === rawPhase);
  console.log("debugging sortedStatus", sortedStatus);
  console.log("debugging initialIndex", initialIndex);
  console.log("debugging currentPhase", currentPhase);

  const [currentIndex, setCurrentIndex] = useState(initialIndex >= 0 ? initialIndex : 0);

  const renderItem = (item) => (
    <ScrollView
      style={{ width }}
      showsVerticalScrollIndicator={false}
    >
      <View
        style={{
          alignItems: "flex-start",
          paddingRight: 20,
          paddingLeft: 20,
          paddingBottom: 20,
        }}
      >
        <Text style={{ fontSize: 24, color: "#2d96ef", marginBottom: 20 }}>
          {decodeHTMLEntities(item.title || "No Title")}
        </Text>
        {initialIndex === currentIndex && (
          <View style={{borderColor:'#2d96ef', borderWidth:1, borderRadius:5, justifyContent: "center"}}>
            <Text style={{ fontSize: 16, color: "#2d96ef" , padding:5}}>
            {translate("yourcurrentstatus")}
            </Text>
          </View>
        )}


        <Text style={{ fontSize: 16, color: "white" }}>
          {decodeHTMLEntities(item.description || "No Description")}
        </Text>
      </View>
    </ScrollView>
  );

  const handleScroll = (event) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentIndex(index);
  };

  if (!sortedStatus.length) {
    return (
      <View style={{ flex: 1, backgroundColor: "#2e3643", justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: "white", fontSize: 18 }}>No status information available</Text>
      </View>
    );
  }

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
          {translate("status")}
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
        {sortedStatus.map((_, index) => (
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

      <View style={{ flex: 1 }}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {renderItem(sortedStatus[currentIndex])}
        </ScrollView>
      </View>

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

        {currentIndex < sortedStatus.length - 1 ? (
          <TouchableOpacity
            onPress={() => {
              if (currentIndex < sortedStatus.length - 1) {
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
