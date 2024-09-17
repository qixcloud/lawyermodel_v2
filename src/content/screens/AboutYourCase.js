import React from "react";
import {
  Image,
  ImageBackground,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SharedElement } from "react-navigation-shared-element";

const AboutYourCase = ({ navigation, route }) => {
  const { item } = route.params;
  const [show, setShow] = React.useState(true);

  return (
    <View style={{ flex: 1, backgroundColor: "#2e3542" }}>
      <SharedElement id={`item.${item.title}.content`}>
        <Image
          source={{ uri: item.image }}
          style={{ width: "100%", height: 200 }}
          resizeMode="cover"
        />
      </SharedElement>
      <View>
        <Text
          style={{
            fontSize: 22,
            marginTop: 20,
            textAlign: "center",
            color: "white",
            marginHorizontal: 20,
          }}
        >
          {item.title}
        </Text>
        <Text
          style={{
            fontSize: 15,
            marginTop: 20,
            textAlign: "center",
            color: "white",
            marginHorizontal: 20,
          }}
        >
          {item.description}
        </Text>
      </View>

      {show && (
        <TouchableOpacity
          onPress={() => {
            setShow(false);
            navigation.goBack();
          }}
          style={{
            position: "absolute",
            right: 20,
            top: Platform.OS === "ios" ? 50 : 20,
            backgroundColor: "white",
            padding: 0,
            borderRadius: 55,
            height: 45,
            width: 45,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Image
            source={require("../images/close.png")}
            style={{
              width: 25,
              height: 25,
              marginHorizontal: 10,
              borderRadius: 25,
            }}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

AboutYourCase.sharedElements = (route, otherRoute, showing) => {
  const { item } = route.params;
  return [`item.${item.title}.content`];
};

export default AboutYourCase;
