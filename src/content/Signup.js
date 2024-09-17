import React, { Component } from "react";
import {
  StyleSheet,
  Text,
  View,
  Alert,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Image,
  Linking,
  KeyboardAvoidingView,
  ScrollView,
  ActivityIndicator,
  Platform,
  Keyboard,
} from "react-native";
import SplashScreen from "./SplashScreen";
import SignUpSteps from "./SignUpSteps";
import axios from "axios";
// import RNPickerSelect, { defaultStyles } from 'react-native-picker-select';
import { Picker } from "@react-native-picker/picker";
import MaskInput, { Masks } from "react-native-mask-input";
import { Input, Icon } from "react-native-elements";

import messaging from "@react-native-firebase/messaging";
import { launchCamera } from "react-native-image-picker";
import { requestCameraPermission } from "./Helper";
import AsyncStorage from "@react-native-async-storage/async-storage";
// import
export default class Signup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      login: 0,
      back: 0,
      next: false,
      inputName: "",
      inputPhone: "",
      inputEmail: "",
      dismissal: "Injured at Work",
      errortxt: "",
      incident_date: "",
      birthday: "",
      social: 0,
      token: "",
      termsAndConditions: false,
      loading: false,
      showContact: true,
      showEmployer: true,
      showLicence: true,
      showPrimaryResidence: true,
      isKeyboardOpen: false,

      // Employer section
      inputEmployerName: "",
      inputDateHired: "",
      inputHoursWages: "",
      inputPayStUBPicture: undefined,

      inputGovIdPicture: undefined,
      // primary residence section
      inputAddress: "",
      inputAddress2: "",
      inputCity: "",
      inputZipCode: "",
      termsOfService: "",
    };
  }

  componentDidMount = async () => {
    const token = await this.getToken();
    this.setState({ token: token });
    console.log("token", token);
    await this.getTermsOfService();
  };

  getTermsOfService = async () => {
    const params = new FormData();
    params.append("method", "getTermsOfService");
    axios({
      method: "post",
      headers: {
        "Content-Type": "multipart/form-data",
      },
      url: global.baseUrl + "wp-admin/admin-ajax.php?action=contact_api",
      data: params,
    }).then((res) => {
      console.log("terms_of_service", res.data.terms_of_service);
      this.setState({ termsOfService: res.data.terms_of_service });
    });
  };
  getToken = async () => {
    //get the messeging token
    const token = await messaging().getToken();
    console.log("token", token);
    //you can also call messages.getToken() (does the same thing)
    return token;
  };
  handleSignUp = async () => {
    this.setState({ loading: true });
    const jwt = await AsyncStorage.getItem("jwtToken");

    await axios({
      method: "get",
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
      url: "https://api.qix.cloud/conversation",
    })
      .then(async (res) => {
        const conversationData = res?.data;
        conversationData.fullName = this.state.inputName;
        conversationData.email = this.state.inputEmail;

        await axios({
          method: "put",
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
          url: "https://api.qix.cloud/conversation",
          data: conversationData,
        })
          .then((res) => {
            if (res.data === "success") {
              this.props.finishSignUp();
            }
          })
          .finally(() => {
            this.setState({ loading: false });
          });
      })
      .catch(() => {
        this.setState({ loading: false });
      });
  };
  gotoSite = () => {
    Linking.openURL(global.baseUrl);
  };

  render() {
    const keyboardVerticalOffset = Platform.OS === "ios" ? 40 : 0;
    const supportedURL = global.baseUrl;

    const isSecondStepFull = () => {
      return (
        this.state.inputName &&
        this.state.inputPhone &&
        this.state.inputEmail &&
        this.state.incident_date &&
        this.state.birthday
      );
    };

    const isThirdStepFull = () => {
      return (
        this.state.inputEmployerName &&
        this.state.inputDateHired &&
        this.state.inputHoursWages &&
        this.state.inputPayStUBPicture
      );
    };

    const isForthStepFull = () => {
      return this.state.inputGovIdPicture;
    };
    const isFiveStep = () => {
      return (
        this.state.inputAddress &&
        this.state.inputCity &&
        this.state.inputZipCode
      );
    };

    const isFormFull = () => {
      return (
        this.state.inputName &&
        this.state.inputPhone &&
        this.state.inputEmail &&
        this.state.termsAndConditions
      );

      // return (
      //   isSecondStepFull() &&
      //   isThirdStepFull &&
      //   isForthStepFull() &&
      //   isFiveStep &&
      //   this.state.termsAndConditions
      // );
    };

    const checkSecondStep = () => {
      if (isSecondStepFull()) {
        this.setState({ showContact: false });
      }
    };

    const checkThirdStep = () => {
      if (isThirdStepFull()) {
        this.setState({ showEmployer: false });
      }
    };

    const checkForthStep = () => {
      if (isForthStepFull()) {
        this.setState({ showLicence: false });
      }
    };

    const checkFiveStep = () => {
      if (isFiveStep()) {
        this.setState({ showPrimaryResidence: false });
      }
    };

    const formatPhone = (num) => {
      console.log("num", num);
      num = num.replace(/\D/g, ""); // Remover todos los caracteres que no sean dígitos
      let telephone = "";

      if (num.length >= 1) {
        telephone = "(" + num.slice(0, 3);
      }

      if (num.length >= 4) {
        telephone += ") " + num.slice(3, 6);
      }

      if (num.length >= 7) {
        telephone += "-" + num.slice(6);
      }

      return telephone;
    };

    const handleCameraIconPress = async (state) => {
      const hasCameraPermission = await requestCameraPermission();
      if (!hasCameraPermission) {
        return Alert.alert("Camera permissions denied");
      }

      await launchCamera({}, (response) => {
        if (response.errorMessage) {
          console.log("Error camera", response.errorMessage);
        } else if (response?.assets?.length > 0) {
          if (state === "inputPayStUBPicture") {
            this.setState({ inputPayStUBPicture: response.assets[0].uri });
            console.log(response.assets[0]);
            checkThirdStep();
          } else {
            this.setState({
              inputGovIdPicture: response.assets[0].uri,
              showLicence: false,
            });
            console.log(response.assets[0]);
          }
        }
      });
      // if (state === "inputPayStUBPicture") {
      //   this.setState({ inputPayStUBPicture: "test" });
      //   this.setState({ showEmployer: false });
      // } else {
      //   this.setState({ inputGovIdPicture: "test" });
      //   this.setState({ showLicence: false });
      // }
    };

    return (
      <>
        {this.state.back === 1 ? <SplashScreen /> : <></>}
        {this.state.next && this.state.back === 0 ? (
          <SignUpSteps
            translate={this.props.translate}
            social={this.state.social}
            completed={global.signup}
          />
        ) : (
          <></>
        )}
        {!this.state.next && this.state.back === 0 ? (
          <View style={styles.container}>
            <View
              // keyboardVerticalOffset={keyboardVerticalOffset}
              style={styles.form}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <TouchableOpacity
                  onPress={() => this.gotoSite()}
                  style={{ paddingTop: 20 }}
                >
                  <Image
                    source={global.logo}
                    style={{ width: 50, height: 50 }}
                  />
                </TouchableOpacity>
                <View style={{ paddingTop: 25, width: "70%" }}>
                  <Text
                    style={{
                      fontFamily: "Quicksand-Bold",
                      fontSize: 25,
                      color: "#afbec5",
                      textAlign: "right",
                    }}
                  >
                    {this.props.translate("signup")}
                  </Text>
                </View>
              </View>

              <View
                style={{
                  justifyContent: "space-between",
                  flex: 1,
                  width: "80%",
                }}
              >
                <View style={{ marginTop: 50 }}>
                  <TextInput
                    onBlur={checkSecondStep}
                    value={this.state.inputName}
                    onChangeText={(text) => this.setState({ inputName: text })}
                    style={styles.input}
                    placeholder={this.props.translate("name")}
                    placeholderTextColor="#afbec5"
                  />
                  <TextInput
                    onBlur={checkSecondStep}
                    value={this.state.inputPhone}
                    onChangeText={(text) =>
                      this.setState({ inputPhone: formatPhone(text) })
                    }
                    style={styles.input}
                    placeholder={this.props.translate("phone")}
                    placeholderTextColor="#afbec5"
                    keyboardType={"numeric"}
                  />
                  <TextInput
                    onBlur={checkSecondStep}
                    value={this.state.inputEmail}
                    onChangeText={(text) =>
                      this.setState({ inputEmail: text.trim() })
                    }
                    style={styles.input}
                    placeholder={this.props.translate("email")}
                    placeholderTextColor="#afbec5"
                  />

                  <Text style={{ fontSize: 11, color: "red", padding: 5 }}>
                    {this.state.errortxt}
                  </Text>
                  <View style={{ height: 150, width: 2 }} />
                </View>
              </View>
              <View>
                <View
                  style={{
                    flexDirection: "row",
                  }}
                >
                  <View
                    style={{
                      height: 25,
                      width: 25,
                      borderRadius: 25,
                      backgroundColor: this.state.termsAndConditions
                        ? "#5fab78"
                        : "#ea5d59",
                      marginRight: 10,
                    }}
                  />
                  <Text
                    style={{
                      fontFamily: "Quicksand-Regular",
                      fontSize: 18,
                      color: "#afbec5",
                    }}
                  >
                    {this.props.translate("termsAndCondition")}
                  </Text>
                </View>

                <View
                  style={{
                    backgroundColor: "#333b48",
                    marginTop: 30,
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <TouchableOpacity
                    onPress={() => {
                      this.setState({
                        termsAndConditions: !this.state.termsAndConditions,
                      });
                    }}
                    style={{
                      height: 30,
                      width: 30,
                      borderColor: "white",
                      borderWidth: 2,
                      marginVertical: 10,
                      marginLeft: 10,
                      justifyContent: "center",
                    }}
                  >
                    {this.state.termsAndConditions ? (
                      <Icon
                        name="check"
                        type="font-awesome"
                        color={"white"}
                        size={15}
                      />
                    ) : null}
                  </TouchableOpacity>
                  <Text
                    style={{
                      fontFamily: "Quicksand-Regular",
                      fontSize: 13,
                      color: "#589cdd",
                      marginLeft: 10,
                      paddingRight: 20,
                    }}
                    onPress={() => Linking.openURL(this.state.termsOfService)}
                  >
                    {this.props.translate("AcceptTermsAndCondition")}
                  </Text>
                </View>
              </View>
            </View>

            <View
              style={{
                flexDirection: "row",
                marginTop: 10,
                marginBottom: 0,
                backgroundColor: "#2e3643",
              }}
            >
              <View
                style={{
                  alignItems: "center",
                  marginTop: 20,
                  flex: 1,
                }}
              >
                <TouchableOpacity onPress={() => this.props.gotoSignUpBack()}>
                  <Text
                    style={{
                      textAlign: "center",
                      fontSize: 20,
                      color: "#fff",
                    }}
                  >
                    {this.props.translate("back")}
                  </Text>
                </TouchableOpacity>
              </View>
              <View
                style={{
                  alignItems: "center",
                  flex: 1,
                }}
              >
                <TouchableOpacity
                  disabled={!isFormFull()}
                  onPress={this.handleSignUp}
                  style={[
                    styles.button,
                    { backgroundColor: !isFormFull() ? "grey" : "#599cdd" },
                  ]}
                >
                  {this.state.loading ? (
                    <ActivityIndicator color={"white"} />
                  ) : (
                    <Text
                      style={{
                        textAlign: "center",
                        fontSize: 20,
                        color: "#fff",
                      }}
                    >
                      {this.props.translate("next")}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
              <View
                style={{ height: Platform.OS === "ios" ? 80 : 80, width: 2 }}
              ></View>
            </View>
          </View>
        ) : (
          <></>
        )}
      </>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2e3643",
    paddingTop: Platform.OS === "ios" ? 30 : 0,
    justifyContent: "space-between",
  },
  input: {
    color: "#afbec5",
    fontFamily: "Quicksand-Regular",
    height: 35,
    borderRadius: 5,
    borderColor: "grey",
    backgroundColor: "#333b48",
    fontSize: 14,
    paddingLeft: 10,
    marginBottom: 10,
  },
  iconContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#333b48",
    borderRadius: 5,
    borderColor: "grey",
    paddingLeft: 10,
    marginBottom: 10,
    justifyContent: "center",
    height: 35,
  },
  inputIcon: {
    flex: 1,
    color: "#afbec5",
    fontFamily: "Quicksand-Regular",
    fontSize: 12,
  },
  inputdate: {
    color: "#000",
    fontFamily: "Quicksand-Regular",
    height: 35,
    borderRadius: 5,
    borderColor: "grey",
    backgroundColor: "#fff",
    fontSize: 12,
    paddingLeft: 10,
    marginBottom: 10,
    width: "100%",
  },
  form: {
    alignItems: "center",
    flex: 4,
  },
  button: {
    fontFamily: "Quicksand-Regular",
    backgroundColor: "#599cdd",
    paddingVertical: 10,
    borderRadius: 5,
    minWidth: 125,
    minHeight: 50,
    justifyContent: "center",
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
});
const pickerStyle = StyleSheet.create({
  inputIOS: {
    color: "#000",
    fontFamily: "Quicksand-Regular",
    height: 30,
    borderRadius: 5,
    borderColor: "grey",
    backgroundColor: "#fff",
    fontSize: 12,
    paddingLeft: 10,
    marginBottom: 10,
  },
  inputAndroid: {
    color: "#000",
    fontFamily: "Quicksand-Regular",
    height: 30,
    borderRadius: 5,
    borderColor: "grey",
    backgroundColor: "#fff",
    fontSize: 12,
    paddingLeft: 10,
  },
});
