import React, { Component } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Keyboard,
  Dimensions,
  TextInput,
  Image,
  Linking,
  KeyboardAvoidingView,
  AppState,
  Alert,
  Platform,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import KeyboardSpacer from "react-native-keyboard-spacer";
import messaging from "@react-native-firebase/messaging";
import DocumentPicker from "react-native-document-picker";
import ScalableImage from "react-native-scalable-image";
import { launchImageLibrary } from "react-native-image-picker";
import * as Progress from "react-native-progress";
import {
  PowerTranslator,
  ProviderTypes,
  TranslatorConfiguration,
  TranslatorFactory,
} from "react-native-power-translator";
import Hyperlink from "react-native-hyperlink";
import DeviceInfo from "react-native-device-info";
import PapelClip from "../assets/clipIcon";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { convertImageToBase64 } from "./Helper";
import ReactNativeBlobUtil from "react-native-blob-util";
var sentCount = 0;
export default class Chat extends Component {
  constructor(props) {
    super(props);
    this.state = {
      login: 0,
      back: 0,
      chat_act: 0,
      lastSentCount: 0,
      messages: [],
      inputBarText: "",
      inputBarTextLength: 0,
      uploadingStatue: 0,
      isKeyboardOpen: false,
      conversationId: undefined,
      intervalId: undefined,
      image: "",
      phoneNumber: "",
      imageLoading: false,
      noteId: "",
    };
    //console.log(this.props.chatMsgs);

    this.options = {
      title: this.props.translate("selectImage"),
      //customButtons: [{ name: 'fb', title: 'Choose Photo from Facebook' }],
      storageOptions: {
        skipBackup: true,
        path: "images",
      },
    };
  }
  gotoBack = () => {
    //this.setState({back: 1})
    this.props.gotoChatBack();
  };
  gotoSite = () => {
    Linking.openURL(global.baseUrl);
  };
  linkFile = (path) => {
    Linking.openURL(path);
  };
  gotoChat = () => {
    this.setState({ chat_act: 1 });
  };

