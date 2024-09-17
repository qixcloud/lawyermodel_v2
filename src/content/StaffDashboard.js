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
  Alert,
  ScrollView,
  Clipboard,
  ImageBackground,
} from "react-native";
import { Avatar, Badge, Icon, withBadge } from "react-native-elements";
import * as Progress from "react-native-progress";
import axios from "axios";
import DeviceInfo from "react-native-device-info";
import LinearGradient from "react-native-linear-gradient";
import Dialog, { DialogContent, DialogTitle } from "react-native-popup-dialog";
import DocumentPicker from "react-native-document-picker";
import ScalableImage from "react-native-scalable-image";
import Carousel from "react-native-snap-carousel";
import Hyperlink from "react-native-hyperlink";
import { launchImageLibrary } from "react-native-image-picker";

import messaging from "@react-native-firebase/messaging";
// import { useDarkMode } from 'react-native-dark-mode'
import RadioButton from "react-native-radio-button";
import RNSearchablePicker from "react-native-searchable-picker";
import SearchInput, { createFilter } from "react-native-search-filter";
import Call from "./Call";
import CallSetTarget from "./calling/callSetTarget";
let uniqueId = DeviceInfo.getUniqueId();
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import CustomBackground from "./components/CustomBackground";
import Comunication from "./staff/Comunication";

import Lottie from "./lottie/Lottie";
// import
const KEYS_TO_FILTERS = ["label"];

