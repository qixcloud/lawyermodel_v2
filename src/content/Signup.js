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
import ScalableImage from "react-native-scalable-image";
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
import { appId, getHeaders, getDashboardItems } from "./Helper";
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
      termsOfService: "https://legalpal.app/privacy-policy",
      appName: "",
      isDialogVisible: false,
      checkVerifyTxt: "",
      loadingFa: false,
      countryCode: "+1",
    };
  }

  componentDidMount = async () => {
    const token = await this.getToken();
    this.setState({ token: token });
    console.log("token", token);
    //await this.getTermsOfService();
    const dashboardData = await getDashboardItems();

    this.setState({ appName: dashboardData.appName });
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
    const jwt = await AsyncStorage.getItem("jwtToken");
    if (jwt) {
      this.setState({ loading: true });
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
              console.log("res", res);
            })
            .finally(() => {
              this.setState({ loading: false });
            });
        })
        .catch(() => {
          this.setState({ loading: false });
          sendCode();
        });
    } else {
      sendCode();
    }
  };
  checkVerify = () => {
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

          await this.signupProcess(responseJson);
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
  signupProcess = async (jwt) => {
    if (jwt) {
      this.setState({ loading: true });
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
              console.log("res", res);
            })
            .finally(() => {
              this.setState({ loading: false });
            });
        })
        .catch(() => {
          this.setState({ loading: false });
        });
    }
  };
  gotoSite = () => {
    Linking.openURL(global.baseUrl);
  };

  hideDialog = () => {
    this.setState({ isDialogVisible: false });
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
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            // keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
          >
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
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
                  {this.state.isDialogVisible ? (
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
                              {this.props.translate("cancel")}
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => this.checkVerify()}
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
                              {this.props.translate("submit")}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </KeyboardAvoidingView>
                    </View>
                  ) : (
                    <>
                      <View
                        style={{
                          flex: 1,
                          justifyContent: "space-between",
                          paddingHorizontal: "10%",
                        }}
                      >
                        <View style={{ marginTop: 50 }}>
                          <TextInput
                            onBlur={checkSecondStep}
                            value={this.state.inputName}
                            onChangeText={(text) =>
                              this.setState({ inputName: text })
                            }
                            style={styles.input}
                            placeholder={this.props.translate("name")}
                            placeholderTextColor="#afbec5"
                          />
                          <View
                            style={{
                              flexDirection: "row",
                              justifyContent: "space-between",
                              width: "100%",
                            }}
                          >
                            <TextInput
                              value={this.state.countryCode}
                              onChangeText={(text) => {
                                let countryCode = "";

                                text = text.replace(/[^0-9]/g, "");

                                if (text.length > 0) {
                                  countryCode = "+";
                                }

                                countryCode += text.slice(0, 3);

                                this.setState({
                                  countryCode: countryCode,
                                });
                              }}
                              style={[styles.input, { width: "10%" }]}
                            />
                            <TextInput
                              onBlur={checkSecondStep}
                              value={this.state.inputPhone}
                              onChangeText={(text) =>
                                this.setState({ inputPhone: formatPhone(text) })
                              }
                              style={[styles.input, { width: "89%" }]}
                              placeholder={this.props.translate("phone")}
                              placeholderTextColor="#afbec5"
                              keyboardType={"numeric"}
                            />
                          </View>
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

                          <Text
                            style={{ fontSize: 11, color: "red", padding: 5 }}
                          >
                            {this.state.errortxt}
                          </Text>
                          <View style={{ height: 150, width: 2 }} />
                        </View>
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
                                termsAndConditions:
                                  !this.state.termsAndConditions,
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
                              padding: 10,
                              width: "80%",
                            }}
                            onPress={() =>
                              Linking.openURL(this.state.termsOfService)
                            }
                          >
                            {/* {this.props.translate("AcceptTermsAndCondition")} */}
                            You agree to receive SMS messages to your phone
                            number from {this.state.appName} and to the terms of
                            the Privacy Policy. If you wish to cancel the SMS
                            messaging service, just reply “STOP.” If you have
                            any other questions, please contact your support
                            representative.
                          </Text>
                        </View>
                      </View>
                    </>
                  )}
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
                    <TouchableOpacity
                      onPress={() => this.props.gotoSignUpBack()}
                    >
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
                    style={{
                      height: Platform.OS === "ios" ? 80 : 80,
                      width: 2,
                    }}
                  ></View>
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
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
