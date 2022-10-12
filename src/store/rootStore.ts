import { makeAutoObservable } from 'mobx';
import {
  SignalingModule,
  signalingStatus,
} from './modules/signaling/SignalingModule';
import { RtcModule } from './modules/rtc/RtcModule';

export class RootStore {
  signalingModule: SignalingModule;
  rtcModule: RtcModule;

  constructor(signalingModule: SignalingModule, rtcModule: RtcModule) {
    makeAutoObservable(this);

    this.signalingModule = signalingModule;
    this.rtcModule = rtcModule;
  }

  get signalingStatus(): signalingStatus {
    return this.signalingModule.getStatus;
  }

  get rtcStatus(): string {
    return this.rtcModule.getStatus;
  }

  get receiveLink(): string {
    return this.signalingModule.getOwnSocketId;
  }

  createReceiveLink = (): void => {
    this.signalingModule.connect();
  };

  connectToReceiver = (receiverLink: string): void => {
    this.signalingModule.connectToRemote(receiverLink);
  };

  sendMessage = (message: string): void => {
    this.signalingModule.sendToRemote(message);
  };

  disconnectSignaling = (): void => {
    this.signalingModule.disconnectSignaling();
  };

  sendInvite = (): void => {
    void this.rtcModule.createInvite();
  };

  waitInvite = (): void => {
    this.rtcModule.waitInvite();
  };
}
