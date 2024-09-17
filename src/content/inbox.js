import React, { Component } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import axios from "axios";
import * as Progress from "react-native-progress";
import FadeInView from "react-native-fade-in-view";
import Hyperlink from "react-native-hyperlink";
import DocumentPicker from "react-native-document-picker";
import { launchImageLibrary } from "react-native-image-picker";
import Signature from "react-native-signature-canvas";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getHeaders } from "./Helper";

const numberPerPage = 10;
// import
export default class Inbox extends Component {
  constructor(props) {
    super(props);
    this.state = {
      login: 0,
      back: 0,
      data: [],
      checked: false,
      next: false,
      post_id: 0,
      uploadingStatue: [],
      progressVal: 0.3,
      viewSignature: 0,
      signatureArrayBuffer: null,
      setSignatureArrayBuffer: null,
      pageIndex: 1,
      viewData: [],
      notes: [],
      loadMoreView: false,
      loading: true,
    };

    this.options = {
      title: this.props.translate("selectImage"),
      //customButtons: [{ name: 'fb', title: 'Choose Photo from Facebook' }],
      storageOptions: {
        skipBackup: true,
        path: "images",
      },
    };
    this.uploadingStatueTmp = [];
  }
  componentDidMount = () => {
    this.getContactPostsReminders();
  };
  getNotesFromConversation = async () => {
    const jwt = await AsyncStorage.getItem("jwtToken");

    const response = await axios({
      method: "get",
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
      url: "https://api.qix.cloud/conversation",
    }).catch((error) => {
      console.log("conversation error", error);
    });

    if (response?.data?.cases) {
      const cases = response.data.cases;

      return cases.map((item) => {
        return {
          body: item.details,
          createdAt: item.timestamp,
        };
      });
    } else {
      return [];
    }
  };
  getContactPostsReminders = async () => {
    this.setState({ loading: true });

    const conversationNotes = await this.getNotesFromConversation().finally(
      () => {
        this.setState({ loading: false });
      }
    );
    const sortedNotes = conversationNotes
      .slice()
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    this.setState({ notes: sortedNotes });
  };

