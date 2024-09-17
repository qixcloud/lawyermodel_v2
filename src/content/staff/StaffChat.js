import React, { Component } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  Text,
  ScrollView,
  View,
  Dimensions,
  Image,
  AppState,
  Alert,
  TextInput,
} from "react-native";
import Lottie from "../lottie/Lottie";
import MessageBubble from "./MessageBubble";
import ScalableImage from "react-native-scalable-image";
import AutogrowInput from "react-native-autogrow-input";
import messaging from "@react-native-firebase/messaging";
import axios from "axios";
import Call from "../StaffCall";
import DocumentPicker from "react-native-document-picker";
import { launchImageLibrary } from "react-native-image-picker";
import Dialog, { DialogContent, DialogTitle } from "react-native-popup-dialog";
import { Picker } from "@react-native-picker/picker";

export default class StaffChat extends Component {
  constructor(props) {
    super(props);
    this.state = {
      chatMessages: this.props.selectedHistory,
      selectCalleeType: "",
      callStatus: 0,
      calleeId: 0,
      inputBarText: "",
      editDialogStatus: false,
      editName: this.props.details.name,
      editPhone: this.props.details.phone,
      editLang: this.props.details.user_data.Language,
      displayName: this.props.details.name,
      displayPhone: this.props.details.phone,
      displayLang: this.props.details.user_data.Language,
    };
    this.options = {
      title: this.props.translate("selectImage"),
      //customButtons: [{ name: 'fb', title: 'Choose Photo from Facebook' }],
      storageOptions: {
        skipBackup: true,
        path: "images",
      },
    };
    console.log("details", this.props.details.user_data.Language);
  }
  componentDidMount = async () => {
    this.putReadAppUser();
    setTimeout(
      function () {
        if (!this.state.callStatus) this.scrollView.scrollToEnd();
      }.bind(this)
    );
    messaging().onMessage(async (remoteMessage) => {
      //Alert.alert('A new FCM message arrived!', JSON.stringify(remoteMessage));
      if (this.props.clientId > 0) {
        if (
          remoteMessage.notification.title ==
          "Chat from " + this.props.details.name
        ) {
          this.pushMsgs(remoteMessage.notification.body);
          this.putReadAppUser();
        }
      }
    });
    this.onNotificationListener();
  };
  componentDidUpdate() {
    setTimeout(
      function () {
        if (!this.state.callStatus) this.scrollView.scrollToEnd();
      }.bind(this)
    );
  }
  UNSAFE_componentWillMount() {
    AppState.addEventListener("change", this._handleAppStateChange);
  }
  putReadAppUser = () => {
    const params = new FormData();
    params.append("user", this.props.details.app_id);
    axios({
      method: "post",
      headers: {
        "Content-Type": "multipart/form-data",
      },
      url: global.baseUrl + "wp-admin/admin-ajax.php?action=putReadAppUser",
      data: params,
    }).then((res) => {
      //console.log("data", res.data);
    });
  };
  _onSendFileProcessing = (url, name, type) => {
    const second = Math.floor(Date.now() / 1000);
    var data = new FormData();
    data.append("file", {
      uri: url,
      name: second + "-" + name,
      type: type,
    });
    data.append("method", "file_upload");
    data.append("contact_id", this.props.details.contact_id);
    data.append("from", "staff");
    var path = global.baseUrl + "wp-admin/admin-ajax.php?action=contact_api";
    this.setState({ uploadingStatue: 1 });
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
        console.log(responseJson);
        this.setState({ inputBarText: responseJson.path });
        this.processingAjaxMessage(responseJson.path);
        this.setState({ uploadingStatue: 0 });
      })
      .catch((error) => {
        console.error(error);
      });
  };

  onNotificationListener = () => {
    this.removeOnNotification = messaging().onMessage(async (remoteMessage) => {
      if (remoteMessage.notification) {
        var title = remoteMessage.notification.title;
        console.log("note", remoteMessage.notification);
        if (title == "Chat from " + this.props.details.name) {
          this.processNotification(remoteMessage.notification);
        }
      }

      console.log("Foreground notification", remoteMessage);
    });
  };

  _handleAppStateChange = (nextAppState) => {
    if (nextAppState == "active") {
      //this.props.simplechat(0);
    }
  };
  processNotification = (note) => {
    var title = note._title;
    if (title == "Chat from " + this.props.details.name) {
      this.pushMsgs(note._body);
    }
  };

  pushMsgs = (body) => {
    if (typeof body !== "undefined" && body != "") {
      if (this.state.chatMessages.length > 0) {
        if (
          this.state.chatMessages[this.state.chatMessages.length - 1]
            .direction != "left" ||
          this.state.chatMessages[this.state.chatMessages.length - 1].text !=
            body
        ) {
          this.state.chatMessages.push({ direction: "left", text: body });
        }
      } else {
        this.state.chatMessages.push({ direction: "left", text: body });
      }
      this.setState({
        messages: this.state.chatMessages,
        inputBarText: "",
      });
    }
  };
  processingAjaxMessage = (txt) => {
    this.state.chatMessages.push({ direction: "right", text: txt });
    this.setState({
      messages: this.state.chatMessages,
      inputBarText: "",
    });

    if (txt.substring(0, 4).toLowerCase() == "sms:") {
      txt = txt.substring(4, txt.length) + "-SMS";
    } else if (txt.substring(0, 3).toLowerCase() == "sms") {
      txt = txt.substring(3, txt.length) + "-SMS";
    }
    const params = new FormData();
    params.append("method", "submitchat");
    params.append("uid", this.props.details.app_id);
    params.append("chat", txt);
    params.append("user", "");
    params.append("staffId", global.staffId);
    console.log(params);
    axios({
      method: "post",
      headers: {
        "Content-Type": "multipart/form-data",
      },
      url: global.baseUrl + "wp-admin/admin-ajax.php?action=the_ajax_hook",
      data: params,
    }).then((res) => {
      //console.log(res.data);
    });
  };
  brower = async () => {
    await launchImageLibrary(this.options, (response) => {
      console.log(response);
      if (!response.didCancel) {
        this._onSendFileProcessing(
          response.assets[0].uri,
          "photo.jpg",
          response.assets[0].type
        );
      }
    });
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
  onSendFilePressed = () => {
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
  changeCallStatus = (status) => {
    this.setState({ selectCalleeType: "" });
    this.setState({ callStatus: status });
    if (!status) this.setState({ calleeId: 0 });
  };
  onSendPressed = () => {
    if (this.state.inputBarText != "") {
      this.processingAjaxMessage(this.state.inputBarText);
    }
  };

  onChangeText = (text) => {
    this.setState({
      inputBarText: text,
    });
  };

  onSizeChange = () => {
    setTimeout(
      function () {
        this.scrollView.scrollToEnd({ animated: false });
      }.bind(this)
    );
  };
  displayEditDialog = () => {
    this.setState({ editDialogStatus: true });
  };
  saveEditInfo = () => {
    const params = new FormData();
    params.append("id", this.props.details.contact_id);
    params.append("name", this.state.editName);
    params.append("phone", this.state.editPhone);
    params.append("lang", this.state.editLang);
    console.log(params);
    axios({
      method: "post",
      headers: {
        "Content-Type": "multipart/form-data",
      },
      url:
        global.baseUrl +
        "wp-admin/admin-ajax.php?action=saveEditConversationInfo",
      data: params,
    }).then((res) => {
      this.setState({ editDialogStatus: false });
      this.setState({ displayName: this.state.editName });
      this.setState({ displayPhone: this.state.editPhone });
      this.setState({ displayLang: this.state.editLang });
    });
  };
  render() {
    var messages = [];
    this.state.chatMessages.forEach(function (message, index) {
      messages.push(
        <MessageBubble
          key={index}
          direction={message.direction}
          text={message.text}
          date={message.date}
        />
      );
    });
    return (
      <View style={styles.container}>
        <Dialog
          visible={this.state.editDialogStatus}
          onTouchOutside={() => {
            this.setState({ editDialogStatus: false });
          }}
          width={0.9}
          dialogTitle={<DialogTitle title={this.props.translate("editInfo")} />}
        >
          <DialogContent>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <TextInput
                onChangeText={(text) => this.setState({ editName: text })}
                maxLength={40}
                style={styles.input}
                editable
                value={this.state.editName}
              ></TextInput>
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <TextInput
                onChangeText={(text) => this.setState({ editPhone: text })}
                maxLength={40}
                style={styles.input}
                editable
                value={this.state.editPhone}
              ></TextInput>
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "flex-start",
                alignItems: "flex-start",
              }}
            >
              <Picker
                selectedValue={this.state.editLang}
                mode="dropdown"
                onValueChange={(itemValue, itemIndex) =>
                  this.setState({ editLang: itemValue })
                }
                style={styles.picker}
              >
                <Picker.Item label="English" value="en" />
                <Picker.Item label="Spanish" value="sp" />
                <Picker.Item label="French" value="fr" />
              </Picker>
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <TouchableOpacity
                onPress={() => this.saveEditInfo()}
                style={{ alignItems: "center" }}
              >
                <Text style={{ color: "blue" }}>
                  {this.props.translate("save")}
                </Text>
              </TouchableOpacity>
            </View>
          </DialogContent>
        </Dialog>
        <View
          style={!this.state.callStatus ? styles.titleWrap : styles.titleWrap1}
        >
          {!this.state.callStatus && (
            <TouchableOpacity onPress={() => this.displayEditDialog()}>
              <Text style={styles.title}>{this.state.displayName}</Text>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={{ color: "#333", marginRight: 10 }}>
                  {this.state.displayPhone}
                </Text>
                {this.props.details.user_data.appType == "Apple" && (
                  <ScalableImage
                    source={require("../images/apple.png")}
                    height={20}
                  />
                )}
                {this.props.details.user_data.appType == "Android" && (
                  <ScalableImage
                    source={require("../images/android.png")}
                    height={20}
                  />
                )}
              </View>
            </TouchableOpacity>
          )}
          {/* <View style={{position: 'absolute', right: 0, flexDirection: 'row'}}> */}
          <View
            style={
              !this.state.callStatus ? styles.controlWrap : styles.controlWrap1
            }
          >
            <Call
              changeCallStatus={this.changeCallStatus}
              caller={global.staffId}
              callee={this.props.clientId}
              baseUrl={global.baseUrl}
              callerType="staff"
              translate={this.props.translate}
            />
            {!this.state.callStatus && (
              <TouchableOpacity
                onPress={() =>
                  this.props.getComunicateList(this.props.clientId)
                }
                style={{}}
              >
                <View
                  style={{ marginBottom: -20, marginTop: -5, marginRight: -5 }}
                >
                  <Lottie
                    loop={true}
                    icon={require("../lottie/icon3.json")}
                    width={50}
                  />
                </View>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {!this.state.callStatus && (
          <>
            <ScrollView
              ref={(ref) => {
                this.scrollView = ref;
              }}
              style={styles.messages}
            >
              {this.state.chatMessages.length < 15 ? (
                <View style={{ height: 700, justifyContent: "center" }}>
                  {this.state.chatMessages.length == 0 ? (
                    <View style={{ alignItems: "center" }}>
                      <Image
                        source={require("../images/Contact-Us.png")}
                        style={{ width: 200, height: 200, marginBottom: 20 }}
                      />
                      <Text style={{ color: "#fff" }}>
                        {this.props.translate("nhogqayc")}
                      </Text>
                      <Text style={{ color: "#fff" }}>
                        {this.props.translate("sumawaiasap")}
                      </Text>
                    </View>
                  ) : (
                    <></>
                  )}
                </View>
              ) : (
                <></>
              )}

              {messages}
              {/*{this.state.uploadingStatue > 0 && (
                <View style={{alignItems: "center"}}>
                    <Progress.Circle size={30} indeterminate={true} />
                </View>
                )} */}
            </ScrollView>
            <View style={styles.inputBar}>
              <AutogrowInput
                style={styles.textBox}
                ref={(ref) => {
                  this.autogrowInput = ref;
                }}
                multiline={true}
                defaultHeight={30}
                onChangeText={(text) => this.onChangeText(text)}
                onContentSizeChange={this.onSizeChange}
                value={this.state.inputBarText}
                placeholder={"Type your message..."}
              />
              <TouchableOpacity
                style={styles.sendFileButton}
                onPress={() => this.onSendFilePressed()}
              >
                <Image
                  source={require("../images/path3.png")}
                  style={styles.sendFile}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.sendButton}
                onPress={() => this.onSendPressed()}
              >
                <Image
                  source={require("../images/26send.png")}
                  style={{ width: 30, height: 30, marginRight: 30 }}
                />
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
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
    backgroundColor: "white",
    // paddingHorizontal: 15,
    // paddingBottom: 20
  },
  controlWrap: {
    position: "absolute",
    right: 0,
    flexDirection: "row",
  },
  controlWrap1: {
    height: "100%",
  },
  titleWrap: {
    marginTop: 20,
    marginHorizontal: 20,
    marginBottom: 10,
    justifyContent: "center",
  },
  titleWrap1: {
    justifyContent: "center",
  },
  title: {
    fontSize: 25,
  },
  buttonWrap: {
    flexDirection: "row",
    marginTop: 15,
  },
  button: {
    backgroundColor: "#ccc",
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 10,
    borderRadius: 5,
  },
  contentWrap: {
    borderTopWidth: 1,
    borderTopColor: "#666",
  },
  itemWrap: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: "#eee",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#666",
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#e7e7e7",
    marginVertical: 15,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  picker: {
    marginVertical: 15,
    width: 200,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#e7e7e7",
  },
  appIconWrap: {
    backgroundColor: "#fff",
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  hisTimeWrap: {
    width: 100,
    alignItems: "flex-end",
  },
  itemContentWrap: {
    width: Dimensions.get("window").width - 170,
    paddingHorizontal: 10,
  },
  inputBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 5,
    paddingVertical: 3,
    marginBottom: 50,
  },
  sendFileButton: {
    position: "absolute",
    bottom: -20,
    right: 80,
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
    bottom: -25,
  },
  sendFile: {
    width: 25,
    height: 22,
  },
  textBox: {
    borderRadius: 5,
    borderWidth: 0,
    borderColor: "#ccc",
    flex: 1,
    fontSize: 16,
    marginLeft: 15,
    padding: 5,
    position: "absolute",
    bottom: -25,
    width: Dimensions.get("window").width - 90,
    paddingRight: 100,
    backgroundColor: "#fff",
  },
  messages: {
    height: Dimensions.get("window").height - 200,
    borderWidth: 0,
    margin: 5,
    borderColor: "#fff",
  },
});
