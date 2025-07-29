/**
 * @format
 */

import { AppRegistry, Platform } from "react-native";
import "react-native-gesture-handler";
import App from "./App";
import { name as appName } from "./app.json";

AppRegistry.registerComponent(
  Platform.OS === "android" ? "qixcloud.hyndmanApp" : appName,
  () => App
);
