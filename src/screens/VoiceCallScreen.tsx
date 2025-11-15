import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import {
  ZegoUIKitPrebuiltCall,
  ONE_ON_ONE_VIDEO_CALL_CONFIG,
} from '@zegocloud/zego-uikit-prebuilt-call-rn';

type RootStackParamList = {
  VoiceCall: {
    appID: number;
    appSign: string;
    userID: string;
    userName: string;
    callID: string;
  };
};

type VoiceCallScreenRouteProp = RouteProp<RootStackParamList, 'VoiceCall'>;

export default function VoiceCallScreen() {
  const route = useRoute<VoiceCallScreenRouteProp>();
  const navigation = useNavigation();
  const { appID, appSign, userID, userName, callID } = route.params;

  const handleCallEnd = (callID: string, reason: number, duration: number) => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <ZegoUIKitPrebuiltCall
        appID={appID}
        appSign={appSign}
        userID={userID}
        userName={userName}
        callID={callID}
        config={{
          ...ONE_ON_ONE_VIDEO_CALL_CONFIG,
          onCallEnd: handleCallEnd,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});

