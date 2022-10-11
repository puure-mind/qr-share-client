import { getRtcServers } from '../../../config/rtc';
import { makeAutoObservable } from 'mobx';

export class RTCReceiver {
  peer = new RTCPeerConnection();
  answer: RTCSessionDescriptionInit | null = null;
  channel = this.peer.createDataChannel('init');

  candidates: RTCIceCandidate[] = [];

  constructor() {
    this.peer = new RTCPeerConnection({ iceServers: [...getRtcServers()] });

    this.peer.ondatachannel = (e: RTCDataChannelEvent): void => {
      this.createChannel(e.channel);
      console.log(e.channel);
    };

    this.peer.onicecandidate = (e: RTCPeerConnectionIceEvent) => {
      console.log('receiver candidate ', e.candidate);
      if (e.candidate != null) {
        console.log('receiver candidate ', e.candidate);
        this.candidates.push(e.candidate);
      }
    };

    makeAutoObservable(this);
  }

  createAnswer = async (offer: RTCSessionDescriptionInit): Promise<void> => {
    await this.peer.setRemoteDescription(offer);
    this.answer = await this.peer.createAnswer();
    await this.peer.setLocalDescription(this.answer);
  };

  addIceCandidate = (candidate: RTCIceCandidate): void => {
    console.log(candidate);
    void this.peer.addIceCandidate(candidate);
  };

  private readonly createChannel = (channel: RTCDataChannel): void => {
    this.channel = channel;
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
}
