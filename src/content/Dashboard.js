import React, { Component, useState } from "react";
import {
  ImageBackground,
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  TextInput,
  Image,
  Linking,
  Alert,
  AppState,
  Dimensions,
} from "react-native";
import { Avatar, Badge, Icon, withBadge } from "react-native-elements";
import SignUpSteps from "./SignUpSteps";
import Chat from "./Chat";
import axios from "axios";
import Inbox from "./inbox";
import Appointmants from "./appointment/appointments";
import All_appointments from "./appointment/all_appointments";
import Questions from "./Questions";
import Glossary from "./Glossary";
import Menu from "./Menu";
import CustomDatePicker from "./components/CustomDatePicker";
import DateTimePicker from "@react-native-community/datetimepicker";
import messaging from "@react-native-firebase/messaging";
//import RNPickerSelect, { defaultStyles } from 'react-native-picker-select';
import { Picker } from "@react-native-picker/picker";
import Carousel, { Pagination } from "react-native-snap-carousel";
import Call from "./Call";
import CallSetTarget from "./calling/callSetTarget";
import ScalableImage from "react-native-scalable-image";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import CustomBackground from "./components/CustomBackground";
//import BlurOverlay,{closeOverlay,openOverlay} from 'react-native-blur-overlay';
import { BlurView } from "@react-native-community/blur";
import Status from "./screens/Status";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ImageOrSvg from "./dashboardBlocks/imageOrSvg";
import { appId, getHeaders, getDashboardItems , getCustomDashboardItems} from "./Helper";
import BlockSlider from "./dashboardBlocks/slider";
import BlockStatus from "./dashboardBlocks/status";
import BlockPosts from "./dashboardBlocks/posts";
import BlockBoxs from "./dashboardBlocks/twoBoxs";
import BlockButton from "./dashboardBlocks/button";
import * as Progress from "react-native-progress";
// import

