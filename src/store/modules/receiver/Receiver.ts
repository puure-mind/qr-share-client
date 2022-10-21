import { ITransportLayer } from '../../interfaces/ITransportLayer';
import { makeAutoObservable } from 'mobx';
import { FileMeta } from '../file/FileModule';

export interface IReceiver {
  getRemoteFileMeta: FileMeta | null;
  ownId: string;
  sendToRemote: (msg: string) => void;

  refresh: () => void;

  downloadFile: () => void;
}

export class Receiver implements IReceiver {
  transportLayer: ITransportLayer;

  constructor(transportLayer: ITransportLayer) {
    makeAutoObservable(this);

    this.transportLayer = transportLayer;

    transportLayer.waitInviteFromRemote();
  }

  get getRemoteFileMeta(): FileMeta | null {
    return this.transportLayer.getFileMeta;
  }

  get ownId(): string {
    return this.transportLayer.ownId;
  }

  downloadFile = (): void => {
    this.transportLayer.downloadFile();
  };

  sendToRemote = (msg: string): void => {
    this.transportLayer.sendToRemote(msg);
  };

  refresh = (): void => {
    this.transportLayer.disconnect();
    this.transportLayer.waitInviteFromRemote();
  };
}
