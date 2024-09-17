import React, { Component } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  Text,
  ScrollView,
  View,
  Dimensions,
  TextInput,
  Alert,
} from "react-native";
import Lottie from "../lottie/Lottie";
import StaffChat from "./StaffChat";
import ScalableImage from "react-native-scalable-image";
import axios from "axios";
import * as Progress from "react-native-progress";
import messaging from "@react-native-firebase/messaging";
import Dialog, { DialogContent, DialogTitle } from "react-native-popup-dialog";
import PhoneNumberMask from "rn-phone-number-mask";

export default class Comunication extends Component {
  constructor(props) {
    super(props);
    this.state = {
      clientId: 0,
      completeds: [],
      unreads: [],
      openeds: [],
      requests: [],
      loaded: 0,
      selectedClientDetails: "",
      selectedHistory: [],
      newDialogStatus: false,
      searchDialogStatus: false,
      newPhoneNumber: "",
      searchKey: "",
      createdConvId: 0,
      createdConvAppId: "",
    };
  }
  componentDidMount = async () => {
    this.getComunicateListFirst();
    messaging().onMessage(async (remoteMessage) => {
      //Alert.alert('A new FCM message arrived!', JSON.stringify(remoteMessage));
      if (remoteMessage.notification.title.indexOf("Chat from ") > -1) {
        //if(remoteMessage.notification.title == "Chat from "+this.props.details.name){
        console.log("this.state.clientId", this.state.clientId);
        if (this.state.clientId == 0) {
          var id = this.getContactIdFromNotification(
            remoteMessage.notification.title
          );
          console.log("id", id);
          if (id > 0) {
            this.getComunicateList(id);
          }
        }
      }
    });
  };
  getContactIdFromNotification = (title) => {
    var id = 0;
    this.state.openeds.forEach(function (data, index) {
      if (title == "Chat from " + data.name) {
        id = data.contact_id;
      }
    });
    this.state.completeds.forEach(function (data, index) {
      if (title == "Chat from " + data.name) {
        id = data.contact_id;
      }
    });
    this.state.unreads.forEach(function (data, index) {
      if (title == "Chat from " + data.name) {
        id = data.contact_id;
      }
    });
    this.state.requests.forEach(function (data, index) {
      if (title == "Chat from " + data.name) {
        id = data.contact_id;
      }
    });
    return id;
  };
  removeMessage = (type, app_id) => {
    const tempArray = [];
    if (type == "opened") {
      this.state.openeds.forEach(function (data, index) {
        if (data.app_id != app_id) {
          tempArray.push(data);
        }
      });
      this.setState({ openeds: tempArray });
    }
    if (type == "complete") {
      this.state.completeds.forEach(function (data, index) {
        if (data.app_id != app_id) {
          tempArray.push(data);
        }
      });
      this.setState({ completeds: tempArray });
    }
    if (type == "unread") {
      this.state.unreads.forEach(function (data, index) {
        if (data.app_id != app_id) {
          tempArray.push(data);
        }
      });
      this.setState({ unreads: tempArray });
    }
    if (type == "request") {
      this.state.requests.forEach(function (data, index) {
        if (data.app_id != app_id) {
          tempArray.push(data);
        }
      });
      this.setState({ unreads: tempArray });
    }
  };
  getComunicateList = (id) => {
    this.setState({ clientId: 0 });
    const params = new FormData();
    params.append("searchKey", this.state.searchKey);
    params.append("contact_id", id);
    console.log(params);
    axios({
      method: "post",
      headers: {
        "Content-Type": "multipart/form-data",
      },
      url:
        global.baseUrl + "wp-admin/admin-ajax.php?action=getChatUserListForApp",
      data: params,
    }).then((res) => {
      //console.log('res.data', res.data);
      const tempArray = [];
      var check = 0;
      if (res.data.opened.length > 0) {
        this.state.openeds.forEach(function (data, index) {
          if (data.app_id == res.data.opened[0].app_id) {
            tempArray.push(res.data.opened[0]);
            check++;
          } else {
            tempArray.push(data);
          }
        });
        if (check < 1) {
          this.removeMessage("complete", res.data.opened[0].app_id);
          this.removeMessage("unread", res.data.opened[0].app_id);
          this.removeMessage("request", res.data.opened[0].app_id);
          tempArray.unshift(res.data.opened[0]);
        }
        this.setState({ openeds: tempArray });
      } else if (res.data.completed.length > 0) {
        this.state.completeds.forEach(function (data, index) {
          if (data.app_id == res.data.completed[0].app_id) {
            tempArray.push(res.data.completed[0]);
            check++;
          } else {
            tempArray.push(data);
          }
        });
        if (check < 1) {
          this.removeMessage("opened", res.data.completed[0].app_id);
          this.removeMessage("unread", res.data.completed[0].app_id);
          this.removeMessage("request", res.data.completed[0].app_id);
          tempArray.unshift(res.data.completed[0]);
        }
        this.setState({ completeds: tempArray });
      } else if (res.data.unread.length > 0) {
        this.state.unreads.forEach(function (data, index) {
          if (data.app_id == res.data.unread[0].app_id) {
            tempArray.push(res.data.unread[0]);
            check++;
          } else {
            tempArray.push(data);
          }
        });
        if (check < 1) {
          this.removeMessage("complete", res.data.unread[0].app_id);
          this.removeMessage("opened", res.data.unread[0].app_id);
          this.removeMessage("request", res.data.unread[0].app_id);
          tempArray.unshift(res.data.unread[0]);
        }
        this.setState({ unreads: tempArray });
      } else if (res.data.requests.length > 0) {
        this.state.requests.forEach(function (data, index) {
          if (data.app_id == res.data.unread[0].app_id) {
            tempArray.push(res.data.unread[0]);
            check++;
          } else {
            tempArray.push(data);
          }
        });
        if (check < 1) {
          this.removeMessage("complete", res.data.requests[0].app_id);
          this.removeMessage("opened", res.data.requests[0].app_id);
          this.removeMessage("unread", res.data.requests[0].app_id);
          tempArray.unshift(res.data.unread[0]);
        }
        this.setState({ requests: tempArray });
      }
    });
  };
  getComunicateListFirst = () => {
    this.setState({ loaded: 0 });
    const params = new FormData();
    params.append("searchKey", this.state.searchKey);
    axios({
      method: "post",
      headers: {
        "Content-Type": "multipart/form-data",
      },
      url:
        global.baseUrl + "wp-admin/admin-ajax.php?action=getChatUserListForApp",
      data: params,
    }).then((res) => {
      console.log(res.data);
      this.setState({ openeds: res.data.opened });
      this.setState({ completeds: res.data.completed });
      this.setState({ unreads: res.data.unread });
      this.setState({ requests: res.data.newClient });
      this.setState({ loaded: 1 });
      if (this.state.createdConvId > 0 || this.state.createdConvAppId != "") {
        var id = 0;
        var details = "";
        var createdConvAppId = this.state.createdConvAppId;
        var createdConvId = this.state.createdConvId;
        res.data.opened.forEach(function (data, index) {
          if (
            createdConvAppId == data.app_id ||
            createdConvId == data.contact_id
          ) {
            id = data.contact_id;
            details = data;
          }
        });
        console.log("id", id);
        res.data.completed.forEach(function (data, index) {
          if (
            createdConvAppId == data.app_id ||
            createdConvId == data.contact_id
          ) {
            id = data.contact_id;
            details = data;
          }
        });
        res.data.unread.forEach(function (data, index) {
          if (
            createdConvAppId == data.app_id ||
            createdConvId == data.contact_id
          ) {
            id = data.contact_id;
            details = data;
          }
        });
        res.data.newClient.forEach(function (data, index) {
          if (
            createdConvAppId == data.app_id ||
            createdConvId == data.contact_id
          ) {
            id = data.contact_id;
            details = data;
          }
        });
        console.log("id", id);
        if (id > 0) {
          this.simplechat(id, details);
        }
      }
      this.setState({ createdConvId: 0 });
      this.setState({ createdConvAppId: "" });
    });
  };

