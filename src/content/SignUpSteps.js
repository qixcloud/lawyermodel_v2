import React, { Component } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Linking,
  KeyboardAvoidingView,
  Image,
  Button,
  CheckBox,
} from "react-native";
import SplashScreen from "./SplashScreen";
import MySettings from "./settings";
import Dashboard from "./Dashboard";
import Notification from "./Notifications";
import Chat from "./Chat";
import axios from "axios";
import SliderScreen from "./SliderScreen";
import AsyncStorage from "@react-native-async-storage/async-storage";
// import

export default class SignUpStep1 extends Component {
  constructor(props) {
    super(props);
    this.state = {
      login: 0,
      back: 0,
      settings: 0,
      maxStep: global.maxStep,
      step: global.maxStep,
      upload: 0,
      sign: 0,
      files: [],
      complete: 1,
      social: this.props.social,
      chatMsgs: [],
      chatEnable: 0,
      showSlider: false,
      sliderItems: [],
    };
    console.log(global.signup);
  }
  componentDidMount() {
    this.getSliderItems();
    this.handleShowSlider();
    if (this.props.logout) this.logout();
  }

  getSliderItems = () => {
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
  handleShowSlider = async () => {
    const sliderViewed = await AsyncStorage.getItem("sliderViewed");
    console.log("sliderViewed,", sliderViewed);
    if (sliderViewed === null) {
      this.setState({ showSlider: true });
      await AsyncStorage.setItem("sliderViewed", "true");
    }
  };
  gotoUpload = () => {
    this.setState({ upload: 1 });
  };
  gotoSettings = () => {
    this.setState({ settings: 1 });
  };
  nextstep = (idx) => {
    if (idx >= 5) this.gotoChatBack();
    this.setState({ step: idx });
    this.setState({ upload: 0 });
    if (idx > this.state.maxStep) {
      global.maxStep = idx;
      this.setState({ maxStep: idx });
    }
    if (idx >= 5) this.completeSignup();
  };
  selectstep = (idx) => {
    if (idx <= this.state.maxStep) {
      this.setState({ step: idx });
    }
  };
  updatestep = (idx) => {
    if (idx > this.state.maxStep) {
      this.setState({ maxStep: idx });
    }
  };
  updatefiles = (files) => {
    this.setState({ files: files.length > 0 ? files : [] });
  };
  updatesign = (idx) => {
    this.setState({ sign: idx });
  };
  gotoSwitch = () => {
    if (this.state.maxStep > 5) {
      //this.completeSignup();
    } else {
      //this.setState({ back: 1 })
    }
  };
  completeSignup = () => {
    global.signup = 1;
    this.setState({ maxStep: 6 });
    this.setState({ complete: 1 });
  };
  changeSocial = (idx) => {
    this.setState({ social: idx });
  };
  logout = () => {
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
      this.setState({ settings: 0 });
      this.setState({ complete: 0 });
      this.setState({ back: 1 });
    });
  };
  gotoSite = () => {
    Linking.openURL(global.baseUrl);
  };
  pushMsgs = (note) => {
    if (typeof note._body !== "undefined" && note._body != "") {
      if (this.state.chatMsgs.length > 0) {
        console.log(this.state.chatMsgs[this.state.chatMsgs.length - 1].text);
        if (
          this.state.chatMsgs[this.state.chatMsgs.length - 1].direction !=
            "left" ||
          this.state.chatMsgs[this.state.chatMsgs.length - 1].text != note._body
        ) {
          this.state.chatMsgs.push({ direction: "left", text: note._body });
        }
      } else {
        this.state.chatMsgs.push({ direction: "left", text: note._body });
      }
    }
  };
  gotoChatBack = () => {
    this.setState({ chatEnable: 0 });
  };
  gotoChat = () => {
    this.setState({ chatEnable: 1 });
  };
  render() {
    if (this.state.showSlider) {
      return (
        <SliderScreen
          translate={this.props.translate}
          showSlider={this.state.showSlider}
          sliderItems={this.state.sliderItems}
          onPress={() => this.setState({ showSlider: false })}
        />
      );
    }

    return (
      <>
        <Notification
          nextstep={this.nextstep}
          updatestep={this.updatestep}
          logout={this.logout}
          pushMsgs={this.pushMsgs}
        />
        {this.state.chatEnable ? (
          <Chat
            translate={this.props.translate}
            gotoChatBack={this.gotoChatBack}
            chatMsgs={this.state.chatMsgs}
          />
        ) : (
          <>
            {this.state.settings === 1 ? (
              <MySettings
                contactId={this.props.contactId}
                translate={this.props.translate}
              />
            ) : (
              <>
                {this.state.complete === 1 ? (
                  this.state.settings === 0 && !this.props.logout ? (
                    <Dashboard
                      translate={this.props.translate}
                      gotoSettings={this.gotoSettings}
                      chatMsgs={this.state.chatMsgs}
                    />
                  ) : (
                    <></>
                  )
                ) : (
                  <>{this.state.back === 1 ? <SplashScreen /> : <></>}</>
                )}
              </>
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
  },
  button: {
    backgroundColor: "#599cdd",
    padding: 10,
    borderRadius: 5,
  },
});