  componentWillMount() {
    this.keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      this.keyboardDidShow.bind(this)
    );
    this.keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      this.keyboardDidHide.bind(this)
    );

    this.onNotificationListener();
  }

  componentWillUnmount() {
    clearInterval(this.state.intervalId);
    this.keyboardDidShowListener.remove();
    this.keyboardDidHideListener.remove();
  }

  keyboardDidShow(e) {
    this.setState({ isKeyboardOpen: true });

    this.scrollView?.scrollToEnd();
  }

  keyboardDidHide(e) {
    this.setState({ isKeyboardOpen: false });

    // this.scrollView?.scrollToEnd();
  }

  getChatNotes = async () => {};

  filterDuplicates(messages) {
    const isDuplicate = (message1, message2) => {
      const timeDifference = Math.abs(message1.date - message2.date);
      return message1.text === message2.text && timeDifference < 5000;
    };

    let filteredMessages = [];

    for (let i = 0; i < messages.length; i++) {
      let duplicateFound = false;
      for (let j = 0; j < i; j++) {
        if (isDuplicate(messages[i], messages[j])) {
          duplicateFound = true;
          break;
        }
      }

      if (!duplicateFound) {
        filteredMessages.push(messages[i]);
      }
    }

    return filteredMessages;
  }
  async getMessages(jwt, conversationId) {
    console.log("conversationId", conversationId);
    await axios({
      method: "get",
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
      url: `https://api.qix.cloud/messages?chat=${conversationId}`,
    }).then(async (res) => {
      const phoneNumber = await AsyncStorage.getItem("phone");
      this.setState({ phoneNumber: phoneNumber });

      if (res.data?.length > 0) {
        let combinedMessages = [...res.data];

        let filteredMessages = this.filterDuplicates(combinedMessages);

        const sortedData = filteredMessages.sort(function (a, b) {
          return a.date - b.date;
        });

        sortedData.forEach((item) => {
          if (item.authorLabel === phoneNumber) {
            item.direction = "right";
          } else {
            item.direction = "left";
          }
        });

        if (this.state.messages?.length !== filteredMessages?.length) {
          this.setState({ messages: filteredMessages });
          setTimeout(() => {
            this.scrollView?.scrollToEnd();
          }, 50);
        }
      } else {
        this.setState({ messages: formattedChatNotes });
      }
    });
  }

  async componentDidMount() {
    const image = await AsyncStorage.getItem("profileImage");
    const phoneNumber = await AsyncStorage.getItem("phone");

    this.setState({ phoneNumber: phoneNumber });
    if (image) {
      this.setState({ image: image });
    }

    const jwt = await AsyncStorage.getItem("jwtToken");

    if (jwt) {
      await axios({
        method: "get",
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
        url: "https://api.qix.cloud/conversation",
      })
        .then(async (res) => {
          if (res?.data?.id) {
            const conversationId = res.data.id;
            console.log("CONVERSATION ID ", conversationId);
            this.setState({ conversationId: conversationId });

            this.getMessages(jwt, conversationId).then(() => {
              setTimeout(() => {
                this.scrollView?.scrollToEnd();
              }, 50);
            });
            const intervalId = setInterval(async () => {
              this.getMessages(jwt, conversationId);
            }, 10000);
            this.setState({ intervalId: intervalId });
          }
        })
        .catch((error) => {});
    }
  }
  componentDidUpdate() {}
  _onSendFileProcessing = async (url, name, type) => {
    this.setState({ imageLoading: true });
    const file = await convertImageToBase64(url);
    const jwt = await AsyncStorage.getItem("jwtToken");

    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", `Bearer ${jwt}`);

    var raw = JSON.stringify({
      chat: this.state.conversationId,
      message: "",
      twilio: "",
      attachment: file,
      attachmentMimeType: "image/png",
    });

    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    fetch("https://api.qix.cloud/message", requestOptions)
      .then(async (result) => {
        const responseJson = await result.json();

        if (responseJson) {
          const lastSeenEventIdKey = `lastSeenMessageId`;
          await AsyncStorage.setItem(
            lastSeenEventIdKey,
            `${responseJson.date}`
          );
          responseJson.direction = "right";
          this.state.messages.push(responseJson);

          this.setState({
            messages: this.state.messages,
            inputBarText: "",
          });

          setTimeout(() => {
            this.scrollView?.scrollToEnd({ animated: false });
          }, 50);
        }
      })
      .catch((error) => console.log("error", error))
      .finally(() => {
        this.setState({ imageLoading: false });
      });
  };

  handleDocumentOperation = async (fileName, size, uri) => {};

  brower = async () => {
    const res = await launchImageLibrary({
      quality: 0.5,
      maxWidth: 800,
      maxHeight: 800,
    });

    if (res.errorMessage) {
      Alert.alert(res.errorMessage);
      console.log("Error camera", res.errorMessage);
    } else if (res?.assets?.length > 0) {
      const image = res.assets[0];
      await this._onSendFileProcessing(image.uri, image.fileName, image.type);
      await this.handleDocumentOperation(
        image.fileName,
        image.fileSize,
        image.uri
      );
    }
  };

  fileBrowser = async () => {
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
      });
      this._onSendFileProcessing(res.uri, res.name, res.type);
    } catch (err) {
      //Handling any exception (If any)
      if (DocumentPicker.isCancel(err)) {
        //If user canceled the document selection
        //alert('Canceled');
      } else {
        //For Unknown Error
        //alert('Unknown Error: ' + JSON.stringify(err));
        throw err;
      }
    }
  };
  _onSendFilePressed = () => {
    Alert.alert(
      "Select Library.",
      "",
      [
        {
          text: "Photo",
          onPress: () => {
            this.brower();
          },
        },
        {
          text: "File",
          onPress: () => {
            this.fileBrowser();
          },
        },
      ],
      { cancelable: false }
    );

    return false;
  };
  _sendMessage() {
    // TODO
    if (this.state.lastSentCount >= 3) {
      Alert.alert(
        "Please wait for reply. You can chat only 3 messages consecutively."
      );
      return;
    }

    if (this.state.inputBarText?.length > 150) {
      Alert.alert("You can use max 150 characters.");
      return;
    }
    sentCount++;
    this.setState({ lastSentCount: sentCount });
    if (this.state.inputBarText != "") {
      this.sendMessage(this.state.inputBarText);
    }
  }
  sendMessage = async (txt) => {
    const jwt = await AsyncStorage.getItem("jwtToken");

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", `Bearer ${jwt}`);

    const raw = JSON.stringify({
      chat: this.state.conversationId,
      message: txt,
    });

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    fetch("https://api.qix.cloud/Message", requestOptions).then(
      async (result) => {
        const responseJson = await result.json();

        if (responseJson) {
          const lastSeenEventIdKey = `lastSeenMessageId`;
          await AsyncStorage.setItem(
            lastSeenEventIdKey,
            `${responseJson.date}`
          );
          this.state.messages.push({ direction: "right", text: txt });
          this.setState({
            messages: this.state.messages,
            inputBarText: "",
          });
          setTimeout(() => {
            this.scrollView?.scrollToEnd({ animated: false });
          }, 50);
        }
      }
    );
  };
  processingAjaxMessage = (txt) => {
    this.state.messages.push({ direction: "right", text: txt });
    this.setState({
      messages: this.state.messages,
      inputBarText: "",
    });
    const params = new FormData();
    params.append("method", "sendMessage");
    params.append("contact_id", global.contactId);
    params.append("text", txt);
    params.append("phone", global.phone);
    axios({
      method: "post",
      headers: {
        "Content-Type": "multipart/form-data",
      },
      url: global.baseUrl + "wp-admin/admin-ajax.php?action=contact_api",
      data: params,
    }).then((res) => {
      //console.log(res.data);
    });
  };
  _onChangeInputBarText(text) {
    if (text?.length <= 150) {
      this.setState({
        inputBarText: text,
      });
    }
  }
  _onInputSizeChange() {
    setTimeout(
      function () {
        // this.scrollView?.scrollToEnd({ animated: false });
      }.bind(this)
    );
  }

  onNotificationListener = () => {
    //this.removeOnNotification = messaging().onMessage(async (remoteMessage) => {
    messaging().onMessage(async (remoteMessage) => {
      if (remoteMessage.notification) {
        var title = remoteMessage.notification.title;

        if (title == "Chat") {
          //console.log("Chat", remoteMessage.notification);
          this.processNotification(remoteMessage.notification);
        }
      }
      console.log("Foreground notification", remoteMessage);
    });
  };

  viewedNotification = () => {
    const params = new FormData();
    params.append("method", "viewedNotification");
    params.append("contact_id", global.contactId);
    axios({
      method: "post",
      headers: {
        "Content-Type": "multipart/form-data",
      },
      url: global.baseUrl + "wp-admin/admin-ajax.php?action=contact_api",
      data: params,
    }).then((res) => {
      //console.log("zzz",res);
      //this.setBadge(0);
    });
  };
  processNotification = (note) => {
    var title = note.title;
    //console.log("title", title);
    if (title == "Chat") {
      this.pushMsgs(note.body);
      sentCount = 0;
      this.setState({ lastSentCount: sentCount });
    }
  };
  pushMsgs = (body) => {
    if (typeof body !== "undefined" && body != "") {
      if (this.state.messages?.length > 0) {
        if (
          this.state.messages[this.state.messages?.length - 1].direction !=
            "left" ||
          this.state.messages[this.state.messages?.length - 1].text != body
        ) {
          this.state.messages.push({ direction: "left", text: body });
        }
        this.state.messages.push({ direction: "left", text: body });
      } else {
        this.state.messages.push({ direction: "left", text: body });
      }

      this.setState({
        messages: this.state.messages,
        inputBarText: "",
      });
    }
  };
  getInputBarTextLength = () => {
    return this.state.inputBarText?.length;
  };
  render() {
    const keyboardVerticalOffset = Platform.OS === "ios" ? 40 : 0;

    var messages = [];
    this.state.messages.forEach(function (message, index) {
      messages.push(
        <MessageBubble
          key={index}
          direction={message.direction}
          text={message.text}
          image={
            message.attachmentMimeType?.includes("image")
              ? message?.attachment
              : undefined
          }
        />
      );
    });

    const renderHeader = () => {
      return (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: Platform.OS === "ios" ? 20 : 0,
          }}
        >
          <View style={{ paddingTop: 25, width: "70%" }}>
            <Text
              style={{
                fontFamily: "Quicksand-Bold",
                fontSize: DeviceInfo.isTablet() ? 40 : 25,
                color: "#d8941c",
              }}
            >
              {this.props.translate("chat")}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => this.gotoBack()}
            style={{ marginTop: 25 }}
          >
            <Image
              source={require("./images/close.png")}
              style={{ width: 25, height: 25, marginHorizontal: 10 }}
            />
          </TouchableOpacity>
        </View>
      );
    };
    //console.log("this.state.isKeyboardOpen", this.state.isKeyboardOpen);
    return (
      <KeyboardAvoidingView
        behavior="position"
        keyboardVerticalOffset={
          Platform.OS === "android"
            ? keyboardVerticalOffset + 20
            : keyboardVerticalOffset - 30
        }
        style={[styles.container, { backgroundColor: this.props.background }]}
      >
        {renderHeader()}
        <ScrollView
          ref={(ref) => {
            this.scrollView = ref;
          }}
          style={{
            height: Platform.OS === "ios" ? 700 : undefined,
            bottom: Platform.OS === "android" ? 55 : 20,
            marginTop: Platform.OS === "android" ? 60 : 0,
          }}
          contentContainerStyle={[
            styles.messages,
            {
              bottom: DeviceInfo.isTablet()
                ? 212.5
                : Platform.OS === "ios"
                ? 150
                : this.state.isKeyboardOpen
                ? 0
                : 120,
            },
          ]}
        >
          <View
            style={{
              height: 700,
              justifyContent: "center",
              zIndex: 0,
            }}
          >
            {this.state.messages?.length == 0 ? (
              <View style={{ alignItems: "center" }}>
                <Image
                  source={require("./images/Contact-Us.png")}
                  style={{
                    width: DeviceInfo.isTablet() ? 340.0 : 200,
                    height: DeviceInfo.isTablet() ? 340.0 : 200,
                    marginBottom: 20,
                  }}
                />
                <Text
                  style={{
                    fontSize: DeviceInfo.isTablet() ? 29.75 : undefined,
                  }}
                >
                  {this.props.translate("nhogqayc")}
                </Text>
                <Text
                  style={{
                    fontSize: DeviceInfo.isTablet() ? 29.75 : undefined,
                  }}
                >
                  {this.props.translate("sumawaiasap")}
                </Text>
              </View>
            ) : (
              <></>
            )}
          </View>
          <View>{messages}</View>
          {this.state.uploadingStatue > 0 && (
            <View style={{ alignItems: "center" }}>
              <Progress.Circle size={30} indeterminate={true} />
            </View>
          )}
        </ScrollView>
        <InputBar
          translate={this.props.translate}
          onSendPressed={() => this._sendMessage()}
          onSendFilePressed={() => this._onSendFilePressed()}
          imageLoading={this.state.imageLoading}
          onSizeChange={() => this._onInputSizeChange()}
          onChangeText={(text) => this._onChangeInputBarText(text)}
          getInputBarTextLength={this.getInputBarTextLength}
          text={this.state.inputBarText}
        />
        {/*<KeyboardSpacer />*/}
      </KeyboardAvoidingView>
    );
  }
}
class MessageBubble extends Component {
  constructor(props) {
    super(props);
    this.state = {
      answerStyle1: styles.answer,
      answerStyle2: styles.answer,
      answerValue: 0,
      shared: 0,
      referral_phone: "",
      imageLoading: styles.imageShow,
      imageMsg: styles.imageHide,
      phoneNumber: "",
    };
  }
  componentDidMount = async () => {
    const phoneNumber = await AsyncStorage.getItem("phone");
    this.setState({ phoneNumber: phoneNumber });
  };
  surveyAnswer = (id, idx) => {
    console.log(id);
    var answer = idx;
    var data = new FormData();
    data.append("method", "surveyAnswer");
    data.append("contact_id", global.contactId);
    data.append("id", id);
    data.append("answer", idx);
    data.append("app_phone", global.phone);
    var path = global.baseUrl + "wp-admin/admin-ajax.php?action=contact_api";
    fetch(path, {
      header: {
        Accept: "application/json",
        "Content-Type": "multipart/form-data",
      },
      method: "POST",
      body: data,
    })
      .then((response) => response.json())
      .then((responseJson) => {
        if (answer == 1) {
          this.setState({ answerStyle1: styles.selectedAnswer });
          this.setState({ answerStyle2: styles.answer });
        } else {
          this.setState({ answerStyle2: styles.selectedAnswer });
          this.setState({ answerStyle1: styles.answer });
        }
        this.setState({ answerValue: answer });
        Alert.alert("Success!");
        console.log(responseJson);
      })
      .catch((error) => {
        console.error(error);
      });
  };
  referralShare = (id) => {
    if (this.state.referral_phone != "") {
      var data = new FormData();
      data.append("method", "referralShare");
      data.append("contact_id", global.contactId);
      data.append("id", id);
      data.append("phone", this.state.referral_phone);
      data.append("app_phone", global.phone);
      var path = global.baseUrl + "wp-admin/admin-ajax.php?action=contact_api";
      fetch(path, {
        header: {
          Accept: "application/json",
          "Content-Type": "multipart/form-data",
        },
        method: "POST",
        body: data,
      })
        .then((response) => response.json())
        .then((responseJson) => {
          this.setState({ shared: 1 });
          Alert.alert("Thanks!");
          console.log(responseJson);
        })
        .catch((error) => {
          console.error(error);
        });
    }
  };
  changeReferralPhone = (text) => {
    this.setState({ referral_phone: text });
  };
  imgLoaded = () => {
    this.setState({ imageLoading: styles.imageHide });
  };

