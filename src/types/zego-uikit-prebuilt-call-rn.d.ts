declare module '@zegocloud/zego-uikit-prebuilt-call-rn' {
  import { ComponentType } from 'react';
  import { ViewProps } from 'react-native';

  export interface ZegoUIKitPrebuiltCallConfig {
    onCallEnd?: (callID: string, reason: number, duration: number) => void;
    [key: string]: unknown;
  }

  export interface ZegoUIKitPrebuiltCallProps extends ViewProps {
    appID: number;
    appSign: string;
    userID: string;
    userName: string;
    callID: string;
    config?: ZegoUIKitPrebuiltCallConfig;
    callInvitationDialog?: ComponentType<ViewProps>;
  }

  export const ZegoUIKitPrebuiltCall: ComponentType<ZegoUIKitPrebuiltCallProps>;

  export const ONE_ON_ONE_VIDEO_CALL_CONFIG: ZegoUIKitPrebuiltCallConfig;
  export const ONE_ON_ONE_VOICE_CALL_CONFIG: ZegoUIKitPrebuiltCallConfig;
  export const GROUP_VIDEO_CALL_CONFIG: ZegoUIKitPrebuiltCallConfig;
  export const GROUP_VOICE_CALL_CONFIG: ZegoUIKitPrebuiltCallConfig;
  export const ZegoCallInvitationDialog: ComponentType<ViewProps>;
  export const ZegoUIKitPrebuiltCallWaitingScreen: ComponentType<any>;
  export const ZegoUIKitPrebuiltCallInCallScreen: ComponentType<any>;

  export interface ZegoInvitee {
    userID: string;
    userName: string;
  }

  export interface ZegoSendCallInvitationButtonProps extends ViewProps {
    invitees: ZegoInvitee[];
    isVideoCall: boolean;
    resourceID: string;
  }

  export const ZegoSendCallInvitationButton: ComponentType<ZegoSendCallInvitationButtonProps>;
}

