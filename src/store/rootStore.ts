import { makeAutoObservable } from 'mobx';
import {
  SocketModule,
  signalingStatus,
} from './modules/signaling/SocketModule';
import { RtcModule } from './modules/rtc/RtcModule';
import { SenderCreator } from './modules/sender/SenderCreator';
import { ReceiverCreator } from './modules/receiver/ReceiverCreator';
import { IReceiver } from './modules/receiver/Receiver';
import { ISender } from './modules/sender/Sender';
import { FileMeta, FileModule } from './modules/file/FileModule';
import { TransportType } from './interfaces/TransportType';
import { ClientType } from './interfaces/ClientType';

export class RootStore {
  rtcModule: RtcModule;
  fileModule: FileModule;

  signalingModule: SocketModule;
  sender: ISender;
  receiver: IReceiver;

  constructor(
    signalingModule: SocketModule,
    rtcModule: RtcModule,
    fileModule: FileModule,
    senderCreator: SenderCreator,
    receiverCreator: ReceiverCreator,
  ) {
    makeAutoObservable(this);

    this.signalingModule = signalingModule;
    this.rtcModule = rtcModule;
    this.fileModule = fileModule;

    this.sender = senderCreator.createSender(this.rtcModule);
    this.receiver = receiverCreator.createReceiver(this.rtcModule);
  }

  get downloadableFile(): FileMeta | null {
    return this.receiver.getRemoteFileMeta;
  }

  get signalingStatus(): signalingStatus {
    return this.signalingModule.getCurrentStatus;
  }

  get rtcStatus(): string {
    return this.rtcModule.getStatus;
  }

  get receiveLink(): string {
    return this.receiver.ownId;
  }

  get downloadLink(): string {
    return this.rtcModule.downloadUrl;
  }

  get downloadProgress(): number {
    return this.rtcModule.getProgress;
  }

  getTransportTypeAs = async (client: ClientType): Promise<TransportType> => {
    return await this.rtcModule.getConnectionTypeAs(client);
  };

  createReceiveLink = (): void => {
    this.receiver.refresh();
  };

  connectToReceiver = (receiverLink: string): void => {
    this.sender.connectToRemote(receiverLink);
  };

  sendMessageToReceiver = (message: string): void => {
    this.sender.send(message);
  };

  disconnectSignaling = (): void => {
    this.signalingModule.disconnect();
  };

  sendFile = (files: File[]): void => {
    if (files?.length !== 0) {
      this.sender.sendFile(files[0]);
    }
  };

  openDialog = async (): Promise<void> => {
    console.log('click');
    const [fileHandle] = await showOpenFilePicker();
    const data = await fileHandle.getFile();
    const buffer = await data.arrayBuffer();
    console.log(buffer);
  };

  downloadFile = (): void => {
    this.receiver.downloadFile();
  };
}
