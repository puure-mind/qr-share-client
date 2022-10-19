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

  sendToRemote = <T>(msg: T): void => {
    console.log('transfer');
    this.ownSocket.emit('msg to socket', {
      receiver: this.remoteSocketId,
      eventName: 'msg to socket',
      data: msg,
    });
  };

  subscribeTo = <T>(eventName: string, fn: (data: T) => void): void => {
    this.ownSocket.on(eventName, (data: T) => {
      fn(data);
    });
  };

  sendEventToRemote = <T>(eventName: string, data?: T): void => {
    this.ownSocket.emit('msg to socket', {
      receiver: this.remoteSocketId,
      eventName,
      data,
    });
  };

  disconnectSignaling = (): void => {
    this.sendEventToRemote('socket closed');

    this.ownSocket.disconnect();
    this.changeSignalingStatusTo('disconnected');

    this.ownSocket.removeAllListeners();
  };
  // private

  private readonly connectSocket = (): void => {
    this.subscribeTo('socket closed', () => {
      this.disconnectSignaling();
    });

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
