import { makeAutoObservable } from 'mobx';
import { io, Socket } from 'socket.io-client';

export type signalingStatus =
  | 'connected'
  | 'disconnected'
  | 'loading'
  | 'waitOther';

export class SignalingModule {
  ownSocket: Socket = io('localhost:5005', { autoConnect: false });

  ownSocketId = '';
  remoteSocketId = '';

  status: signalingStatus = 'loading';

  constructor() {
    makeAutoObservable(this);
  }

  get getStatus(): signalingStatus {
    return this.status;
  }

  get getOwnSocketId(): string {
    return this.ownSocketId;
  }

  // actions
  connectToRemote = (remoteSocketId: string): void => {
    this.connectSocket();

    this.setRemoteSocketId(remoteSocketId);

    this.ownSocket.emit('from sender to receiver', {
      receiver: remoteSocketId,
      sender: this.ownSocketId,
    });

    this.ownSocket.on('from receiver to sender', () => {
      this.changeSignalingStatusTo('connected');
    });
  };

  connect = (): void => {
    this.connectSocket();

    this.ownSocket.on('from sender to receiver', (data: string) => {
      this.setRemoteSocketId(data);
      this.ownSocket.emit('from receiver to sender', this.remoteSocketId);

      this.changeSignalingStatusTo('connected');
    });
  };

  sendToRemote = (msg: string): void => {
    console.log('transfer');
    this.ownSocket.emit('msg to socket', {
      receiver: this.remoteSocketId,
      data: msg,
    });
  };

  disconnectSignaling = (): void => {
    this.ownSocket.disconnect();
    this.changeSignalingStatusTo('disconnected');

    this.ownSocket.removeAllListeners();
  };
  // private

  private readonly connectSocket = (): void => {
    if (this.ownSocket.connected) {
      this.disconnectSignaling();
    }

    this.ownSocket?.connect();

    this.ownSocket.on('connect', () => {
      this.setOwnSocketId(this.ownSocket.id);

      this.changeSignalingStatusTo('waitOther');
    });

    this.ownSocket.on('disconnect', () => {
      this.changeSignalingStatusTo('disconnected');
      // this.status = 'disconnected';

      setTimeout(() => {
        this.ownSocket?.connect();
      }, 5000);
    });

    this.ownSocket.on('msg to socket', (data: string) => {
      console.log(data);
    });
  };

  private readonly setOwnSocketId = (id: string): void => {
    this.ownSocketId = id;
  };

  private readonly changeSignalingStatusTo = (
    status: signalingStatus,
  ): void => {
    this.status = status;
  };

  private readonly setRemoteSocketId = (id: string): void => {
    this.remoteSocketId = id;
  };
}
