import { ITransportLayer } from '../../interfaces/ITransportLayer';
import { makeAutoObservable } from 'mobx';

export interface ISender {
  connectToRemote: (id: string) => void;
  send: (msg: string) => void;
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
}
