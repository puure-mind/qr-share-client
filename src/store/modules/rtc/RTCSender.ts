import { getRtcServers } from '../../../config/rtc';
import { makeAutoObservable } from 'mobx';
import internal from 'stream';

export class RTCSender {
  peer = new RTCPeerConnection();
  offer: RTCSessionDescriptionInit | null = null;

  channel: RTCDataChannel = this.peer.createDataChannel('init');

  channelStatus = 'init';

  constructor() {
    this.peer = new RTCPeerConnection({ iceServers: [...getRtcServers()] });

    this.createChannel();
    void this.peer.createOffer().then((sdp) => {
      this.setPeerDescription(sdp);
    });

    makeAutoObservable(this);
  }

  get getChannelStatus(): string {
    return this.channelStatus;
  }

  setAnswer = (answer: RTCSessionDescriptionInit): void => {
    void this.peer.setRemoteDescription(answer);
  };

  addIceCandidate = (candidate: RTCIceCandidate): void => {
    void this.peer.addIceCandidate(candidate);
  };

  sendBytes = (bytes: Int8Array): void => {
    console.log(bytes);
    const chunkSize = 10;
    const chunks = [];

    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.slice(i, i + chunkSize);
      chunks.push(chunk);
    }

    const sendedObject = {
      command: 'start',
      payload: {
        chunkSize,
        chunksCount: chunks.length,
        fileName: 'fileName.txt',
      },
    };

    this.channel.send(JSON.stringify(sendedObject));

    // chunks.forEach((chunk) => {
    //   const chunkObject = {
    //     command: 'chunk',
    //     payload: chunk,
    //   };
    //   this.channel.send(JSON.stringify(chunkObject));
    // });

    // this.sendChunks(chunks);

    this.sendYielded(chunks);
  };

  *sendYielded(chunks: any[]): Generator<void> {
    let i = 0;
    console.log('start: ', i);

    while (i < chunks.length) {
      if (this.channelIsFull()) {
        console.log('channel full');
        yield;
      }
      console.log('channel free');
      const chunkObject = {
        command: 'chunk',
        payload: chunks[i],
      };
      this.channel.send(JSON.stringify(chunkObject));

      i++;
      console.log('end: ', i);
    }

    this.channel.send(JSON.stringify({ command: 'end' }));
  }

  private readonly channelIsFull = (): boolean => {
    return (
      this.channel.bufferedAmount > this.channel.bufferedAmountLowThreshold
    );
  };

  private readonly sendChunks = (chunks: any[]): void => {
    let i = 0;

    this.channel.onbufferedamountlow = () => {
      console.log('full');
    };

    while (i < chunks.length) {
      const sendedObject = {
        command: 'chunk',
        payload: chunks[i],
      };
      this.channel.send(JSON.stringify(sendedObject));
      i++;
    }
    console.log(i);
  };

  private readonly send = (chunk: Int8Array): void => {
    if (this.channel.bufferedAmount > 0) {
      return;
    }

    const sendedObject = {
      command: 'chunk',
      payload: chunk,
    };

    this.channel.send(JSON.stringify(sendedObject));
  };

  private readonly setPeerDescription = (
    sdp: RTCSessionDescriptionInit,
  ): void => {
    this.offer = sdp;
    void this.peer.setLocalDescription(sdp);
  };

  private readonly createChannel = (): void => {
    this.channel = this.peer.createDataChannel('files');
    this.channel.binaryType = 'arraybuffer';
    this.channel.onopen = this.onChannelOpen;
    this.channel.onmessage = this.onChannelMessage;
    this.channel.onclose = this.onChannelClose;
  };

  private readonly onChannelOpen = (): void => {
    this.changeChannelStatus('connected');
    console.log('channel open');
  };

  private readonly onChannelClose = (): void => {
    this.changeChannelStatus('disconnected');
    console.log('channel close');
  };

  private readonly onChannelMessage = (msg: MessageEvent<Int8Array>): void => {
    console.log(msg.data);
  };

  private readonly changeChannelStatus = (status: string): void => {
    this.channelStatus = status;
  };
}
