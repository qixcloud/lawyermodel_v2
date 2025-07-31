import React, { Component } from "react";
import * as RNLocalize from "react-native-localize";
import i18n from "i18n-js";
import memoize from "lodash.memoize";
import {
  I18nManager,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
  Easing,
  TouchableOpacity,
  Dimensions,
  Image,
  Linking,
  Alert,
} from "react-native";
import MainView from "./MainView";
import Login from "./Login";
import Signup from "./Signup";
import axios from "axios";
import DeviceInfo from "react-native-device-info";
import BootSplash from "react-native-bootsplash";

// import FingerprintScanner from 'react-native-fingerprint-scanner';
//import ScalableImage from 'react-native-scalable-image';
let uniqueId = DeviceInfo.getUniqueId();
// import
const translationGetters = {
  en: () => require("../translate/en.json"),
  es: () => require("../translate/es.json"),
  fr: () => require("../translate/fr.json"),
  zh: () => require("../translate/zh.json"),
};

const translate = memoize(
  (key, config) => i18n.t(key, config),
  (key, config) => (config ? key + JSON.stringify(config) : key)
);

const setI18nConfig = () => {
  // fallback if no available language fits
  const fallback = { languageTag: "en", isRTL: false };

  const { languageTag, isRTL } =
    RNLocalize.findBestAvailableLanguage(Object.keys(translationGetters)) ||
    fallback;

  // clear translation cache
  translate.cache.clear();
  // update layout direction
  I18nManager.forceRTL(isRTL);
  // set i18n-js config

  console.log("languageTag", RNLocalize.getLocales());
  i18n.translations = { [languageTag]: translationGetters[languageTag]() };
  i18n.locale = languageTag;
  global.lang = languageTag;
};
export default class SplashScreen extends Component {
  constructor(props) {
    super(props);
    global.contactId = "";
    global.name = "";
    global.phone = "";
    global.email = "";
    global.signup = 0;
    global.apps = [];
    global.settingsData = "";
    global.maxStep = 1;
    global.version = 1;
    global.lang = "en";
    global.baseUrl = "https://qix.cloud/lawyermodel/";
    global.mainUrl = "https://qix.cloud/lawyermodel/";
    global.title = "Dial Law Firm";
    global.logo = require("./logo.png");
    global.staffId = 0;
    global.staffName = "";
    global.uniqueId = uniqueId;
    this.state = {
      answer: 1,
      loaded: 1,
      update: 0,
      updateUrl: "",
      phoneNumber: "",
      password: "",
      biometryType: null,
      showBiometry: 0,
      signinwithcodewrap: 0,
      signcode: "",
      checkSignCodeTxt: "",
      staffLoginStatus: 0,
      staffDashboardStatus: 0,
    };
    setI18nConfig();
    //console.log(global.lang);
  }
  componentDidMount = () => {
    setTimeout(() => {
      this.setSwitch();
    }, 500);
    RNLocalize.addEventListener("change", this.handleLocalizationChange);
    // FingerprintScanner.isSensorAvailable()
    // .then((biometryType) => {
    //   this.setState({biometryType});
    // })
    // .catch((error) => console.log('isSensorAvailable error => ', error));
  };
  componentWillUnmount() {
    RNLocalize.removeEventListener("change", this.handleLocalizationChange);
  }

