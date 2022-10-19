import { ITransportLayer } from '../../interfaces/ITransportLayer';
import { makeAutoObservable } from 'mobx';

export interface IReceiver {
  ownId: string;
  sendToRemote: (msg: string) => void;

  refresh: () => void;
}

export class Receiver implements IReceiver {
  transportLayer: ITransportLayer;

  constructor(transportLayer: ITransportLayer) {
    makeAutoObservable(this);

    this.transportLayer = transportLayer;

    transportLayer.waitInviteFromRemote();
  }

  get ownId(): string {
    return this.transportLayer.ownId;
  }

  sendToRemote = (msg: string): void => {
    this.transportLayer.sendToRemote(msg);
  };

  refresh = (): void => {
    this.transportLayer.disconnect();
    this.transportLayer.waitInviteFromRemote();
  };
}
