import { makeAutoObservable } from 'mobx';
import { TransportLayer } from './modules/transport/transportLayer';

export class RootStore {
  link = '';
  transportLayer: TransportLayer = new TransportLayer(this);

  constructor() {
    makeAutoObservable(this);
  }

  get privateLink(): string {
    return this.link;
  }

  refreshLink(): void {
    // this.setLink(Math.floor(Math.random() * 10).toString());
  }

  testConnection = (): void => {
    this.transportLayer.sendOffer();
  };

  setPrivateLink = (privateLink: string): void => {
    this.link = privateLink;
  };
}