export default class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      login: 0,
      back: 0,
      chat_act: 0,
      chatMsgs: this.props.chatMsgs,
      badgeCount: 0,
      isDialogVisible: 0,
      about: "",
      mruseDate: "",
      mruseTime: new Date(),
      showMruseTime: false,
      viewMeruseTime: "",
      location: "",
      isCaseDialogVisible: false,
      case_file_id: "",
      case_files: [],
      casesCount: 0,
      appoType: "coming",
      currentlyOpenSwipeable: null,
      searchGlossaryKey: "",
      appoButtonType: "ability",
      dashboardButtonType: "schedule",
      displayMenu: 0,
      swipeIdx: 1,
      badgeInboxCount: 0,
      facebookLink: "",
      sliderItems: [],
      viewCarousel: 1,
      callStatus: 0,
      selectCalleeType: "",
      calleeId: 0,
      activeIndex: 0,
      insta: "",
      youtube: "",
      fb: "",
      twitter: "",
      linkedin: "",
      businessAddress: "",
      businessEmail: "",
      businessPhone: "",
      appointments: [],
      intake_complete: false,
      dashboardItems: "",
      logo: "",
      userAvatar: "",
      footerIcon1: "",
      footerIcon2: "",
      footerIcon3: "",
      bottomVisible: 0,
      colorTop: "#eef2f5",
      colorBody: "#eef2f5",
      colorBottom: "#a8c6f5",
      logoLoaded: false,
      currentPhase: "",
      status: []
    };
    this.sheetRef = React.createRef();
    this.getBadgeCount();
  }
  closeOverlayAndMenu = () => {
    this.sheetRef.current.close();
    //closeOverlay();
  };
  handleSnapPress = (index) => {
    this.sheetRef.current?.snapToIndex(index);
    //openOverlay();
  };

  handleSheetChanges = (index) => {
    this.setState({ menuStatus: index });
    console.log("index", index);
    if (index < 0) {
      //closeOverlay();
    }
  };
  async componentDidMount() {
    this.getConversation();
    this.getSliderItems();

    const projectIdJson = await AsyncStorage.getItem("projectId");
    const projectsIds = JSON.parse(projectIdJson);
    if (!projectsIds) {
      this.setState({ loading: false });
    }
    this.setState({ projectsIds: projectsIds });
    const image = await AsyncStorage.getItem("profileImage");
    if (image) {
      this.setState({ image: image });
    }
    this.setState({ clientName: global.clientName });
    this.setState({ isLoading: false });

    // this.handleAppReview();

    this.getBadgeCount();

    if (!projectsIds[0]) {
      return;
    }

    AppState.addEventListener("change", this._handleAppStateChange);
    this.onNotificationListener();
    messaging().onMessage(async (remoteMessage) => {
      if (
        remoteMessage.notification.title == "Chat" ||
        remoteMessage.notification.title == "Inbox"
      ) {
        this.getBadgeCount();
      }
    });
    const params = new FormData();
    params.append("method", "get_merus_cases");
    params.append("contact_id", global.contactId);
    axios({
      method: "post",
      headers: {
        "Content-Type": "multipart/form-data",
      },
      url: global.baseUrl + "wp-admin/admin-ajax.php?action=contact_api",
      data: params,
    }).then((res) => {
      console.log("cases", res.data.casesCount);
      this.setState({ case_files: res.data.cases });
      this.setState({ casesCount: res.data.casesCount });
      this.hideDialog();
    });
    const params1 = new URLSearchParams();
    params1.append("method", "getFaceBookLink");
    params1.append("contact_id", global.contactId);
    axios({
      method: "post",
      headers: {
        "Content-Type": "multipart/form-data",
      },
      url: global.baseUrl + "wp-admin/admin-ajax.php?action=contact_api",
      data: params1,
    }).then((res) => {
      console.log("link", res.data.link);
      this.setState({ facebookLink: res.data.link });
    });
    // this.getSocialLinks();

    // console.log("business start");
    // axios({
    //   method: "post",
    //   headers: {
    //     "Content-Type": "multipart/form-data",
    //   },
    //   url:
    //     global.baseUrl + "wp-admin/admin-ajax.php?action=getBusinessInfoForApp",
    //   //data: params
    // }).then((res) => {
    //   console.log("business", res.data);
    //   this.setState({ businessAddress: res.data.location });
    //   this.setState({ businessEmail: res.data.company_email });
    //   this.setState({ businessPhone: res.data.company_phone });
    // });
  }

  fetchCalendarEvents = async (projectIdProp) => {
    const date = new Date();
    date.setMonth(date.getMonth() - 2);
  };
  getIntakeIsComplete = async () => {
    try {
      const jwt = await AsyncStorage.getItem("jwtToken");

      const response = await axios({
        method: "get",
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
        url: "https://api.qix.cloud/conversation",
      });

      console.log('important response',response)
      if (response?.data?.intake_complete) {
        this.setState({ intake_complete: res.data.intake_complete });
      }
    } catch (error) {
      console.error("Error al obtener los eventos:", error);
    }
  };
  fetchInbox = async (projectIdProp) => {};
  getSocialLinks = () => {
    const params = new FormData();
    params.append("contact_id", global.contactId);
    axios({
      method: "post",
      headers: {
        "Content-Type": "multipart/form-data",
      },
      url: global.baseUrl + "wp-admin/admin-ajax.php?action=getSocialLinks",
      data: params,
    }).then((res) => {
      console.log("getSocialLinks", res.data);
      this.setState({ fb: res.data.fb });
      this.setState({ twitter: res.data.twitter });
      this.setState({ insta: res.data.insta });
      this.setState({ youtube: res.data.youtube });
      this.setState({ linkedin: res.data.linkedin });
    });
  };
  getSliderItems = async () => {
    const dashboardData = await getDashboardItems();
    const customDashboardData = await getCustomDashboardItems();
    this.setState({ sliderItems: dashboardData.sliders.data[global.lang] });
    this.setState({ customDashboardItems: customDashboardData });
    console.log("dashboardData", dashboardData);
    console.log("customDashboardData", customDashboardData)
    ;
    this.setState({ DashboardItems: dashboardData });
    this.setState({ colorTop: dashboardData.colors.top });
    this.setState({ colorBody: dashboardData.colors.body });
    this.setState({ colorBottom: dashboardData.colors.bottom });
    this.setState({
      logo: dashboardData.icons.app,
    });
    console.log(dashboardData.icons.app);
    this.setState({
      userAvatar: dashboardData.icons.userAvatar,
    });
    this.setState({
      bottomVisible: dashboardData.bottomVisible,
    });
    console.log("bottomVisible", dashboardData.bottomVisible);
    this.setState({
      footerIcon1: dashboardData.icons.footerIcon1,
    });
    this.setState({
      footerIcon2: dashboardData.icons.footerIcon2,
    });
    this.setState({
      footerIcon3: dashboardData.icons.footerIcon3,
    });
    this.setState({ businessAddress: dashboardData.business_address });
    this.setState({ businessEmail: dashboardData.business_email });
    this.setState({ businessPhone: dashboardData.business_phone });
    this.setState({ fb: dashboardData.business_facebook });
    // this.setState({ twitter: dashboardData.twitter });
    this.setState({ insta: dashboardData.business_instagram });
    // this.setState({ youtube: dashboardData.youtube });
    // this.setState({ linkedin: dashboardData.linkedin });

    // if (global.lang === "en") {
    //   const data = [
    //     require("../assets/sliders/home/Artboard1.jpg"),
    //     require("../assets/sliders/home/Artboard2.jpg"),
    //     require("../assets/sliders/home/Artboard3.jpg"),
    //   ];
    //   this.setState({ sliderItems: data });
    // } else {
    //   const data = [
    //     require("../assets/sliders/home/Artboard1_es.jpg"),
    //     require("../assets/sliders/home/Artboard2_es.jpg"),
    //     require("../assets/sliders/home/Artboard3_es.jpg"),
    //   ];
    //   this.setState({ sliderItems: data });
    // }
  };

  gotoPage = (page) => {
    const pages = ["chat", "app", "inbox", "questions", "glossary", "account"];
    if (page != "") {
      //page = "chat";
      haspage = pages.includes(page);
      if (haspage) {
        if (page == "account") {
          this.gotoMenuItem(6);
        } else if (page == "inbox") {
          this.gotoMenuItem(5);
        } else {
          this.setState({ appoType: page });
        }
      } else {
        Linking.openURL(page);
      }
    }
  };
  onNotificationListener = () => {
    this.removeOnNotification = messaging().onMessage(async (remoteMessage) => {
      if (remoteMessage.notification) {
        var title = remoteMessage.notification.title;
        console.log("note", remoteMessage.notification);
        if (title == "Chat") {
          this.getBadgeCount();
        }
      }

      console.log("Foreground notification", remoteMessage);
    });
  };

  _handleAppStateChange = (nextAppState) => {
    if (nextAppState == "active") {
      this.getBadgeCount();
    }
  };

  getBadgeCount = () => {
    const params = new FormData();
    params.append("method", "getBadgeCount");
    params.append("contact_id", global.contactId);
    axios({
      method: "post",
      headers: {
        "Content-Type": "multipart/form-data",
      },
      url: global.baseUrl + "wp-admin/admin-ajax.php?action=contact_api",
      data: params,
    }).then((res) => {
      console.log("badge", res.data);
      this.setState({ badgeCount: res.data });
    });

    const params1 = new URLSearchParams();
    params1.append("method", "getBadgeInboxCount");
    params1.append("contact_id", global.contactId);
    axios({
      method: "post",
      headers: {
        "Content-Type": "multipart/form-data",
      },
      url: global.baseUrl + "wp-admin/admin-ajax.php?action=contact_api",
      data: params1,
    }).then((res) => {
      console.log("badge1", res.data);
      this.setState({ badgeInboxCount: res.data });
    });
  };
  submitData = () => {
    //this.setState({ settings: 1 });
  };
  searchGlossary = (key) => {
    this.setState({ searchGlossaryKey: key });
    this.setState({ appoType: "glossary" });
  };
  searchGlossary1 = (key) => {
    this.setState({ searchGlossaryKey: key });
    this.setState({ appoType: "glossary" });
    this.gotoRight();
  };
  gotoglossary = () => {
    //Alert.alert("If you have questions please contact (510) 785-2800")

    this.setState({ searchGlossaryKey: "" });
    this.setState({ appoType: "glossary" });
  };
  gotoquestions = () => {
    //Alert.alert("If you have questions please contact (510) 785-2800")
    this.setState({ appoType: "questions" });
  };
  gotoSite = () => {
    Linking.openURL(global.mainUrl);
  };
  gotoQuestions = () => {
    Alert.alert("If you have questions please contact (510) 785-2800");
  };
  hideDialog = () => {
    this.setState({ isDialogVisible: false });
  };
  openDialog = () => {
    this.setState({ isDialogVisible: true });
  };
  handleConfirm = () => {};
  onChangeMruseTime = (event, selectedDate) => {
    this.setState({ showMruseTime: false });
    const currentDate = selectedDate || new Date();
    this.setState({ mruseTime: currentDate });
    this.setState({
      viewMeruseTime:
        new Date(currentDate).getHours().toString() +
        ":" +
        new Date(currentDate).getMinutes().toString(),
    });
    console.log(currentDate);
  };
  checkAboutTxt = (txt) => {
    if (txt.length <= 260) {
      this.setState({ about: txt });
    }
  };
  sendMeruscase = () => {
    if (
      this.state.mruseDate == "" ||
      this.state.location == "" ||
      this.state.about == "" ||
      this.state.case_file_id == ""
    ) {
      Alert.alert(this.props.translate("pleaseInputValues"));
      return;
    }
    const params = new FormData();
    params.append("method", "sendMerusase");
    params.append("contact_id", global.contactId);
    params.append(
      "dateTime",
      this.state.mruseDate + " " + this.state.viewMeruseTime
    );
    params.append("location", this.state.location);
    params.append("about", this.state.about);
    params.append("case_file_id", this.state.case_file_id);
    axios({
      method: "post",
      headers: {
        "Content-Type": "multipart/form-data",
      },
      url: global.baseUrl + "wp-admin/admin-ajax.php?action=contact_api",
      data: params,
    }).then((res) => {
      console.log("badgeCount", res.data);
      this.setState({ badgeCount: res.data });
      this.hideDialog();
    });
  };
  gotoHistory = () => {
    //Alert.alert("If you have questions please contact (510) 785-2800")
    this.setState({ appoType: "all" });
  };
  gotoHome = () => {
    //Alert.alert("If you have questions please contact (510) 785-2800")
    this.setState({ appoType: "coming" });
  };
  gotoAllApp = () => {
    this.gotoRight();
    //this.setState({appoType: "all"});
  };
  gotoChatBack = () => {
    this.getBadgeCount();
    //this.gotoLeft();
    this.setState({ appoType: "coming" });
  };

  gotoChat = () => {
    this.gotoRight();
  };
  gotoBack = () => {
    this.setState({ appoType: "coming" });
  };
  gotoLeft() {
    //this.refs.swiper.scrollBy(-1);
    this.setState({ appoType: "inbox" });
    const params = new FormData();
    params.append("method", "putReadInboxCount");
    params.append("contact_id", global.contactId);
    axios({
      method: "post",
      headers: {
        "Content-Type": "multipart/form-data",
      },
      url: global.baseUrl + "wp-admin/admin-ajax.php?action=contact_api",
      data: params,
    }).then((res) => {
      this.setState({ badgeInboxCount: 0 });
    });
  }
  gotoRight() {
    //this.refs.swiper.scrollBy(1);
    this.setState({ appoType: "app" });
  }
  changeAppoButtonType(type) {
    this.setState({ appoButtonType: type });
  }
  changeDashboardButtonType(type) {
    this.setState({ dashboardButtonType: type });
  }
  changeDisplayMenu = (show) => {
    //this.setState({"displayMenu": show});
    this.handleSnapPress(0);
    //openOverlay();
  };
  gotoMenuItem = (item) => {
    this.setState({ displayMenu: 0 });
    //this.setState({"swipeIdx": 1});
    switch (item) {
      case 1:
        //this.setState({"swipeIdx": 2});
        this.setState({ appoType: "app" });
        break;
      case 2:
        this.setState({ appoType: "chat" });
        break;
      case 3:
        this.setState({ appoType: "glossary" });
        break;
      case 4:
        this.setState({ appoType: "questions" });
        break;
      case 5:
        //this.setState({"swipeIdx": 0});
        this.setState({ appoType: "inbox" });
        const params = new FormData();
        params.append("method", "putReadInboxCount");
        params.append("contact_id", global.contactId);
        axios({
          method: "post",
          headers: {
            "Content-Type": "multipart/form-data",
          },
          url: global.baseUrl + "wp-admin/admin-ajax.php?action=contact_api",
          data: params,
        }).then((res) => {
          this.setState({ badgeInboxCount: 0 });
        });

        break;
      case 6:
        this.props.gotoSettings();
        break;
      case 7:
        if (this.state.facebookLink != "") {
          Linking.openURL(this.state.facebookLink);
        } else {
          Linking.openURL("https://www.facebook.com/");
        }
        break;
      default:
        Alert.alert("NUMBER NOT FOUND");
    }
  };
  changeCallStatus = (status) => {
    //this.setState({selectCalleeType: ""});
    this.setState({ callStatus: status });
    //if(!status)this.setState({calleeId: 0});
  };
  sellectCollee = (type) => {
    this.setState({ selectCalleeType: type });
  };
  startEndCall = (id = 0) => {
    this.setState({ calleeId: id });
  };

  handleLogoLoaded = () => {
    this.setState({ logoLoaded: true });
  };
  handleLoaded = () => {};
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
  getConversation = async () => {
    try {
      const jwt = await AsyncStorage.getItem("jwtToken");
      const response = await axios({
        method: "get",
        headers: {
          Authorization: `Bearer ${jwt}`
        },
        url: "https://api.qix.cloud/conversation"
      });

      console.log("Conversation response:", response.data);

      if (response?.data?.caseFileIdsMetaMap) {
        const firstCaseFileId = Object.keys(response.data.caseFileIdsMetaMap)[0];
        const phase = response.data.caseFileIdsMetaMap[firstCaseFileId]?.phase;

        console.log("Phase found:", phase);
        this.setState({ currentPhase: phase || "" });
      }

    } catch (error) {
      console.error("Error getting conversation:", error);
    }
  };

  render() {
    const keyboardVerticalOffset = Platform.OS === "ios" ? 40 : 0;
    return (
      <>
        {!this.state.callStatus ? (
          <>
            {this.state.selectCalleeType != "" ? (
              <CallSetTarget
                startEndCall={this.startEndCall}
                translate={this.props.translate}
              />
            ) : (
              <>
                {this.state.displayMenu ? (
                  <Menu
                    translate={this.props.translate}
                    Badge={this.state.badgeCount}
                    badgeInbox={this.state.badgeInboxCount}
                    changeDisplay={this.changeDisplayMenu}
                    gotoMenuItem={this.gotoMenuItem}
                  />
                ) : (
                  <>
                    {this.state.showMruseTime && (
                      <DateTimePicker
                        value={this.state.mruseTime}
                        mode="time"
                        is24Hour={true}
                        display="default"
                        onChange={this.onChangeMruseTime}
                        format="HH:MM"
                      />
                    )}
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
                            marginBottom: 50,
                          }}
                        >
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
                            {this.props.translate("addAppointment")}
                          </Text>

                          <CustomDatePicker
                            date={this.state.mruseDate}
                            placeholder={this.props.translate("Date")}
                            onDateChange={(date) => {
                              this.setState({ mruseDate: date });
                            }}
                          />
                          <TextInput
                            onTouchStart={() =>
                              this.setState({ showMruseTime: true })
                            }
                            value={this.state.viewMeruseTime}
                            style={styles.input}
                            placeholder="Time"
                            placeholderTextColor="#555"
                          ></TextInput>
                          <TextInput
                            onChangeText={(text) =>
                              this.setState({ location: text })
                            }
                            style={styles.input}
                            placeholder="Location"
                            placeholderTextColor="#555"
                          ></TextInput>
                          {this.state.casesCount == 0 ? (
                            <TextInput
                              onChangeText={(text) =>
                                this.setState({ case_file_id: text })
                              }
                              style={styles.input}
                              value={this.state.case_file_id}
                              placeholder="Case File ID"
                              placeholderTextColor="#555"
                              keyboardType={"numeric"}
                            ></TextInput>
                          ) : (
                            <View
                              style={{
                                backgroundColor: "#fff",
                                marginBottom: 10,
                                borderRadius: 5,
                              }}
                            >
                              <RNPickerSelect
                                placeholder={{
                                  label: "Case File ID",
                                  value: "",
                                }}
                                onValueChange={(value) =>
                                  this.setState({ case_file_id: value })
                                }
                                items={this.state.case_files}
                                style={pickerStyle}
                              />
                              <Picker
                                // selectedValue={selectedLanguage}
                                onValueChange={(value) =>
                                  this.setState({ case_file_id: value })
                                }
                              >
                                {this.state.case_files.map((case_file) => {
                                  return (
                                    <Picker.Item
                                      label={case_file.label}
                                      value={case_file.value}
                                    />
                                  );
                                })}
                              </Picker>
                            </View>
                          )}
                          <Text style={{ marginTop: 10 }}>
                            About ({this.state.about.length}/260)
                          </Text>
                          <TextInput
                            onChangeText={(text) => this.checkAboutTxt(text)}
                            multiline
                            numberOfLines={4}
                            value={this.state.about}
                            style={styles.inputmultiple}
                            placeholder="Short message 260 characters"
                            placeholderTextcolor="grey"
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
                              onPress={() => this.sendMeruscase()}
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
                        {this.state.back === 1 ? <SignUpSteps /> : <></>}
                        {this.state.back === 0 && (
                          <>
                            {this.state.chat_act == 1 ? (
                              <Chat
                                translate={this.props.translate}
                                gotoChatBack={this.gotoChatBack}
                                chatMsgs={this.state.chatMsgs}
                                background={this.state.colorBody}
                              />
                            ) : (
                              <>
                                {this.state.appoType == "coming" ? (
                                  <></>
                                ) : (
                                  this.state.appoType == "all" && (
                                    <View style={styles.container1}>
                                      <View
                                        style={{
                                          flexDirection: "row",
                                          justifyContent: "center",
                                          alignItems: "center",
                                        }}
                                      >
                                        <View
                                          style={{
                                            paddingTop: 25,
                                            width: "70%",
                                          }}
                                        >
                                          <Text
                                            allowFontScaling={false}
                                            style={{
                                              fontFamily: "Quicksand-Bold",
                                              fontSize: 25,
                                              color: "#afbec5",
                                            }}
                                          >
                                            {this.props.translate(
                                              "appointments"
                                            )}
                                          </Text>
                                        </View>
                                        <TouchableOpacity
                                          onPress={() =>
                                            this.setState({
                                              appoType: "coming",
                                            })
                                          }
                                          style={{ marginTop: 25 }}
                                        >
                                          <Image
                                            source={require("./images/close.png")}
                                            style={{
                                              width: 25,
                                              height: 25,
                                              marginHorizontal: 10,
                                            }}
                                          />
                                        </TouchableOpacity>
                                      </View>
                                      <ScrollView
                                        style={{
                                          marginTop: 15,
                                          backgroundColor: "#ebeef5",
                                        }}
                                      >
                                        <View
                                          style={{
                                            marginTop: 10,
                                            alignItems: "center",
                                            justifyContent: "center",
                                          }}
                                        >
                                          <TouchableOpacity
                                            onPress={() => this.openDialog()}
                                          >
                                            <Image
                                              source={require("./images/circle-add.png")}
                                              style={{ width: 35, height: 35 }}
                                            />
                                          </TouchableOpacity>
                                        </View>
                                        <All_appointments
                                          translate={this.props.translate}
                                          appoType={this.state.appoType}
                                          searchGlossary={this.searchGlossary1}
                                        />
                                      </ScrollView>
                                    </View>
                                  )
                                )}
                                {this.state.appoType == "glossary" ? (
                                  <View style={styles.container}>
                                    <View
                                      style={{
                                        flexDirection: "row",
                                        justifyContent: "center",
                                        alignItems: "center",
                                      }}
                                    >
                                      <View
                                        style={{ paddingTop: 25, width: "70%" }}
                                      >
                                        <Text
                                          allowFontScaling={false}
                                          style={{
                                            fontFamily: "Quicksand-Bold",
                                            fontSize: 25,
                                            color: "#d8941c",
                                          }}
                                        >
                                          {this.props.translate("glossary")}
                                        </Text>
                                      </View>
                                      <TouchableOpacity
                                        onPress={() =>
                                          this.setState({ appoType: "coming" })
                                        }
                                        style={{ marginTop: 25 }}
                                      >
                                        <Image
                                          source={require("./images/close.png")}
                                          style={{
                                            width: 25,
                                            height: 25,
                                            marginHorizontal: 10,
                                          }}
                                        />
                                      </TouchableOpacity>
                                    </View>
                                    <Glossary
                                      translate={this.props.translate}
                                      appoType={this.state.appoType}
                                      searchGlossaryKey={
                                        this.state.searchGlossaryKey
                                      }
                                    />
                                  </View>
                                ) : (
                                  this.state.appoType == "questions" && (
                                    <View style={styles.container}>
                                      <View
                                        style={{
                                          flexDirection: "row",
                                          justifyContent: "center",
                                          alignItems: "center",
                                        }}
                                      >
                                        <View
                                          style={{
                                            paddingTop: 25,
                                            width: "70%",
                                          }}
                                        >
                                          <Text
                                            allowFontScaling={false}
                                            style={{
                                              fontFamily: "Quicksand-Bold",
                                              fontSize: 25,
                                              color: "#d8941c",
                                            }}
                                          >
                                            {this.props.translate("questions")}
                                          </Text>
                                        </View>
                                        <TouchableOpacity
                                          onPress={() =>
                                            this.setState({
                                              appoType: "coming",
                                            })
                                          }
                                          style={{ marginTop: 25 }}
                                        >
                                          <Image
                                            source={require("./images/close.png")}
                                            style={{
                                              width: 25,
                                              height: 25,
                                              marginHorizontal: 10,
                                            }}
                                          />
                                        </TouchableOpacity>
                                      </View>
                                      <Questions
                                        translate={this.props.translate}
                                        appoType={this.state.appoType}
                                      />
                                    </View>
                                  )
                                )}
                                {this.state.appoType == "chat" ? (
                                  <Chat
                                    translate={this.props.translate}
                                    gotoChatBack={this.gotoChatBack}
                                    chatMsgs={this.state.chatMsgs}
                                    background={this.state.colorBody}
                                  />
                                ) : (
                                  <></>
                                )}
                                {this.state.appoType == "status" ? (
                                  <Status
                                    goBack={this.gotoHome}
                                    translate={this.props.translate}
                                    currentPhase={this.state.currentPhase}
                                    status={
                                      this.state.customDashboardItems || this.state.DashboardItems.status[
                                          global.lang
                                          ]
                                    }
                                  />
                                ) : (
                                  <></>
                                )}
                                {this.state.appoType == "inbox" ? (
                                  <View
                                    style={[
                                      styles.container1,
                                      { backgroundColor: this.state.colorBody },
                                    ]}
                                  >
                                    <View
                                      style={{
                                        flexDirection: "row",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        marginBottom: 25,
                                      }}
                                    >
                                      <View
                                        style={{ paddingTop: 25, width: "70%" }}
                                      >
                                        <Text
                                          allowFontScaling={false}
                                          style={{
                                            fontFamily: "Quicksand-Bold",
                                            fontSize: 25,
                                            color: "#d8941c",
                                          }}
                                        >
                                          Inbox
                                        </Text>
                                      </View>
                                      <TouchableOpacity
                                        onPress={() => this.gotoBack()}
                                        style={{ marginTop: 25 }}
                                      >
                                        <Image
                                          source={require("./images/close.png")}
                                          style={{
                                            width: 25,
                                            height: 25,
                                            marginHorizontal: 10,
                                          }}
                                        />
                                      </TouchableOpacity>
                                    </View>
                                    <Inbox
                                      translate={this.props.translate}
                                      appoType={this.state.appoType}
                                      visible={0}
                                      searchGlossary={this.searchGlossary}
                                    />
                                  </View>
                                ) : (
                                  <></>
                                )}
                                {this.state.appoType == "app" ? (
                                  <View
                                    style={[
                                      styles.container1,
                                      { backgroundColor: this.state.colorTop },
                                    ]}
                                  >
                                    <View
                                      style={{
                                        flexDirection: "row",
                                        justifyContent: "center",
                                        alignItems: "center",
                                      }}
                                    >
                                      <View
                                        style={{ paddingTop: 25, width: "70%" }}
                                      >
                                        <Text
                                          allowFontScaling={false}
                                          style={{
                                            fontFamily: "Quicksand-Bold",
                                            fontSize: 25,
                                            color: "#d8941c",
                                          }}
                                        >
                                          {this.props.translate("appointments")}
                                        </Text>
                                      </View>
                                      <TouchableOpacity
                                        onPress={() => this.gotoBack()}
                                        style={{ marginTop: 25 }}
                                      >
                                        <Image
                                          source={require("./images/close.png")}
                                          style={{
                                            width: 25,
                                            height: 25,
                                            marginHorizontal: 10,
                                          }}
                                        />
                                      </TouchableOpacity>
                                    </View>
                                    <ScrollView
                                      style={{
                                        marginTop: 15,
                                        backgroundColor: this.state.colorBody,
                                      }}
                                    >
                                      <Text style={styles.appoButton}>
                                        {this.props.translate("upcoming")}
                                      </Text>
                                      <Appointmants
                                        items={this.state.appointments}
                                        translate={this.props.translate}
                                        searchGlossary={this.searchGlossary1}
                                      />
                                      <Text style={styles.appoButton}>
                                        {this.props.translate("previous")}
                                      </Text>
                                      <All_appointments
                                        translate={this.props.translate}
                                        items={this.state.appointments}
                                      />
                                    </ScrollView>
                                  </View>
                                ) : (
                                  <></>
                                )}
                              </>
                            )}
                          </>
                        )}
                      </>
                    )}
                  </>
                )}
              </>
            )}
            <View
              style={{
                display: this.state.appoType == "coming" ? "flex" : "none",
                height: "100%",
              }}
            >
              {!this.state.logoLoaded && (
                <View
                  style={[
                    styles.container,
                    {
                      height: "100%",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: this.state.colorBody || "#2e3643",
                      position: "absolute",
                      width: "100%",
                      zIndex: 1,
                    },
                  ]}
                >
                  <Progress.Circle size={30} indeterminate={true} />
                </View>
              )}
              <View style={styles.container0}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: this.state.colorTop,
                    paddingVertical: 15,
                  }}
                >
                  <TouchableOpacity
                    onPress={() => this.gotoSite()}
                    style={{
                      paddingTop: 20,
                      textAlign: "left",
                      marginLeft: 40,
                      width: "40%",
                    }}
                  >
                    {this.state.logo && (
                      <ImageOrSvg
                        height="50"
                        uri={this.state.logo} // Remote SVG URL
                        handleLoaded={this.handleLogoLoaded}
                      />
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => this.changeDisplayMenu(1)}
                    style={{
                      flexDirection: "row",
                      justifyContent: "flex-end",
                      alignItems: "center",
                      width: "48%",
                      marginLeft: "2%",
                      paddingRight: 30,
                    }}
                  >
                    {this.state.userAvatar && (
                      <ImageOrSvg
                        width="40"
                        height="40"
                        uri={this.state.userAvatar} // Remote SVG URL
                        handleLoaded={this.handleLoaded}
                      />
                    )}
                  </TouchableOpacity>
                </View>

                <ScrollView
                  style={{
                    paddingHorizontal: 0,
                    backgroundColor: this.state.colorBody,
                  }}
                >
                  {this.state.DashboardItems?.sections &&
                    this.state.DashboardItems.sections.map((section, index) => (
                      <View key={index}>
                        {section.content == "slider" && (
                          <BlockSlider
                            sliderItems={this.state.sliderItems}
                            duration={
                              this.state.DashboardItems.sliders.duration
                            }
                            gotoPage={this.gotoPage}
                          />
                        )}
                        {section.content == "status" && (
                          <BlockStatus
                            currentPhase={this.state.currentPhase}
                            status={this.state.customDashboardItems ?? section[global.lang]}
                            onStatusPress={() => {
                              this.setState({
                                appoType: "status",
                              });
                            }}
                          />
                        )}
                        {section.content == "boxs2" && (
                          <BlockBoxs boxs={section} gotoPage={this.gotoPage} />
                        )}
                        {section.content == "posts" && (
                          <BlockPosts
                            posts={this.state.DashboardItems.posts[global.lang]}
                          />
                        )}
                        {section.content == "button" && (
                          <BlockButton
                            button={section}
                            gotoPage={this.gotoPage}
                          />
                        )}
                      </View>
                    ))}
                </ScrollView>
                {this.state.bottomVisible == 1 && (
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-around",
                      alignItems: "center",
                      backgroundColor: this.state.colorBottom,
                      paddingVertical: 15,
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => this.gotoMenuItem(1)}
                      style={{
                        flexDirection: "row",
                        justifyContent: "center",
                      }}
                    >
                      {this.state.footerIcon1 && (
                        <ImageOrSvg
                          width="40"
                          height="40"
                          uri={this.state.footerIcon1} // Remote SVG URL
                          handleLoaded={this.handleLoaded}
                        />
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity
                      // onPress={() =>
                      //   this.changeDisplayMenu(true)
                      // }
                      onPress={() => this.gotoHome()}
                      style={{
                        flexDirection: "row",
                        justifyContent: "center",
                      }}
                    >
                      {this.state.footerIcon2 && (
                        <ImageOrSvg
                          width="40"
                          height="40"
                          uri={this.state.footerIcon2} // Remote SVG URL
                          handleLoaded={this.handleLoaded}
                        />
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => this.gotoMenuItem(2)}
                      style={{
                        flexDirection: "row",
                        justifyContent: "center",
                      }}
                    >
                      {this.state.footerIcon3 && (
                        <ImageOrSvg
                          width="40"
                          height="40"
                          uri={this.state.footerIcon3} // Remote SVG URL
                          handleLoaded={this.handleLoaded}
                        />
                      )}
                    </TouchableOpacity>
                  </View>
                )}
                <BlurView
                  style={{
                    alignItems: "center",
                    justifyContent: "center",
                    width: "100%",
                  }}
                  blurType="dark"
                  blurAmount={10}
                  reducedTransparencyFallbackColor="black"
                  onPress={() => {
                    this.closeOverlayAndMenu();
                  }}
                />
                {this.state.appoType == "coming" && (
                  <BottomSheet
                    backgroundComponent={CustomBackground}
                    onChange={this.handleSheetChanges}
                    ref={this.sheetRef}
                    index={-1}
                    enablePanDownToClose={true}
                    snapPoints={["90%", "90%", "90%"]}
                  >
                    <BottomSheetView
                      style={{
                        flex: 1,
                      }}
                    >
                      <ScrollView
                        style={{
                          paddingHorizontal: 20,
                          paddingBottom: 20,
                        }}
                      >
                        <View
                          style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: 5,
                            width: "100%",
                          }}
                        >
                          <Text
                            allowFontScaling={false}
                            style={{
                              textAlign: "left",
                              fontFamily: "Quicksand-Regular",
                              fontSize: 30,
                              fontWeight: "bold",
                              marginVertical: 10,
                              color: "#AFBDC4",
                              width: "85%",
                              paddingBottom: 15,
                            }}
                          >
                            {this.props.translate("menu")}
                          </Text>
                          <TouchableOpacity
                            onPress={() => {
                              this.closeOverlayAndMenu();
                            }}
                          >
                            <ScalableImage
                              source={require("./images/close.png")}
                              width={15}
                            />
                          </TouchableOpacity>
                        </View>
                        <TouchableOpacity
                          onPress={() => this.gotoMenuItem(1)}
                          style={styles.menuWrap}
                        >
                          <ScalableImage
                            source={require("./images/appointment_icon.png")}
                            width={30}
                            style={{ marginRight: 10 }}
                          />
                          <Text style={styles.menuItem}>
                            {this.props.translate("appointments")}
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => this.gotoMenuItem(2)}
                          style={styles.menuWrap}
                        >
                          <ScalableImage
                            source={require("./images/chat_icon.png")}
                            width={30}
                            style={{ marginRight: 10 }}
                          />
                          <View style={{ flexDirection: "row" }}>
                            <Text style={styles.menuItem}>
                              {this.props.translate("chatwithsupport")}
                            </Text>
                            {this.state.badgeCount > 0 && (
                              <Badge
                                value={this.state.badgeCount}
                                status="error"
                                left={5}
                                top={5}
                              />
                            )}
                          </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() => this.gotoMenuItem(4)}
                          style={styles.menuWrap}
                        >
                          <ScalableImage
                            source={require("./images/question_icon.png")}
                            width={30}
                            style={{ marginRight: 10 }}
                          />
                          <Text style={styles.menuItem}>
                            {this.props.translate("questions")}
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => this.gotoMenuItem(5)}
                          style={styles.menuWrap}
                        >
                          <ScalableImage
                            source={require("./images/inbox_icon_1.png")}
                            width={30}
                            style={{ marginRight: 10 }}
                          />
                          <View style={{ flexDirection: "row" }}>
                            <Text style={styles.menuItem}>
                              {this.props.translate("inbox")}
                            </Text>
                            {this.state.badgeInboxCount > 0 && (
                              <Badge
                                value={this.state.badgeInboxCount}
                                status="error"
                                left={5}
                                top={5}
                              />
                            )}
                          </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => this.gotoMenuItem(6)}
                          style={styles.menuWrap}
                        >
                          <ScalableImage
                            source={require("./images/Account_icon.png")}
                            width={30}
                            style={{ marginRight: 10 }}
                          />
                          <View style={{ flexDirection: "row" }}>
                            <Text style={styles.menuItem}>
                              {this.props.translate("account")}
                            </Text>
                            <View
                              style={{
                                backgroundColor: global.intake_complete
                                  ? "#315731"
                                  : "#fe7675",
                                padding: 6,
                                paddingHorizontal: 12,
                                marginLeft: 10,
                                borderRadius: 20,
                              }}
                            >
                              <Text style={{ color: "white" }}>
                                {global.intake_complete
                                  ? "Complete 5/5"
                                  : "Complete  1/5"}
                              </Text>
                            </View>
                          </View>
                        </TouchableOpacity>
                        <View
                          style={{
                            flexDirection: "row",
                            justifyContent: "flex-start",
                            alignItems: "center",
                            marginBottom: 20,
                            width: "100%",
                          }}
                        >
                          {this.state.insta != "" && (
                            <TouchableOpacity
                              onPress={() => Linking.openURL(this.state.insta)}
                            >
                              <ScalableImage
                                source={require("./images/social/insta.png")}
                                width={30}
                                style={{ marginRight: 15 }}
                              />
                            </TouchableOpacity>
                          )}
                          {this.state.youtube != "" && (
                            <TouchableOpacity
                              onPress={() =>
                                Linking.openURL(this.state.youtube)
                              }
                            >
                              <ScalableImage
                                source={require("./images/social/youtube.png")}
                                width={40}
                                style={{ marginRight: 15 }}
                              />
                            </TouchableOpacity>
                          )}
                          {this.state.twitter != "" && (
                            <TouchableOpacity
                              onPress={() =>
                                Linking.openURL(this.state.twitter)
                              }
                            >
                              <ScalableImage
                                source={require("./images/social/twitter.png")}
                                width={40}
                                style={{ marginRight: 15 }}
                              />
                            </TouchableOpacity>
                          )}
                          {this.state.fb != "" && (
                            <TouchableOpacity
                              onPress={() => Linking.openURL(this.state.fb)}
                            >
                              <ScalableImage
                                source={require("./images/social/fb.png")}
                                width={30}
                                style={{ marginRight: 15 }}
                              />
                            </TouchableOpacity>
                          )}
                          {this.state.linkedin != "" && (
                            <TouchableOpacity
                              onPress={() =>
                                Linking.openURL(this.state.linkedin)
                              }
                            >
                              <ScalableImage
                                source={require("./images/social/LinkedIn.png")}
                                width={30}
                                style={{ marginRight: 15 }}
                              />
                            </TouchableOpacity>
                          )}
                        </View>
                        <Text
                          style={{
                            fontFamily: "Quicksand-Regular",
                            fontSize: 20,
                            marginBottom: 10,
                          }}
                        >
                          {this.props.translate("businessInfo")}
                        </Text>
                        <Text
                          style={{
                            fontFamily: "Quicksand-Regular",
                            fontSize: 15,
                            marginBottom: 10,
                          }}
                        >
                          {this.props.translate("address")}:{" "}
                          {this.state.businessAddress}
                        </Text>
                        <Text
                          style={{
                            fontFamily: "Quicksand-Regular",
                            fontSize: 15,
                            marginBottom: 10,
                          }}
                        >
                          {this.props.translate("email")}:{" "}
                          {this.state.businessEmail}
                        </Text>
                        <Text
                          style={{
                            fontFamily: "Quicksand-Regular",
                            fontSize: 15,
                            marginBottom: 15,
                          }}
                        >
                          {this.props.translate("phone")}:{" "}
                          {this.state.businessPhone}
                        </Text>
                      </ScrollView>
                    </BottomSheetView>
                  </BottomSheet>
                )}
              </View>
            </View>
          </>
        ) : (
          <></>
        )}
        <Call
          changeCallStatus={this.changeCallStatus}
          sellectCollee={this.sellectCollee}
          caller={192}
          callee={global.contactId}
          baseUrl={global.baseUrl}
          callerType="client"
          translate={this.props.translate}
        />
      </>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    fontFamily: "Quicksand-Regular",
    flex: 1,
    ...Platform.select({
      ios: {
        paddingTop: 30,
      },
    }),
    backgroundColor: "#fff",
  },
  container0: {
    fontFamily: "Quicksand-Regular",
    flex: 1,
    ...Platform.select({
      ios: {
        paddingTop: 30,
      },
    }),
    backgroundColor: "#2e3643",
  },
  menuWrap: {
    fontFamily: "Quicksand-Regular",
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  menuItem: {
    fontFamily: "Quicksand-Regular",
    textAlign: "left",
    fontSize: 20,
    color: "#2f3542",
  },
  container1: {
    fontFamily: "Quicksand-Regular",
    flex: 1,
    ...Platform.select({
      ios: {
        paddingTop: 60,
        marginTop: -30,
      },
    }),
    backgroundColor: "#152030",
  },
  title: {
    alignItems: "center",
    fontFamily: "Quicksand-Regular",
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
    borderColor: "grey",
    backgroundColor: "#fff",
    fontSize: 12,
    paddingLeft: 10,
    marginBottom: 10,
  },
  inputdate: {
    fontFamily: "Quicksand-Regular",
    color: "#000",
    height: 40,
    borderRadius: 5,
    borderColor: "grey",
    backgroundColor: "#fff",
    paddingLeft: 10,
    marginBottom: 10,
    width: "100%",
  },
  inputmultiple: {
    borderRadius: 5,
    borderColor: "grey",
    backgroundColor: "#fff",
    fontSize: 12,
    paddingLeft: 10,
    marginTop: 5,
    ...Platform.select({
      ios: {
        height: 100,
      },
      android: {
        height: 100,
      },
      default: {
        height: 100,
      },
    }),
  },
  noteContainer: {
    fontFamily: "Quicksand-Regular",
    fontWeight: "bold",
    marginLeft: 15,
    paddingTop: 1,
    paddingHorizontal: 5,
    backgroundColor: "red",
    borderRadius: 10,
    alignItems: "center",
    maxWidth: 20,
  },
  button: {
    fontFamily: "Quicksand-Regular",
    backgroundColor: "#599cdd",
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 10,
    marginTop: 10,
  },
  button1: {
    fontFamily: "Quicksand-Regular",
    backgroundColor: "#fff",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 5,
    marginTop: 10,
  },
  appoButtonAct: {
    fontFamily: "Quicksand-Regular",
    color: "#000",
    fontSize: 20,
    textAlign: "center",
    marginBottom: 5,
    marginHorizontal: 10,
    backgroundColor: "#000",
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  appoButton: {
    fontFamily: "Quicksand-Regular",
    color: "#000",
    fontSize: 20,
    textAlign: "center",
    marginBottom: 5,
    marginHorizontal: 10,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
});

const pickerStyle = StyleSheet.create({
  inputIOS: {
    fontSize: 12,
    fontFamily: "Quicksand-Regular",
    color: "#000",
    width: "100%",
    height: 40,
    borderRadius: 5,
    borderColor: "grey",
    backgroundColor: "#fff",
    fontSize: 15,
    paddingLeft: 10,
    marginBottom: 10,
    borderWidth: 0,
  },
  inputAndroid: {
    fontSize: 12,
    fontFamily: "Quicksand-Regular",
    color: "#000",
    width: "100%",
    height: 35,
    borderRadius: 5,
    borderColor: "grey",
    backgroundColor: "#fff",
    paddingLeft: 10,
    borderWidth: 0,
  },
});
