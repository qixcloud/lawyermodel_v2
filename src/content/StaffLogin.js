import React, { Component } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Linking,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
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
import LinearGradient from "react-native-linear-gradient";
import QRCodeScanner from "react-native-qrcode-scanner";
import { RNCamera } from "react-native-camera";
import messaging from "@react-native-firebase/messaging";

//import messaging from '@react-native-firebase/messaging';
// import { useDarkMode } from 'react-native-dark-mode'
let uniqueId = DeviceInfo.getUniqueId();
// import
export default class StaffLogin extends Component {
  constructor(props) {
    super(props);
    this.state = {
      signup: 0,
      back: 0,
      inputPhone: this.props.phoneNumber,
      inputEmail: "",
      inputPassword: "",
      errorTxt: "",
      sign: 0,
      social: 0,
      verify: 0,
      isDialogVisible: false,
      token: "",
      checkVerifyTxt: "",
      socialDialog: 0,
      signed: 1,
      displayQR: 0,
    };
    global.apps = [];
  }
  componentDidMount = async () => {
    const token = await this.getToken();
    this.setState({ token: token });
    if (this.props.phoneNumber != "") {
      this.checkLogin("");
      this.setState({ signed: 1 });
    } else {
      this.setState({ signed: 0 });
    }
  };