  render() {
    var leftSpacer =
      this.props.direction === "left" ? null : <View style={{ width: 70 }} />;
    var rightSpacer =
      this.props.direction === "left" ? <View style={{ width: 70 }} /> : null;
    var bubbleStyles =
      this.props.direction === "left"
        ? [styles.messageBubble, styles.messageBubbleLeft]
        : [styles.messageBubble, styles.messageBubbleRight];
    var msg = this.props.text?.trim();
    var bubbleTextStyle =
      this.props.direction === "left"
        ? styles.messageBubbleTextLeft
        : styles.messageBubbleTextRight;
    var bubbleTextStyleImage = styles.messageBubbleImage;
    var fileName = msg?.split("\n")[0].split("/").pop();
    var survey_id = 0;
    var survey_name = "";
    var survey_question = "";
    var survey_a1 = "";
    var survey_a2 = "";
    var referral_id = 0;
    var referral_name = "";
    var referral_message = "";
    var referral_sms = "";
    var referral_link = "";
    var messageTxt = "";
    var messageDate = "";

    if (msg?.indexOf("Survey-") > -1) {
    } else if (msg?.indexOf("Referral-") > -1) {
    } else if (msg?.substring(0, 4) == "http") {
    } else {
      var tmp = this.props?.text?.split("\n");
      if (tmp?.length > 1) {
        messageTxt = tmp[0]
          .replace("-SMSAPP", "")
          .replace("-SMS", "")
          .replace(/&#39;/g, "'");
        messageDate = tmp[1];
      } else {
        if (tmp?.length > 0) {
          messageTxt = tmp[0]
            .replace("-SMSAPP", "")
            .replace("-SMS", "")
            .replace(/&#39;/g, "'");
        }
      }
    }

    const renderVideoChatLink = () => {
      const url = this.props.text?.trim().split("\n")[0];
      let name = global.clientName?.replace(" ", "-") ?? "user";

      const formattedUrl = url.replace("admin", name);
      //console.log("formattedUrl", formattedUrl);

      return (
        <TouchableOpacity
          style={{
            backgroundColor: "#f2efe0",
            paddingVertical: 8,
            paddingHorizontal: 30,
            borderRadius: 10,
          }}
          onPress={() => Linking.openURL(formattedUrl)}
        >
          <Text style={{ fontSize: 19, color: "#5493e7" }}>{formattedUrl}</Text>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              backgroundColor: "white",
              padding: 5,
              borderRadius: 10,
              marginTop: 10,
            }}
          >
            {/*<ScalableImage*/}
            {/*  source={require("./images/file_icons/videocall.png")}*/}
            {/*  width={25}*/}
            {/*/>*/}
            <Text style={{ fontSize: 14, marginLeft: 10 }}>Click to open</Text>
          </View>
        </TouchableOpacity>
      );
    };

    return (
      <View style={{ justifyContent: "space-between", flexDirection: "row" }}>
        {leftSpacer}
        <View style={bubbleStyles}>
          {msg?.substring(0, 4) == "http" ||
          msg?.indexOf("/tm/") > -1 ||
          msg?.indexOf("/m/") > -1 ||
          msg?.indexOf("http://") > -1 ||
          msg?.indexOf("https://") > -1 ? (
            <>
              {/* {msg?.indexOf('/tm/') > -1 || msg?.indexOf('/m/') > -1 ? (      */}
              {msg?.substring(0, 4) != "http" ? (
                <>
                  {/*{this.props.direction === 'left' && (*/}
                  {/*  <Image source={require('./images/left.png')} style={{ width: 13, height:13, marginRight: -7 }} />*/}
                  {/*)}*/}
                  <Hyperlink
                    linkDefault={true}
                    linkStyle={{ color: "#2980b9" }}
                  >
                    <Text style={bubbleTextStyle}>
                      {this.props.text
                        .replace("-SMSAPP", "")
                        .replace("-SMS", "")
                        .replace(/&#39;/g, "'")}
                    </Text>
                  </Hyperlink>
                  {this.props.direction === "right" && (
                    <Image
                      source={require("./images/right.png")}
                      style={{ width: 13, height: 13, marginLeft: -7 }}
                    />
                  )}
                </>
              ) : (
                <>
                  {msg?.toLowerCase().indexOf("page=comunications&type=") >
                  -1 ? (
                    <>
                      <Hyperlink
                        linkDefault={true}
                        linkStyle={{ color: "#2980b9" }}
                      >
                        <Text style={bubbleTextStyle}>
                          {this.props.text
                            .replace("-SMSAPP", "")
                            .replace("-SMS", "")
                            .replace(/&#39;/g, "'")}
                        </Text>
                      </Hyperlink>
                      {this.props.direction === "right" && (
                        <Image
                          source={require("./images/right.png")}
                          style={{ width: 13, height: 13, marginLeft: -7 }}
                        />
                      )}
                    </>
                  ) : (
                    <>
                      {fileName.toLowerCase().indexOf(".jpeg") > -1 ||
                      fileName.toLowerCase().indexOf(".jpg") > -1 ||
                      fileName.toLowerCase().indexOf(".png") > -1 ||
                      fileName.toLowerCase().indexOf(".bmp") > -1 ? (
                        <TouchableOpacity
                          style={bubbleTextStyleImage}
                          onPress={() =>
                            Linking.openURL(
                              this.props.text?.trim().split("\n")[0]
                            )
                          }
                        >
                          <ScalableImage
                            onLoadEnd={(e) => this.imgLoaded()}
                            source={{
                              uri: this.props.text?.trim().split("\n")[0],
                            }}
                            width={100}
                          />
                          <View
                            style={
                              ({ alignItems: "center", width: 100 },
                              this.state.imageLoading)
                            }
                          >
                            <Progress.Circle size={30} indeterminate={true} />
                          </View>
                        </TouchableOpacity>
                      ) : (
                        <>
                          {fileName.toLowerCase().indexOf(".pdf") > -1 ? (
                            <TouchableOpacity
                              style={bubbleTextStyleImage}
                              onPress={() =>
                                Linking.openURL(
                                  this.props.text?.trim().split("\n")[0]
                                )
                              }
                            >
                              <ScalableImage
                                source={require("./images/file_icons/pdf.png")}
                                width={50}
                              />
                              <Text style={{ color: "#fff" }}>{fileName}</Text>
                            </TouchableOpacity>
                          ) : (
                            renderVideoChatLink()
                          )}
                        </>
                      )}
                    </>
                  )}
                </>
              )}
            </>
          ) : (
            <>
              {msg?.indexOf("Survey-") > -1 ||
              msg?.indexOf("Referral-") > -1 ? (
                <>
                  {msg?.indexOf("Survey-") > -1 ? (
                    <View
                      style={{
                        backgroundColor: "white",
                        paddingHorizontal: 10,
                        paddingVertical: 5,
                        borderRadius: 5,
                      }}
                    >
                      {/* <PowerTranslator text={survey_name} style={{fontSize: 20, marginBottom: 10}} />
                  <PowerTranslator text={survey_question} style={{marginBottom: 10}} /> */}
                      <Text style={{ fontSize: 20, marginBottom: 10 }}>
                        {survey_name}
                      </Text>
                      <Text style={{ marginBottom: 10 }}>
                        {survey_question}
                      </Text>
                      {this.state.answerValue > 0 ? (
                        <View style={{ alignItems: "center", padding: 10 }}>
                          <ScalableImage
                            source={require("./images/check.png")}
                            width={30}
                          />
                        </View>
                      ) : (
                        <>
                          <TouchableOpacity
                            onPress={() => this.surveyAnswer(survey_id, 1)}
                            style={this.state.answerStyle1}
                          >
                            <Text>{survey_a1}</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => this.surveyAnswer(survey_id, 2)}
                            style={this.state.answerStyle2}
                          >
                            <Text>{survey_a2}</Text>
                          </TouchableOpacity>
                        </>
                      )}
                    </View>
                  ) : (
                    <View
                      style={{
                        backgroundColor: "white",
                        paddingHorizontal: 10,
                        paddingVertical: 5,
                        borderRadius: 5,
                      }}
                    >
                      {/* <PowerTranslator text={referral_name} style={{fontSize: 20, marginBottom: 10}} />
                  <PowerTranslator text={referral_message} style={{marginBottom: 10}} /> */}
                      <Text style={{ fontSize: 20, marginBottom: 10 }}>
                        {referral_name}
                      </Text>
                      <Text style={{ marginBottom: 10 }}>
                        {referral_message}
                      </Text>
                      {this.state.shared > 0 ? (
                        <View style={{ alignItems: "center", padding: 10 }}>
                          <ScalableImage
                            source={require("./images/check.png")}
                            width={30}
                          />
                        </View>
                      ) : (
                        <>
                          <TextInput
                            onChangeText={(text) =>
                              this.changeReferralPhone(text)
                            }
                            defaultValue={this.state.referral_phone}
                            keyboardType={"numeric"}
                            style={{
                              marginBottom: 10,
                              borderWidth: 1,
                              borderRadius: 5,
                              padding: 5,
                            }}
                            placeholder="INSERT PHONE #"
                            placeholderTextColor="#555"
                          ></TextInput>
                          {this.state.referral_phone?.length < 1 ? (
                            <View
                              style={{
                                backgroundColor: "#eee",
                                alignItems: "center",
                                marginBottom: 10,
                                paddingHorizontal: 10,
                                paddingVertical: 5,
                                borderRadius: 5,
                              }}
                            >
                              <Text>Share</Text>
                            </View>
                          ) : (
                            <TouchableOpacity
                              onPress={() => this.referralShare(referral_id)}
                              style={{
                                backgroundColor: "#bde0fe",
                                alignItems: "center",
                                marginBottom: 10,
                                paddingHorizontal: 10,
                                paddingVertical: 5,
                                borderRadius: 5,
                              }}
                            >
                              <Text>Share</Text>
                            </TouchableOpacity>
                          )}
                        </>
                      )}
                    </View>
                  )}
                </>
              ) : this.props.image ? (
                <TouchableOpacity
                  onPress={() => {
                    console.log("image", this.props.image);
                    Linking.openURL(this.props.image);
                  }}
                  style={bubbleTextStyle}
                >
                  <Image
                    resizeMode={"contain"}
                    source={{ uri: this.props.image }}
                    style={{
                      width: DeviceInfo.isTablet() ? 160 : 120,
                      height: DeviceInfo.isTablet() ? 160 : 120,
                      borderRadius: 8,
                    }}
                  />
                </TouchableOpacity>
              ) : (
                <View style={bubbleTextStyle}>
                  <Hyperlink
                    linkDefault={true}
                    linkStyle={{ color: "#2980b9" }}
                  >
                    <Text
                      style={{ fontSize: DeviceInfo.isTablet() ? 27.2 : 16 }}
                    >
                      {messageTxt}
                    </Text>
                  </Hyperlink>
                  <Text style={{ fontSize: DeviceInfo.isTablet() ? 18.7 : 10 }}>
                    {messageDate}
                  </Text>
                </View>
              )}
              {/*{this.props.direction === 'right' && (*/}
              {/*  <Image source={require('./images/right.png')} style={{ width: 13, height:13, marginLeft: -7 }} />*/}
              {/*)}*/}
            </>
          )}
        </View>
        {rightSpacer}
      </View>
    );
  }
}
class InputBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isKeyboardOpen: false,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.text === "") {
      // this.autogrowInput.resetInputText();
    }
  }