  handleLocalizationChange = () => {
    setI18nConfig();
    this.forceUpdate();
  };
  layerSwitch = () => {
    const params = new FormData();
    params.append("method", "signed_in");
    params.append("uniqueId", uniqueId);
    axios({
      method: "POST",
      headers: {
        "Content-Type": "multipart/form-data",
      },
      url: global.baseUrl + "wp-admin/admin-ajax.php?action=contact_api",
      data: params,
    }).then((res) => {
      this.setSwitch();
      if (res.data.phone == "") {
        this.checkVersion();
      } else {
        if (res.data.staff > 0) {
          this.setState({ phoneNumber: res.data.phone });
          global.staffId = res.data.staff;
          this.setState({ staffDashboardStatus: 1 });
          this.setState({ staffLoginStatus: 1 });
        } else {
          this.setState({ phoneNumber: res.data.phone });
          //this.checkBiometric();
          //this.setState({"showBiometry" : 1});
        }
        //this.checkVersion();
      }
    });
  };
  signout = () => {
    const params = new FormData();
    params.append("method", "sign_out");
    params.append("contact_id", global.contactId);
    params.append("uniqueId", global.uniqueId);
    axios({
      method: "post",
      headers: {
        "Content-Type": "multipart/form-data",
      },
      url: global.baseUrl + "wp-admin/admin-ajax.php?action=contact_api",
      data: params,
    }).then((res) => {
      this.setState({ staffDashboardStatus: 0 });
      this.setState({ staffLoginStatus: 1 });
      global.staffId = 0;
    });
  };
  checkVersion = () => {
    const fileName = Platform.OS === "ios" ? "ios" : "android";
    const timeStamp = Date.now();
    axios({
      method: "get",
      url:
        "https://qix.cloud/version/lawyermodel/" +
        fileName +
        ".json?t=" +
        timeStamp,
    }).then((res) => {
      console.log(
        "checkVersion",
        res.data.version,
        global.version,
        this.state.answer
      );
      if (global.version < res.data.version) {
        this.setState({ update: 1 });
      } else {
        this.setState({ update: 2 });
      }
      this.setState({ updateUrl: res.data.url });
    });
  };
  getMessage = () => {
    const { biometryType } = this.state;
    if (biometryType == "Face ID") {
      return translate("biometryMsg1");
    } else {
      return translate("biometryMsg2");
    }
  };
  signinwithcode = () => {
    const params = new FormData();
    params.append("method", "signinwithcode");
    params.append("phoneNumber", this.state.phoneNumber);
    axios({
      method: "post",
      headers: {
        "Content-Type": "multipart/form-data",
      },
      url: global.baseUrl + "wp-admin/admin-ajax.php?action=contact_api",
      data: params,
    }).then((res) => {
      //console.log(res.data.code);
      this.setState({ signcode: res.data.code });
      this.setState({ signinwithcodewrap: 1 });
    });
  };
  checksigncode = () => {
    //console.log(this.state.checkSignCodeTxt);
    if (
      this.state.checkSignCodeTxt != "" &&
      this.state.checkSignCodeTxt == this.state.signcode
    ) {
      this.setState({ answer: 1 });
      this.setState({ showBiometry: 0 });
    }
  };
  checkBiometric = () => {
    const { biometryType } = this.state;
    if (biometryType !== null && biometryType !== undefined) {
      // FingerprintScanner.authenticate({
      //   description: this.getMessage()
      // })
      //   .then(() => {
      // 	this.setState({"showBiometry" : 0});
      // 	this.setState({answer: 1});
      // 	//you can write your logic here to what will happen on successful authentication
      //   })
      //   .catch((error) => {
      // 	//Alert.alert(translate("authenticationFailed"));
      //   });
    } else {
      //Alert.alert(translate("biometricsFailed"));
    }
  };
  gotoUpdate = () => {
    Linking.openURL(this.state.updateUrl);
  };
  setSwitch = () => {
    BootSplash.hide();
    this.setState({ loaded: 1 });
  };
  gotoSite = () => {
    Linking.openURL(global.baseUrl);
  };
  gotoSignUp = () => {
    this.setState({ answer: 2 });
  };
  gotoSignUpBack = () => {
    this.setState({ answer: 1 });
  };
  finishSignUp = async () => {
    this.setState({ answer: 1 });
  };
  gotoAppLogin = () => {
    this.setState({ staffLoginStatus: 0 });
  };
  render() {
    return (
      <>
        {this.state.loaded == 0 ? (
          <View
            style={{
              backgroundColor: "1",
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Image
              source={require("./images/bootsplash_logo.png")}
              style={{
                width: 175,
                height: 175,
              }}
            />
          </View>
        ) : (
          <>
            {this.state.answer === 1 ? (
              <>
                {this.state.update == 0 && this.state.showBiometry ? (
                  <View style={{ flex: 1 }}>
                    <View style={styles.container}>
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <View style={{ paddingTop: 25, width: "70%" }}>
                          <Text
                            style={{
                              fontFamily: "Quicksand-Bold",
                              fontSize: 25,
                              color: "#afbec5",
                            }}
                          >
                            {translate("welcome")}
                          </Text>
                        </View>
                        <TouchableOpacity
                          onPress={() => this.gotoSite()}
                          style={{ paddingTop: 20, textAlign: "right" }}
                        >
                          <Image
                            source={global.logo}
                            style={{ width: 50, height: 50 }}
                          />
                        </TouchableOpacity>
                      </View>
                      <View
                        style={{
                          paddingBottom: 55,
                          paddingTop: 25,
                          width: "90%",
                        }}
                      >
                        <Text
                          style={{
                            fontFamily: "Quicksand-Regular",
                            fontSize: 15,
                            color: "#333",
                            width: "100%",
                            textAlign: "right",
                          }}
                        >
                          {translate("panswer")}
                        </Text>
                        <Text
                          style={{
                            fontFamily: "Quicksand-Regular",
                            fontSize: 15,
                            color: "#333",
                            width: "100%",
                            textAlign: "right",
                          }}
                        >
                          {translate("theQuestionBelow")}
                        </Text>
                      </View>
                      <View
                        style={{
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <View
                          style={{
                            width: Dimensions.get("window").width * 0.8,
                            backgroundColor: "white",
                            borderRadius: 5,
                            padding: 20,
                          }}
                        >
                          <TouchableOpacity
                            onPress={() => this.checkBiometric()}
                            style={styles.button}
                          >
                            <Text
                              style={{
                                fontFamily: "Quicksand-Regular",
                                textAlign: "center",
                                fontSize: 20,
                                color: "#fff",
                                paddingLeft: 10,
                                paddingRight: 10,
                              }}
                            >
                              {translate("tryagain")}
                            </Text>
                          </TouchableOpacity>
                        </View>
                        <View
                          style={{
                            width: Dimensions.get("window").width * 0.8,
                            backgroundColor: "white",
                            borderRadius: 5,
                            padding: 20,
                          }}
                        >
                          <TouchableOpacity
                            onPress={() => this.signinwithcode()}
                            style={styles.button}
                          >
                            <Text
                              style={{
                                fontFamily: "Quicksand-Regular",
                                textAlign: "center",
                                fontSize: 20,
                                color: "#fff",
                                paddingLeft: 10,
                                paddingRight: 10,
                              }}
                            >
                              {translate("signinwithcode")}
                            </Text>
                          </TouchableOpacity>
                          {this.state.signinwithcodewrap ? (
                            <View
                              style={{
                                justifyContent: "center",
                                alignItems: "center",
                              }}
                            >
                              <TextInput
                                onChangeText={(text) =>
                                  this.setState({ checkSignCodeTxt: text })
                                }
                                style={styles.input}
                                placeholderTextColor="#555"
                                placeholder="Please input Verification code."
                                keyboardType={"numeric"}
                              ></TextInput>
                              <TouchableOpacity
                                onPress={() => this.checksigncode()}
                                style={styles.button1}
                              >
                                <Text
                                  style={{
                                    fontFamily: "Quicksand-Regular",
                                    textAlign: "center",
                                    fontSize: 20,
                                    color: "#fff",
                                    paddingLeft: 10,
                                    paddingRight: 10,
                                  }}
                                >
                                  {translate("submit")}
                                </Text>
                              </TouchableOpacity>
                            </View>
                          ) : (
                            <></>
                          )}
                        </View>
                      </View>
                    </View>
                  </View>
                ) : (
                  <Login
                    translate={translate}
                    phoneNumber={this.state.phoneNumber}
                    gotoSignUp={this.gotoSignUp}
                    gotoStaffLogin={this.gotoStaffLogin}
                  />
                )}
              </>
            ) : (
              <></>
            )}
            {this.state.answer === 2 ? (
              <Signup
                translate={translate}
                gotoSignUpBack={this.gotoSignUpBack}
                finishSignUp={this.finishSignUp}
                phone={this.state.phoneNumber}
              />
            ) : (
              <></>
            )}
            {this.state.answer === 0 ? (
              <View style={{ flex: 1 }}>
                <View style={styles.container}>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <View style={{ paddingTop: 25, width: "70%" }}>
                      <Text
                        style={{
                          fontFamily: "Quicksand-Bold",
                          fontSize: 25,
                          color: "#afbec5",
                        }}
                      >
                        {translate("welcome")}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => this.gotoSite()}
                      style={{ paddingTop: 20, textAlign: "right" }}
                    >
                      <Image
                        source={global.logo}
                        style={{ width: 50, height: 50 }}
                      />
                    </TouchableOpacity>
                  </View>
                  <View
                    style={{
                      paddingBottom: 55,
                      paddingTop: 25,
                      width: "90%",
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: "Quicksand-Regular",
                        fontSize: 15,
                        color: "#333",
                        width: "100%",
                        textAlign: "right",
                      }}
                    >
                      {translate("panswer")}
                    </Text>
                    <Text
                      style={{
                        fontFamily: "Quicksand-Regular",
                        fontSize: 15,
                        color: "#333",
                        width: "100%",
                        textAlign: "right",
                      }}
                    >
                      {translate("theQuestionBelow")}
                    </Text>
                  </View>
                  <View
                    style={{
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    {this.state.update == 1 && (
                      <View
                        style={{
                          width: Dimensions.get("window").width * 0.8,
                          height: Dimensions.get("window").height * 0.45,
                          backgroundColor: "white",
                          borderRadius: 5,
                          padding: 20,
                        }}
                      >
                        <Text
                          style={{
                            fontFamily: "Quicksand-Regular",
                            fontSize: 20,
                            color: "#324b5f",
                            textAlign: "center",
                          }}
                        >
                          {translate("updateApp")}
                        </Text>
                        <View
                          style={{
                            flexDirection: "row",
                            justifyContent: "center",
                            paddingTop: 30,
                          }}
                        >
                          <View style={{ marginRight: 15 }}>
                            <TouchableOpacity
                              onPress={() => this.gotoUpdate()}
                              style={styles.button}
                            >
                              <Text
                                style={{
                                  fontFamily: "Quicksand-Regular",
                                  textAlign: "center",
                                  fontSize: 20,
                                  color: "#fff",
                                  paddingLeft: 10,
                                  paddingRight: 10,
                                }}
                              >
                                {translate("update")}
                              </Text>
                            </TouchableOpacity>
                          </View>
                          <View>
                            <TouchableOpacity
                              onPress={() => this.setState({ update: 2 })}
                              style={styles.button}
                            >
                              <Text
                                style={{
                                  fontFamily: "Quicksand-Regular",
                                  textAlign: "center",
                                  fontSize: 20,
                                  color: "#fff",
                                  paddingLeft: 10,
                                  paddingRight: 10,
                                }}
                              >
                                {translate("cancel")}
                              </Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    )}
                    {this.state.update == 2 && (
                      <View
                        style={{
                          width: Dimensions.get("window").width * 0.8,
                          height: Dimensions.get("window").height * 0.45,
                          backgroundColor: "white",
                          borderRadius: 5,
                          padding: 20,
                        }}
                      >
                        <Text
                          style={{
                            fontFamily: "Quicksand-Regular",
                            fontSize: 20,
                            color: "#324b5f",
                            textAlign: "center",
                          }}
                        >
                          {translate("areYouAlready")}
                        </Text>
                        <View
                          style={{
                            flexDirection: "row",
                            justifyContent: "center",
                            paddingTop: 30,
                          }}
                        >
                          <View style={{ marginRight: 15 }}>
                            <TouchableOpacity
                              onPress={() => this.setState({ answer: 1 })}
                              style={styles.button}
                            >
                              <Text
                                style={{
                                  fontFamily: "Quicksand-Regular",
                                  textAlign: "center",
                                  fontSize: 20,
                                  color: "#fff",
                                  paddingLeft: 10,
                                  paddingRight: 10,
                                }}
                              >
                                {translate("yes")}
                              </Text>
                            </TouchableOpacity>
                          </View>
                          <View>
                            <TouchableOpacity
                              onPress={() => this.setState({ answer: 2 })}
                              style={styles.button}
                            >
                              <Text
                                style={{
                                  fontFamily: "Quicksand-Regular",
                                  textAlign: "center",
                                  fontSize: 20,
                                  color: "#fff",
                                  paddingLeft: 10,
                                  paddingRight: 10,
                                }}
                              >
                                {translate("no")}
                              </Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    )}
                    {this.state.update == 0 && this.state.showBiometry && (
                      <View
                        style={{
                          width: Dimensions.get("window").width * 0.8,
                          height: 150,
                          backgroundColor: "white",
                          borderRadius: 5,
                          padding: 20,
                        }}
                      >
                        <TouchableOpacity
                          onPress={() => this.checkBiometric()}
                          style={styles.button}
                        >
                          <Text
                            style={{
                              fontFamily: "Quicksand-Regular",
                              textAlign: "center",
                              fontSize: 20,
                              color: "#fff",
                              paddingLeft: 10,
                              paddingRight: 10,
                            }}
                          >
                            {translate("tryagain")}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            ) : (
              <></>
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
  },
  button: {
    backgroundColor: "#599cdd",
    padding: 10,
    borderRadius: 5,
  },
  button1: {
    backgroundColor: "#599cdd",
    padding: 10,
    borderRadius: 5,
    width: 120,
  },
  inputPW: {
    fontFamily: "Quicksand-Regular",
    height: 40,
    borderRadius: 5,
    color: "#000",
    borderColor: "grey",
    backgroundColor: "#fff",
    fontSize: 12,
    paddingLeft: 10,
    marginVertical: 10,
    borderWidth: 1,
  },
  buttonStyle: {
    width: "70%",
    backgroundColor: "#000",
    borderRadius: 25,
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: 17, fontWeight: "bold" },
  biometryText: {
    color: "#000",
    fontSize: 17,
    fontWeight: "bold",
    marginTop: 30,
  },
  input: {
    fontFamily: "Quicksand-Regular",
    height: 40,
    width: "100%",
    borderRadius: 5,
    color: "#000",
    borderColor: "grey",
    backgroundColor: "#fff",
    fontSize: 12,
    paddingLeft: 10,
    marginTop: 10,
    marginBottom: 10,
    borderWidth: 1,
  },
});
