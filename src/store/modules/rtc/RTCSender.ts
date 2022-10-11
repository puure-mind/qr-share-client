import { getRtcServers } from '../../../config/rtc';
import { makeAutoObservable } from 'mobx';

export class RTCSender {
  peer = new RTCPeerConnection();
  offer: RTCSessionDescriptionInit | null = null;

  channel: RTCDataChannel = this.peer.createDataChannel('init');

  constructor() {
    this.peer = new RTCPeerConnection({ iceServers: [...getRtcServers()] });

    this.createChannel();
    void this.peer.createOffer().then((sdp) => {
      this.setPeerDescription(sdp);
    });

    makeAutoObservable(this);
  }

  setAnswer = (answer: RTCSessionDescriptionInit): void => {
    void this.peer.setRemoteDescription(answer);
  };

  addIceCandidate = (candidate: RTCIceCandidate): void => {
    console.log(candidate);
    void this.peer.addIceCandidate(candidate);
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
    console.log('channel open');
  };

  private readonly onChannelClose = (): void => {
    console.log('channel close');
  };

  private readonly onChannelMessage = (msg: MessageEvent<string>): void => {
    console.log(msg.data);
  };

  sendMsg = (test: string): void => {
    console.log(test);
    this.channel.send(test);
  };
}
