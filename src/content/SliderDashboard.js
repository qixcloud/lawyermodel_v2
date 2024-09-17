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

let data = [
  {
    title: "Documenting the Incident",
    caption: "Strengthen your case with thorough documentation and evidence.",
    img: require("./images/evidence.jpg"),
    description:
      "Thorough documentation and evidence are vital in strengthening your case. Recording incident details, gathering physical evidence, and securing witness statements provide a solid foundation. Organized records, such as medical and police reports, demonstrate your commitment to a strong, supported case, increasing the likelihood of a favorable outcome.",
  },
  {
    title: "Types of Injury Claims",
    caption: "Know your options for seeking compensation after an injury",
    img: require("./images/types_of_injury.jpg"),
    description:
      "To seek compensation after an injury, it's important to know your options. Personal injury claims cover incidents like car accidents or slips and falls caused by negligence. Workers’ Compensation claims address workplace injuries, providing benefits for medical expenses and lost wages. Product liability claims deal with harm caused by defective products. Medical malpractice claims involve injuries due to negligence by healthcare professionals. Understanding these types of claims helps you pursue appropriate compensation. ",
  },
  {
    title: "Medical care",
    caption: "Essential for evidence and your well-being.",
    img: require("./images/medical_care.jpg"),
    description:
      "Obtaining timely and comprehensive medical care is crucial for both your well-being and the strength of your case. When you seek immediate medical attention after an injury, you prioritize your health and address any potential underlying issues. Beyond obvious health benefits, the medical records and reports generated during your treatment become valuable evidence. These documents provide a clear and detailed account of injuries, treatment received, and the impact on your daily life. They substantiate the severity and extent of your condition, reinforcing your compensation claim. Additionally, by consistently pursuing necessary medical care, you prioritize your recovery, ensuring that you receive appropriate treatment and support throughout the process. \n",
  },
  {
    title: "Disability benefits",
    caption: "Explore support options for your injury-related disability.",
    img: require("./images/benefits.jpg"),
    description:
      "When dealing with an injury-related disability, it is important to explore the available options for disability benefits and support. Disability benefits can provide financial assistance to individuals who are unable to work due to their disability. Programs such as Social Security Disability Insurance (SSDI) and Supplemental Security Income (SSI) offer monthly payments and medical coverage to eligible individuals. Additionally, private disability insurance may provide coverage for income replacement in the event of a disability. It is crucial to understand the eligibility requirements, application process, and potential benefits offered by these programs to ensure you receive the support you need. Explore disability benefits and help alleviate financial stress and provide resources to assist you in managing your injury-related disability effectively",
  },
  {
    title: "Length of my Case",
    caption: "Case duration varies, manage expectations with expert guidance.",
    img: require("./images/time.jpg"),
    description:
      "Case durations vary widely, so managing expectations is crucial with expert guidance. Factors like legal complexities, investigation needs, and court schedules influence timelines. Some cases resolve quickie through negotiation or settlement, while others may require more time and potentially go to trial. Consulting experienced professionals offer insights into potential durations and case dynamics. Realistic expectations help navigate the process, maintaining focus and patience. While desiring a swift resolution is natural, understanding variables and seeking expert guidance ensures effective management throughout. ",
  },
];

const ITEM_WIDTH = screenWidth * 0.6;
const ITEM_HEIGHT = screenHeight * 0.3;
const ITEM_SEPARATOR_WIDTH = screenWidth * 0.08;

const SliderDashboard = (props) => {
  const [activeSlide, setActiveSlide] = useState(0);
  const navigation = useNavigation();

  React.useEffect(() => {
    if (activeSlide === data.length - 1) {
      //animationRef.current.play();
    }
  }, [activeSlide]);

  const renderItem = ({ item, index }) => {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => navigation.navigate("AboutYourCase", { item })}
      >
        <SharedElement id={`item.${item.title}.photo`}>
          <Image
            style={{
              width: ITEM_WIDTH,
              height: ITEM_HEIGHT,
              borderRadius: 15,
              marginHorizontal: ITEM_SEPARATOR_WIDTH / 2,
              position: "absolute",
            }}
            source={item.img}
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
            {item.caption}
          </Text>
        </View>
      </TouchableOpacity>
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
    <View
      style={{
        flex: 1,
        backgroundColor: "#2e3643",
        marginTop: 20,
      }}
    >
      <View style={{ borderWidth: 0 }}>
        <Text
          style={{
            fontSize: 20,
            color: "#fff",
            paddingHorizontal: 20,
            paddingVertical: 10,
            marginTop: 10,
          }}
        >
          Status
        </Text>

        <TouchableOpacity
          onPress={props.onStatusPress}
          style={{
            overflow: "hidden",
            borderRadius: 10,
            marginLeft: 10,
            marginBottom: 25,
          }}
        >
          <Image
            source={require("./images/layout3.png")}
            borderRadius={10}
            style={{
              overflow: "hidden",
              height: 110,
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
                  paddingHorizontal: 20,
                  fontSize: 16,
                  fontWeight: "bold",
                }}
              >
                Preparing &
              </Text>
              <Text
                style={{
                  color: "#fff",
                  paddingHorizontal: 20,
                  fontSize: 16,
                  fontWeight: "bold",
                }}
              >
                Filing Lawsuit
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
                source={require("./images/white_arrow.png")}
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

        <Text
          style={{
            fontSize: 20,
            color: "#fff",
            paddingHorizontal: 20,
            paddingVertical: 10,
            marginTop: 10,
          }}
        >
          {props.translate("aboutYourCase")}
        </Text>
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
            paddingHorizontal: 0, //ITEM_SEPARATOR_WIDTH / 10,
          }}
        />
      </View>
      {/* <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          marginBottom: 30,
        }}
      >
        {data.map((item, index) => renderDot(index))}
      </View> */}
    </View>
  );
};

export default SliderDashboard;
