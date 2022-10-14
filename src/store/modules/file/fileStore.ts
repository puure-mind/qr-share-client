import { RtcModule } from '../rtc/RtcModule';

export class FileStore {
  sendFile = async (file: File, rtc: RtcModule): Promise<void> => {
    const bytesFile = await this.parseFile(file);
    rtc.sendBytes(bytesFile);
  };

  parseFile = async (file: File): Promise<Int8Array> => {
    console.log(file);
    const buffer = await file.arrayBuffer();
    const bytes = new Int8Array(buffer);
    return bytes;
  };

  createFileLinkFromBytes = (bytes: Int8Array): void => {
    const blob: BlobPart[] = [];
    blob.push(bytes);
    const receivedFile = new File(blob, 'received.jpg');

    console.log(receivedFile);

    // const downloadUrl = window.URL.createObjectURL(receivedFile);
    // const link = document.createElement('a');
    // link.href = downloadUrl;
    // link.download = receivedFile.name;
    // document.body.appendChild(link);
    // link.click();
    // link.remove();
  };

  downloadFileFromBytes = (bytes: Int8Array): void => {
    const blob: BlobPart[] = [];
    blob.push(bytes);
    const receivedFile = new File(blob, 'received.jpg');

    const downloadUrl = window.URL.createObjectURL(receivedFile);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = receivedFile.name;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  downloadFile = (downloadUrl: string, name: string): void => {
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };
}