  getToken = async () => {
    //get the messeging token
    const token = await messaging().getToken();
    console.log(token);
    return token;
  };
  checkLogin = (type = "", email = "") => {
    this.setState({ errorTxt: "" });
    this.setState({ errorPhone: "" });
    this.setState({ errorEmail: "" });
    const params = new FormData();
    params.append("token", this.state.token);
    params.append("appType", "Android");
    params.append("loginType", type);
    if (this.state.inputEmail === "" && email === "") {
      this.setState({ errorTxt: "* Please input Email." });
    } else if (this.state.inputPassword === "" && type !== "qr") {
      this.setState({ errorTxt: "* Please input Password." });
    } else {
      params.append("method", "staff_sign_in");
      if (type == "qr") {
        params.append("email", email);
      } else {
        params.append("email", this.state.inputEmail);
      }
      params.append("password", this.state.inputPassword);
      params.append("uniqueId", uniqueId);
      console.log(params);
      axios({
        method: "post",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        url: global.baseUrl + "wp-admin/admin-ajax.php?action=contact_api",
        data: params,
      }).then((res) => {
        this.setState({ displayQR: 0 });
        console.log(res.data);
        if (res.data.data.sms > 0) {
          if (res.data.data.phone == "") {
            this.setState({
              errorTxt: "* You do not have a phone number in your account.",
            });
          } else if (res.data.data.sms > 111) {
            console.log(res.data.data.sms);
            this.setState({ signed: 0 });
            this.setState({ verify: res.data.data.sms });
          }
        }

        this.setLoggedIn(res);
      });
    }
  };
  hideDialog = () => {
    this.setState({ isDialogVisible: false });
    this.setState({ verify: 0 });
    this.setState({ sign: 0 });
    this.setState({ inputPhone: "" });
  };
  setLoggedIn = (res) => {
    if (res.data.sign_in == "success") {
      global.staffId = res.data.data.userId;
      this.setState({ isDialogVisible: true });
    } else {
      this.setState({ errorTxt: "* Invalid Login info." });
    }
  };
  checkVerify = () => {
    if (this.state.checkVerifyTxt == this.state.verify) {
      const params = new FormData();
      params.append("method", "smsVerify");
      params.append("contact_id", global.staffId);
      params.append("uniqueId", uniqueId);
      //console.log(params);
      axios({
        method: "post",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        url: global.baseUrl + "wp-admin/admin-ajax.php?action=contact_api",
        data: params,
      }).then((res) => {
        //console.log("-----------------------");
        //console.log(res.data);
        this.setState({ isDialogVisible: false });
        this.props.gotoStaffDashboard();
      });
    }
  };
  gotoSite = () => {
    Linking.openURL(global.baseUrl);
  };
  onSuccess = (e) => {
    this.setState({ inputEmail: e.data });
    this.checkLogin("qr", e.data);
    console.log(e.data);
    //this.setState({displayQR: 0});
  };
  displayQRDialog = () => {
    this.setState({ displayQR: 1 });
  };
  render() {
    const keyboardVerticalOffset = Platform.OS === "ios" ? -180 : -180;
    const supportedURL = global.baseUrl;
    return (
      <>
        {this.state.isDialogVisible ? (
          <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <KeyboardAvoidingView
                style={{
                  backgroundColor: "#e4e5e7",
                  padding: 15,
                  width: 300,
                  borderRadius: 10,
                  marginBottom: 100,
                }}
              >
                <ScalableImage
                  source={require("./images/verify.png")}
                  width={200}
                  style={{ marginLeft: 50 }}
                />
                <Text
                  allowFontScaling={false}
                  style={{
                    textAlign: "center",
                    fontFamily: "Quicksand-Regular",
                    fontSize: 25,
                    fontWeight: "bold",
                    marginVertical: 10,
                  }}
                >
                  Verify
                </Text>
                <TextInput
                  onChangeText={(text) =>
                    this.setState({ checkVerifyTxt: text })
                  }
                  style={styles.input}
                  placeholder="Please input Verification code."
                  placeholderTextColor="#555"
                  keyboardType={"numeric"}
                ></TextInput>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <TouchableOpacity
                    onPress={() => this.hideDialog()}
                    style={styles.button3}
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
                  <TouchableOpacity
                    onPress={() => this.checkVerify()}
                    style={styles.button3}
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
                </View>
              </KeyboardAvoidingView>
            </View>
          </TouchableWithoutFeedback>
        ) : this.state.displayQR ? (
          <QRCodeScanner
            ref={(node) => {
              this.scanner = node;
            }}
            onRead={this.onSuccess}
            // flashMode={RNCamera.Constants.FlashMode.torch}
            topContent={
              <Text style={styles.centerText}>
                {this.props.translate("loginWithQR")}
              </Text>
            }
          />
        ) : (
          <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            <LinearGradient
              colors={["#2768ea", "#ff564f"]}
              style={styles.container}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: 15,
                }}
              >
                <TouchableOpacity
                  onPress={() => this.gotoSite()}
                  style={{
                    paddingTop: 20,
                    textAlign: "right",
                    paddingRight: 15,
                  }}
                >
                  <Image
                    source={global.logo}
                    style={{ width: 50, height: 50 }}
                  />
                </TouchableOpacity>
                <View style={{ paddingTop: 25 }}>
                  <Text
                    style={{
                      fontFamily: "Quicksand-Regular",
                      textAlign: "left",
                      fontSize: 25,
                      color: "#fff",
                    }}
                  >
                    {global.title}
                  </Text>
                </View>
              </View>
              <KeyboardAvoidingView
                behavior="position"
                keyboardVerticalOffset={keyboardVerticalOffset}
                style={{
                  justifyContent: "center",
                  marginTop: 0,
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    width: Dimensions.get("window").width * 0.8,
                    padding: 30,
                    borderRadius: 5,
                    backgroundColor: "#eee",
                    shadowColor: "#000",
                    borderWidth: 1,
                    borderColor: "#ddd",
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "Quicksand-Regular",
                      fontSize: 15,
                      color: "#324b5f",
                    }}
                  >
                    {this.props.translate("userNameEmail")}
                  </Text>
                  <View style={{ paddingTop: 10 }}>
                    <TextInput
                      onChangeText={(text) =>
                        this.setState({ inputEmail: text })
                      }
                      style={styles.input}
                    ></TextInput>
                  </View>
                  <Text
                    style={{
                      fontFamily: "Quicksand-Regular",
                      fontSize: 15,
                      color: "#324b5f",
                    }}
                  >
                    {this.props.translate("password")}
                  </Text>
                  <View style={{ paddingTop: 10 }}>
                    <TextInput
                      onChangeText={(text) =>
                        this.setState({ inputPassword: text })
                      }
                      secureTextEntry={true}
                      style={styles.input}
                    ></TextInput>
                  </View>
                  <Text style={{ fontSize: 11, color: "red", padding: 5 }}>
                    {this.state.errorTxt}
                  </Text>
                  <TouchableOpacity
                    onPress={() => this.checkLogin("")}
                    style={styles.button}
                  >
                    <Text
                      style={{
                        fontFamily: "Quicksand-Regular",
                        textAlign: "center",
                        fontSize: 20,
                        color: "#fff",
                      }}
                    >
                      {this.props.translate("login")}
                    </Text>
                  </TouchableOpacity>
                  <View style={{ alignItems: "center" }}>
                    <TouchableOpacity
                      onPress={() => this.displayQRDialog()}
                      style={styles.button2}
                    >
                      <Image
                        source={require("./images/qr.png")}
                        style={{ width: 30, height: 30, marginRight: 10 }}
                      />
                      <Text
                        style={{
                          fontFamily: "Quicksand-Regular",
                          textAlign: "center",
                          fontSize: 15,
                          color: "#555",
                        }}
                      >
                        {this.props.translate("loginWithQR")}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={{ alignItems: "center" }}>
                  <TouchableOpacity
                    onPress={() => this.props.gotoAppLogin()}
                    style={styles.button1}
                  >
                    <Text
                      style={{
                        fontFamily: "Quicksand-Regular",
                        textAlign: "center",
                        fontSize: 20,
                        color: "#555",
                      }}
                    >
                      {this.props.translate("back")}
                    </Text>
                  </TouchableOpacity>
                </View>
              </KeyboardAvoidingView>
            </LinearGradient>
          </TouchableWithoutFeedback>
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
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    width: "90%",
    ...Platform.select({
      ios: {
        marginTop: 50,
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
    height: 40,
    borderRadius: 5,
    color: "#000",
    borderColor: "grey",
    backgroundColor: "#fff",
    fontSize: 12,
    paddingLeft: 10,
    marginBottom: 10,
  },
  button: {
    fontFamily: "Quicksand-Regular",
    backgroundColor: "#599cdd",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    width: "100%",
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
  button2: {
    fontFamily: "Quicksand-Regular",
    backgroundColor: "#ddd",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    marginBottom: 10,
    alignItems: "center",
    flexDirection: "row",
    width: "100%",
    justifyContent: "center",
  },
  button3: {
    fontFamily: "Quicksand-Regular",
    backgroundColor: "#599cdd",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    paddingHorizontal: 10,
    marginHorizontal: 10,
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
  centerText: {
    flex: 1,
    fontSize: 18,
    padding: 32,
    color: "#777",
  },
  textBold: {
    fontWeight: "500",
    color: "#000",
  },
  buttonText: {
    fontSize: 21,
    color: "rgb(0,122,255)",
  },
  buttonTouchable: {
    padding: 16,
  },
});