  updatePagenation = () => {
    var page = this.state.pageIndex + 1;
    var tmp = [];
    for (i = 0; i < this.state.data.length; i++) {
      if (i >= numberPerPage * page) break;
      tmp.push(this.state.data[i]);
    }
    this.setState({ viewData: tmp });
    if (this.state.data.length <= numberPerPage * page) {
      this.setState({ loadMoreView: false });
    } else {
      this.setState({ loadMoreView: true });
    }
    this.setState({ pageIndex: page });
  };
  submitAsk = (id, option) => {
    const params = new FormData();
    params.append("method", "submitContactPosts");
    params.append("post_id", id);
    params.append("author_id", global.contactId);
    params.append("author", global.name);
    params.append("meta_key", "Ask");
    params.append("meta_value", option);
    console.log("submitContactPosts");
    axios({
      method: "post",
      headers: {
        "Content-Type": "multipart/form-data",
      },
      url: global.baseUrl + "wp-admin/admin-ajax.php?action=contact_api",
      data: params,
    }).then((res) => {
      console.log(res.data);
      Alert.alert(this.props.translate("Success"));
      this.getContactPostsReminders();
    });
  };
  _onSendFileProcessing = (url, name, type) => {
    this.setState({ progressVal: 0.3 });
    const second = Math.floor(Date.now() / 1000);
    var data = new FormData();
    data.append("file", {
      uri: url,
      name: global.contactId + "-" + name, //second + '-' + name,
      type: type,
    });
    data.append("method", "submitContactPosts");
    data.append("author_id", global.contactId);
    data.append("post_id", this.state.post_id);
    data.append("author", global.name);
    data.append("meta_key", "Request");
    var path = global.baseUrl + "wp-admin/admin-ajax.php?action=contact_api";
    this.uploadingStatueTmp[this.state.post_id] = 1;
    this.setState({ uploadingStatue: this.uploadingStatueTmp });
    var uThis = this;
    setTimeout(function () {
      uThis.setState({ progressVal: 0.5 });
    }, 500);
    setTimeout(function () {
      uThis.setState({ progressVal: 0.8 });
    }, 1000);
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
        this.setState({ progressVal: 1 });
        this.uploadingStatueTmp[this.state.post_id] = 0;
        this.setState({ uploadingStatue: this.uploadingStatueTmp });
        //   setTimeout(function(){
        // 	  uThis.uploadingStatueTmp[uThis.state.post_id] = 0;
        // 	  uThis.setState({uploadingStatue: uThis.uploadingStatueTmp});
        //   }, 500);
        Alert.alert(this.props.translate("Success"));
        this.getContactPostsReminders();
      })
      .catch((error) => {
        console.error(error);
      });
  };
  browser = async () => {
    await launchImageLibrary(this.options, (response) => {
      if (!response.didCancel) {
        this._onSendFileProcessing(
          response.assets[0].uri,
          response.assets[0].fileName,
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
      if (DocumentPicker.isCancel(err)) {
      } else {
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
  uploadDocument = (id) => {
    this.setState({ post_id: id });
    //this.fileBrowser();
    // - this.browser();
    Alert.alert(
      "Select Library.",
      "",
      [
        {
          text: "Photo",
          onPress: () => {
            this.browser();
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
  donwloadAttached = (id, file) => {
    const params = new FormData();
    params.append("method", "submitContactPosts");
    params.append("post_id", id);
    params.append("author_id", global.contactId);
    params.append("author", global.name);
    params.append("meta_key", "Attach");
    params.append("meta_value", 1);
    console.log("submitContactPosts");
    axios({
      method: "post",
      headers: {
        "Content-Type": "multipart/form-data",
      },
      url: global.baseUrl + "wp-admin/admin-ajax.php?action=contact_api",
      data: params,
    }).then((res) => {
      Linking.openURL(file);
    });
  };
  viewDocument = (file) => {
    Linking.openURL(file);
  };
  signDocument = (id) => {
    this.setState({ post_id: id });
    this.setState({ viewSignature: 1 });
  };
  handleSignature = (signature) => {
    console.log("___handleSignature -> Start");
    //console.log(signature);
    const params = new FormData();
    params.append("method", "submitContactPosts");
    params.append("post_id", this.state.post_id);
    params.append("author_id", global.contactId);
    params.append("author", global.name);
    params.append("meta_key", "signature");
    params.append("meta_value", 1);
    params.append("signature", signature);
    console.log(global.name);
    axios({
      method: "post",
      headers: {
        "Content-Type": "multipart/form-data",
      },
      url: global.baseUrl + "wp-admin/admin-ajax.php?action=contact_api",
      data: params,
    }).then((res) => {
      console.log("signature", res.data);
      this.getContactPostsReminders();
    });
    this.setState({ viewSignature: 0 });
  };
  render() {
    const convertUTC = (utcString) => {
      const date = new Date(utcString);

      const day = ("0" + date.getDate()).slice(-2);
      const month = ("0" + (date.getMonth() + 1)).slice(-2);
      const year = date.getFullYear();
      let hours = date.getHours();
      const minutes = ("0" + date.getMinutes()).slice(-2);

      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12;
      hours = hours ? hours : 12; // La hora '0' debe ser '12'
      hours = ("0" + hours).slice(-2); // Relleno

      const formattedDate = `${month}/${day}/${year} ${hours}:${minutes} ${ampm}`;

      return formattedDate;
    };

    const renderNote = ({ item, index }) => {
      const addHttpsToLinks = (text) => {
        const urlRegex = /\bwww\.\S+/gi;

        const rawUrls = text.match(urlRegex) || [];

        const newText = text.replace(urlRegex, (url) => "https://" + url);

        const allUrlRegex = /https?:\/\/\S+/gi;
        const allUrls = newText.match(allUrlRegex) || [];

        const tokens = newText.split(allUrlRegex);
        let index = 0;

        const elements = [];
        tokens.forEach((token, i) => {
          elements.push(<Text key={index++}>{token}</Text>);

          if (i < allUrls.length) {
            elements.push(
              <Text
                key={index++}
                style={{ color: "#2980b9" }}
                onPress={() => Linking.openURL(allUrls[i])}
              >
                {allUrls[i] + " "}
              </Text>
            );
          }
        });

        return elements;
      };

      return (
        <FadeInView duration={750}>
          <View style={styles.activeNote}>
            <View style={{ width: "100%" }}>
              <Text
                allowFontScaling={false}
                style={{
                  fontFamily: "Eina03-Regular",
                  color: "#000",
                  fontSize: 18,
                  marginBottom: 10,
                }}
              >
                {addHttpsToLinks(item.body)}
              </Text>
            </View>

            <Text
              allowFontScaling={false}
              style={{ color: "#000", fontSize: 15 }}
            >
              {convertUTC(item.createdAt)}
            </Text>
          </View>
        </FadeInView>
      );
    };

    if (this.state.notes.length === 0) {
      if (this.state.loading) {
        return (
          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
              marginTop: "50%",
            }}
          >
            <ActivityIndicator color={"white"} />
          </View>
        );
      }

      return (
        <View style={{ alignItems: "center", justifyContent: "center" }}>
          <Text style={{ fontFamily: "Eina03-Regular" }}>
            {this.props.translate("noResults")}
          </Text>
        </View>
      );
    } else {
      return <FlatList data={this.state.notes} renderItem={renderNote} />;
    }

    return (
      <>
        {this.state.viewSignature ? (
          <Signature
            onOK={(sig) => this.handleSignature(sig)}
            onEmpty={() => console.log("___onEmpty")}
            descriptionText={this.props.translate("pleaseSignHere")}
            clearText={this.props.translate("clear")}
            confirmText={this.props.translate("save")}
            webStyle={".m-signature-pad{height: 250px;margin: auto;}"}
          />
        ) : (
          <ScrollView
            style={{
              minHeight: 100,
              width: "100%",
              textAlign: "center",
              marginBottom: 50,
              paddingTop: 10,
            }}
          >
            {this.state.data.length > 0 ? (
              this.state.data[0] != "no" ? (
                this.state.viewData.map((app) => {
                  if (app.appMsgType == "Ask") {
                    var ask = 0;
                    var i;
                    var meta = app.meta;
                    for (i = 0; i < meta.length; i++) {
                      if (meta[i].meta_key == "Ask") {
                        ask = meta[i].meta_value;
                      }
                    }
                  }
                  var signature = 0;
                  var signedPdf = "";
                  if (app.appMsgType == "signature") {
                    var i;
                    var meta = app.meta;
                    for (i = 0; i < meta.length; i++) {
                      if (meta[i].meta_key == "signature") {
                        signature = meta[i].meta_value;
                      }
                      if (meta[i].meta_key == "signedPdf") {
                        signedPdf = meta[i].meta_value;
                      }
                    }
                  }
                  return (
                    <FadeInView duration={750}>
                      <View
                        style={
                          app.noteCount > 0 ? styles.activeNote : styles.note
                        }
                      >
                        <View style={{ width: "100%" }}>
                          <Hyperlink
                            linkDefault={true}
                            linkStyle={{ color: "#2980b9" }}
                          >
                            <Text
                              allowFontScaling={false}
                              style={{
                                fontFamily: "Eina03-Regular",
                                color: "#000",
                                fontSize: 18,
                                marginBottom: 10,
                              }}
                            >
                              {app.message}
                            </Text>
                          </Hyperlink>
                        </View>
                        <View style={{ width: "100%", flexDirection: "row" }}>
                          {
                            (app.status = "Send to user" ? (
                              <>
                                <Text
                                  allowFontScaling={false}
                                  style={{ color: "#000", fontSize: 15 }}
                                >
                                  By:{" "}
                                </Text>
                                <Text
                                  allowFontScaling={false}
                                  style={{ color: "#000", fontSize: 15 }}
                                >
                                  {app.author}{" "}
                                </Text>
                              </>
                            ) : (
                              <Text
                                allowFontScaling={false}
                                style={{ color: "#000", fontSize: 15 }}
                              >
                                {app.status}{" "}
                              </Text>
                            ))
                          }
                          <Text
                            allowFontScaling={false}
                            style={{ color: "#000", fontSize: 15 }}
                          >
                            {app.date}
                          </Text>
                        </View>
                        {app.appMsgType == "Ask" && (
                          <View style={{ width: "100%", flexDirection: "row" }}>
                            <TouchableOpacity
                              onPress={() => this.submitAsk(app.id, 1)}
                              style={
                                ask == "1" ? styles.button1 : styles.button2
                              }
                            >
                              <Text
                                style={
                                  ask == "1"
                                    ? styles.button1Txt
                                    : styles.button2Txt
                                }
                              >
                                {app.option1}
                              </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              onPress={() => this.submitAsk(app.id, 2)}
                              style={
                                ask == "2" ? styles.button1 : styles.button2
                              }
                            >
                              <Text
                                style={
                                  ask == "2"
                                    ? styles.button1Txt
                                    : styles.button2Txt
                                }
                              >
                                {app.option2}
                              </Text>
                            </TouchableOpacity>
                          </View>
                        )}
                        {app.appMsgType == "Request" && (
                          <>
                            {app.meta.map((m) => {
                              if (m.meta_key == "Request") {
                                fileNameIndex =
                                  m.meta_value.lastIndexOf("/") + 1;
                                filename = m.meta_value.substr(fileNameIndex);
                              }
                              return (
                                m.meta_key == "Request" && (
                                  <View
                                    style={{
                                      width: "100%",
                                      flexDirection: "row",
                                    }}
                                  >
                                    <TouchableOpacity
                                      onPress={() =>
                                        Linking.openURL(m.meta_value)
                                      }
                                    >
                                      <Text
                                        style={{ fontSize: 15, marginTop: 10 }}
                                      >
                                        {filename}
                                      </Text>
                                    </TouchableOpacity>
                                  </View>
                                )
                              );
                            })}
                            <View
                              style={{ width: "100%", flexDirection: "row" }}
                            >
                              {this.state.uploadingStatue[app.id] ? (
                                <View style={styles.button}>
                                  <Progress.Bar
                                    progress={this.state.progressVal}
                                    width={200}
                                  />
                                </View>
                              ) : (
                                <TouchableOpacity
                                  onPress={() => this.uploadDocument(app.id)}
                                  style={styles.button}
                                >
                                  <Image
                                    source={require("./images/upload.png")}
                                    style={{
                                      width: 25,
                                      height: 20,
                                      position: "absolute",
                                      left: 5,
                                      top: 5,
                                    }}
                                  />
                                  <Text
                                    style={{ fontSize: 15, marginLeft: 30 }}
                                  >
                                    {this.props.translate("UploadDocument")}
                                  </Text>
                                </TouchableOpacity>
                              )}
                            </View>
                          </>
                        )}
                        {app.appMsgType == "Attach" && (
                          <View style={{ width: "100%", flexDirection: "row" }}>
                            <TouchableOpacity
                              onPress={() =>
                                this.donwloadAttached(app.id, app.attachmentUrl)
                              }
                              style={styles.button}
                            >
                              <Image
                                source={require("./images/book.png")}
                                style={{
                                  width: 15,
                                  height: 21,
                                  position: "absolute",
                                  left: 5,
                                  top: 3,
                                }}
                              />
                              <Text style={{ fontSize: 15, marginLeft: 20 }}>
                                {this.props.translate("DownloadDocument")}
                              </Text>
                            </TouchableOpacity>
                          </View>
                        )}
                        {app.appMsgType == "signature" && (
                          <View style={{ width: "100%", flexDirection: "row" }}>
                            {signature == 1 ? (
                              <>
                                <TouchableOpacity
                                  onPress={() =>
                                    this.viewDocument(
                                      "https://qix.cloud" + signedPdf
                                    )
                                  }
                                  style={styles.button}
                                >
                                  <Image
                                    source={require("./images/book.png")}
                                    style={{
                                      width: 15,
                                      height: 21,
                                      position: "absolute",
                                      left: 5,
                                      top: 3,
                                    }}
                                  />
                                  <Text
                                    style={{ fontSize: 15, marginLeft: 20 }}
                                  >
                                    {this.props.translate("viewDocument")}
                                  </Text>
                                </TouchableOpacity>
                                <Text
                                  style={{
                                    fontSize: 15,
                                    marginLeft: 20,
                                    marginTop: 13,
                                    color: "green",
                                  }}
                                >
                                  {this.props.translate("signed")}
                                </Text>
                              </>
                            ) : (
                              <>
                                <TouchableOpacity
                                  onPress={() =>
                                    this.viewDocument(app.attachmentUrl)
                                  }
                                  style={styles.button}
                                >
                                  <Image
                                    source={require("./images/book.png")}
                                    style={{
                                      width: 15,
                                      height: 21,
                                      position: "absolute",
                                      left: 5,
                                      top: 3,
                                    }}
                                  />
                                  <Text
                                    style={{ fontSize: 15, marginLeft: 20 }}
                                  >
                                    {this.props.translate("viewDocument")}
                                  </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                  onPress={() => this.signDocument(app.id)}
                                  style={styles.button3}
                                >
                                  <Text style={{ fontSize: 15 }}>
                                    {this.props.translate("signDocument")}
                                  </Text>
                                  <Image
                                    source={require("./images/pen.png")}
                                    style={{
                                      width: 20,
                                      height: 20,
                                      position: "absolute",
                                      right: 5,
                                      top: 3,
                                    }}
                                  />
                                </TouchableOpacity>
                              </>
                            )}
                          </View>
                        )}
                      </View>
                    </FadeInView>
                  );
                })
              ) : (
                <View
                  style={{ alignItems: "center", justifyContent: "center" }}
                >
                  <Text style={{ fontFamily: "Eina03-Regular" }}>
                    {this.props.translate("noResults")}
                  </Text>
                </View>
              )
            ) : (
              <View style={{ alignItems: "center", justifyContent: "center" }}>
                {/* <Image source={require('../images/loading.gif')} style={{ width: 50, height:50 }} /> */}
                <Progress.Circle size={30} indeterminate={true} />
              </View>
            )}
            {this.state.loadMoreView ? (
              <View style={{ alignItems: "center", justifyContent: "center" }}>
                <TouchableOpacity
                  onPress={() => this.updatePagenation()}
                  style={styles.button2}
                >
                  <Text style={{ fontFamily: "Eina03-Regular" }}>
                    {this.props.translate("loadMore")}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <></>
            )}
          </ScrollView>
        )}
      </>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
    ...Platform.select({
      ios: {
        paddingTop: 10,
      },
    }),
  },
  noteContainer: {
    fontFamily: "Eina03-Bold",
    position: "absolute",
    top: -22,
    right: -18,
    paddingTop: 1,
    paddingHorizontal: 5,
    backgroundColor: "red",
    borderRadius: 10,
    alignItems: "center",
    maxWidth: 20,
  },
  note: {
    fontFamily: "Eina03-Regular",
    marginLeft: "5%",
    marginBottom: 10,
    width: "90%",
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderRadius: 10,
    borderWidth: 1,
  },
  activeNote: {
    fontFamily: "Eina03-Regular",
    borderWidth: 1,
    borderColor: "green",
    marginLeft: "5%",
    marginBottom: 10,
    width: "90%",
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderRadius: 10,
  },
  button: {
    fontFamily: "Eina03-Regular",
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginTop: 10,
    marginRight: 10,
  },
  button1: {
    fontFamily: "Eina03-Regular",
    paddingHorizontal: 15,
    paddingVertical: 3,
    marginTop: 10,
    marginRight: 20,
    borderRadius: 5,
    backgroundColor: "#41b2f8",
    color: "#fff",
  },
  button1Txt: {
    fontSize: 15,
    color: "#fff",
  },
  button2: {
    fontFamily: "Eina03-Regular",
    paddingHorizontal: 15,
    paddingVertical: 3,
    marginTop: 10,
    marginRight: 20,
    borderRadius: 5,
    backgroundColor: "#eee",
  },
  button3: {
    fontFamily: "Eina03-Regular",
    paddingLeft: 10,
    paddingRight: 35,
    paddingVertical: 5,
    marginTop: 10,
    marginRight: 20,
    borderRadius: 5,
    backgroundColor: "#eee",
  },
  button2Txt: {
    fontSize: 15,
  },
});