export default class StaffDashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      inputPhone: this.props.phoneNumber,
      errorTxt: "",
      isDialogVisible: false,
      token: "",
      displayQR: 0,
      action1: 0,
      action2: 0,
      action3: 0,
      action4: 0,
      actionGen1: 0,
      actionGen2: 0,
      actionGen3: 1,
      actionSign1: 1,
      actionSign2: 0,
      selectedAction: 0,
      addPost: false,
      postImageSource: require("./images/empty_image.png"),
      sliderItems: [],
      clientUsers: [],
      pendingItems: [],
      actionRadio: "Send to user",
      actionSignRadio: "Send as user",
      selectedUser: 0,
      requestCount: "",
      pendingCount: "",
      notificationsStatus: 0,
      signPendingStatus: 0,
      postViewStatus: 0,
      postPhotoUrl: "",
      postPhotoName: "",
      postPhotoType: "",
      docUrl: "",
      docName: "",
      docType: "",
      postmessage: "",
      postTempPhotoSource: "",
      postSubmitStatus: 0,
      totalLikes: "",
      option1: "",
      option2: "",
      actionMsg: "",
      submitActionStatus: 0,
      searchTerm: "",
      viewSearchList: 0,
      selectedUserLabel: "",
      searchTemplate: "",
      selectedTempLabel: "",
      signTemplate: [],
      viewTemplateList: 0,
      SignatureUrl: "",
      SignatureName: "",
      Signature1: "",
      Signature2: "",
      callStatus: 0,
      selectCalleeType: "",
      calleeId: 0,
      comunicateState: 0,
      menuStatus: -1,
      moreStatus: false,
      appLink: "",
      sharePhone: "",
      badgeCount: 0,
      newClientDialogStatus: false,
      newClientName: "",
      newClientPhone: "",
      newStaffDialogStatus: false,
      newStaffName: "",
      newStaffPhone: "",
      newStaffEmail: "",
      viewSignature: false,
      selectedSignatureDetails: "",
      staffName: "",
    };
    global.apps = [];
    this.options = {
      title: this.props.translate("selectImage"),
      //customButtons: [{ name: 'fb', title: 'Choose Photo from Facebook' }],
      storageOptions: {
        skipBackup: true,
        path: "images",
      },
    };
    console.log("height", Dimensions.get("window").height * 0.7);
    //console.log('height', 340/Dimensions.get('window').height*100);
  }
  componentDidMount = async () => {
    this.sheetRef = React.createRef();
    const token = await this.getToken();
    this.setState({ token: token });
    this.getPostsItems();
    this.getChatUserListForStaff();
    this.getSignPending();
    this.getStaffNotificationsCount();
    this.getSignTemplates();
    this.getAppLinkAndPhone();
    this.getComunicateListCount();
    this.getStaffNameById();
    messaging().onMessage(async (remoteMessage) => {
      //Alert.alert('A new FCM message arrived!', JSON.stringify(remoteMessage));
      if (remoteMessage.notification.title.indexOf("Log In Code") > -1) {
        Alert.alert("Log In Code", remoteMessage.notification.body);
      }
    });
  };
  getStaffNameById = () => {
    const params = new FormData();
    params.append("staffId", global.staffId);
    axios({
      method: "post",
      headers: {
        "Content-Type": "multipart/form-data",
      },
      url: global.baseUrl + "wp-admin/admin-ajax.php?action=getStaffNameById",
      data: params,
    }).then((res) => {
      this.setState({ staffName: res.data.trim() });
    });
  };
  getComunicateListCount = () => {
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
      this.setState({
        badgeCount: res.data.opened.length + res.data.unread.length,
      });
    });
  };
  getAppLinkAndPhone = (id = 0) => {
    const params = new FormData();
    axios({
      method: "post",
      headers: {
        "Content-Type": "multipart/form-data",
      },
      url: global.baseUrl + "wp-admin/admin-ajax.php?action=getAppLinkAndPhone",
      data: params,
    }).then((res) => {
      console.log(res.data);
      this.setState({ appLink: res.data.app_link.trim() });
      this.setState({ sharePhone: res.data.phone.trim() });
    });
  };
  getSignTemplates = (id = 0) => {
    const params = new FormData();
    params.append("id", id);
    axios({
      method: "post",
      headers: {
        "Content-Type": "multipart/form-data",
      },
      url:
        global.baseUrl + "wp-admin/admin-ajax.php?action=getSignatureTemplate",
      data: params,
    }).then((res) => {
      this.setState({ signTemplate: res.data });
    });
  };
  getStaffNotificationsCount = () => {
    const params = new FormData();
    params.append("method", "getStaffNotificationsCount");
    params.append("staffId", global.staffId);
    axios({
      method: "post",
      headers: {
        "Content-Type": "multipart/form-data",
      },
      url: global.baseUrl + "wp-admin/admin-ajax.php?action=contact_api",
      data: params,
    }).then((res) => {
      this.setState({ requestCount: res.data.request });
      this.setState({ pendingCount: res.data.pending });
      this.setState({ notificationsStatus: 1 });
    });
  };
  createStaffPost = () => {
    if (this.state.postPhotoUrl != "" && this.state.postmessage != "") {
      const second = Math.floor(Date.now() / 1000);
      var data = new FormData();
      data.append("photo", {
        uri: this.state.postPhotoUrl,
        name: second + this.state.postPhotoName,
        type: "image/jpg",
      });
      data.append("method", "createStaffPost");
      data.append("staffId", global.staffId);
      data.append("message", this.state.postmessage);
      this.setState({ postSubmitStatus: 1 });
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
          this.setState({ postSubmitStatus: 0 });
          this.setState({ addPost: false });
          this.setState({ postViewStatus: 0 });
          this.getPostsItems();
        })
        .catch((error) => {
          console.error(error);
        });
    }
  };
  getSignPending = () => {
    const params = new FormData();
    params.append("method", "getContactPostSignatureByStaff");
    params.append("staffId", global.staffId);
    axios({
      method: "post",
      headers: {
        "Content-Type": "multipart/form-data",
      },
      url: global.baseUrl + "wp-admin/admin-ajax.php?action=contact_api",
      data: params,
    }).then((res) => {
      //console.log("pendingItems", res.data.signPending);
      this.setState({ pendingItems: res.data.signPending });
      this.setState({ signPendingStatus: 1 });
    });
  };
  getChatUserListForStaff = () => {
    const params = new FormData();
    params.append("method", "chatUserListForStaff");
    params.append("staffId", global.staffId);
    axios({
      method: "post",
      headers: {
        "Content-Type": "multipart/form-data",
      },
      url: global.baseUrl + "wp-admin/admin-ajax.php?action=contact_api",
      data: params,
    }).then((res) => {
      //console.log("Items", res.data.users);
      this.setState({ clientUsers: res.data.users });
    });
  };
  getPostsItems = () => {
    const params = new FormData();
    params.append("method", "getStaffPosts");
    params.append("staffId", global.staffId);
    axios({
      method: "post",
      headers: {
        "Content-Type": "multipart/form-data",
      },
      url: global.baseUrl + "wp-admin/admin-ajax.php?action=contact_api",
      data: params,
    }).then((res) => {
      this.setState({ sliderItems: res.data.posts });
      this.setState({ totalLikes: res.data.totalLikes });
      this.setState({ postViewStatus: 1 });
    });
  };
  brower = async () => {
    await launchImageLibrary(this.options, (response) => {
      //console.log(response);
      if (!response.didCancel) {
        if (response.assets[0].fileSize < 5000000) {
          this._onPostPhotoProcessing(
            response.assets[0].uri,
            "photo.jpg",
            response.assets[0].type
          );
        } else {
          Alert.alert(this.props.translate("imageSizeError"));
        }
      }
    });
  };
  fileBrowser = async () => {
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
      });
      if (res.size < 5000000) {
        this._onPostPhotoProcessing(res.uri, res.name, res.type);
      } else {
        Alert.alert(this.props.translate("imageSizeError"));
      }
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
      } else {
        throw err;
      }
    }
  };
  actionFileBrowser = async () => {
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
      });
      if (res.type != "application/pdf") {
        Alert.alert(this.props.translate("docTypeError"));
      } else {
        this._onDocumentProcessing(res.uri, res.name, res.type);
      }
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
      } else {
        throw err;
      }
    }
  };
  _onDocumentProcessing = (url, name, type) => {
    //console.log(url, name, type);
    this.setState({ docUrl: url });
    this.setState({ docName: name });
    this.setState({ docType: type });
  };
  selectPostPhoto = () => {
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
  _onPostPhotoProcessing = (url, name, type) => {
    //console.log({uri:url}, name, type);
    this.setState({ postPhotoUrl: url });
    this.setState({ postPhotoName: name });
    this.setState({ postPhotoType: type });
    this.setState({ postTempPhotoSource: { uri: url } });
  };
  getToken = async () => {
    //get the messeging token
    const token = await messaging().getToken();
    // console.log('token',token);
    return token;
  };
  gotoSite = () => {
    Linking.openURL(global.baseUrl);
  };
  onSuccess = (e) => {
    this.setState({ inputEmail: e.data });
    this.checkLogin("qr", e.data);
    //console.log(e.data)
    //this.setState({displayQR: 0});
  };
  displayQRDialog = () => {
    this.setState({ displayQR: 1 });
  };
  changeActionSignRadio = (value) => {
    if (value == "Send to user") {
      this.setState({ actionSign2: 0 });
      this.setState({ actionSign1: 1 });
    } else {
      this.setState({ actionSign1: 0 });
      this.setState({ actionSign2: 1 });
    }
    this.setState({ actionSignRadio: value });
    this.setState({ actionRadio: value });
  };
  changeActionRadio = (value) => {
    if (value == "Send to user") {
      this.setState({ actionGen1: 0 });
      this.setState({ actionGen2: 0 });
      this.setState({ actionGen3: 1 });
    } else if (value == "Complete") {
      this.setState({ actionGen1: 0 });
      this.setState({ actionGen2: 1 });
      this.setState({ actionGen3: 0 });
    } else {
      this.setState({ actionGen1: 1 });
      this.setState({ actionGen2: 0 });
      this.setState({ actionGen3: 0 });
    }
    this.setState({ actionRadio: value });
    this.setState({ actionSignRadio: value });
  };
  updateActionStatue = (id, status = 0) => {
    this.setState({ docUrl: "" });
    this.setState({ docName: "" });
    this.setState({ docType: "" });
    if (id == 1) {
      this.setState({ action1: status });
      this.setState({ action2: 0 });
      this.setState({ action3: 0 });
      this.setState({ action4: 0 });
    } else if (id == 2) {
      this.setState({ action2: status });
      this.setState({ action1: 0 });
      this.setState({ action3: 0 });
      this.setState({ action4: 0 });
    } else if (id == 3) {
      this.setState({ action3: status });
      this.setState({ action2: 0 });
      this.setState({ action1: 0 });
      this.setState({ action4: 0 });
    } else if (id == 4) {
      this.setState({ action4: status });
      this.setState({ action2: 0 });
      this.setState({ action3: 0 });
      this.setState({ action1: 0 });
    }
    if (status == 1) {
      this.setState({ selectedAction: id });
    } else {
      this.setState({ selectedAction: 0 });
    }
    this.displayMenu(-1);
  };
  addPostDialog = () => {
    this.setState({ selectedAction: 0 });
    this.setState({ action1: 0 });
    this.setState({ action2: 0 });
    this.setState({ action3: 0 });
    this.setState({ action4: 0 });
    this.setState({ addPost: true });
  };
  submitActionData = () => {
    //console.log("submitActionData", this.state.selectedAction);
    var params = new FormData();
    if (this.state.selectedUser == 0 || this.state.actionMsg == "") {
      return false;
    }
    if (this.state.selectedAction == 1) {
      params.append("appMsgType", "Request");
    } else if (this.state.selectedAction == 2) {
      params.append("appMsgType", "Attach");
    } else if (this.state.selectedAction == 3) {
      if (this.state.option1 == "" || this.state.option2 == "") {
        return false;
      }
      params.append("appMsgType", "Ask");
    } else if (this.state.selectedAction == 4) {
      params.append("appMsgType", "signature");
    }
    if (this.state.selectedAction == 2) {
      if (this.state.docUrl == "") {
        return false;
      }
      params.append("document", {
        uri: this.state.docUrl,
        name: second + ".pdf",
        type: "application/pdf",
      });
    }
    this.setState({ submitActionStatus: 1 });
    params.append("option1", this.state.option1);
    params.append("option2", this.state.option2);
    params.append("attachmentUrl", "");
    params.append("attachmentName", "");
    params.append("SignatureUrl", this.state.SignatureUrl);
    params.append("SignatureName", this.state.SignatureName);
    params.append("Signature1", this.state.Signature1);
    params.append("Signature2", this.state.Signature2);
    params.append("status", this.state.actionRadio);
    params.append("post_id", "");
    params.append("contact_id", this.state.selectedUser);
    params.append("author_id", global.staffId);
    params.append("author", "");
    params.append("msg", this.state.actionMsg);
    params.append("from", "App");
    //console.log("params", params);
    var path =
      global.baseUrl + "wp-admin/admin-ajax.php?action=updateContactPost";
    fetch(path, {
      header: {
        Accept: "application/json",
        "Content-Type": "multipart/form-data",
      },
      method: "POST",
      body: params,
    })
      .then((response) => response.json())
      .then((responseJson) => {
        //console.log("responseJson", responseJson.id);
        this.setState({ submitActionStatus: 0 });
        Alert.alert(this.props.translate("Success"));

        const params1 = new URLSearchParams();
        params1.append("status", this.state.actionRadio);
        params1.append("msg", this.state.actionMsg);
        params1.append("contact_id", this.state.selectedUser);
        params1.append("lang", global.lang);
        params1.append("postId", responseJson.id);
        console.log("params1", params1);
        axios({
          method: "post",
          headers: {
            "Content-Type": "multipart/form-data",
          },
          url:
            global.baseUrl +
            "wp-admin/admin-ajax.php?action=updateContactPostNotification",
          data: params1,
        }).then((res) => {
          console.log("Success");
        });
      })
      .catch((error) => {
        console.error(error);
      });
  };
  updatePost = (id, type) => {
    //console.log(id);
    const params = new FormData();
    params.append("method", "updateStaffPost");
    params.append("staffId", global.staffId);
    params.append("postId", id);
    params.append("type", type);
    axios({
      method: "post",
      headers: {
        "Content-Type": "multipart/form-data",
      },
      url: global.baseUrl + "wp-admin/admin-ajax.php?action=contact_api",
      data: params,
    }).then((res) => {
      this.setState({ postViewStatus: 0 });
      this.getPostsItems();
    });
  };
  changeSelectUser = (text) => {
    this.setState({ selectedUser: text });
  };
  selectHandler = (item, label) => {
    //console.log(item);
    //this.setState({ selectedUser: item.value })
    this.setState({ selectedUser: item });
    this.setState({ selectedUserLabel: label });
    this.setState({ viewSearchList: 0 });
  };
  selectTempHandler = (item, label, url, Signature1, Signature2) => {
    //console.log(item);
    this.setState({ selectedTempLabel: label });
    this.setState({ SignatureUrl: url });
    this.setState({ SignatureName: label });
    this.setState({ Signature1: Signature1 });
    this.setState({ Signature2: Signature2 });
    this.setState({ viewTemplateList: 0 });
  };
  searchUpdated = (term) => {
    this.viewSearchList();
    this.setState({ searchTerm: term });
    this.setState({ selectedUserLabel: term });
  };
  searchUpdatedTemplate = (term) => {
    //console.log(term);
    this.setState({ selectedTempLabel: term });
    this.viewTemplateList();
  };
  viewSearchList = () => {
    this.setState({ viewSearchList: 1 });
  };
  viewTemplateList = () => {
    this.setState({ viewTemplateList: 1 });
  };
  changeCallStatus = (status) => {
    //console.log('callStatus', status);
    this.setState({ selectCalleeType: "" });
    this.setState({ callStatus: status });
    if (!status) this.setState({ calleeId: 0 });
  };
  sellectCollee = (type) => {
    console.log(type);
    this.setState({ selectCalleeType: type });
  };
  startEndCall = (id = 0, phone = "", app = 0) => {
    //console.log('calleeId', app);
    if (!app) {
      Alert.alert(this.props.translate("notHaveApp"));
    } else {
      this.setState({ calleeId: id });
    }
  };
  gotochat = (status) => {
    this.setState({ menuStatus: -1 });
    this.setState({ comunicateState: status });
  };
  gotocomingsoon = () => {};
  gotoMore = () => {
    this.setState({ moreStatus: true });
  };
  gotoback = () => {
    this.setState({ moreStatus: false });
  };
  addClient = () => {
    this.setState({ newClientDialogStatus: true });
    this.displayMenu(-1);
  };
  addNewClient = () => {
    if (this.state.newClientName == "" || this.state.newClientPhone == "") {
      Alert.alert(this.props.translate("pleaseInputValues"));
      return false;
    } else {
      const params = new FormData();
      params.append("name", this.state.newClientName);
      params.append("phone", this.state.newClientPhone);
      console.log(params);
      axios({
        method: "post",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        url:
          global.baseUrl + "wp-admin/admin-ajax.php?action=addNewConversation",
        data: params,
      }).then((res) => {
        Alert.alert(this.props.translate("Success"));
        this.setState({ newClientDialogStatus: false });
      });
    }
  };
  addStaff = () => {
    this.setState({ newStaffDialogStatus: true });
    this.displayMenu(-1);
  };
  addNewStaff = () => {
    if (
      this.state.newStaffName == "" ||
      this.state.newStaffEmail == "" ||
      this.state.newStaffPhone == ""
    ) {
      Alert.alert(this.props.translate("pleaseInputValues"));
      return false;
    }
    const params = new FormData();
    params.append("name", this.state.newStaffName);
    params.append("email", this.state.newStaffEmail);
    params.append("phone", this.state.newStaffPhone);
    console.log(params);
    axios({
      method: "post",
      headers: {
        "Content-Type": "multipart/form-data",
      },
      url: global.baseUrl + "wp-admin/admin-ajax.php?action=addNewStaffFromApp",
      data: params,
    }).then((res) => {
      if (res.data.trim() == "ok") {
        Alert.alert(this.props.translate("Success"));
      } else {
        Alert.alert(res.data.trim());
      }
      this.setState({ newStaffDialogStatus: false });
    });
  };
  shareAppLink = () => {
    console.log("appLink", this.state.appLink);
    Clipboard.setString(this.state.appLink);
    this.displayMenu(-1);
    Alert.alert(this.props.translate("copiedToClipboard"));
  };
  sharePhoneNumber = () => {
    //console.log(this.props.phoneNumber);
    console.log("phone", this.state.sharePhone);
    Clipboard.setString(this.state.sharePhone);
    this.displayMenu(-1);
    Alert.alert(this.props.translate("copiedToClipboard"));
  };
  signout = () => {
    this.props.signout();
  };
  closeActionStatue = () => {
    this.setState({ selectedAction: 0 });
  };
  handleSnapPress = (index) => {
    this.sheetRef.current?.snapToIndex(index);
  };
  handleSheetChanges = (index) => {
    this.setState({ menuStatus: index });
  };
  displayMenu = (status) => {
    this.setState({ menuStatus: status });
    if (status < 0) {
      this.sheetRef.current.close();
    } else {
      this.handleSnapPress(status);
    }
  };
  deletePendingSignature = () => {
    this.setState({ viewSignature: false });
    const params = new FormData();
    params.append("method", "deletePendingSignature");
    params.append("id", this.state.selectedSignatureDetails.id);
    console.log(params);
    axios({
      method: "post",
      headers: {
        "Content-Type": "multipart/form-data",
      },
      url: global.baseUrl + "wp-admin/admin-ajax.php?action=contact_api",
      data: params,
    }).then((res) => {
      Alert.alert(this.props.translate("Success"));
      this.setState({ pendingItems: [] });
      this.setState({ signPendingStatus: 0 });
      this.getSignPending();
    });
  };
  signatureDetails = (details) => {
    this.setState({ viewSignature: true });
    this.setState({ selectedSignatureDetails: details });
    console.log(details);
  };
  _renderItem = ({ item, index }) => {
    return (
      <View style={{ flexDirection: "row" }}>
        <LinearGradient
          colors={["#ff564f", "#2768ea"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientWrap}
        >
          <View style={styles.gradientView}>
            <TouchableOpacity
              onPress={() => this.signatureDetails(item[0])}
              style={{
                flexDirection: "row",
                justifyContent: "flex-start",
                alignItems: "center",
                overflow: "hidden",
              }}
            >
              <View style={{ width: "30%" }}>
                <View
                  style={{ marginBottom: -20, marginTop: -20, marginLeft: -20 }}
                >
                  {/* <Lottie icon={require('./lottie/icon10.json')} loop={true} width={80} /> */}
                  <ScalableImage
                    source={require("./images/gifs/lottie_pen.gif")}
                    width={80}
                  />
                </View>
              </View>
              <View style={{ width: "70%" }}>
                <Text style={{ textAlign: "right" }}>{item[0].name}</Text>
                <Text style={{ textAlign: "right" }}>{item[0].created}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </LinearGradient>
        {item.length > 1 && (
          <LinearGradient
            colors={["#ff564f", "#2768ea"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientWrap}
          >
            <View style={styles.gradientView}>
              <TouchableOpacity
                onPress={() => this.signatureDetails(item[1])}
                style={{
                  flexDirection: "row",
                  justifyContent: "flex-start",
                  alignItems: "center",
                  overflow: "hidden",
                }}
              >
                <View style={{ width: "30%" }}>
                  {/* <Image source={require("./images/edit.png")} style={{ width: 25, height:25, marginRight: 10 }} /> */}
                  <View
                    style={{
                      marginBottom: -20,
                      marginTop: -20,
                      marginLeft: -20,
                    }}
                  >
                    {/* <Lottie icon={require('./lottie/icon10.json')} width={80} /> */}
                    <ScalableImage
                      source={require("./images/gifs/lottie_pen.gif")}
                      width={80}
                    />
                  </View>
                </View>
                <View style={{ width: "70%" }}>
                  <Text style={{ textAlign: "right" }}>{item[1].name}</Text>
                  <Text style={{ textAlign: "right" }}>{item[1].created}</Text>
                </View>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        )}
      </View>
    );
  };
  _renderPostItem = ({ item, index }) => {
    return (
      <LinearGradient
        colors={["#ff564f", "#2768ea"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradientPostWrap}
      >
        <View style={styles.gradientView}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "flex-start",
              alignItems: "center",
              marginBottom: 10,
            }}
          >
            <View
              style={{
                width: "70%",
                flexDirection: "row",
                justifyContent: "flex-start",
                alignItems: "center",
              }}
            >
              <View style={{ marginRight: 10 }}>
                <ScalableImage
                  source={require("./images/staff_avatar.png")}
                  height={20}
                />
              </View>
              <Text>{item.staff_name}</Text>
            </View>
            <View style={{ width: "30%", alignItems: "flex-end" }}>
              <Text>
                {item.likes} {this.props.translate("likes")}
              </Text>
            </View>
          </View>
          <View
            style={{
              alignItems: "center",
              overflow: "hidden",
              height: (Dimensions.get("window").width * 1080) / 1350,
              marginBottom: 10,
            }}
          >
            <ScalableImage
              source={{ uri: item.photo }}
              width={Dimensions.get("window").width}
            />
          </View>
          <Hyperlink linkDefault={true} linkStyle={{ color: "#2980b9" }}>
            <Text>{item.message}</Text>
          </Hyperlink>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "flex-start",
              alignItems: "center",
            }}
          >
            <Text style={{ width: "60%" }}>{item.created}</Text>
            {item.staff_id == global.staffId ? (
              <TouchableOpacity
                onPress={() => this.updatePost(item.id, "delete")}
                style={{ width: "40%", alignItems: "flex-end" }}
              >
                <ScalableImage
                  source={require("./images/delete-64.png")}
                  height={25}
                />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => this.updatePost(item.id, "like")}
                style={{ width: "40%", alignItems: "flex-end" }}
              >
                {/* <ScalableImage source={require("./images/like.png")} height={25} /> */}
                <View
                  style={{
                    marginBottom: -30,
                    marginTop: -30,
                    marginRight: -20,
                  }}
                >
                  <Lottie
                    loop={true}
                    icon={require("./lottie/icon8.json")}
                    width={80}
                  />
                </View>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </LinearGradient>
    );
  };
  render() {
    const keyboardVerticalOffset = Platform.OS === "ios" ? -180 : -180;
    const filteredClients = this.state.clientUsers.filter(
      createFilter(this.state.searchTerm, KEYS_TO_FILTERS)
    );
    const filteredSignTemplate = this.state.signTemplate.filter(
      createFilter(this.state.searchTemplate, KEYS_TO_FILTERS)
    );
    return (
      <>
        {this.state.comunicateState ? (
          <>
            <Comunication
              gotochat={this.gotochat}
              translate={this.props.translate}
            />
          </>
        ) : (
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
                    <Dialog
                      visible={this.state.addPost}
                      onTouchOutside={() => {
                        this.setState({ addPost: false });
                      }}
                      width={0.9}
                      dialogTitle={
                        <DialogTitle
                          title={this.props.translate("createPost")}
                        />
                      }
                    >
                      <DialogContent>
                        <View style={{ marginTop: 20, alignItems: "center" }}>
                          <View
                            style={{
                              width: Dimensions.get("window").width * 0.8,
                              borderRadius: 5,
                              flexDirection: "row",
                              justifyContent: "center",
                              alignItems: "center",
                              borderWidth: 1,
                              borderColor: "grey",
                              minHeight: 180,
                              marginBottom: 20,
                            }}
                          >
                            <TouchableOpacity
                              onPress={() => this.selectPostPhoto()}
                              style={{ alignItems: "center" }}
                            >
                              {this.state.postTempPhotoSource != "" ? (
                                <ScalableImage
                                  source={this.state.postTempPhotoSource}
                                  height={180}
                                />
                              ) : (
                                <>
                                  <ScalableImage
                                    source={this.state.postImageSource}
                                    width={54}
                                  />
                                  <Text style={{ fontSize: 15 }}>
                                    {this.props.translate("insertPhoto")}(Max
                                    5Mbyte)
                                  </Text>
                                  <Text style={{ fontSize: 13 }}>
                                    {this.props.translate(
                                      "recommendedDimesion"
                                    )}
                                    : 1080 × 1350
                                  </Text>
                                </>
                              )}
                            </TouchableOpacity>
                          </View>
                        </View>
                        <View
                          style={{
                            flexDirection: "row",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <TextInput
                            onChangeText={(text) =>
                              this.setState({ postmessage: text })
                            }
                            maxLength={40}
                            style={styles.mutiInput1}
                            multiline={true}
                            editable
                            placeholder={this.props.translate("insertMessage")}
                          ></TextInput>
                        </View>
                        <View
                          style={{
                            flexDirection: "row",
                            justifyContent: "flex-end",
                            alignItems: "center",
                          }}
                        >
                          {this.state.postSubmitStatus ? (
                            <Progress.Circle size={30} indeterminate={true} />
                          ) : (
                            <LinearGradient
                              colors={["#ff564f", "#2768ea"]}
                              start={{ x: 0, y: 0 }}
                              end={{ x: 1, y: 0 }}
                              style={styles.gradientBtnWrap}
                            >
                              <TouchableOpacity
                                onPress={() => this.createStaffPost()}
                                style={{ alignItems: "center" }}
                              >
                                <Text style={{ color: "#fff" }}>
                                  {this.props.translate("submit")}
                                </Text>
                              </TouchableOpacity>
                            </LinearGradient>
                          )}
                        </View>
                      </DialogContent>
                    </Dialog>
                    <Dialog
                      visible={this.state.newClientDialogStatus}
                      onTouchOutside={() => {
                        this.setState({ newClientDialogStatus: false });
                      }}
                      width={0.9}
                      dialogTitle={
                        <DialogTitle
                          title={this.props.translate("addClient")}
                        />
                      }
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
                            onChangeText={(text) =>
                              this.setState({ newClientName: text })
                            }
                            maxLength={40}
                            style={styles.inputDialog}
                            editable
                            placeholder={this.props.translate("name")}
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
                            onChangeText={(text) =>
                              this.setState({ newClientPhone: text })
                            }
                            maxLength={40}
                            style={styles.inputDialog}
                            editable
                            placeholder={this.props.translate("phone")}
                          ></TextInput>
                        </View>
                        <View
                          style={{
                            flexDirection: "row",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <TouchableOpacity
                            onPress={() => this.addNewClient()}
                            style={{ alignItems: "center" }}
                          >
                            <Text style={{ color: "blue" }}>
                              {this.props.translate("save")}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </DialogContent>
                    </Dialog>
                    <Dialog
                      visible={this.state.newStaffDialogStatus}
                      onTouchOutside={() => {
                        this.setState({ newStaffDialogStatus: false });
                      }}
                      width={0.9}
                      dialogTitle={
                        <DialogTitle title={this.props.translate("addStaff")} />
                      }
                    >
                      <DialogContent>
                        <View style={{ justifyContent: "center" }}>
                          <TextInput
                            onChangeText={(text) =>
                              this.setState({
                                newStaffName: text.toLowerCase(),
                              })
                            }
                            value={this.state.newStaffName}
                            autoCapitalize="none"
                            maxLength={40}
                            style={styles.inputDialog}
                            editable
                            placeholder={this.props.translate("username")}
                          ></TextInput>
                          <Text style={{ marginTop: -10 }}>
                            {this.props.translate("lowercaseOnly")}
                          </Text>
                        </View>
                        <View
                          style={{
                            flexDirection: "row",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <TextInput
                            onChangeText={(text) =>
                              this.setState({ newStaffEmail: text })
                            }
                            maxLength={40}
                            style={styles.inputDialog}
                            editable
                            placeholder={this.props.translate("email")}
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
                            onChangeText={(text) =>
                              this.setState({ newStaffPhone: text })
                            }
                            maxLength={40}
                            style={styles.inputDialog}
                            editable
                            placeholder={this.props.translate("phone")}
                          ></TextInput>
                        </View>
                        <View
                          style={{
                            flexDirection: "row",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <TouchableOpacity
                            onPress={() => this.addNewStaff()}
                            style={{ alignItems: "center" }}
                          >
                            <Text style={{ color: "blue" }}>
                              {this.props.translate("save")}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </DialogContent>
                    </Dialog>
                    <Dialog
                      visible={this.state.viewSignature}
                      onTouchOutside={() => {
                        this.setState({ viewSignature: false });
                      }}
                      width={0.9}
                      dialogTitle={
                        <DialogTitle
                          title={this.props.translate("signature")}
                        />
                      }
                    >
                      <DialogContent>
                        <View
                          style={{
                            justifyContent: "center",
                            alignItems: "center",
                            marginTop: 15,
                            marginBottom: 5,
                          }}
                        >
                          <Text>
                            {this.state.selectedSignatureDetails.name}
                          </Text>
                        </View>
                        <View style={{ marginVertical: 5 }}>
                          <Text>{this.props.translate("message")}</Text>
                          <View
                            style={{
                              padding: 10,
                              borderRadius: 5,
                              backgroundColor: "#e7e7e7",
                            }}
                          >
                            <Text>
                              {this.state.selectedSignatureDetails.message}
                            </Text>
                          </View>
                        </View>
                        <View style={{ marginVertical: 5 }}>
                          <Text>{this.props.translate("document")}</Text>
                          <View
                            style={{
                              padding: 10,
                              borderRadius: 5,
                              backgroundColor: "#e7e7e7",
                            }}
                          >
                            <Text>
                              {this.state.selectedSignatureDetails.doc}
                            </Text>
                          </View>
                        </View>
                        <View
                          style={{
                            marginTop: 15,
                            justifyContent: "flex-end",
                            alignItems: "flex-end",
                          }}
                        >
                          <TouchableOpacity
                            onPress={() => this.deletePendingSignature()}
                            style={{ alignItems: "center" }}
                          >
                            <ScalableImage
                              source={require("./images/delete-64.png")}
                              width={25}
                            />
                          </TouchableOpacity>
                        </View>
                      </DialogContent>
                    </Dialog>
                    <View
                      style={{ paddingHorizontal: 15, backgroundColor: "#fff" }}
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
                            textAlign: "left",
                            paddingRight: 15,
                            width: "30%",
                          }}
                        >
                          <ScalableImage source={global.logo} width={50} />
                        </TouchableOpacity>
                        {this.state.menuStatus > -1 ? (
                          <TouchableOpacity
                            onPress={() => this.displayMenu(-1)}
                            style={{
                              paddingTop: 25,
                              width: "70%",
                              alignItems: "flex-end",
                              height: 50,
                            }}
                          >
                            {/* <Lottie icon={require('./lottie/icon3.json')} loop={true} width={70} />		 */}
                            <ScalableImage
                              source={require("./images/gifs/lottie_close.gif")}
                              width={70}
                              style={{ marginTop: -20 }}
                            />
                          </TouchableOpacity>
                        ) : (
                          <TouchableOpacity
                            onPress={() => this.displayMenu(0)}
                            style={{
                              paddingTop: 25,
                              width: "70%",
                              alignItems: "flex-end",
                              height: 50,
                            }}
                          >
                            {/* <ScalableImage source={require("./images/gmenu.png")} height={50} /> */}
                            {/* <Lottie icon={require('./lottie/icon2.json')} loop={true} width={70} />		 */}
                            <ScalableImage
                              source={require("./images/gifs/lottie_menu.gif")}
                              width={70}
                              style={{ marginTop: -20 }}
                            />
                            {this.state.badgeCount > 0 && (
                              <View
                                style={{
                                  position: "absolute",
                                  top: 18,
                                  right: 10,
                                }}
                              >
                                <Badge
                                  value={this.state.badgeCount}
                                  status="error"
                                />
                              </View>
                            )}
                          </TouchableOpacity>
                        )}
                      </View>
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "flex-start",
                          alignItems: "center",
                          marginBottom: 15,
                          width: "100%",
                        }}
                      >
                        <View style={{ marginRight: 15 }}>
                          {/* <ScalableImage source={require("./images/dashboard.png")} height={20} /> */}
                          <Text
                            style={{
                              fontFamily: "Quicksand-Regular",
                              textAlign: "left",
                              fontSize: 20,
                              color: "#000",
                              fontWeight: "bold",
                            }}
                          >
                            {global.title}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <ScrollView style={styles.container}>
                      {this.state.selectedAction > 0 && (
                        <View
                          style={{
                            backgroundColor: "#fff",
                            marginBottom: 10,
                            borderRadius: 5,
                            padding: 5,
                          }}
                        >
                          <KeyboardAvoidingView
                            behavior="position"
                            keyboardVerticalOffset={keyboardVerticalOffset}
                          >
                            <TextInput
                              onChangeText={(term) => {
                                this.searchUpdated(term);
                              }}
                              style={styles.searchInput}
                              placeholder={
                                this.props.translate("selectClient") + "..."
                              }
                              value={this.state.selectedUserLabel}
                              onFocus={() => this.viewSearchList()}
                              // onBlur={() => { this.hideSearchList() }}
                            />
                            <View style={{ position: "absolute", right: 0 }}>
                              <TouchableOpacity
                                onPress={() => this.closeActionStatue()}
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
                                    icon={require("./lottie/icon3.json")}
                                    width={50}
                                  />
                                </View>
                              </TouchableOpacity>
                            </View>
                            <ScrollView style={{ flex: 1, maxHeight: 200 }}>
                              {filteredClients.map((client) => {
                                return (
                                  <>
                                    {this.state.viewSearchList ? (
                                      <TouchableOpacity
                                        onPress={() =>
                                          this.selectHandler(
                                            client.value,
                                            client.label
                                          )
                                        }
                                        style={styles.clientItem}
                                      >
                                        <View>
                                          <Text>{client.label}</Text>
                                        </View>
                                      </TouchableOpacity>
                                    ) : (
                                      <></>
                                    )}
                                  </>
                                );
                              })}
                            </ScrollView>
                            <TextInput
                              TextInput
                              onChangeText={(text) =>
                                this.setState({ actionMsg: text })
                              }
                              maxLength={40}
                              style={styles.mutiInput}
                              multiline={true}
                              editable
                              placeholder={this.props.translate(
                                "insertMessage"
                              )}
                            ></TextInput>
                          </KeyboardAvoidingView>
                          {this.state.selectedAction == 4 ? (
                            <View
                              style={{
                                flexDirection: "row",
                                justifyContent: "flex-start",
                                alignItems: "center",
                                marginBottom: 5,
                              }}
                            >
                              <View
                                style={{
                                  flexDirection: "row",
                                  justifyContent: "flex-start",
                                  alignItems: "center",
                                }}
                              >
                                <RadioButton
                                  animation={"bounceIn"}
                                  isSelected={this.state.actionSign1}
                                  onPress={() =>
                                    this.changeActionSignRadio("Send to user")
                                  }
                                />
                                <Text> Send to App </Text>
                              </View>
                              <View
                                style={{
                                  flexDirection: "row",
                                  justifyContent: "center",
                                  alignItems: "center",
                                }}
                              >
                                <RadioButton
                                  animation={"bounceIn"}
                                  isSelected={this.state.actionSign2}
                                  onPress={() =>
                                    this.changeActionSignRadio("Send as SMS")
                                  }
                                />
                                <Text> Send as SMS </Text>
                              </View>
                            </View>
                          ) : (
                            <View
                              style={{
                                flexDirection: "row",
                                justifyContent: "flex-start",
                                alignItems: "center",
                                marginBottom: 5,
                              }}
                            >
                              <View
                                style={{
                                  flexDirection: "row",
                                  justifyContent: "flex-start",
                                  alignItems: "center",
                                }}
                              >
                                <RadioButton
                                  animation={"bounceIn"}
                                  isSelected={this.state.actionGen1}
                                  onPress={() =>
                                    this.changeActionRadio("In-progress")
                                  }
                                />
                                <Text> In-progress </Text>
                              </View>
                              <View
                                style={{
                                  flexDirection: "row",
                                  justifyContent: "center",
                                  alignItems: "center",
                                }}
                              >
                                <RadioButton
                                  animation={"bounceIn"}
                                  isSelected={this.state.actionGen2}
                                  onPress={() =>
                                    this.changeActionRadio("Complete")
                                  }
                                />
                                <Text> Complete </Text>
                              </View>
                              <View
                                style={{
                                  flexDirection: "row",
                                  justifyContent: "center",
                                  alignItems: "center",
                                }}
                              >
                                <RadioButton
                                  animation={"bounceIn"}
                                  isSelected={this.state.actionGen3}
                                  onPress={() =>
                                    this.changeActionRadio("Send to user")
                                  }
                                />
                                <Text> Send to App </Text>
                              </View>
                            </View>
                          )}
                          {this.state.selectedAction == 4 && (
                            <KeyboardAvoidingView
                              behavior="position"
                              keyboardVerticalOffset={keyboardVerticalOffset}
                            >
                              <TextInput
                                onChangeText={(term) => {
                                  this.searchUpdatedTemplate(term);
                                }}
                                style={styles.searchInput}
                                placeholder={
                                  this.props.translate("selectTemplate") + "..."
                                }
                                value={this.state.selectedTempLabel}
                                onFocus={() => this.viewTemplateList()}
                                // onBlur={() => { this.hideSearchList() }}
                              />
                              <ScrollView style={{ flex: 1, maxHeight: 200 }}>
                                {filteredSignTemplate.map((tmp) => {
                                  return (
                                    <>
                                      {this.state.viewTemplateList ? (
                                        <TouchableOpacity
                                          onPress={() =>
                                            this.selectTempHandler(
                                              tmp.id,
                                              tmp.SignatureName,
                                              tmp.SignatureUrl,
                                              tmp.Signature1,
                                              tmp.Signature2
                                            )
                                          }
                                          style={styles.clientItem}
                                        >
                                          <View>
                                            <Text>{tmp.SignatureName}</Text>
                                          </View>
                                        </TouchableOpacity>
                                      ) : (
                                        <></>
                                      )}
                                    </>
                                  );
                                })}
                              </ScrollView>
                            </KeyboardAvoidingView>
                          )}
                          <View
                            style={{
                              flexDirection: "row",
                              justifyContent: "flex-end",
                              alignItems: "flex-end",
                            }}
                          >
                            {this.state.selectedAction == 3 &&
                              this.state.actionRadio == "Send to user" && (
                                <>
                                  <View style={{}}>
                                    <Text>
                                      {this.props.translate("option")}1
                                    </Text>
                                    <TextInput
                                      onChangeText={(text) =>
                                        this.setState({ option1: text })
                                      }
                                      style={styles.input1}
                                    ></TextInput>
                                  </View>
                                  <View style={{}}>
                                    <Text>
                                      {this.props.translate("option")}2
                                    </Text>
                                    <TextInput
                                      onChangeText={(text) =>
                                        this.setState({ option2: text })
                                      }
                                      style={styles.input1}
                                    ></TextInput>
                                  </View>
                                </>
                              )}
                            {this.state.selectedAction == 2 &&
                              this.state.actionRadio == "Send to user" && (
                                <View style={{ marginRight: 20 }}>
                                  <LinearGradient
                                    colors={["#ff564f", "#2768ea"]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.gradientBtnWrap}
                                  >
                                    <TouchableOpacity
                                      onPress={() => this.actionFileBrowser()}
                                      style={{ alignItems: "center" }}
                                    >
                                      <Text style={{ color: "#fff" }}>
                                        {this.props.translate("selectDocument")}
                                      </Text>
                                    </TouchableOpacity>
                                  </LinearGradient>
                                </View>
                              )}
                            {this.state.submitActionStatus ? (
                              <Progress.Circle size={30} indeterminate={true} />
                            ) : (
                              <LinearGradient
                                colors={["#ff564f", "#2768ea"]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.gradientBtnWrap}
                              >
                                <TouchableOpacity
                                  onPress={() => this.submitActionData()}
                                  style={{ alignItems: "center" }}
                                >
                                  <Text style={{ color: "#fff" }}>
                                    {this.props.translate("save")}
                                  </Text>
                                </TouchableOpacity>
                              </LinearGradient>
                            )}
                          </View>
                        </View>
                      )}
                      <Text
                        style={{
                          fontFamily: "Quicksand-Regular",
                          textAlign: "left",
                          fontSize: 18,
                          color: "#000",
                          marginBottom: 5,
                          marginTop: 15,
                        }}
                      >
                        {this.props.translate("pendingSignatures")}
                      </Text>
                      {this.state.signPendingStatus ? (
                        <View>
                          <Carousel
                            layout={"default"}
                            loop={true}
                            autoplay={true}
                            scrollEnabled={true}
                            autoplayInterval={8000}
                            ref={(ref) => (this.carousel = ref)}
                            data={this.state.pendingItems}
                            renderItem={this._renderItem}
                            sliderWidth={Dimensions.get("window").width}
                            itemWidth={Dimensions.get("window").width}
                            onSnapToItem={(index) =>
                              this.setState({ activeIndex: index })
                            }
                          />
                        </View>
                      ) : (
                        <Progress.Circle size={30} indeterminate={true} />
                      )}
                      <Text
                        style={{
                          fontFamily: "Quicksand-Regular",
                          textAlign: "left",
                          fontSize: 18,
                          color: "#000",
                          marginBottom: 5,
                          marginTop: 20,
                        }}
                      >
                        {this.props.translate("notifications")}
                      </Text>
                      {this.state.notificationsStatus ? (
                        <View
                          style={{
                            flexDirection: "row",
                            justifyContent: "flex-start",
                            alignItems: "center",
                          }}
                        >
                          <LinearGradient
                            colors={["#ff564f", "#2768ea"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.gradientWrap}
                          >
                            <View style={styles.gradientView}>
                              <View
                                style={{
                                  flexDirection: "row",
                                  justifyContent: "flex-start",
                                  alignItems: "center",
                                }}
                              >
                                <View style={{ width: "30%" }}>
                                  <ScalableImage
                                    source={require("./images/mark_chat_unread.png")}
                                    width={30}
                                    style={{ marginRight: 10 }}
                                  />
                                </View>
                                <View
                                  style={{
                                    width: "70%",
                                    alignItems: "flex-end",
                                  }}
                                >
                                  <Text style={{ textAlign: "right" }}>
                                    {this.props.translate("youHave")}{" "}
                                    {this.state.pendingCount}{" "}
                                    {this.props.translate("messagePending")}
                                  </Text>
                                </View>
                              </View>
                            </View>
                          </LinearGradient>
                          <LinearGradient
                            colors={["#ff564f", "#2768ea"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.gradientWrap}
                          >
                            <View style={styles.gradientView}>
                              <View
                                style={{
                                  flexDirection: "row",
                                  justifyContent: "flex-start",
                                  alignItems: "center",
                                }}
                              >
                                <View style={{ width: "30%" }}>
                                  <ScalableImage
                                    source={require("./images/sms.png")}
                                    width={30}
                                    style={{ marginRight: 10 }}
                                  />
                                </View>
                                <View
                                  style={{
                                    width: "70%",
                                    alignItems: "flex-end",
                                  }}
                                >
                                  <Text style={{ textAlign: "right" }}>
                                    {this.props.translate("youHaveReceived")}{" "}
                                    {this.state.requestCount}{" "}
                                    {this.props.translate("newRequest")}
                                  </Text>
                                </View>
                              </View>
                            </View>
                          </LinearGradient>
                        </View>
                      ) : (
                        <Progress.Circle size={30} indeterminate={true} />
                      )}
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "flex-start",
                          alignItems: "center",
                          marginBottom: 5,
                          marginTop: 20,
                          width: "100%",
                        }}
                      >
                        <View style={{ marginRight: 15 }}>
                          <Text
                            style={{
                              fontFamily: "Quicksand-Regular",
                              textAlign: "left",
                              fontSize: 18,
                              color: "#000",
                            }}
                          >
                            {this.props.translate("posts")}
                          </Text>
                        </View>
                        <TouchableOpacity
                          onPress={() => {
                            this.addPostDialog();
                          }}
                        >
                          {/* <Image source={require("./images/plus.png")} style={{ width: 20, height:20 }} /> */}
                          <Text
                            style={{
                              fontFamily: "Quicksand-Regular",
                              fontSize: 12,
                              backgroundColor: "#e7e7e7",
                              paddingHorizontal: 10,
                              paddingVertical: 5,
                              borderRadius: 5,
                            }}
                          >
                            {this.props.translate("addPost")}
                          </Text>
                        </TouchableOpacity>
                      </View>

                      {this.state.postViewStatus ? (
                        <View>
                          <Carousel
                            layout={"default"}
                            loop={true}
                            autoplay={true}
                            scrollEnabled={true}
                            autoplayInterval={10000}
                            ref={(ref) => (this.carousel = ref)}
                            data={this.state.sliderItems}
                            renderItem={this._renderPostItem}
                            sliderWidth={Dimensions.get("window").width}
                            itemWidth={Dimensions.get("window").width}
                            onSnapToItem={(index) =>
                              this.setState({ activeIndex: index })
                            }
                          />
                        </View>
                      ) : (
                        <Progress.Circle size={30} indeterminate={true} />
                      )}
                      <Text style={{ paddingVertical: 10 }}>
                        {this.props.translate("youHave")}{" "}
                        {this.state.totalLikes} {this.props.translate("likes")}
                      </Text>
                    </ScrollView>
                  </>
                )}
              </>
            ) : (
              <></>
            )}
            {/* <Call changeCallStatus={this.changeCallStatus} sellectCollee={this.sellectCollee} caller={global.staffId} callee={this.state.calleeId}  baseUrl={global.baseUrl}  callerType="staff" translate={this.props.translate} /> */}
            <BottomSheet
              backgroundComponent={CustomBackground}
              onChange={this.handleSheetChanges}
              ref={this.sheetRef}
              index={-1}
              enablePanDownToClose={true}
              snapPoints={[
                (360 / Dimensions.get("window").height) * 100 + "%",
                (500 / Dimensions.get("window").height) * 100 + "%",
                "90%",
              ]}
            >
              <BottomSheetView
                style={{
                  flex: 1,
                }}
              >
                <View
                  style={{
                    width: "100%",
                    alignItems: "center",
                    marginBottom: 15,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "Quicksand-Regular",
                      textAlign: "left",
                      fontSize: 20,
                      color: "#000",
                      fontWeight: "bold",
                    }}
                  >
                    {this.props.translate("menu")}
                  </Text>
                </View>
                {this.state.moreStatus ? (
                  <>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "center",
                        alignItems: "center",
                        marginBottom: 4,
                        width: "100%",
                      }}
                    >
                      <TouchableOpacity
                        onPress={() => this.gotocomingsoon()}
                        style={styles.actionWrapLeft1}
                      >
                        <Text style={{ fontSize: 20 }}>Coming Soon</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => this.addClient()}
                        style={styles.actionWrap}
                      >
                        <ScalableImage
                          source={require("./images/user.png")}
                          width={35}
                        />
                        <Text style={styles.actionTitle}>
                          {this.props.translate("addClient")}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => this.addStaff()}
                        style={styles.actionWrap}
                      >
                        <ScalableImage
                          source={require("./images/user.png")}
                          width={35}
                        />
                        <Text style={styles.actionTitle}>
                          {this.props.translate("addStaff")}
                        </Text>
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
                        onPress={() => this.gotoback()}
                        style={styles.actionWrapLeft1}
                      >
                        <Text style={{ fontSize: 20 }}>
                          {this.props.translate("back")}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => this.shareAppLink()}
                        style={styles.actionWrap}
                      >
                        <ScalableImage
                          source={require("./images/share.png")}
                          width={25}
                        />
                        <Text style={styles.actionTitle}>
                          {this.props.translate("shareAppLink")}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => this.sharePhoneNumber()}
                        style={styles.actionWrap}
                      >
                        <ScalableImage
                          source={require("./images/share.png")}
                          width={25}
                        />
                        <Text style={styles.actionTitle}>
                          {this.props.translate("sharePhoneNumber")}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </>
                ) : (
                  <>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "center",
                        alignItems: "center",
                        marginBottom: 4,
                        width: "100%",
                      }}
                    >
                      <TouchableOpacity
                        onPress={() => this.gotochat(1)}
                        style={styles.actionWrapLeft}
                      >
                        <View>
                          <ScalableImage
                            source={require("./images/gifs/lottie_msg.gif")}
                            width={80}
                          />
                          {this.state.badgeCount > 0 && (
                            <Badge
                              value={this.state.badgeCount}
                              status="error"
                              right={-20}
                              top={-65}
                            />
                          )}
                        </View>
                        <Text style={{ fontWeight: "bold", fontSize: 20 }}>
                          {this.props.translate("chat")}
                        </Text>
                      </TouchableOpacity>
                      {this.state.action1 ? (
                        <TouchableOpacity
                          onPress={() => this.updateActionStatue(1, 0)}
                          style={styles.actionWrap}
                        >
                          <View style={{ marginBottom: -20, marginTop: -15 }}>
                            <ScalableImage
                              source={require("./images/gifs/lottie_file.gif")}
                              width={80}
                            />
                          </View>
                          <Text style={styles.actionTitle}>
                            {this.props.translate("requestDocument")}
                          </Text>
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity
                          onPress={() => this.updateActionStatue(1, 1)}
                          style={styles.actionWrap}
                        >
                          <View style={{ marginBottom: -20, marginTop: -15 }}>
                            <ScalableImage
                              source={require("./images/gifs/lottie_file.gif")}
                              width={80}
                            />
                          </View>
                          <Text style={styles.actionTitle}>
                            {this.props.translate("requestDocument")}
                          </Text>
                        </TouchableOpacity>
                      )}
                      {this.state.action2 ? (
                        <TouchableOpacity
                          onPress={() => this.updateActionStatue(2, 0)}
                          style={styles.actionWrap}
                        >
                          <View style={{ marginBottom: -20, marginTop: -15 }}>
                            <ScalableImage
                              source={require("./images/gifs/lottie_upload.gif")}
                              width={80}
                            />
                          </View>
                          <Text style={styles.actionTitle}>
                            {this.props.translate("sendDocument")}
                          </Text>
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity
                          onPress={() => this.updateActionStatue(2, 1)}
                          style={styles.actionWrap}
                        >
                          <View style={{ marginBottom: -20, marginTop: -15 }}>
                            <ScalableImage
                              source={require("./images/gifs/lottie_upload.gif")}
                              width={80}
                            />
                          </View>
                          <Text style={styles.actionTitle}>
                            {this.props.translate("sendDocument")}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <TouchableOpacity
                        onPress={() => this.gotoMore()}
                        style={styles.actionWrapComingSoon}
                      >
                        <Text style={{ fontSize: 20 }}>
                          {this.props.translate("more")}
                        </Text>
                      </TouchableOpacity>
                      {this.state.action3 ? (
                        <TouchableOpacity
                          onPress={() => this.updateActionStatue(3, 0)}
                          style={styles.actionWrap1}
                        >
                          <View style={{ marginBottom: -20, marginTop: -15 }}>
                            <ScalableImage
                              source={require("./images/gifs/lottie_question.gif")}
                              width={80}
                            />
                          </View>
                          <Text style={styles.actionTitle}>
                            {this.props.translate("askQuestion")}
                          </Text>
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity
                          onPress={() => this.updateActionStatue(3, 1)}
                          style={styles.actionWrap1}
                        >
                          <View style={{ marginBottom: -20, marginTop: -15 }}>
                            <ScalableImage
                              source={require("./images/gifs/lottie_question.gif")}
                              width={80}
                            />
                          </View>
                          <Text style={styles.actionTitle}>
                            {this.props.translate("askQuestion")}
                          </Text>
                        </TouchableOpacity>
                      )}
                      {this.state.action4 ? (
                        <TouchableOpacity
                          onPress={() => this.updateActionStatue(4, 0)}
                          style={styles.actionWrap1}
                        >
                          <View style={{ marginBottom: -20, marginTop: -15 }}>
                            <ScalableImage
                              source={require("./images/gifs/lottie_pen_g.gif")}
                              width={80}
                            />
                          </View>
                          <Text style={styles.actionTitle}>
                            {this.props.translate("getSignature")}
                          </Text>
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity
                          onPress={() => this.updateActionStatue(4, 1)}
                          style={styles.actionWrap1}
                        >
                          <View style={{ marginBottom: -20, marginTop: -15 }}>
                            <ScalableImage
                              source={require("./images/gifs/lottie_pen_g.gif")}
                              width={80}
                            />
                          </View>
                          <Text style={styles.actionTitle}>
                            {this.props.translate("getSignature")}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </>
                )}
                <TouchableOpacity
                  onPress={() => this.signout()}
                  style={{ marginTop: 30 }}
                >
                  <Text
                    style={{
                      fontSize: 15,
                      textAlign: "center",
                      fontWeight: "bold",
                      marginBottom: 15,
                    }}
                  >
                    {this.state.staffName}
                  </Text>
                  <Text style={{ fontSize: 15, textAlign: "center" }}>
                    {this.props.translate("signout")}
                  </Text>
                </TouchableOpacity>
                <View
                  style={{ width: "100%", alignItems: "center", marginTop: 50 }}
                >
                  <ScalableImage
                    source={require("./images/powered.png")}
                    width={62}
                  />
                  <Text style={{ fontSize: 18, marginVertical: 10 }}>
                    {this.props.translate("version")} 2.0
                  </Text>
                </View>
              </BottomSheetView>
            </BottomSheet>
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
        paddingTop: 50,
      },
    }),
    paddingHorizontal: 15,
    paddingBottom: 20,
    backgroundColor: "#fff",
  },
  inputDialog: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#e7e7e7",
    marginVertical: 15,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  gradientWrap: {
    padding: 2,
    borderRadius: 5,
    width: Dimensions.get("window").width / 2 - 23,
    marginRight: 10,
  },
  gradientPostWrap: {
    padding: 2,
    borderRadius: 5,
    marginRight: 10,
    width: "90%",
  },
  gradientBtnWrap: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  gradientView: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 3,
  },
  actionWrapComingSoon: {
    flexDirection: "row",
    justifyContent: "center",
    paddingHorizontal: 5,
    paddingVertical: 5,
    marginHorizontal: 2,
    //borderWidth: 2,
    alignItems: "center",
    width: 150,
    borderRadius: 10,
    borderColor: "#555",
    height: 80,
    backgroundColor: "#dde3ec",
  },
  actionWrapLeft: {
    flexDirection: "row",
    paddingHorizontal: 5,
    paddingVertical: 5,
    marginHorizontal: 2,
    //borderWidth: 2,
    alignItems: "center",
    width: 150,
    borderRadius: 10,
    borderColor: "#555",
    height: 100,
    backgroundColor: "#dde3ec",
  },
  actionWrapLeft1: {
    flexDirection: "row",
    paddingHorizontal: 5,
    paddingVertical: 5,
    marginHorizontal: 2,
    justifyContent: "center",
    alignItems: "center",
    width: 150,
    borderRadius: 10,
    borderColor: "#555",
    height: 100,
    backgroundColor: "#dde3ec",
    overflow: "hidden",
  },
  actionWrap: {
    paddingHorizontal: 5,
    paddingVertical: 5,
    marginHorizontal: 2,
    //borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    width: 100,
    borderRadius: 10,
    borderColor: "#555",
    backgroundColor: "#dde3ec",
    height: 100,
    overflow: "hidden",
  },
  actionWrap1: {
    paddingHorizontal: 5,
    paddingVertical: 5,
    marginHorizontal: 2,
    //borderWidth: 2,
    alignItems: "center",
    width: 100,
    borderRadius: 10,
    borderColor: "#555",
    backgroundColor: "#dde3ec",
    height: 80,
    overflow: "hidden",
  },
  actionWrapAct: {
    paddingHorizontal: 5,
    paddingVertical: 5,
    marginHorizontal: 1,
    //borderWidth: 2,
    alignItems: "center",
    width: 100,
    borderRadius: 10,
    borderColor: "#2260ff",
    backgroundColor: "#dde3ec",
    overflow: "hidden",
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
  actionTitle: {
    marginTop: 3,
    textAlign: "center",
    color: "#333",
  },
  actionTitleAct: {
    marginTop: 3,
    textAlign: "center",
    color: "#2260ff",
  },
  input: {
    fontFamily: "Quicksand-Regular",
    borderRadius: 5,
    color: "#000",
    borderColor: "grey",
    backgroundColor: "#fff",
    fontSize: 12,
    paddingLeft: 10,
    marginBottom: 10,
  },
  input1: {
    fontFamily: "Quicksand-Regular",
    borderRadius: 5,
    color: "#000",
    borderColor: "grey",
    backgroundColor: "#fff",
    fontSize: 12,
    borderWidth: 1,
    marginRight: 15,
    width: Dimensions.get("window").width * 0.3,
    paddingVertical: 1,
  },
  mutiInput: {
    fontFamily: "Quicksand-Regular",
    minHeight: 100,
    borderRadius: 5,
    color: "#000",
    borderColor: "grey",
    backgroundColor: "#fff",
    fontSize: 12,
    paddingLeft: 10,
    marginBottom: 10,
    borderWidth: 1,
  },
  mutiInput1: {
    fontFamily: "Quicksand-Regular",
    minHeight: 50,
    borderRadius: 5,
    color: "#000",
    borderColor: "grey",
    backgroundColor: "#fff",
    fontSize: 12,
    paddingLeft: 10,
    marginBottom: 10,
    borderWidth: 1,
    width: Dimensions.get("window").width * 0.8,
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
  clientItem: {
    borderBottomWidth: 0.5,
    borderColor: "rgba(0,0,0,0.3)",
    padding: 10,
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
