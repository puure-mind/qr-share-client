import { makeAutoObservable } from 'mobx';
import {
  SocketModule,
  signalingStatus,
} from './modules/signaling/SocketModule';
import { RtcModule } from './modules/rtc/RtcModule';
import { FileStore } from './modules/file/fileStore';
import { SenderCreator } from './modules/sender/SenderCreator';
import { ReceiverCreator } from './modules/receiver/ReceiverCreator';
import { IReceiver } from './modules/receiver/Receiver';
import { ISender } from './modules/sender/Sender';

export class RootStore {
  rtcModule: RtcModule;
  fileStore: FileStore;

  signalingModule: SocketModule;
  sender: ISender;
  receiver: IReceiver;

  constructor(
    signalingModule: SocketModule,
    rtcModule: RtcModule,
    fileStore: FileStore,
    senderCreator: SenderCreator,
    receiverCreator: ReceiverCreator,
  ) {
    makeAutoObservable(this);

    this.signalingModule = signalingModule;
    this.rtcModule = rtcModule;
    this.fileStore = fileStore;

    this.sender = senderCreator.createSender(this.rtcModule);
    this.receiver = receiverCreator.createReceiver(this.rtcModule);
  }

  get signalingStatus(): signalingStatus {
    return this.signalingModule.getCurrentStatus;
  }

  get rtcStatus(): string {
    return this.rtcModule.getStatus;
  }

  get receiveLink(): string {
    return this.receiver.ownId;
    // return this.signalingModule.ownId;
  }

  get downloadLink(): string {
    return this.rtcModule.downloadUrl;
  }

  get downloadProgress(): number {
    return this.rtcModule.getProgress;
  }

  createReceiveLink = (): void => {
    this.receiver.refresh();
    // this.signalingModule.waitInviteFromRemote();
  };

  connectToReceiver = (receiverLink: string): void => {
    this.sender.connectToRemote(receiverLink);
    // this.signalingModule.sendInviteToRemote(receiverLink);
  };

  sendMessageToSender = (message: string): void => {
    // this.signalingModule.sendToRemote(message);
    this.receiver.sendToRemote(message);
  };

  sendMessageToReceiver = (message: string): void => {
    this.sender.send(message);
  };

  disconnectSignaling = (): void => {
    this.signalingModule.disconnect();
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
