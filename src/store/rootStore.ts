import { makeAutoObservable } from 'mobx';
import {
  SignalingModule,
  signalingStatus,
} from './modules/signaling/SignalingModule';
import { RtcModule } from './modules/rtc/RtcModule';
import { FileStore } from './modules/file/fileStore';

export class RootStore {
  signalingModule: SignalingModule;
  rtcModule: RtcModule;
  fileStore: FileStore;

  constructor(
    signalingModule: SignalingModule,
    rtcModule: RtcModule,
    fileStore: FileStore,
  ) {
    makeAutoObservable(this);

    this.signalingModule = signalingModule;
    this.rtcModule = rtcModule;
    this.fileStore = fileStore;
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

  get downloadLink(): string {
    return this.rtcModule.downloadUrl;
  }

  get downloadProgress(): number {
    return this.rtcModule.getProgress;
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

  sendFile = (files: File[]): void => {
    if (files?.length !== 0) {
      void this.fileStore.sendFile(files[0], this.rtcModule);
    }
  };

  downloadFile = (): void => {
    this.fileStore.downloadFile(this.downloadLink, 'download.txt');
  };

  openDialog = async (): Promise<void> => {
    console.log('click');
    const [fileHandle] = await showOpenFilePicker();
    const data = await fileHandle.getFile();
    const buffer = await data.arrayBuffer();
    console.log(buffer);

    this.signalingModule.sendEventToRemote<ArrayBuffer>(
      'transfer file',
      buffer,
    );
  };

  waitFile = (): void => {
    this.signalingModule.subscribeTo<ArrayBuffer>('transfer file', (bytes) => {
      console.log('event received');
      this.fileStore.downloadFileFromBytes(new Int8Array(bytes));
    });
  };

  saveFile = (): void => {
    this.rtcModule.saveFile();
  };
}
