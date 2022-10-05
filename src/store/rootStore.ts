import { makeAutoObservable } from 'mobx';
import {
  SignalingModule,
  signalingStatus,
} from './modules/signaling/SignalingModule';

export class RootStore {
  signalingModule: SignalingModule;

  constructor(signalingModule: SignalingModule) {
    makeAutoObservable(this);

    this.signalingModule = signalingModule;
  }

  get signalingStatus(): signalingStatus {
    return this.signalingModule.getStatus;
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
}
