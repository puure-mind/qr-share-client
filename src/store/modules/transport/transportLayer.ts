import { RootStore } from '../../rootStore';
import { io } from 'socket.io-client';
import { makeAutoObservable } from 'mobx';

type SocketStatus = 'connected' | 'disconnected';

export class TransportLayer {
  rootStore: RootStore;
  socket = io('localhost:5005');
  socketStatus: SocketStatus = 'disconnected';
  pong = '';

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this, {
      rootStore: false,
      subscribeSocket: false,
    });

    this.subscribeSocket();
  }

  subscribeSocket = (): void => {
    this.socket.on('connect', () => {
      this.socketStatus = 'connected';
      this.rootStore.setPrivateLink(this.socket.id);
    });

    this.socket.on('disconnect', () => {
      this.socketStatus = 'disconnected';
    });

    this.socket.on('pong', () => {
      this.setAnswer('pong');
    });
  };

  setAnswer = (data: string): void => {
    this.pong = data;
    console.log(data);
  };

  sendOffer = (): void => {
    this.socket.emit('ping', 'ping');
  };
}
