// import firebase from 'react-native-firebase';
// import Notice from "./notice";
import {Alert} from 'react-native';
// import IncomingCall from 'react-native-incoming-call';
// import RNUnlockDevice from 'react-native-unlock-device';
import DeviceInfo from 'react-native-device-info';
let uniqueId = DeviceInfo.getUniqueId();

export default async (message) => {
	// handle your message
	console.log('BackgroundNotification', message);
	console.log('BackgroundNotification', message.notification.title);
	if(message.notification.title == "Video Call"){
		// IncomingCall.openAppFromHeadlessMode(uniqueId);//('callUUIDv4');
		RNUnlockDevice.unlock();
	}

	return Promise.resolve();
}