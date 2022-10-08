import { getRtcServers } from '../../../config/rtc';
import { SignalingModule } from '../signaling/SignalingModule';
import { makeAutoObservable } from 'mobx';

export class RtcModule {
  private readonly signaling;

  constructor(
    private peer: RTCPeerConnection,
    private channel: RTCDataChannel,
    signaling: SignalingModule,
  ) {
    this.signaling = signaling;

    makeAutoObservable(this);
  }

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

  private readonly subscribePeer = (): void => {
    this.peer.onicecandidate = (e: RTCPeerConnectionIceEvent) => {
      if (e.candidate != null) {
        // sendCandidateToReceiver();
        console.log(e.candidate);
        this.sendCandidateToReceiver(e.candidate);
      }
    };

    this.signaling.subscribeTo<RTCSessionDescription>(
      'receiverSdp',
      (sdp): void => {
        void this.peer.setRemoteDescription(sdp);
      },
    );

    this.signaling.subscribeTo<RTCIceCandidate>(
      'receiverCandidate',
      (candidate): void => {
        void this.peer.addIceCandidate(candidate);
      },
    );
  };

  connectToReceiver = async (): Promise<void> => {
    this.peerInit();

    const sdp: RTCSessionDescriptionInit = await this.peer.createOffer();
    await this.peer.setLocalDescription(sdp);

    this.sendSdpToReceiver(sdp);
  };

  private readonly peerInit = (): void => {
    this.connect();
    this.createChannel();
    this.subscribePeer();
  };

  private readonly sendSdpToReceiver = (
    sdp: RTCSessionDescriptionInit,
  ): void => {
    this.signaling.sendToRemote(sdp);
  };

  private readonly sendCandidateToReceiver = (
    candidate: RTCIceCandidate,
  ): void => {
    this.signaling.sendToRemote(candidate);
  };

  private readonly connect = (): void => {
    this.peer = new RTCPeerConnection({ iceServers: [...getRtcServers()] });
    console.log(this.peer.getConfiguration());
  };
}
