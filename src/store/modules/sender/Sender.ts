import { ITransportLayer } from '../../interfaces/ITransportLayer';
import { makeAutoObservable } from 'mobx';

export interface ISender {
  connectToRemote: (id: string) => void;
  send: (msg: string) => void;

  sendBytes: (bytes: Int8Array) => void;

  sendFile: (file: File) => void;
}

export class Sender implements ISender {
  transportLayer: ITransportLayer;

  constructor(transportLayer: ITransportLayer) {
    makeAutoObservable(this);

    this.transportLayer = transportLayer;
  }

  connectToRemote = (id: string): void => {
    this.transportLayer.sendInviteToRemote(id);
  };

  send = (msg: string): void => {
    console.log('sended');
    this.transportLayer.sendToRemote(msg);
  };

  sendBytes = (bytes: Int8Array): void => {
    this.transportLayer.sendBytes(bytes);
  };

  sendFile = (file: File): void => {
    this.transportLayer.sendFile(file);
  };
}
