import { IReceiver, Receiver } from './Receiver';
import { ITransportLayer } from '../../interfaces/ITransportLayer';

export class ReceiverCreator {
  createReceiver = (transportLayer: ITransportLayer): IReceiver => {
    return new Receiver(transportLayer);
  };
}