  createNew = () => {
    this.setState({ newDialogStatus: true });
  };
  addNewConversation = () => {
    if (this.state.newPhoneNumber != "") {
      const params = new FormData();
      params.append("phone", this.state.newPhoneNumber);
      axios({
        method: "post",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        url:
          global.baseUrl + "wp-admin/admin-ajax.php?action=addNewConversation",
        data: params,
      }).then((res) => {
        console.log(res.data);
        // Alert.alert(this.props.translate("Success"));
        this.setState({ newDialogStatus: false });
        this.setState({ newPhoneNumber: "" });
        if (res.data > 0) {
          this.setState({ createdConvId: res.data.trim() });
        } else {
          this.setState({ createdConvAppId: res.data.trim() });
        }
        this.getComunicateListFirst();
      });
    }
  };
  search = () => {
    this.setState({ searchDialogStatus: true });
  };
  searchUser = () => {
    this.getComunicateListFirst();
    this.setState({ searchDialogStatus: false });
  };
  simplechat = (id, details = []) => {
    //console.log('details.his', details.his);
    if (id == 0) {
      //this.getComunicateListFirst();
    } else {
      var messages = [];
      details.his.forEach(function (message, index) {
        if (message.fromuser.includes("App-")) {
          messages.push({
            direction: "left",
            text: message.text,
            date: message.date,
          });
        } else {
          messages.push({
            direction: "right",
            text: message.text,
            date: message.date,
          });
        }
      });
      details.new.forEach(function (message, index) {
        if (message.from.includes("App-")) {
          messages.push({
            direction: "left",
            text: message.text,
            date: message.date,
          });
        } else {
          messages.push({
            direction: "right",
            text: message.text,
            date: message.date,
          });
        }
      });
      console.log("details", details.new);
      this.setState({ selectedHistory: messages });
      this.setState({ selectedClientDetails: details });
    }
    this.setState({ clientId: id });
  };
  gotoVideoCall = () => {};
  gotoAudioCall = () => {};
  render() {
    return (
      <>
        {this.state.clientId > 0 ? (
          <StaffChat
            clientId={this.state.clientId}
            translate={this.props.translate}
            getComunicateList={this.getComunicateList}
            details={this.state.selectedClientDetails}
            selectedHistory={this.state.selectedHistory}
            gotoVideoCall={this.gotoVideoCall}
            gotoAudioCall={this.gotoAudioCall}
          />
        ) : (
          <ScrollView style={styles.container}>
            <Dialog
              visible={this.state.newDialogStatus}
              onTouchOutside={() => {
                this.setState({ newDialogStatus: false });
              }}
              width={0.9}
              dialogTitle={
                <DialogTitle title={this.props.translate("createNew")} />
              }
            >
              <DialogContent>
                <View
                  style={{ justifyContent: "center", alignItems: "center" }}
                >
                  {/* <TextInput onChangeText={(text) => this.setState({ newPhoneNumber: text })}  maxLength={40} style={styles.input} editable placeholder={this.props.translate("insertPhoneNUmber")}></TextInput> */}
                  <PhoneNumberMask
                    onNumberChange={(phoneNumber) =>
                      this.setState({ newPhoneNumber: phoneNumber })
                    }
                    style={styles.input}
                    placeholder={this.props.translate("insertPhoneNUmber")}
                  />
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <TouchableOpacity
                    onPress={() => this.addNewConversation()}
                    style={{ alignItems: "center" }}
                  >
                    <Text style={{ color: "blue" }}>
                      {this.props.translate("create")}
                    </Text>
                  </TouchableOpacity>
                </View>
              </DialogContent>
            </Dialog>
            <Dialog
              visible={this.state.searchDialogStatus}
              onTouchOutside={() => {
                this.setState({ searchDialogStatus: false });
              }}
              width={0.9}
            >
              <DialogContent>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                    marginTop: 15,
                  }}
                >
                  <TextInput
                    onChangeText={(text) => this.setState({ searchKey: text })}
                    maxLength={40}
                    style={styles.input}
                    editable
                    value={this.state.searchKey}
                  ></TextInput>
                  <TouchableOpacity
                    onPress={() => this.setState({ searchKey: "" })}
                    style={{ position: "absolute", right: 5 }}
                  >
                    <ScalableImage
                      source={require("../images/gifs/lottie_close.gif")}
                      width={30}
                    />
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
                    onPress={() => this.searchUser()}
                    style={{ alignItems: "center" }}
                  >
                    <Text style={{ color: "blue" }}>
                      {this.props.translate("search")}
                    </Text>
                  </TouchableOpacity>
                </View>
              </DialogContent>
            </Dialog>
            <View style={styles.titleWrap}>
              <View>
                <Text style={styles.title}>
                  {this.props.translate("Comunicate")}
                </Text>
                <View style={{ position: "absolute", right: 0 }}>
                  <TouchableOpacity
                    onPress={() => this.props.gotochat(0)}
                    style={{}}
                  >
                    <View
                      style={{
                        marginBottom: -20,
                        marginTop: -5,
                        marginRight: -5,
                      }}
                    >
                      <Lottie
                        loop={true}
                        icon={require("../lottie/icon3.json")}
                        width={50}
                      />
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.buttonWrap}>
                <TouchableOpacity
                  onPress={() => this.createNew()}
                  style={styles.button}
                >
                  <Text>{this.props.translate("createNew")}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => this.search()}
                  style={styles.button}
                >
                  <View style={{ flexDirection: "row" }}>
                    <ScalableImage
                      source={require("../images/search.png")}
                      height={20}
                      style={{ marginRight: 5 }}
                    />
                    <Text>{this.props.translate("search")}</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.contentWrap}>
              {this.state.loaded ? (
                <>
                  {this.state.unreads.map((data) => {
                    return (
                      <TouchableOpacity
                        onPress={() => this.simplechat(data.contact_id, data)}
                        style={styles.itemWrapunread}
                        key={data.contact_id}
                      >
                        <View style={styles.appIconWrap}>
                          {data.user_data.appType == "Android" && (
                            <ScalableImage
                              source={require("../images/android.png")}
                              height={25}
                            />
                          )}
                          {data.user_data.appType == "Apple" && (
                            <ScalableImage
                              source={require("../images/apple.png")}
                              height={25}
                            />
                          )}
                          {data.user_data.appType == "" && (
                            <ScalableImage
                              source={require("../images/question1.png")}
                              height={25}
                            />
                          )}
                        </View>
                        <View style={styles.itemContentWrap}>
                          <Text style={{ fontSize: 18 }}>{data.name}</Text>
                          <Text>{data.lastHis}</Text>
                        </View>
                        <View style={styles.hisTimeWrap}>
                          <Text>{data.lastTime}</Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                  {this.state.openeds.map((data) => {
                    return (
                      <TouchableOpacity
                        onPress={() => this.simplechat(data.contact_id, data)}
                        style={styles.itemWrapopened}
                        key={data.contact_id}
                      >
                        <View style={styles.appIconWrap}>
                          {data.user_data.appType == "Android" && (
                            <ScalableImage
                              source={require("../images/android.png")}
                              height={25}
                            />
                          )}
                          {data.user_data.appType == "Apple" && (
                            <ScalableImage
                              source={require("../images/apple.png")}
                              height={25}
                            />
                          )}
                          {data.user_data.appType == "" && (
                            <ScalableImage
                              source={require("../images/question1.png")}
                              height={25}
                            />
                          )}
                        </View>
                        <View style={styles.itemContentWrap}>
                          <Text style={{ fontSize: 18 }}>{data.name}</Text>
                          <Text>{data.lastHis}</Text>
                        </View>
                        <View style={styles.hisTimeWrap}>
                          <Text>{data.lastTime}</Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                  {this.state.completeds.map((data) => {
                    return (
                      <TouchableOpacity
                        onPress={() => this.simplechat(data.contact_id, data)}
                        style={styles.itemWrapcompleted}
                        key={data.contact_id}
                      >
                        <View style={styles.appIconWrap}>
                          {data.user_data.appType == "Android" && (
                            <ScalableImage
                              source={require("../images/android.png")}
                              height={25}
                            />
                          )}
                          {data.user_data.appType == "Apple" && (
                            <ScalableImage
                              source={require("../images/apple.png")}
                              height={25}
                            />
                          )}
                          {data.user_data.appType == "" && (
                            <ScalableImage
                              source={require("../images/question1.png")}
                              height={25}
                            />
                          )}
                        </View>
                        <View style={styles.itemContentWrap}>
                          <Text style={{ fontSize: 18 }}>{data.name}</Text>
                          <Text>{data.lastHis}</Text>
                        </View>
                        <View style={styles.hisTimeWrap}>
                          <Text>{data.lastTime}</Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                  {this.state.requests.map((data) => {
                    return (
                      <TouchableOpacity
                        onPress={() => this.simplechat(data.contact_id, data)}
                        style={styles.itemWrapcompleted}
                        key={data.contact_id}
                      >
                        <View style={styles.appIconWrap}>
                          {data.user_data.appType == "Android" && (
                            <ScalableImage
                              source={require("../images/android.png")}
                              height={25}
                            />
                          )}
                          {data.user_data.appType == "Apple" && (
                            <ScalableImage
                              source={require("../images/apple.png")}
                              height={25}
                            />
                          )}
                          {data.user_data.appType == "" && (
                            <ScalableImage
                              source={require("../images/question1.png")}
                              height={25}
                            />
                          )}
                        </View>
                        <View style={styles.itemContentWrap}>
                          <Text style={{ fontSize: 18 }}>{data.name}</Text>
                          <Text>{data.lastHis}</Text>
                        </View>
                        <View style={styles.hisTimeWrap}>
                          <Text>{data.lastTime}</Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </>
              ) : (
                <View
                  style={{
                    alignItems: "center",
                    justifyContent: "center",
                    marginTop: 50,
                  }}
                >
                  <Progress.Circle size={30} indeterminate={true} />
                </View>
              )}
            </View>
          </ScrollView>
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
    // paddingHorizontal: 15,
    paddingBottom: 20,
  },
  input: {
    width: Dimensions.get("window").width - 90,
    borderWidth: 1,
    borderColor: "#e7e7e7",
    marginVertical: 15,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  titleWrap: {
    marginTop: 20,
    marginHorizontal: 20,
    marginBottom: 10,
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
  itemWrapunread: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: "#cbeef6",
    alignItems: "center",
    borderBottomWidth: 0,
    borderBottomColor: "#666",
  },
  itemWrapopened: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: "#f7f8d5",
    alignItems: "center",
    borderBottomWidth: 0,
    borderBottomColor: "#666",
  },
  itemWrapcompleted: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: "#cffbdc",
    alignItems: "center",
    borderBottomWidth: 0,
    borderBottomColor: "#666",
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
});
