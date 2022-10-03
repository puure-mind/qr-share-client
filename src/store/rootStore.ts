import { makeAutoObservable } from 'mobx';
import { TransportLayer } from './modules/transport/transportLayer';

export class RootStore {
  link = '';
  transportLayer: TransportLayer = new TransportLayer(this);

  constructor() {
    makeAutoObservable(this);
  }

  setLink(link: string): void {
    this.link = link;
  }

  refreshLink(): void {
    this.setLink(Math.floor(Math.random() * 10).toString());
  }

  testConnection = (): void => {
    this.transportLayer.sendOffer();
  };

  get connectionAnswer(): string {
    return this.transportLayer.pong;
  }
}
