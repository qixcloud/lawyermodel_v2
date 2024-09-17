import React, { Component } from "react";
import { View, Text, Alert, AppState, DeviceEventEmitter } from "react-native";
import messaging from "@react-native-firebase/messaging";
import axios from "axios";
var currentTime;
// import
// async function checkApplicationPermission() {
//   const authorizationStatus = await messaging().requestPermission();

//     if (authorizationStatus === messaging.AuthorizationStatus.AUTHORIZED) {
//       console.log('User has notification permissions enabled.');
//     } else if (authorizationStatus === messaging.AuthorizationStatus.PROVISIONAL) {
//       console.log('User has provisional notification permissions.');
//     } else {
//       console.log('User has notification permissions disabled');
//     }
// }

export default class Notification extends Component {
  constructor(props) {
    super(props);
    this.state = {
      token: "",
      hasPermission: false,
      count: 0,
    };

    this.props.pushMsgs("note");
  }
  displayNotification(title, body) {
    Alert.alert(
      title,
      body,
      [{ text: "Ok", onPress: () => console.log("ok pressed") }],
      { cancelable: false }
    );
  }
  notification = (remoteMessage) => {
    console.log(remoteMessage);
  };
  componentDidMount() {
    console.log("---notification---");
    messaging().onMessage(async (remoteMessage) => {
      //Alert.alert('A new FCM message arrived!', JSON.stringify(remoteMessage));
      this.androidProcessNotification(remoteMessage.notification.title);
    });
    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      console.log(
        "Message handled in the background--------------------",
        remoteMessage.notification.title
      );
      if (!remoteMessage.notification.title === "Video Call") {
        this.androidProcessNotification(remoteMessage.notification.title);
      }
    });
    AppState.addEventListener("change", this._handleAppStateChange);
    this.onNotificationListener();
    this.onNotificationOpenedListener();
    this.getInitialNotification();
    this.requestPermission();
  }
  getToken = async () => {
    const token = await messaging().getToken();
    return token;
  };
  getInitialNotification = async () => {
    const notification = await messaging().getInitialNotification();
    console.log("getInitialNotification", notification);
    return notification;
  };

  onNotificationOpenedListener = () => {
    this.removeOnNotificationOpened = messaging().onNotificationOpenedApp(
      (notification) => {
        console.log("onNotificationOpened", notification);
        this.processNotification(notification.notification);
        //this.viewedNotification();
      }
    );
  };

  onNotificationListener = () => {
    this.removeOnNotification = messaging().onNotificationOpenedApp(
      (notification) => {
        console.log("onNotification", notification.notification);
        this.processNotification(notification.notification);
        this.viewedNotification();
      }
    );
  };
  processNotification = (note) => {
    var title = note.title;
    console.log("note", note);
    if (title == "Confirm") {
      this.props.nextstep(2);
    }
    if (title == "Great News!" || title == "¡Buenas noticias!") {
      this.props.nextstep(5);
    }
    if (title == "Docusign") {
      this.props.nextstep(3);
    }
    if (title == "Docusign Redo") {
      this.props.nextstep(2);
    }
    if (title == "Chat") {
      //this.props.pushMsgs(note);
    }
  };

  androidProcessNotification = (title) => {
    if (title == "Confirm") {
      this.props.nextstep(2);
    }
    if (title == "Supper Confirm") {
      this.props.nextstep(5);
    }
    if (title == "Great News!" || title == "¡Buenas noticias!") {
      console.log("title", title);
      this.props.nextstep(5);
    }
    if (title == "Docusign") {
      this.props.nextstep(3);
    }
    if (title == "Docusign Redo") {
      this.props.nextstep(2);
    }
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
      this.setBadge(0);
    });
  };
  onTokenRefreshListener = () => {
    //remember to remove the listener on un mount
    //this gets triggered when a new token is generated for the user
    // this.removeonTokenRefresh = messages.onTokenRefresh(token => {
    //do something with the new token
    // })
  };
  setBadge = async (number) => {
    //only works on iOS for now
    // return await notifications.setBadge(number)
  };

  getBadge = async () => {
    //only works on iOS for now
    // return await notifications.getBadge()
  };

  hasPermission = async () => {
    //only works on iOS
    // return await notifications.hasPermission()
  };

  requestPermission = async () => {
    //only works on iOS
    return await messaging().requestPermission();
  };
  componentWillUnmount() {}
  getMaxStep = () => {
    const params = new FormData();
    params.append("method", "getMaxStep");
    params.append("contact_id", global.contactId);
    axios({
      method: "post",
      headers: {
        "Content-Type": "multipart/form-data",
      },
      url: global.baseUrl + "wp-admin/admin-ajax.php?action=contact_api",
      data: params,
    }).then((res) => {
      console.log(global.maxStep);
      console.log(res.data.data.step);
      if (global.maxStep < res.data.data.step)
        this.props.nextstep(res.data.data.step);
    });
  };
  _handleAppStateChange = (nextAppState) => {
    if (nextAppState == "active") {
      if (currentTime != "" && Date.now() - currentTime > 3600000 * 24) {
        this.props.logout();
      } else {
        //this.viewedNotification();
        this.getMaxStep();
      }
    } else {
      currentTime = Date.now();
      console.log(currentTime);
    }
  };
  render() {
    const { token, hasPermission } = this.state;

    return <></>;
  }
}
