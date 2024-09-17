import React, { Component } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Image,
  Button,
  CheckBox,
  Alert,
} from "react-native";
import SplashScreen from "../SplashScreen";
import Step3 from "./step3";
import axios from "axios";
import { launchImageLibrary, launchCamera } from "react-native-image-picker";
import { requestCameraPermission } from "../Helper";
// import
export default class Upload extends Component {
  constructor(props) {
    super(props);
    this.state = {
      login: 0,
      back: 0,
      settings: 0,
      maxStep: 1,
      step: 1,
      avatarSource: require("../images/camera.png"),
      picked: 0,
      uploadStatus: "",
      files: this.props.files,
      fileIdx: this.props.files.length - 1,
      saveVisible: false,
    };
    this.componentDidMount = () => {
      if (this.props.files.length > 0) {
        this.setState({ saveVisible: true });
      }
    };
    this.options = {
      title: this.props.translate("selectImage"),
      //customButtons: [{ name: 'fb', title: 'Choose Photo from Facebook' }],
      storageOptions: {
        skipBackup: true,
        path: "images",
      },
    };
  }
  gotoSettings = () => {
    this.props.nextstep(3);
  };
  brower = async () => {
    await launchImageLibrary(this.options, (response) => {
      this.confirmAvata(response);
    });
  };
  cametra = async () => {
    const hasCameraPermission = await requestCameraPermission();
    if (!hasCameraPermission) {
      return Alert.alert("Camera permissions denied");
    }

    await launchCamera(this.options, (response) => {
      console.log(response);
      this.confirmAvata(response);
    });
  };
  confirmAvata = (response) => {
    if (!response.didCancel) {
      this.setState({ avatarSource: { uri: response.assets[0].uri } });
      Alert.alert(
        this.props.translate("wantUploadImage"),
        "",
        [
          {
            text: this.props.translate("cancel"),
            onPress: () => console.log("Cancel Pressed"),
            style: "cancel",
          },
          {
            text: this.props.translate("ok"),
            onPress: () => this.changeAvata(response),
          },
        ],
        { cancelable: false }
      );
    }
  };
  changeAvata = (response) => {
    const second = Math.floor(Date.now() / 1000);
    const tmp = { id: 0, meta_value: second + ".jpg" };
    this.state.files.push(tmp);
    this.state.fileIdx = this.state.fileIdx + 1;
    //this.setState({uploadStatus: "Uploading..."});
    this.setState({ avatarSource: { uri: response.assets[0].uri } });
    var data = new FormData();
    data.append("avatar", {
      uri: response.assets[0].uri,
      name: second + ".jpg",
      type: "image/jpg",
    });
    data.append("method", "avata_upload");
    data.append("contact_id", global.contactId);
    data.append("fileIdx", this.state.fileIdx);
    var path = global.baseUrl + "wp-admin/admin-ajax.php?action=contact_api";
    console.log({ uri: response.assets[0].uri });
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
        if (responseJson.status == "success") {
          this.state.files[responseJson.fileIdx].id = 1;
          var t = this.state.files;
          this.setState({ files: t });
          console.log(this.state.files);
          this.props.updatestep(4);
          this.setState({ saveVisible: true });
        } else {
          this.setState({ uploadStatus: this.props.translate("failed") });
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };
  render() {
    return (
      <>
        {this.state.back === 1 ? <SplashScreen /> : <></>}
        {this.state.settings === 1 && this.state.back === 0 ? (
          <MySettings translate={this.props.translate} />
        ) : (
          <></>
        )}
        {this.state.settings === 0 && this.state.back === 0 ? (
          <ScrollView style={styles.container}>
            <TouchableOpacity
              onPress={() => this.setState({ back: 0 })}
              style={{
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <View style={{ paddingTop: 25, width: "80%" }}>
                <Image
                  source={global.logo}
                  style={{ width: 180, height: 65 }}
                />
              </View>
            </TouchableOpacity>
            <View style={{ marginTop: 20, alignItems: "center" }}>
              <View
                style={{
                  width: Dimensions.get("window").width * 1,
                  padding: 20,
                  borderRadius: 5,
                  backgroundColor: "#eee",
                  borderWidth: 1,
                  borderColor: "#ddd",
                }}
              >
                <TouchableOpacity
                  onPress={() => this.cametra()}
                  style={{ width: "100%", alignItems: "center" }}
                >
                  <Image
                    source={this.state.avatarSource}
                    style={styles.uploadAvatar}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => this.brower()}
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
                    {this.props.translate("library")}
                  </Text>
                </TouchableOpacity>
                <Text
                  style={{ textAlign: "center", fontSize: 15, color: "blue" }}
                >
                  {this.state.uploadStatus}
                </Text>
              </View>
            </View>
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
                paddingTop: 20,
              }}
            >
              {this.state.files.map((file) => {
                if (file.id == 0) {
                  return (
                    <View style={{ flexDirection: "row", marginBottom: 15 }}>
                      <Image
                        source={require("../images/loader.gif")}
                        style={{ width: 25, height: 25, marginRight: 20 }}
                      />
                      <Text style={{ marginTop: 5, width: 180 }}>
                        {file.meta_value}
                      </Text>
                      <Image
                        source={require("../images/close.png")}
                        style={{ width: 25, height: 25, marginLeft: 20 }}
                      />
                    </View>
                  );
                } else {
                  return (
                    <View style={{ flexDirection: "row", marginBottom: 15 }}>
                      <Image
                        source={require("../images/loadered.png")}
                        style={{ width: 25, height: 25, marginRight: 20 }}
                      />
                      <Text style={{ marginTop: 5, width: 180 }}>
                        {file.meta_value}
                      </Text>
                      <Image
                        source={require("../images/checked.png")}
                        style={{ width: 25, height: 25, marginLeft: 20 }}
                      />
                    </View>
                  );
                }
              })}
            </View>
            {this.state.saveVisible ? (
              <View
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                  paddingTop: 20,
                }}
              >
                <TouchableOpacity
                  onPress={() => this.props.nextstep(4)}
                  style={styles.saveButton}
                >
                  <Text
                    style={{ textAlign: "center", fontSize: 20, color: "#fff" }}
                  >
                    {this.props.translate("save")}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <></>
            )}
          </ScrollView>
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
    ...Platform.select({
      ios: {
        paddingTop: 50,
      },
    }),
  },
  button: {
    backgroundColor: "#599cdd",
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
    width: 100,
    marginLeft: Dimensions.get("window").width * 0.5 - 70,
  },
  uploadAvatar: {
    width: 320,
    height: 170,
  },
  saveButton: {
    width: 70,
    backgroundColor: "#001431",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginTop: 10,
  },
});
