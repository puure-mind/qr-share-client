import { ISender, Sender } from './Sender';
import { ITransportLayer } from '../../interfaces/ITransportLayer';

export class SenderCreator {
  createSender = (transportLayer: ITransportLayer): ISender => {
    return new Sender(transportLayer);
  };
}
