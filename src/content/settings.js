import React, { Component } from "react";
import {
  StyleSheet,
  Text,
  Linking,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Alert,
  Platform,
} from "react-native";
import SignUpSteps from "./SignUpSteps";
import axios from "axios";
import AdvancedSettings from "./AdvancedSettings";
import { Input, Icon } from "react-native-elements";
import { Picker } from "@react-native-picker/picker";
import MaskInput, { Masks } from "react-native-mask-input";
import {
  convertImageToBase64,
  convertPdfToBase64,
  createPDF,
  getHeaders,
  requestCameraPermission,
} from "./Helper";
import { launchCamera } from "react-native-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import RNBlobUtil from "react-native-blob-util";

export default class MySettings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      login: 0,
      back: 0,
      email:
        global.settingsData != "" ? global.settingsData.base.Email_1_Value : "",
      phone:
        global.settingsData != "" ? global.settingsData.base.Phone_1_Value : "",
      yelp: global.settingsData != "" ? global.settingsData.yelp : "",
      birthday:
        global.settingsData != "" ? global.settingsData.base.Birthday : "",
      address:
        global.settingsData != "" ? global.settingsData.base.Email_1_Value : "",
      street:
        global.settingsData != ""
          ? global.settingsData.base.Address_1_Street
          : "",
      city:
        global.settingsData != ""
          ? global.settingsData.base.Address_1_City
          : "",
      state:
        global.settingsData != ""
          ? global.settingsData.base.Address_1_Region
          : "",
      zipCode:
        global.settingsData != ""
          ? global.settingsData.base.Address_1_Postal_Code
          : "",
      errorTxt: "",
      isChecked: false,
      apt:
        global.settingsData != ""
          ? global.settingsData.base.Address_1_Type
          : "",
      incident: global.settingsData != "" ? global.settingsData.incident : "",
      logout: 0,
      advancedStatus: false,
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
      dismissal: "Injured at Work",
    };
  }
  componentDidMount = () => {
    const params = new FormData();
    params.append("method", "get_settings");
    params.append("contact_id", global.contactId);
    axios({
      method: "post",
      headers: {
        "Content-Type": "multipart/form-data",
      },
      url: global.baseUrl + "wp-admin/admin-ajax.php?action=contact_api",
      data: params,
    }).then((res) => {
      console.log(res.data);
      if (res.data.status == "success") {
        this.setState({ email: res.data.base.Email_1_Value });
        this.setState({ yelp: res.data.yelp });
        this.setState({ incident: res.data.incident });
        this.setState({ phone: res.data.base.Phone_1_Value });
        this.setState({ birthday: res.data.base.Birthday });
        this.setState({ street: res.data.base.Address_1_Street });
        this.setState({ city: res.data.base.Address_1_City });
        this.setState({ zipCode: res.data.base.Address_1_Postal_Code });
        this.setState({ state: res.data.base.Address_1_Region });
        this.setState({ apt: res.data.base.Address_1_Type });
        global.settingsData = res.data;
        console.log(this.state.phone);
      }
    });
  };
  advancedSettingsFunc = () => {
    this.setState({ advancedStatus: true });
  };
  advancedBackFunc = () => {
    this.setState({ advancedStatus: false });
  };
  _onSendFileProcessing = async (url) => {
    const file = await convertPdfToBase64(url);
    const jwt = await AsyncStorage.getItem("jwtToken");

    var myHeaders = new Headers();

    await axios({
      method: "get",
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
      url: "https://api.qix.cloud/conversation",
    }).then(async (res) => {
      if (res?.data?.id) {
        const conversationId = res.data.id;

        myHeaders.append("Content-Type", "application/json");
        myHeaders.append("Authorization", `Bearer ${jwt}`);
        console.log("url", url);
        console.log("file", file);
        console.log("this.state.conversationId", conversationId);

        const raw = JSON.stringify({
          chat: conversationId,
          message: "",
          twilio: "",
          attachment: file,
          attachmentMimeType: "pdf",
        });

        const requestOptions = {
          method: "POST",
          headers: myHeaders,
          body: raw,
          redirect: "follow",
        };

        fetch("https://api.qix.cloud/message", requestOptions)
          .then(async (result) => {
            const responseJson = await result.json();
            console.log("RESPONSE JSON", responseJson);
          })
          .catch((error) => console.log("error", error))
          .finally(() => {
            this.setState({ imageLoading: false });
          });
      }
    });
  };
  uploadDocumentToMerusCase = async (file) => {
    RNBlobUtil.fetch(
      "POST",
      "https://api.meruscase.com/uploads/add",
      {
        Authorization: "Bearer 55666bed6270ca231a803fe8ccb95c26aced96cc",
      },
      [
        { name: "data[Upload][case_file_id]", data: String("2930787") },
        {
          name: "data[Upload][submitted_files][]",
          filename: "pdftest.pdf",
          data: RNBlobUtil.wrap(file.filePath),
        },
      ]
    )
      .then((response) => {
        console.log(response.text());
      })
      .catch((error) => {
        console.error("Error:", error);
      });
    return;
    console.log("file.filePath", file.filePath);
    const formData = new FormData();
    formData.append("data[Upload][case_file_id]", "2930787");
    formData.append("data[Upload][submitted_files][]", {
      uri: file.filePath,
      type: "application/pdf",
      name: "pdftest2.pdf",
    });

    try {
      const response = await fetch("https://api.meruscase.com/uploads/add", {
        method: "POST",
        headers: {
          Authorization: "Bearer 55666bed6270ca231a803fe8ccb95c26aced96cc",
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Error al subir el documento");
      }

      return await response.json();
    } catch (error) {
      console.error("Error en la solicitud:", error);
      throw error;
    }
  };

  sendFileToMerusCase = async (
    fileLink,
    fileMimeType = "image/jpeg",
    caseFileId = "2930787"
  ) => {
    try {
      const jwtToken =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Ik1WOHJrODdCUmFXb0xvVXZpUUZ1IiwiYXBwIjoiTVY4cms4N0JSYVdvTG9VdmlRRnUiLCJpYXQiOjE3MDE5MDU5ODIsImV4cCI6MTcwMjE2NTE4Mn0.iIunv9KaQFtty2VddN6Ai8rpEmSlzK4E9C_KCtVog1o";
      const response = await fetch(
        "https://api.qix.cloud/" + "sendMerusCaseFile",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + jwtToken,
          },
          body: JSON.stringify({
            fileLink,
            caseFileId,
            fileMimeType,
          }),
        }
      );
      console.log("responseeee ", response);
      if (!response.ok) {
        throw new Error("Error en la respuesta de la API");
      }

      return await response.json();
    } catch (error) {
      console.error("Error enviando archivo a MerusCase:", error);
      throw error;
    }
  };
  gotoback = () => {
    this.setState({ back: 1 });
  };
  logoutFunc = async () => {
    await AsyncStorage.removeItem("jwtToken");
    await AsyncStorage.removeItem("phone");
    await AsyncStorage.removeItem("projectId");
    await AsyncStorage.removeItem("sliderViewed");

    this.setState({ logout: 1 });
    this.setState({ back: 1 });
  };

  handleSubmit = async () => {
    await createPDF(
      this.state.dismissal,
      this.state.incident_date,
      this.state.inputName,
      this.state.inputPhone,
      this.state.inputEmail,
      this.state.birthday,
      this.state.inputEmployerName,
      this.state.inputDateHired,
      this.state.inputHoursWages,
      this.state.inputPayStUBPicture,
      this.state.inputGovIdPicture,
      this.state.inputAddress,
      this.state.inputAddress2,
      this.state.inputCity,
      this.state.inputZipCode
    ).then(async (res) => {
      // this.sendFileToMerusCase(res.filePath);
      this.uploadDocumentToMerusCase(res);
      const jwt = await AsyncStorage.getItem("jwtToken");

      await axios({
        method: "get",
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
        url: "https://api.qix.cloud/conversation",
      }).then(async (resConversation) => {
        const conversationData = resConversation.data;
        conversationData.intake_complete = true;
        global.intake_complete = true;

        await axios({
          method: "put",
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
          url: "https://api.qix.cloud/conversation",
          data: conversationData,
        });
      });
    });
  };

  render() {
    const keyboardVerticalOffset = Platform.OS === "ios" ? 40 : 0;

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
        {this.state.advancedStatus ? (
          <AdvancedSettings
            translate={this.props.translate}
            advancedBackFunc={this.advancedBackFunc}
            advancedDeleteBackFunc={this.advancedDeleteBackFunc}
          />
        ) : (
          <>
            {this.state.back == 1 ? (
              <SignUpSteps
                translate={this.props.translate}
                settings={0}
                logout={this.state.logout}
              />
            ) : (
              <></>
            )}
            {this.state.back === 0 ? (
              <ScrollView style={styles.container}>
                <TouchableOpacity
                  onPress={() => this.gotoback()}
                  style={{
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <View style={{ paddingTop: 25, width: "70%" }}>
                    <Text style={{ fontSize: 25, color: "white" }}>
                      {this.props.translate("settings")}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => this.gotoback()}
                    style={{ marginTop: 25 }}
                  >
                    <Image
                      source={require("./images/close.png")}
                      style={{ width: 25, height: 25, marginHorizontal: 10 }}
                    />
                  </TouchableOpacity>
                </TouchableOpacity>
                <View style={styles.title}>
                  <Text style={{ fontSize: 25, color: "#fff", marginTop: 15 }}>
                    {global.name}
                  </Text>
                </View>
                <View
                  style={{
                    width: Dimensions.get("window").width * 1,
                    padding: 15,
                  }}
                >
                  <View
                    contentContainerStyle={{
                      justifyContent: "space-around",
                      flex: 2,
                    }}
                  >
                    <ScrollView
                      showsVerticalScrollIndicator={false}
                      style={{ flex: 1 }}
                    >
                      <View style={{ flexDirection: "row", marginTop: 30 }}>
                        <View
                          style={{
                            height: 25,
                            width: 25,
                            borderRadius: 25,
                            backgroundColor: "#5fab78",
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
                          {this.props.translate("selectInjuryType")}
                        </Text>
                      </View>

                      <View
                        style={{
                          width: Dimensions.get("window").width * 0.9,
                          paddingHorizontal: 30,
                        }}
                      >
                        <View style={{ paddingTop: 20 }}>
                          <View
                            style={{
                              backgroundColor: "#333b48",
                              marginBottom: 10,
                              borderRadius: 5,
                              padding: 5,
                            }}
                          >
                            {/* <RNPickerSelect
											placeholder={{
												label: this.props.translate("selectInjuryType") + '...',
												value: '',
											}}
											onValueChange={(value) => this.setState({ dismissal: value })}
											items={[
												{ label: this.props.translate("injuredAtWork"), value: 'Injured at Work' },
												{ label: this.props.translate("injuredOutsideWork"), value: 'Injured outside Work' },
												{ label: this.props.translate("vehicleAccident"), value: 'Vehicle Accident' },
												{ label: this.props.translate("unfairDismissal"), value: 'Unfair Dismissal' },
											]} style={pickerStyle}
										/> */}
                            <Picker
                              style={{
                                backgroundColor: "#333b48",
                                color: "#afbec5",
                                justifyContent: "center",
                                height: Platform.OS === "android" ? 60 : 100,
                              }}
                              selectedValue={this.state.dismissal}
                              itemStyle={{
                                color: "#afbec5",
                                fontSize: 13,
                                height: 120,
                              }}
                              numberOfLines={1}
                              onValueChange={(value) => {
                                console.log("selected value", value);
                                this.setState({ dismissal: value });
                              }}
                            >
                              <Picker.Item
                                label={this.props.translate("injuredAtWork")}
                                value="Injured at Work"
                              />
                              <Picker.Item
                                label={this.props.translate(
                                  "injuredOutsideWork"
                                )}
                                value="Injured outside Work"
                              />
                              <Picker.Item
                                label={this.props.translate("vehicleAccident")}
                                value="Vehicle Accident"
                              />
                              <Picker.Item
                                label={this.props.translate("unfairDismissal")}
                                value="Unfair Dismissal"
                              />
                            </Picker>
                          </View>
                        </View>
                      </View>
                      {/*START OF CONTACT FIELDS*/}
                      <View style={{ flexDirection: "row", marginTop: 10 }}>
                        <View
                          style={{
                            height: 25,
                            width: 25,
                            borderRadius: 25,
                            backgroundColor: isSecondStepFull()
                              ? "#5fab78"
                              : "#ea5d59",
                            marginRight: 10,
                          }}
                        />
                        <TouchableOpacity
                          onPress={() =>
                            this.setState({
                              showContact: !this.state.showContact,
                            })
                          }
                          style={{
                            flexDirection: "row",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <Text
                            style={{
                              fontFamily: "Quicksand-Regular",
                              fontSize: 18,
                              color: "#afbec5",
                            }}
                          >
                            {this.props.translate("insertContactType")}
                          </Text>
                          <Icon
                            style={{ marginLeft: 5 }}
                            name={
                              this.state.showContact ? "arrow-up" : "arrow-down"
                            }
                            type="font-awesome-5"
                            color={"#afbec5"}
                            size={13}
                          />
                        </TouchableOpacity>
                      </View>

                      {this.state.showContact ? (
                        <View
                          style={{
                            width: Dimensions.get("window").width * 0.9,
                            padding: 30,
                          }}
                        >
                          <MaskInput
                            value={this.state.incident_date}
                            onChangeText={(date) => {
                              this.setState({ incident_date: date });
                            }}
                            onBlur={checkSecondStep}
                            placeholder={this.props.translate("incidentDate")}
                            mask={Masks.DATE_MMDDYYYY}
                            style={styles.input}
                            placeholderTextColor="#afbec5"
                            keyboardType={"numeric"}
                          />
                          <TextInput
                            onBlur={checkSecondStep}
                            value={this.state.inputName}
                            onChangeText={(text) =>
                              this.setState({ inputName: text })
                            }
                            style={styles.input}
                            placeholder={this.props.translate("name")}
                            placeholderTextColor="#afbec5"
                          ></TextInput>
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
                          ></TextInput>
                          <TextInput
                            onBlur={checkSecondStep}
                            value={this.state.inputEmail}
                            onChangeText={(text) =>
                              this.setState({ inputEmail: text.trim() })
                            }
                            style={styles.input}
                            placeholder={this.props.translate("email")}
                            placeholderTextColor="#afbec5"
                          ></TextInput>

                          <MaskInput
                            onBlur={checkSecondStep}
                            value={this.state.birthday}
                            onChangeText={(date) => {
                              this.setState({ birthday: date });
                            }}
                            placeholder={this.props.translate("birthday")}
                            mask={Masks.DATE_MMDDYYYY}
                            style={styles.input}
                            placeholderTextColor="#afbec5"
                            keyboardType={"numeric"}
                          />
                        </View>
                      ) : null}
                      {/*END OF CONTACT FIELDS*/}

                      {/*START OF EMPLOYER INFO SECTION FIELDS*/}
                      <View
                        style={{
                          flexDirection: "row",
                          marginTop: this.state.showContact ? 0 : 50,
                        }}
                      >
                        <View
                          style={{
                            height: 25,
                            width: 25,
                            borderRadius: 25,
                            backgroundColor: isThirdStepFull()
                              ? "#5fab78"
                              : "#ea5d59",
                            marginRight: 10,
                          }}
                        />
                        <TouchableOpacity
                          onPress={() =>
                            this.setState({
                              showEmployer: !this.state.showEmployer,
                            })
                          }
                          style={{
                            flexDirection: "row",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <Text
                            style={{
                              fontFamily: "Quicksand-Regular",
                              fontSize: 18,
                              color: "#afbec5",
                            }}
                          >
                            {this.props.translate("employerInfoType")}
                          </Text>
                          <Icon
                            style={{ marginLeft: 5 }}
                            name={
                              this.state.showEmployer
                                ? "arrow-up"
                                : "arrow-down"
                            }
                            type="font-awesome-5"
                            color={"#afbec5"}
                            size={13}
                          />
                        </TouchableOpacity>
                      </View>

                      {this.state.showEmployer ? (
                        <View
                          style={{
                            width: Dimensions.get("window").width * 0.9,
                            padding: 30,
                          }}
                        >
                          <TextInput
                            onBlur={checkThirdStep}
                            value={this.state.inputEmployerName}
                            onChangeText={(text) =>
                              this.setState({ inputEmployerName: text })
                            }
                            style={styles.input}
                            placeholder={this.props.translate("employerName")}
                            placeholderTextColor="#afbec5"
                          ></TextInput>
                          <MaskInput
                            onBlur={checkThirdStep}
                            value={this.state.inputDateHired}
                            onChangeText={(date) => {
                              this.setState({ inputDateHired: date });
                            }}
                            placeholder={this.props.translate("dateHired")}
                            mask={Masks.DATE_MMDDYYYY}
                            style={styles.input}
                            placeholderTextColor="#afbec5"
                            keyboardType={"numeric"}
                          />
                          <TextInput
                            onBlur={checkThirdStep}
                            value={this.state.inputHoursWages}
                            onChangeText={(text) =>
                              this.setState({ inputHoursWages: text })
                            }
                            style={styles.input}
                            placeholder={this.props.translate(
                              "insertHoursWages"
                            )}
                            placeholderTextColor="#afbec5"
                            keyboardType={"numeric"}
                          ></TextInput>
                          <TouchableOpacity
                            onPress={() =>
                              handleCameraIconPress("inputPayStUBPicture")
                            }
                            style={styles.iconContainer}
                          >
                            {this.state.inputPayStUBPicture ? (
                              <Text style={styles.inputIcon}>
                                {this.props.translate("imageAdded")}
                              </Text>
                            ) : (
                              <Text style={styles.inputIcon}>
                                {this.props.translate("addPayStub")}
                              </Text>
                            )}
                            <Icon
                              style={{
                                marginLeft: 5,
                                marginRight: 10,
                              }}
                              name={"camera"}
                              color={"#afbec5"}
                              type={"font-awesome"}
                              size={13}
                            />
                          </TouchableOpacity>
                        </View>
                      ) : null}
                      {/*END OF EMPLOYER INFO SECTION FIELDS */}

                      {/*START OF LICENCE ID SECTION FIELDS*/}
                      <View
                        style={{
                          flexDirection: "row",
                          marginTop: this.state.showEmployer ? 0 : 50,
                        }}
                      >
                        <View
                          style={{
                            height: 25,
                            width: 25,
                            borderRadius: 25,
                            backgroundColor: isForthStepFull()
                              ? "#5fab78"
                              : "#ea5d59",
                            marginRight: 10,
                          }}
                        />
                        <TouchableOpacity
                          onPress={() =>
                            this.setState({
                              showLicence: !this.state.showLicence,
                            })
                          }
                          style={{
                            flexDirection: "row",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <Text
                            style={{
                              fontFamily: "Quicksand-Regular",
                              fontSize: 18,
                              color: "#afbec5",
                            }}
                          >
                            {this.props.translate("licencePhotoID")}
                          </Text>
                          <Icon
                            style={{ marginLeft: 5 }}
                            name={
                              this.state.showLicence ? "arrow-up" : "arrow-down"
                            }
                            type="font-awesome-5"
                            color={"#afbec5"}
                            size={13}
                          />
                        </TouchableOpacity>
                      </View>

                      {this.state.showLicence ? (
                        <View
                          style={{
                            width: Dimensions.get("window").width * 0.9,
                            padding: 30,
                          }}
                        >
                          <TouchableOpacity
                            onPress={() =>
                              handleCameraIconPress("inputGovIdPicture")
                            }
                            style={styles.iconContainer}
                          >
                            {this.state.inputGovIdPicture ? (
                              <Text style={styles.inputIcon}>
                                {this.props.translate("imageAdded")}
                              </Text>
                            ) : (
                              <Text style={styles.inputIcon}>
                                {this.props.translate("addGovernmentID")}
                              </Text>
                            )}
                            <Icon
                              style={{
                                marginLeft: 5,
                                marginRight: 10,
                              }}
                              name={"camera"}
                              color={"#afbec5"}
                              type={"font-awesome"}
                              size={13}
                            />
                          </TouchableOpacity>
                        </View>
                      ) : null}
                      {/*END OF LICENCE ID SECTION FIELDS */}

                      {/*START OF PRIMARY RESIDENCE SECTION FIELDS*/}
                      <View
                        style={{
                          flexDirection: "row",
                          marginTop: this.state.showLicence ? 0 : 50,
                        }}
                      >
                        <View
                          style={{
                            height: 25,
                            width: 25,
                            borderRadius: 25,
                            backgroundColor: isFiveStep()
                              ? "#5fab78"
                              : "#ea5d59",
                            marginRight: 10,
                          }}
                        />
                        <TouchableOpacity
                          onPress={() =>
                            this.setState({
                              showPrimaryResidence:
                                !this.state.showPrimaryResidence,
                            })
                          }
                          style={{
                            flexDirection: "row",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <Text
                            style={{
                              fontFamily: "Quicksand-Regular",
                              fontSize: 18,
                              color: "#afbec5",
                            }}
                          >
                            {this.props.translate("primaryResidence")}
                          </Text>
                          <Icon
                            style={{ marginLeft: 5 }}
                            name={
                              this.state.showPrimaryResidence
                                ? "arrow-up"
                                : "arrow-down"
                            }
                            type="font-awesome-5"
                            color={"#afbec5"}
                            size={13}
                          />
                        </TouchableOpacity>
                      </View>

                      {this.state.showPrimaryResidence ? (
                        <View
                          style={{
                            width: Dimensions.get("window").width * 0.9,
                            padding: 30,
                          }}
                        >
                          <TextInput
                            onBlur={checkFiveStep}
                            value={this.state.inputAddress}
                            onChangeText={(text) =>
                              this.setState({ inputAddress: text })
                            }
                            style={styles.input}
                            placeholder={this.props.translate("address1")}
                            placeholderTextColor="#afbec5"
                          ></TextInput>

                          <TextInput
                            onBlur={checkFiveStep}
                            value={this.state.inputAddress2}
                            onChangeText={(text) =>
                              this.setState({ inputAddress2: text })
                            }
                            style={styles.input}
                            placeholder={this.props.translate(
                              "address2Optional"
                            )}
                            placeholderTextColor="#afbec5"
                          ></TextInput>

                          <TextInput
                            onBlur={checkFiveStep}
                            value={this.state.inputCity}
                            onChangeText={(text) =>
                              this.setState({ inputCity: text })
                            }
                            style={styles.input}
                            placeholder={this.props.translate("city")}
                            placeholderTextColor="#afbec5"
                          ></TextInput>

                          <TextInput
                            onBlur={checkFiveStep}
                            value={this.state.inputZipCode}
                            onChangeText={(text) =>
                              this.setState({ inputZipCode: text })
                            }
                            style={styles.input}
                            placeholder={this.props.translate("zipCode")}
                            placeholderTextColor="#afbec5"
                          ></TextInput>
                        </View>
                      ) : null}
                      {/*END OF PRIMARY RESIDENCE FIELDS */}

                      <Text style={{ fontSize: 11, color: "red", padding: 5 }}>
                        {this.state.errortxt}
                      </Text>
                    </ScrollView>
                  </View>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <TouchableOpacity
                    onPress={() => this.handleSubmit()}
                    style={styles.button}
                  >
                    <Text style={{ fontSize: 15 }}>SAVE</Text>
                  </TouchableOpacity>
                </View>

                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <TouchableOpacity
                    onPress={() => this.logoutFunc()}
                    style={styles.button}
                  >
                    <Text style={{ fontSize: 15 }}>
                      {this.props.translate("signout")}
                    </Text>
                  </TouchableOpacity>
                </View>
                <View
                  style={{
                    justifyContent: "center",
                    alignItems: "center",
                    marginBottom: 100,
                  }}
                >
                  <TouchableOpacity
                    onPress={() => this.advancedSettingsFunc()}
                    style={styles.button1}
                  >
                    <Text style={{ fontSize: 15, textAlign: "center" }}>
                      {this.props.translate("advancedSettings")}
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
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
        paddingTop: 30,
      },
    }),
    backgroundColor: "#2e3643",
  },
  title: {
    alignItems: "center",
    ...Platform.select({
      ios: {
        marginTop: 5,
      },
      android: {
        marginTop: 5,
      },
      default: {
        marginTop: 5,
      },
    }),
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
  inputdate: {
    color: "#000",
    height: 30,
    borderRadius: 5,
    borderColor: "grey",
    backgroundColor: "#fff",
    paddingLeft: 5,
    marginBottom: 8,
    width: "100%",
  },
  inputmultiple: {
    color: "#000",
    borderRadius: 5,
    borderColor: "grey",
    backgroundColor: "#fff",
    fontSize: 12,
    paddingLeft: 10,
    ...Platform.select({
      ios: {
        height: 60,
      },
      android: {
        height: 60,
      },
      default: {
        height: 60,
      },
    }),
  },
  button: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 5,
    marginTop: 15,
  },
  button1: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 5,
    marginTop: 15,
    maxWidth: 200,
  },
  inputIcon: {
    flex: 1,
    color: "#afbec5",
    fontFamily: "Quicksand-Regular",
    fontSize: 12,
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
});
