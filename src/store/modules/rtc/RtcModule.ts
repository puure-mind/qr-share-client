import { SignalingModule } from '../signaling/SignalingModule';
import { autorun, makeAutoObservable, when } from 'mobx';
import { RTCSender } from './RTCSender';
import { RTCReceiver } from './RTCReceiver';

export class RtcModule {
  private readonly signaling;

  constructor(signaling: SignalingModule) {
    this.signaling = signaling;

    makeAutoObservable(this);
  }

  createInvite = async (): Promise<void> => {
    const Sender = new RTCSender();

    this.subscribeSender(Sender);

    when(
      () => Sender.offer !== null,
      () => this.sendOffer(Sender.offer),
    );

    // Sender.sendMsg('test');

    autorun(() => {
      console.log(Sender.channel.readyState);
    });
  };

  private readonly sendOffer = (
    offer: RTCSessionDescriptionInit | null,
  ): void => {
    this.signaling.sendEventToRemote<RTCSessionDescriptionInit | null>(
      'offer',
      offer,
    );
  };

  private readonly subscribeSender = (Sender: RTCSender): void => {
    this.signaling.subscribeTo<RTCSessionDescriptionInit>(
      'answer',
      (answer) => {
        Sender.setAnswer(answer);
      },
    );

    this.signaling.subscribeTo<RTCIceCandidate>(
      'candidate',
      (candidate): void => {
        Sender.addIceCandidate(candidate);
      },
    );

    Sender.peer.onicecandidate = (e: RTCPeerConnectionIceEvent) => {
      if (e.candidate != null) {
        console.log('sender candidates: ', e.candidate);
        this.signaling.sendEventToRemote('candidate', e.candidate);
      }
    };
  };

  waitInvite = (): void => {
    this.signaling.subscribeTo<RTCSessionDescriptionInit | null>(
      'offer',
      (data) => {
        if (data != null) void this.acceptInvite(data);
      },
    );
  };

  private readonly acceptInvite = async (
    offer: RTCSessionDescriptionInit,
  ): Promise<void> => {
    const Receiver = new RTCReceiver();

    this.subscribeReceiver(Receiver);

    await Receiver.createAnswer(offer);

    when(
      () => Receiver.answer !== null,
      () => this.sendAnswer(Receiver.answer),
    );
  };

  private readonly sendAnswer = (
    answer: RTCSessionDescriptionInit | null,
  ): void => {
    this.signaling.sendEventToRemote<RTCSessionDescriptionInit | null>(
      'answer',
      answer,
    );
  };

  private readonly subscribeReceiver = (Receiver: RTCReceiver): void => {
    Receiver.peer.onicecandidate = (e: RTCPeerConnectionIceEvent) => {
      if (e.candidate != null) {
        this.signaling.sendEventToRemote('candidate', e.candidate);
      }
    };

    this.signaling.subscribeTo<RTCIceCandidate>(
      'candidate',
      (candidate): void => {
        void Receiver.addIceCandidate(candidate);
      },
    );
  };
}