  componentDidMount() {
    Keyboard.addListener("keyboardDidShow", this.keyboardDidShow);
    Keyboard.addListener("keyboardDidHide", this.keyboardDidHide);
  }

  keyboardDidShow = () => {
    this.setState({ isKeyboardOpen: true });
  };

  keyboardDidHide = () => {
    this.setState({ isKeyboardOpen: false });
  };

  render() {
    return (
      <View
        style={{
          marginBottom: 200,
          bottom: DeviceInfo.isTablet()
            ? 187.0
            : Platform.OS === "ios"
            ? this.state.isKeyboardOpen
              ? 30
              : 30
            : this.state.isKeyboardOpen
            ? -150
            : 120,
        }}
      >
        <View style={styles.inputBar}>
          <TextInput
            style={styles.textBox}
            // ref={(ref) => { this.autogrowInput = ref }}
            multiline={true}
            defaultHeight={DeviceInfo.isTablet() ? 85.0 : 30}
            onChangeText={(text) => this.props.onChangeText(text)}
            onContentSizeChange={this.props.onSizeChange}
            value={this.props.text}
            placeholder={"Type your message..."}
            placeholderTextColor="#fff"
          />
          <Text style={styles.txtCounter}>
            {this.props.getInputBarTextLength()}/150
          </Text>
          <TouchableOpacity
            style={styles.sendFileButton}
            onPress={() => this.props.onSendFilePressed()}
          >
            {!this.props.imageLoading ? (
              <PapelClip
                height={DeviceInfo.isTablet() ? 40 : 25}
                width={DeviceInfo.isTablet() ? 40 : 25}
              />
            ) : (
              <ActivityIndicator color={"green"} />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.sendButton}
            onPress={() => this.props.onSendPressed()}
          >
            {/* <Text style={{color: 'white'}}>Send</Text> */}
            <Image
              source={require("./images/26send.png")}
              style={{
                width: DeviceInfo.isTablet() ? 42.5 : 30,
                height: DeviceInfo.isTablet() ? 42.5 : 30,
                marginRight: 30,
              }}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  //ChatView

  outer: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-between",
    backgroundColor: "white",
  },

  messages: {
    borderWidth: 0,
    margin: 5,
    borderColor: "#fff",
    justifyContent: "flex-end",
  },

  //InputBar

  inputBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 5,
    paddingVertical: 15,
    backgroundColor: "#838683",
    borderRadius: 16,
    marginHorizontal: 10,
    alignItems: "center",
    bottom: Platform.OS === "android" ? 50 : 30,
  },
  textBox: {
    borderRadius: 5,
    borderWidth: 0,
    borderColor: "#ccc",
    flex: 1,
    fontSize: DeviceInfo.isTablet() ? 27.2 : 16,
    marginLeft: 15,
    padding: 5,
    width: Dimensions.get("window").width - 90,
    paddingRight: 100,
    color: "#fff",
    maxHeight: DeviceInfo.isTablet() ? 85.0 : 50,
    marginRight: 65,
  },
  txtCounter: {
    position: "absolute",
    right: DeviceInfo.isTablet() ? 127.5 : 110,
    color: "#fff",
    fontSize: DeviceInfo.isTablet() ? 25.5 : undefined,
  },
  sendFile: {
    width: DeviceInfo.isTablet() ? 21.25 : 13,
    height: DeviceInfo.isTablet() ? 42.5 : 26,
  },
  sendFileButton: {
    position: "absolute",
    right: DeviceInfo.isTablet() ? 80.75 : 80,
  },
  sendButton: {
    justifyContent: "flex-end",
    alignItems: "flex-end",
    paddingLeft: 15,
    right: 0,
    // paddingRight: 15,
    borderRadius: 5,
    backgroundColor: "transparent",
    position: "absolute",
  },

  //MessageBubble

  messageBubble: {
    borderRadius: 5,
    marginTop: 8,
    marginRight: 10,
    marginLeft: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    flexDirection: "row",
    flex: 1,
    alignItems: "flex-end",
  },

  messageBubbleLeft: {},
  answer: {
    backgroundColor: "#eeeeee",
    alignItems: "center",
    marginBottom: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  selectedAnswer: {
    backgroundColor: "#bde0fe",
    alignItems: "center",
    marginBottom: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  imageShow: {
    display: "flex",
  },
  imageHide: {
    display: "none",
  },

  messageBubbleTextLeft: {
    backgroundColor: "#fff",
    color: "black",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 10,
    overflow: "hidden",
    borderBottomLeftRadius: 0,
  },

  messageBubbleImage: {
    backgroundColor: "transparent",
    borderRadius: 5,
    overflow: "hidden",
  },
  messageBubbleRight: {
    justifyContent: "flex-end",
  },

  messageBubbleTextRight: {
    backgroundColor: "#5493e7",
    color: "white",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 10,
    overflow: "hidden",
    borderBottomRightRadius: 0,
  },
  container: {
    fontFamily: "Quicksand-Regular",
    backgroundColor: "#152030",
    flex: 1,
    ...Platform.select({
      ios: {
        paddingTop: 30,
      },
    }),
  },
  title: {
    alignItems: "center",
    fontFamily: "Eina03-Regular",
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
    fontFamily: "Eina03-Regular",
    height: 40,
    borderRadius: 5,
    borderColor: "grey",
    backgroundColor: "#fff",
    fontSize: 12,
    paddingLeft: 10,
  },
  inputmultiple: {
    borderRadius: 5,
    borderColor: "grey",
    backgroundColor: "#fff",
    fontSize: 12,
    paddingLeft: 10,
    ...Platform.select({
      ios: {
        height: 160,
      },
      android: {
        height: 160,
      },
      default: {
        height: 160,
      },
    }),
  },
  noteContainer: {
    fontFamily: "Eina03-Bold",
    marginLeft: 15,
    paddingTop: 1,
    paddingHorizontal: 5,
    borderRadius: 10,
    alignItems: "center",
    maxWidth: 20,
  },
  button: {
    fontFamily: "Eina03-Regular",
    backgroundColor: "#599cdd",
    padding: 10,
    borderRadius: 5,
  },
});
