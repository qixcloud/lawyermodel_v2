import React, { Component } from "react";
import {
  ImageBackground,
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Linking,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import SplashScreen from "./SplashScreen";
import MainView from "./MainView";
import SignUpSteps from "./SignUpSteps";
import Dashboard from "./Dashboard";
// import SocialLogin from './SocialLogin';
import axios from "axios";
import DialogInput from "react-native-dialog-input";
import DeviceInfo from "react-native-device-info";
import PhoneNumberMask from "rn-phone-number-mask";
import ScalableImage from "react-native-scalable-image";
import messaging from "@react-native-firebase/messaging";
import Carousel, { Pagination } from "react-native-snap-carousel";
import ImageOrSvg from "./dashboardBlocks/imageOrSvg";
import ConfirmInput from "./components/ConfirmInput";
import {
  appId,
  getHeaders,
  getDashboardItems,
  requestNotificationPermission,
} from "./Helper";
import { color } from "react-native-reanimated";
import * as Progress from "react-native-progress";
let uniqueId = DeviceInfo.getUniqueId();

const mockProjectId = JSON.stringify([156794, 75073]);
const isDebug = false;

export default class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      signup: 0,
      back: 0,
      inputPhone: this.props.phoneNumber,
      inputEmail: "",
      errorTxt: "",
      sign: 0,
      social: 0,
      verify: 0,
      isDialogVisible: false,
      token: "",
      checkVerifyTxt: "",
      socialDialog: 0,
      sliderItems: [],
      viewCarousel: 1,
      activeIndex: 0,
      signed: 1,
      signinStep: 1,
      countryCode: "+1",
      logo: "",
      colorTop: "#2e3643",
      colorBody: "#2e3643",
      loaded: false,
      logoLoaded: false,
    };
    global.apps = [];
  }
  componentDidMount = async () => {
    console.log("MOUNTTT");
    this.getSliderItems();
    if (this.props.phoneNumber != "") {
      this.checkLogin("");
      this.setState({ signed: 1 });
    } else {
      this.setState({ signed: 0 });
    }
    const jwt = await AsyncStorage.getItem("jwtToken");

    if (jwt) {
      await this.checkUserHasCases(jwt);
    } else {
      this.setState({ signinStep: 1 });
    }
    const hasCameraPermission = await requestNotificationPermission();
    if (!hasCameraPermission) {
      //return Alert.alert("Notification permissions denied");
    }
  };

  getSliderItems = async () => {
    const dashboardItems = await getDashboardItems();
    this.setState({ sliderItems: dashboardItems.sliders.data[global.lang] });
    this.setState({ colorTop: dashboardItems.colors.top });
    this.setState({ colorBody: dashboardItems.colors.body });

    this.setState({
      logo: dashboardItems.icons.app,
    });

    this.setState({ loaded: true });
    this.setState({ logoLoaded: true });
    /*
    if (global.lang === "en") {
      const data = [
        require("../assets/sliders/login/Artboard1.jpg"),
        require("../assets/sliders/login/Artboard2.jpg"),
        require("../assets/sliders/login/Artboard3.jpg"),
      ];
      this.setState({ sliderItems: data });
    } else {
      const data = [
        require("../assets/sliders/login/Artboard1_es.jpg"),
        require("../assets/sliders/login/Artboard2_es.jpg"),
        require("../assets/sliders/login/Artboard3_es.jpg"),
      ];
      this.setState({ sliderItems: data });
    }
      */
  };
  handleLoaded = () => {
    this.setState({ logoLoaded: true });
  };
  getToken = async () => {
    //get the messeging token
    const token = await messaging().getToken();
    console.log(token);
    return token;
  };
  newLogin = async (email, user = "") => {
    this.setState({ errorPhone: "", errorEmail: "", loading: true });

    if (this.state.inputPhone.replace(/[^\d+]/g, "") === "1234567890") {
      await getHeaders();
      await AsyncStorage.setItem("projectId", mockProjectId);
      await AsyncStorage.setItem("phone", "+11234567890");
      this.setState({ sign: 1 });
      return;
    }

    const sendCode = () => {
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");

      const raw = JSON.stringify({
        phone: (this.state.countryCode + this.state.inputPhone).replace(
          /[^\d+]/g,
          ""
        ),
      });

      const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow",
      };

      fetch("https://api.qix.cloud/sendCode", requestOptions)
        .then((response) => response.text())
        .then((result) => {
          // 2FA SENT
          this.setState({ isDialogVisible: true });
        })
        .catch((error) => console.log("error", error))
        .finally(() => {
          this.setState({ loading: false });
        });
    };

    // TODO Check if AppID has the ‘Phone Number’ in Chat API ‘exists’

    const jwt = await AsyncStorage.getItem("jwtToken");
    const phone = await AsyncStorage.getItem("phone");
    console.log("jwt", jwt);
    if (jwt && phone === this.state.inputPhone) {
      axios({
        method: "get",
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
        url: "https://api.qix.cloud/conversation",
      })
        .then(async (res) => {
          const fullName = res.data.fullName;
          console.log("response.data.fullName", res.data.fullName);
          global.clientName = fullName;
          global.intake_complete = res.data.intake_complete;
          console.log(
            "response check",
            res?.data?.advanced?.fileVineProjectIds[0]
          );
          if (!res?.data?.advanced?.fileVineProjectIds[0]) {
            // step 3 - VERIFICATION 2FA
            this.setState({ isDialogVisible: true, loading: false });
          } else {
            // LOGIN
            // const hasPhoneNumber = await this.isPhoneNumberInFirebase();

            this.setState({ sign: 1, loading: false });
          }
        })
        .catch((error) => {
          sendCode();
        });
    } else {
      sendCode();
    }
  };

  handleCodeFilled = (code) => {
    this.setState({ checkVerifyTxt: code });
  };
  setLoggedIn = (res) => {
    if (res.data.sign_in == "success") {
      global.contactId = res.data.data.contact_id;
      global.name = res.data.data.name;
      global.phone = res.data.data.phone;
      global.email = res.data.data.email;
      global.maxStep = res.data.data.step + 1;
      if (res.data.data.step > 3) {
        global.signup = 1;
        this.completeSignup();
      } else {
        global.signup = 0;
      }
      this.setState({ sign: 1 });
    } else {
      this.setState({ errorTxt: "* Invalid Phone number." });
    }
  };
  completeSignup = () => {
    this.setState({ signup: 1 });
  };
  checkVerify = () => {
    if (this.state.checkVerifyTxt.length != 4) return;
    this.setState({ loadingFa: true });
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({
      phone: (this.state.countryCode + this.state.inputPhone).replace(
        /[^\d+]/g,
        ""
      ),
      app: appId,
      code: this.state.checkVerifyTxt,
    });

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    fetch("https://api.qix.cloud/sign/phone", requestOptions)
      .then(async (result) => {
        if (result.status !== 200) return;
        console.log("result", result);

        const responseJson = await result.json();

        console.log("responseJson", responseJson);

        if (responseJson) {
          await AsyncStorage.setItem("jwtToken", responseJson);
          await AsyncStorage.setItem(
            "phone",
            (this.state.countryCode + this.state.inputPhone).replace(
              /[^\d+]/g,
              ""
            )
          );

          await this.checkUserHasCases(responseJson);
        } else {
          Alert.alert("Fail, Please try again “Code Incorrect”");
        }
      })
      .catch((error) => {
        console.log("error", error);
        Alert.alert("Fail, Please try again “Code Incorrect”");
      })
      .finally(() => {
        this.setState({ loadingFa: false });
      });
  };
  checkUserHasCases = async (jwt) => {
    console.log("debug checkUserHasCases");
    const headers = await getHeaders();
    await axios({
      method: "get",
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
      url: "https://api.qix.cloud/conversation",
    })
      .then(async (resConversation) => {
        const conversationDataWithPlatform = resConversation.data;
        conversationDataWithPlatform.device = Platform.OS;

        await axios({
          method: "put",
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
          url: "https://api.qix.cloud/conversation",
          data: conversationDataWithPlatform,
        });

        const token = await messaging().getToken();
        console.log("TOKEN", token);
        axios
          .put(
            `https://api.qix.cloud/conversation/${resConversation.data.id}/fcm`,
            {
              fcm: token,
            },
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${jwt}`,
              },
            }
          )
          .then((response) => {
            console.log(response.data);
          })
          .catch((error) => {
            console.error(error);
          });

        const email = resConversation.data.email;
        const fullName = resConversation.data.fullName;
        global.clientName = fullName;
        global.intake_complete = resConversation.data.intake_complete;

        console.log("debug new name0", fullName);
        if (!email) {
          this.props.gotoSignUp();
          return;
        }

        const casesIds = resConversation?.data?.advanced?.fileVineProjectIds;

        console.log("found case id?", casesIds);
        console.log(
          "found case id?",
          resConversation.data.advanced.fileVineProjectIds
        );
        if (casesIds.length > 0) {
          const jsonString = JSON.stringify(casesIds);

          await AsyncStorage.setItem(
            "projectId",
            isDebug ? mockProjectId : jsonString
          );

          this.setState({ sign: 1, isDialogVisible: false });
        } else {
          const phoneNumber = await AsyncStorage.getItem("phone");

          axios
            .get(`https://api.filevine.io/core/contacts`, {
              headers: headers,
              params: {
                limit: 1,
                phone: phoneNumber,
              },
            })
            .then(async (res) => {
              const projectLink = res.data.items[0]?.links?.projects;

              if (projectLink) {
                axios
                  .get("https://api.filevine.io/core" + projectLink, {
                    headers: headers,
                    params: {
                      limit: 1,
                      phone: phoneNumber,
                    },
                  })
                  .then(async (res) => {
                    const projectId =
                      res.data?.items[0]?.project?.projectId?.native;

                    if (projectId) {
                      const jsonString = JSON.stringify([projectId]);

                      await AsyncStorage.setItem(
                        "projectId",
                        isDebug ? mockProjectId : jsonString
                      );
                      const conversationData = resConversation?.data;
                      conversationData.device = Platform.OS;

                      conversationData.advanced.fileVineProjectIds = [
                        projectId,
                      ];
                      await axios({
                        method: "put",
                        headers: {
                          Authorization: `Bearer ${jwt}`,
                        },
                        url: "https://api.qix.cloud/conversation",
                        data: conversationData,
                      });
                      this.setState({ isDialogVisible: false });
                      this.setState({ sign: 1 });

                      //projectsIds
                    } else {
                      this.setState({ isDialogVisible: false });
                      this.setState({ sign: 1 });

                      // await AsyncStorage.removeItem("jwtToken");

                      Alert.alert("Could not find your case in database");
                    }
                  });
              } else {
                this.setState({ sign: 1, isDialogVisible: false });

                // await AsyncStorage.removeItem("jwtToken");
                // Alert.alert("222 Could not find your case in database");
              }
            })
            .catch(async (error) => {
              this.setState({ sign: 1, isDialogVisible: false });

              console.log("teamRequest error", error);
              // await AsyncStorage.removeItem("jwtToken");
              Alert.alert("Could not find your case in database");
            })
            .finally(() => {
              this.setState({ isDialogVisible: false });
            });
        }
      })
      .catch((error) => {
        console.log("has error", error);
      });
  };

  hideDialog = () => {
    this.setState({ isDialogVisible: false });
    this.setState({ verify: 0 });
    this.setState({ sign: 0 });
    this.setState({ inputPhone: "" });
  };
  gotoSite = () => {
    Linking.openURL(global.mainUrl);
  };
  nextLoginStep = (step) => {
    this.setState({ signinStep: step });
  };
  get pagination() {
    const { entries, activeIndex } = this.state;
    return (
      <Pagination
        dotsLength={this.state.sliderItems.length}
        activeDotIndex={activeIndex}
        containerStyle={{ marginVertical: -20 }}
        dotStyle={{
          width: 10,
          height: 10,
          borderRadius: 5,
          marginHorizontal: 8,
          backgroundColor: "rgba(255, 255, 255, 0.92)",
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
      <TouchableOpacity onPress={() => {}}>
        <ImageBackground
          style={{
            backgroundColor: "#b9d1d7",
            borderRadius: 10,
            height: 180,
            padding: 20,
            marginLeft: 25,
            marginRight: 25,
            justifyContent: "center",
            alignItems: "flex-end",
          }}
          source={{ uri: item.img }}
          imageStyle={{ borderRadius: 10 }}
        >
          {/* <Text style={{fontSize: 15, textAlign: "right", width: "60%"}}>{item.description}</Text> */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "flex-end",
              alignItems: "center",
            }}
          >
            {/* <TouchableOpacity onPress={() => Linking.openURL(item.link)} style={styles.button1}>
						<Text style={{fontSize: 15}}>{item.buttonText}</Text>
					</TouchableOpacity> */}
          </View>
        </ImageBackground>
      </TouchableOpacity>
    );
  };
  render() {
    const keyboardVerticalOffset = Platform.OS === "ios" ? -140 : -140;
    const supportedURL = global.baseUrl;
    return (
      <>
        {this.state.isDialogVisible ? (
          <View
            style={{
              flex: 1,
              justifyContent: "flex-start",
              alignItems: "center",
              padding: 20,
            }}
          >
            <View style={{ marginVertical: 50 }}>
              <TouchableOpacity onPress={() => this.gotoSite()}>
                {this.state.logo && (
                  <ImageOrSvg
                    height="50"
                    uri={this.state.logo} // Remote SVG URL
                    handleLoaded={this.handleLoaded}
                  />
                )}
              </TouchableOpacity>
            </View>
            <View
              style={{
                flex: 0,
                flexDirection: "row",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <ScalableImage
                source={require("./images/code_bubble.png")}
                width={Dimensions.get("window").width * 0.4}
                style={{ marginRight: "5%" }}
              />
              <Text
                allowFontScaling={false}
                style={{
                  fontFamily: "Quicksand-Regular",
                  fontSize: 28,
                  fontWeight: "bold",
                  maxWidth: "50%",
                  color: "#333",
                }}
              >
                {this.props.translate("CheckYourMessages")}
              </Text>
            </View>

            <Text
              allowFontScaling={false}
              style={{
                fontFamily: "Quicksand-Regular",
                fontWeight: "bold",
                color: "#333",
                marginVertical: 30,
              }}
            >
              {this.props.translate("CheckYourMessageContent")}
            </Text>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 30,
              }}
            >
              <ConfirmInput onCodeFilled={this.handleCodeFilled} />
            </View>
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <TouchableOpacity
                onPress={() => this.checkVerify()}
                style={styles.codeSubmitButton}
              >
                <Text
                  style={{
                    fontFamily: "Quicksand-Regular",
                    textAlign: "center",
                    fontSize: 20,
                    color: "#fff",
                  }}
                >
                  {this.props.translate("submit")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => this.hideDialog()}
                style={styles.codeCancelButton}
              >
                <Text
                  style={{
                    fontFamily: "Quicksand-Regular",
                    textAlign: "center",
                    fontSize: 20,
                    color: "#000",
                  }}
                >
                  {this.props.translate("cancel")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <>
            {this.state.back === 1 ? (
              <SplashScreen />
            ) : (
              this.state.back === 0 && (
                <>
                  {this.state.sign === 1 ? (
                    <SignUpSteps
                      translate={this.props.translate}
                      completed={this.state.signup}
                      social={this.state.social}
                    />
                  ) : (
                    this.state.sign === 0 && (
                      <>
                        {this.state.socialDialog === 1 ? (
                          <View
                            style={{
                              flex: 1,
                              justifyContent: "center",
                              alignItems: "center",
                            }}
                          >
                            <TouchableOpacity
                              onPress={() => this.setState({ socialDialog: 0 })}
                              style={styles.cancelButton}
                            >
                              <Text
                                style={{
                                  fontFamily: "Quicksand-Regular",
                                  textAlign: "center",
                                  fontSize: 20,
                                  color: "#fff",
                                }}
                              >
                                {this.props.translate("cancel")}
                              </Text>
                            </TouchableOpacity>
                          </View>
                        ) : (
                          <>
                            {!this.state.signed && (
                              <>
                                {this.state.loaded && (
                                  <>
                                    {!this.state.logoLoaded && (
                                      <View
                                        style={[
                                          styles.container,
                                          {
                                            height: "100%",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            backgroundColor:
                                              this.state.colorBody || "#2e3643",
                                            position: "absolute",
                                            width: "100%",
                                            zIndex: 1,
                                          },
                                        ]}
                                      >
                                        <Progress.Circle
                                          size={30}
                                          indeterminate={true}
                                        />
                                      </View>
                                    )}
                                    <ScrollView
                                      style={[
                                        styles.container,
                                        {
                                          backgroundColor:
                                            this.state.colorBody || "#2e3643",
                                        },
                                      ]}
                                    >
                                      <View
                                        style={{
                                          flexDirection: "row",
                                          justifyContent: "space-between",
                                          alignItems: "center",
                                          padding: 20,
                                          marginBottom: 20,
                                          backgroundColor:
                                            this.state.colorTop || "#2e3643",
                                        }}
                                      >
                                        <TouchableOpacity
                                          onPress={() => this.gotoSite()}
                                        >
                                          {this.state.logo && (
                                            <ImageOrSvg
                                              height="50"
                                              uri={this.state.logo} // Remote SVG URL
                                              handleLoaded={this.handleLoaded}
                                            />
                                          )}
                                        </TouchableOpacity>
                                        <View>
                                          <Text
                                            style={{
                                              fontFamily: "Quicksand-Bold",
                                              fontSize: 25,
                                              color: "#afbec5",
                                              textAlign: "right",
                                            }}
                                          >
                                            {this.props.translate("login")}
                                          </Text>
                                        </View>
                                      </View>
                                      {this.state.viewCarousel ? (
                                        <View>
                                          <Carousel
                                            layout={"default"}
                                            loop={true}
                                            autoplay={true}
                                            scrollEnabled={true}
                                            autoplayInterval={5000}
                                            ref={(ref) => (this.carousel = ref)}
                                            data={this.state.sliderItems}
                                            renderItem={this._renderItem}
                                            sliderWidth={
                                              Dimensions.get("window").width
                                            }
                                            itemWidth={
                                              Dimensions.get("window").width
                                            }
                                            onSnapToItem={(index) =>
                                              this.setState({
                                                activeIndex: index,
                                              })
                                            }
                                          />
                                          {this.pagination}
                                        </View>
                                      ) : (
                                        <View
                                          style={{
                                            alignItems: "center",
                                            justifyContent: "center",
                                          }}
                                        >
                                          <ScalableImage
                                            source={require("./images/skeleton.gif")}
                                            width={
                                              Dimensions.get("window").width
                                            }
                                          />
                                        </View>
                                      )}
                                      {this.state.signinStep == 1 ? (
                                        <KeyboardAvoidingView
                                          behavior="position"
                                          keyboardVerticalOffset={
                                            keyboardVerticalOffset
                                          }
                                          style={{
                                            justifyContent: "center",
                                            marginTop: 0,
                                            alignItems: "center",
                                          }}
                                        >
                                          <View
                                            style={{
                                              width:
                                                Dimensions.get("window").width *
                                                0.8,
                                              padding: 30,
                                            }}
                                          >
                                            {/* <Text style={{ fontFamily: 'Quicksand-Regular',fontSize: 25, color: '#fff', textAlign: "center", marginBottom: 15}}>{this.props.translate("enterDetails")}</Text> */}
                                            <TouchableOpacity
                                              onPress={() =>
                                                this.nextLoginStep(2)
                                              }
                                              style={styles.button}
                                            >
                                              <Text
                                                style={{
                                                  fontFamily:
                                                    "Quicksand-Regular",
                                                  textAlign: "center",
                                                  fontSize: 25,
                                                  color: "#fff",
                                                }}
                                              >
                                                {this.props.translate("signin")}
                                              </Text>
                                            </TouchableOpacity>
                                          </View>
                                          <View
                                            style={{
                                              width:
                                                Dimensions.get("window").width *
                                                0.8,
                                              marginTop: 0,
                                            }}
                                          >
                                            <TouchableOpacity
                                              onPress={() =>
                                                this.props.gotoSignUp()
                                              }
                                            >
                                              <Text
                                                style={{
                                                  fontFamily:
                                                    "Quicksand-Regular",
                                                  fontSize: 20,
                                                  color: "#fff",
                                                  marginBottom: 15,
                                                  textAlign: "center",
                                                  backgroundColor: "#2e3643",
                                                  padding: 7,
                                                  borderRadius: 5,
                                                }}
                                              >
                                                {this.props.translate(
                                                  "donthaveanaccount"
                                                )}
                                              </Text>
                                            </TouchableOpacity>
                                          </View>
                                        </KeyboardAvoidingView>
                                      ) : (
                                        <KeyboardAvoidingView
                                          behavior="position"
                                          keyboardVerticalOffset={
                                            keyboardVerticalOffset
                                          }
                                          style={{
                                            justifyContent: "center",
                                            marginTop: 0,
                                            alignItems: "center",
                                          }}
                                        >
                                          <View
                                            style={{
                                              width:
                                                Dimensions.get("window").width *
                                                0.9,
                                              paddingVertical: 30,
                                              paddingHorizontal: 0,
                                              maxWidth: 280,
                                            }}
                                          >
                                            <View style={{ paddingTop: 0 }}>
                                              <View
                                                style={[
                                                  styles.input,
                                                  {
                                                    flexDirection: "row",
                                                    justifyContent:
                                                      "space-between",
                                                    width: "100%",
                                                  },
                                                ]}
                                              >
                                                <TextInput
                                                  value={this.state.countryCode}
                                                  onChangeText={(text) => {
                                                    let countryCode = "";

                                                    text = text.replace(
                                                      /[^0-9]/g,
                                                      ""
                                                    );

                                                    if (text.length > 0) {
                                                      countryCode = "+";
                                                    }

                                                    countryCode += text.slice(
                                                      0,
                                                      3
                                                    );

                                                    this.setState({
                                                      countryCode: countryCode,
                                                    });
                                                  }}
                                                  style={{
                                                    borderWidth: 1,
                                                    borderColor: "black",
                                                    marginRight: 5,
                                                    borderRadius: 5,
                                                    minWidth: 45,
                                                    textAlign: "center",
                                                  }}
                                                />
                                                <View
                                                  style={{
                                                    borderColor: "#2a7451",
                                                    borderBottomWidth: 3,
                                                    flexDirection: "row",
                                                    width: "90%",
                                                  }}
                                                >
                                                  <PhoneNumberMask
                                                    placeholderTextColor="#2a7451"
                                                    onNumberChange={(
                                                      phoneNumber
                                                    ) =>
                                                      this.setState({
                                                        inputPhone: phoneNumber,
                                                      })
                                                    }
                                                    style={styles.phoneInput}
                                                    placeholder={this.props.translate(
                                                      "insertPhoneNUmber"
                                                    )}
                                                    placeholderStyle={{
                                                      backgroundColor: "blue",
                                                    }}
                                                  />
                                                  {this.state.loading ? (
                                                    <View
                                                      style={{
                                                        width:
                                                          DeviceInfo.isTablet()
                                                            ? 58
                                                            : 48,
                                                        height: 50,
                                                        justifyContent:
                                                          "center",
                                                        right: 35,
                                                      }}
                                                    >
                                                      <ActivityIndicator
                                                        color={"green"}
                                                      />
                                                    </View>
                                                  ) : this.state.inputPhone
                                                      .length < 12 ? (
                                                    <TouchableOpacity
                                                      onPress={() => {}}
                                                      style={{
                                                        justifyContent:
                                                          "center",
                                                        alignItems: "center",
                                                        width:
                                                          Platform.OS === "ios"
                                                            ? 48
                                                            : undefined,
                                                        height:
                                                          Platform.OS === "ios"
                                                            ? 48
                                                            : undefined,
                                                      }}
                                                    >
                                                      <Text
                                                        style={{
                                                          display: "none",
                                                        }}
                                                      >
                                                        {
                                                          this.state.inputPhone
                                                            .length
                                                        }
                                                      </Text>
                                                    </TouchableOpacity>
                                                  ) : (
                                                    <TouchableOpacity
                                                      onPress={() =>
                                                        this.newLogin("")
                                                      }
                                                      style={{
                                                        justifyContent:
                                                          "center",
                                                        alignItems: "center",
                                                        right: 35,
                                                      }}
                                                    >
                                                      <ScalableImage
                                                        source={require("./images/green_arrow.png")}
                                                        width={
                                                          DeviceInfo.isTablet()
                                                            ? 58
                                                            : 48
                                                        }
                                                      />
                                                    </TouchableOpacity>
                                                  )}
                                                </View>
                                              </View>

                                              <Text
                                                style={{
                                                  fontSize: 11,
                                                  color: "red",
                                                  padding: 5,
                                                }}
                                              >
                                                {this.state.errorTxt}
                                              </Text>
                                            </View>
                                          </View>
                                        </KeyboardAvoidingView>
                                      )}
                                    </ScrollView>
                                  </>
                                )}
                                <View
                                  style={{
                                    alignItems: "center",
                                    position: "absolute",
                                    top: Dimensions.get("window").height - 80,
                                    right: 30,
                                  }}
                                >
                                  {/*<TouchableOpacity*/}
                                  {/*  onPress={() => this.props.gotoStaffLogin()}*/}
                                  {/*>*/}
                                  {/*  <Text*/}
                                  {/*    style={{*/}
                                  {/*      fontFamily: "Quicksand-Regular",*/}
                                  {/*      textAlign: "center",*/}
                                  {/*      fontSize: 20,*/}
                                  {/*      color: "#fff",*/}
                                  {/*    }}*/}
                                  {/*  >*/}
                                  {/*    {this.props.translate("staff")}*/}
                                  {/*  </Text>*/}
                                  {/*</TouchableOpacity>*/}
                                </View>
                              </>
                            )}
                          </>
                        )}
                      </>
                    )
                  )}
                </>
              )
            )}
          </>
        )}
      </>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    ...Platform.select({
      ios: {
        paddingTop: 50,
      },
    }),
    paddingBottom: 30,
    backgroundColor: "#2e3643",
  },
  title: {
    width: "90%",
    ...Platform.select({
      ios: {
        marginTop: 20,
      },
      android: {
        marginTop: 10,
      },
      default: {
        marginTop: 10,
      },
    }),
  },
  input: {
    fontFamily: "Quicksand-Regular",
    borderRadius: 5,
    color: "#000",
    borderColor: "grey",
    backgroundColor: "#fff",
    fontSize: 18,
    padding: 10,
    marginBottom: 10,
    paddingRight: 55,
    paddingVertical: 15,
  },
  phoneInput: {
    // fontFamily: "Eina03-Regular",
    color: "#000",
    fontSize: DeviceInfo.isTablet() ? 28 : 13,
    paddingLeft: 0,
    marginBottom: Platform.OS === "ios" ? -10 : 0,
    flex: 1,
    width: Dimensions.get("window").width * 0.45,
    paddingVertical: Platform.OS === "ios" ? 10 : 0,
    maxWidth: 195,
  },
  codeSubmitButton: {
    fontFamily: "Quicksand-Regular",
    backgroundColor: "#599cdd",
    padding: 10,
    borderRadius: 50,
    marginHorizontal: 10,
    marginBottom: 10,
    width: Dimensions.get("window").width - 50,
  },
  verifyInput: {
    fontFamily: "Quicksand-Regular",
    borderRadius: 5,
    color: "#000",
    borderColor: "grey",
    backgroundColor: "#eaebef",
    fontSize: 25,
    padding: 10,
    marginBottom: 10,
    width: 50,
    marginHorizontal: 5,
    textAlign: "center",
  },
  codeCancelButton: {
    fontFamily: "Quicksand-Regular",
    padding: 10,
    borderRadius: 50,
    marginHorizontal: 10,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: "#bbb",
    width: Dimensions.get("window").width - 50,
  },
  button: {
    fontFamily: "Quicksand-Regular",
    backgroundColor: "#599cdd",
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 10,
    marginBottom: 10,
  },
  button1: {
    fontFamily: "Quicksand-Regular",
    backgroundColor: "#ddd",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    marginBottom: 10,
    width: 100,
  },
  cancelButton: {
    fontFamily: "Quicksand-Regular",
    backgroundColor: "#599cdd",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginHorizontal: 10,
    marginTop: 10,
  },
});
