/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import ZegoUIKitPrebuiltCallService from '@zegocloud/zego-uikit-prebuilt-call-rn'
import * as ZIM from 'zego-zim-react-native';
import * as ZPNs from 'zego-zpns-react-native';

// Zego credentials
const APP_ID = 797383271;
const APP_SIGN = '63e7962afd2097300852541e62cc9441466f1d430d88fb3e998afeff96a790a2';

ZegoUIKitPrebuiltCallService.useSystemCallingUI([ZIM, ZPNs]);

export const onUserLogin = async (userID, userName, props) => {
  return ZegoUIKitPrebuiltCallService.init(
    APP_ID, // You can get it from ZEGOCLOUD's console
    APP_SIGN, // You can get it from ZEGOCLOUD's console
    userID, // It can be any valid characters, but we recommend using a phone number.
    userName,
    [ZIM, ZPNs],
    {
        ringtoneConfig: {
            incomingCallFileName: 'zego_incoming.mp3',
            outgoingCallFileName: 'zego_outgoing.mp3',
        },
        androidNotificationConfig: {
            channelID: "ZegoUIKit",
            channelName: "ZegoUIKit",
        },
    }).then(() => {
      // /////////////////////////
      ZegoUIKitPrebuiltCallService.requestSystemAlertWindow({
        message: 'We need your consent for the following permissions in order to use the offline call function properly',
        allow: 'Allow',
        deny: 'Deny',
      });
      // /////////////////////////
    });
}

export const onUserLogout = async () => {
  return ZegoUIKitPrebuiltCallService.uninit()
}

AppRegistry.registerComponent(appName, () => App);
