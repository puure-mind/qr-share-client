import { makeAutoObservable } from 'mobx';

const CHUNK_SIZE = 16384;

export interface ProcessedFile {
  meta: FileMeta;
  chunks: FileChunk[];
}

export interface FileChunk {
  meta: {
    id: number;
  };
  data: Int8Array;
}

export interface FileMeta {
  fileName: string;
  size: number;
  chunkSize: number;
  chunkCount: number;
}

export class FileModule {
  file: File | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  convertToBytes = async (file: File): Promise<Int8Array> => {
    const buffer = await file.arrayBuffer();
    return new Int8Array(buffer);
  };

  processFile = async (file: File): Promise<ProcessedFile> => {
    const bytes = await this.convertToBytes(file);

    const chunks: FileChunk[] = [];

    for (let i = 0; i < bytes.length; i += CHUNK_SIZE) {
      const chunk: FileChunk = {
        meta: { id: i },
        data: bytes.slice(i, i + CHUNK_SIZE),
      };
      chunks.push(chunk);
    }

    const meta: FileMeta = {
      fileName: file.name,
      size: file.size,
      chunkSize: CHUNK_SIZE,
      chunkCount: chunks.length,
    };

    return await new Promise<ProcessedFile>((resolve) =>
      resolve({ meta, chunks }),
    );
  };
}
